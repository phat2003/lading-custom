package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

const testSecret = "secret-dung-trong-test"

// fakeUserFetcher đóng vai UserRepository, để test chạy không cần DB.
type fakeUserFetcher struct {
	user *models.User
	err  error
	// calls đếm số lần middleware chạm "DB" — dùng để chứng minh nó thực sự
	// nạp lại user chứ không đọc claims trong token.
	calls int
}

func (f *fakeUserFetcher) FindByID(uuid.UUID) (*models.User, error) {
	f.calls++
	if f.err != nil {
		return nil, f.err
	}
	return f.user, nil
}

func activeUser() *models.User {
	return &models.User{
		UserID:   uuid.New(),
		Email:    "a@b.com",
		Role:     models.RoleUser,
		PlanType: models.PlanFree,
		IsActive: true,
	}
}

// runAuth dựng 1 router tối thiểu có AuthRequired và gọi thử với token cho sẵn.
// Trả về response cùng giá trị mà handler đọc được từ context.
func runAuth(t *testing.T, users UserFetcher, authHeader string) (*httptest.ResponseRecorder, gin.H) {
	t.Helper()
	gin.SetMode(gin.TestMode)

	seen := gin.H{}
	r := gin.New()
	r.GET("/protected", AuthRequired(testSecret, users), func(c *gin.Context) {
		seen["user_id"], _ = c.Get("user_id")
		seen["role"], _ = c.Get("role")
		seen["plan_type"], _ = c.Get("plan_type")
		c.Status(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	if authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w, seen
}

func bearerFor(t *testing.T, u *models.User) string {
	t.Helper()
	tok, err := GenerateToken(testSecret, 1, u.UserID, u.Role, u.PlanType)
	if err != nil {
		t.Fatalf("không tạo được token: %v", err)
	}
	return "Bearer " + tok
}

func TestAuthRequired_TokenHopLe(t *testing.T) {
	u := activeUser()
	f := &fakeUserFetcher{user: u}

	w, seen := runAuth(t, f, bearerFor(t, u))

	if w.Code != http.StatusOK {
		t.Fatalf("mong đợi 200, nhận %d", w.Code)
	}
	if seen["user_id"] != u.UserID {
		t.Errorf("user_id trong context = %v, mong đợi %v", seen["user_id"], u.UserID)
	}
	if f.calls != 1 {
		t.Errorf("middleware phải nạp user từ DB đúng 1 lần, thực tế %d", f.calls)
	}
}

// Đây là bài test cho lỗ hổng chính: admin khoá tài khoản nhưng token cũ vẫn
// còn hạn. Trước khi sửa, request này trả 200 suốt tới 72 giờ.
func TestAuthRequired_TaiKhoanBiKhoaThiChanNgay(t *testing.T) {
	u := activeUser()
	token := bearerFor(t, u) // token phát lúc tài khoản còn hoạt động

	u.IsActive = false // admin khoá sau đó
	f := &fakeUserFetcher{user: u}

	w, _ := runAuth(t, f, token)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("tài khoản bị khoá phải nhận 401, nhận %d", w.Code)
	}
}

// Tương tự với hạ quyền: quyền phải lấy từ DB, không phải từ claims.
func TestAuthRequired_QuyenLayTuDBKhongPhaiTuToken(t *testing.T) {
	u := activeUser()
	u.Role = models.RoleAdmin
	u.PlanType = models.PlanPro
	token := bearerFor(t, u) // token ghi role=admin, plan=pro

	u.Role = models.RoleUser // bị hạ quyền trong DB
	u.PlanType = models.PlanFree
	f := &fakeUserFetcher{user: u}

	w, seen := runAuth(t, f, token)

	if w.Code != http.StatusOK {
		t.Fatalf("mong đợi 200, nhận %d", w.Code)
	}
	if seen["role"] != models.RoleUser {
		t.Errorf("role = %v, mong đợi %v (giá trị mới trong DB)", seen["role"], models.RoleUser)
	}
	if seen["plan_type"] != models.PlanFree {
		t.Errorf("plan_type = %v, mong đợi %v", seen["plan_type"], models.PlanFree)
	}
}

func TestAuthRequired_UserDaBiXoa(t *testing.T) {
	u := activeUser()
	f := &fakeUserFetcher{err: repository.ErrNotFound}

	w, _ := runAuth(t, f, bearerFor(t, u))

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("mong đợi 401, nhận %d", w.Code)
	}
}

func TestAuthRequired_HeaderKhongHopLe(t *testing.T) {
	cases := map[string]string{
		"thiếu header":  "",
		"thiếu tiền tố": "abc.def.ghi",
		"sai tiền tố":   "Basic abc",
		"token rỗng":    "Bearer ",
		"token rác":     "Bearer khong-phai-jwt",
	}

	for name, header := range cases {
		t.Run(name, func(t *testing.T) {
			w, _ := runAuth(t, &fakeUserFetcher{user: activeUser()}, header)
			if w.Code != http.StatusUnauthorized {
				t.Fatalf("mong đợi 401, nhận %d", w.Code)
			}
		})
	}
}

func TestAuthRequired_TokenHetHan(t *testing.T) {
	u := activeUser()
	// expireHours âm -> ExpiresAt nằm trong quá khứ.
	tok, err := GenerateToken(testSecret, -1, u.UserID, u.Role, u.PlanType)
	if err != nil {
		t.Fatalf("không tạo được token: %v", err)
	}

	w, _ := runAuth(t, &fakeUserFetcher{user: u}, "Bearer "+tok)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("token hết hạn phải nhận 401, nhận %d", w.Code)
	}
}

func TestAuthRequired_KySaiKhoa(t *testing.T) {
	u := activeUser()
	tok, err := GenerateToken("khoa-khac-hoan-toan", 1, u.UserID, u.Role, u.PlanType)
	if err != nil {
		t.Fatalf("không tạo được token: %v", err)
	}

	w, _ := runAuth(t, &fakeUserFetcher{user: u}, "Bearer "+tok)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("token ký sai khoá phải nhận 401, nhận %d", w.Code)
	}
}

// Tấn công đổi thuật toán: token alg=none, không chữ ký.
func TestAuthRequired_ChanThuatToanNone(t *testing.T) {
	u := activeUser()
	claims := Claims{
		UserID:   u.UserID,
		Role:     models.RoleSuperAdmin, // kẻ tấn công tự nâng quyền
		PlanType: models.PlanPro,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		},
	}
	tok, err := jwt.NewWithClaims(jwt.SigningMethodNone, claims).
		SignedString(jwt.UnsafeAllowNoneSignatureType)
	if err != nil {
		t.Fatalf("không tạo được token none: %v", err)
	}

	w, _ := runAuth(t, &fakeUserFetcher{user: u}, "Bearer "+tok)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("token alg=none phải bị từ chối, nhận %d", w.Code)
	}
}

// runGuard chạy 1 middleware phân quyền với context đã được set sẵn.
func runGuard(t *testing.T, guard gin.HandlerFunc, set map[string]any) *httptest.ResponseRecorder {
	t.Helper()
	gin.SetMode(gin.TestMode)

	r := gin.New()
	r.GET("/x", func(c *gin.Context) {
		for k, v := range set {
			c.Set(k, v)
		}
		c.Next()
	}, guard, func(c *gin.Context) { c.Status(http.StatusOK) })

	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/x", nil))
	return w
}

func TestAdminRequired(t *testing.T) {
	cases := []struct {
		name string
		set  map[string]any
		want int
	}{
		{"admin qua được", map[string]any{"role": models.RoleAdmin}, http.StatusOK},
		{"super_admin qua được", map[string]any{"role": models.RoleSuperAdmin}, http.StatusOK},
		{"user thường bị chặn", map[string]any{"role": models.RoleUser}, http.StatusForbidden},
		{"thiếu role bị chặn", map[string]any{}, http.StatusForbidden},
		// Sai kiểu phải trả 403 chứ không được panic thành 500.
		{"role sai kiểu bị chặn", map[string]any{"role": "admin"}, http.StatusForbidden},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if w := runGuard(t, AdminRequired(), tc.set); w.Code != tc.want {
				t.Fatalf("mong đợi %d, nhận %d", tc.want, w.Code)
			}
		})
	}
}

func TestProRequired(t *testing.T) {
	cases := []struct {
		name string
		set  map[string]any
		want int
	}{
		{"gói pro qua được", map[string]any{"plan_type": models.PlanPro}, http.StatusOK},
		{"gói free bị chặn", map[string]any{"plan_type": models.PlanFree}, http.StatusForbidden},
		{"thiếu plan bị chặn", map[string]any{}, http.StatusForbidden},
		{"plan sai kiểu bị chặn", map[string]any{"plan_type": "pro"}, http.StatusForbidden},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if w := runGuard(t, ProRequired(), tc.set); w.Code != tc.want {
				t.Fatalf("mong đợi %d, nhận %d", tc.want, w.Code)
			}
		})
	}
}
