package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

// Claims là payload trong JWT token.
type Claims struct {
	UserID   uuid.UUID       `json:"user_id"`
	Role     models.UserRole `json:"role"`
	PlanType models.PlanType `json:"plan_type"`
	jwt.RegisteredClaims
}

// GenerateToken tạo JWT cho user sau khi đăng nhập thành công.
func GenerateToken(secret string, expireHours int, userID uuid.UUID, role models.UserRole, planType models.PlanType) (string, error) {
	claims := Claims{
		UserID:   userID,
		Role:     role,
		PlanType: planType,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(expireHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// UserFetcher là phần duy nhất của UserRepository mà middleware cần.
// Khai báo interface ngay tại nơi dùng để test được bằng bản giả, khỏi cần DB.
type UserFetcher interface {
	FindByID(id uuid.UUID) (*models.User, error)
}

// AuthRequired kiểm tra JWT trong header Authorization: Bearer <token>, rồi
// NẠP LẠI user từ DB.
//
// Vì sao phải chạm DB mỗi request thay vì tin claims trong token: role,
// plan_type và is_active đều có thể bị admin đổi bất cứ lúc nào, còn token thì
// sống tới JWT_EXPIRE_HOURS (mặc định 72h). Nếu chỉ đọc claims thì thao tác
// khoá tài khoản chỉ chặn được lần đăng nhập sau, còn phiên đang chạy vẫn dùng
// API bình thường suốt 3 ngày. Đây là truy vấn theo khoá chính, rất rẻ.
func AuthRequired(secret string, users UserFetcher) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			response.Fail(c, http.StatusUnauthorized, "thiếu hoặc sai định dạng token")
			c.Abort()
			return
		}

		tokenStr := strings.TrimPrefix(header, "Bearer ")
		claims := &Claims{}
		// Ghim thuật toán HS256: không có ràng buộc này, thư viện chấp nhận mọi
		// alg mà keyfunc trả khoá hợp lệ, mở đường cho tấn công đổi thuật toán.
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))
		if err != nil || !token.Valid {
			response.Fail(c, http.StatusUnauthorized, "token không hợp lệ hoặc đã hết hạn")
			c.Abort()
			return
		}

		user, err := users.FindByID(claims.UserID)
		if err != nil {
			// Token ký đúng nhưng user đã bị xoá -> coi như không hợp lệ.
			response.Fail(c, http.StatusUnauthorized, "tài khoản không còn tồn tại")
			c.Abort()
			return
		}
		if !user.IsActive {
			response.Fail(c, http.StatusUnauthorized, "tài khoản đã bị khoá")
			c.Abort()
			return
		}

		// Lấy quyền từ DB chứ KHÔNG từ claims: đây là chỗ khiến việc đổi quyền
		// hay đổi gói có hiệu lực ngay, không phải chờ token hết hạn.
		c.Set("user_id", user.UserID)
		c.Set("role", user.Role)
		c.Set("plan_type", user.PlanType)
		c.Next()
	}
}

// ProRequired chỉ cho phép user có plan "pro" thực hiện (dùng sau AuthRequired).
func ProRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Ép kiểu có kiểm tra: assertion trần sẽ panic thành 500 nếu context
		// bị set sai kiểu ở đâu đó, che mất lỗi thật.
		plan, ok := c.Get("plan_type")
		planType, okType := plan.(models.PlanType)
		if !ok || !okType {
			response.Fail(c, http.StatusForbidden, "không xác định được gói dịch vụ")
			c.Abort()
			return
		}
		if planType != models.PlanPro {
			response.Fail(c, http.StatusForbidden, "tính năng này chỉ dành cho gói Pro")
			c.Abort()
			return
		}
		c.Next()
	}
}

// AdminRequired chỉ cho phép admin hoặc super_admin (dùng sau AuthRequired).
func AdminRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, ok := c.Get("role")
		r, okType := role.(models.UserRole)
		if !ok || !okType {
			response.Fail(c, http.StatusForbidden, "không xác định được quyền")
			c.Abort()
			return
		}
		if r != models.RoleAdmin && r != models.RoleSuperAdmin {
			response.Fail(c, http.StatusForbidden, "chỉ admin mới được phép thực hiện")
			c.Abort()
			return
		}
		c.Next()
	}
}
