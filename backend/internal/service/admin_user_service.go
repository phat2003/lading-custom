package service

import (
	"errors"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

// Lỗi nghiệp vụ riêng của khu vực quản trị user.
var (
	ErrCannotDeleteSelf       = errors.New("không thể tự xoá tài khoản đang đăng nhập")
	ErrCannotDeleteSuperAdmin = errors.New("không thể xoá tài khoản super admin")
	ErrCannotLockSelf         = errors.New("không thể tự khoá tài khoản đang đăng nhập")
)

// AdminUserService chứa business logic quản trị người dùng (trang admin Users).
// Tách khỏi UserService (chỉ lo profile của chính mình) vì phạm vi quyền khác hẳn.
type AdminUserService struct {
	userRepo    *repository.UserRepository
	projectRepo *repository.ProjectRepository
}

func NewAdminUserService(
	userRepo *repository.UserRepository,
	projectRepo *repository.ProjectRepository,
) *AdminUserService {
	return &AdminUserService{userRepo: userRepo, projectRepo: projectRepo}
}

// ListUsersInput điều kiện lọc + phân trang từ query string.
type ListUsersInput struct {
	Search string
	Plan   string
	Status string
	Page   int
	Limit  int
}

// ListUsers trả một trang user kèm tổng số bản ghi khớp bộ lọc.
func (s *AdminUserService) ListUsers(in ListUsersInput) ([]models.User, int64, error) {
	return s.userRepo.FindPaged(repository.UserFilter{
		Search: in.Search,
		Plan:   in.Plan,
		Status: in.Status,
		Page:   in.Page,
		Limit:  in.Limit,
	})
}

// UserDetail là user kèm số liệu phụ cho panel chi tiết.
// Nhúng models.User để JSON phẳng đúng shape frontend mong đợi.
type UserDetail struct {
	models.User
	ProjectCount int64                `json:"project_count"`
	Subscription *models.Subscription `json:"subscription"`
}

// GetUser lấy chi tiết 1 user kèm số project và gói đang hiệu lực.
func (s *AdminUserService) GetUser(id uuid.UUID) (*UserDetail, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	projectCount, err := s.projectRepo.CountByOwnerID(id)
	if err != nil {
		return nil, err
	}

	// Không có subscription active là chuyện bình thường (user gói free) -> sub = nil.
	sub, err := s.userRepo.FindActiveSubscription(id)
	if err != nil {
		return nil, err
	}

	return &UserDetail{User: *user, ProjectCount: projectCount, Subscription: sub}, nil
}

// CreateUserInput dữ liệu đầu vào khi admin tạo user (nút "Add User").
type CreateUserInput struct {
	Email    string
	Password string
	FullName string
	Phone    string
	Role     models.UserRole
	PlanType models.PlanType
}

// CreateUser tạo user mới với mật khẩu đã hash.
// Khác /auth/register ở chỗ admin được chỉ định role và plan_type.
func (s *AdminUserService) CreateUser(in CreateUserInput) (*models.User, error) {
	exists, err := s.userRepo.ExistsByEmail(in.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrEmailExists
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	role := in.Role
	if role == "" {
		role = models.RoleUser
	}
	plan := in.PlanType
	if plan == "" {
		plan = models.PlanFree
	}

	user := &models.User{
		Email:        in.Email,
		PasswordHash: string(hash),
		FullName:     in.FullName,
		Phone:        in.Phone,
		Role:         role,
		PlanType:     plan,
		IsActive:     true, // set tường minh: GORM bỏ qua bool false khi INSERT
	}
	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}
	return user, nil
}

// UpdateUserInput các trường admin được phép sửa.
// Con trỏ = nil nghĩa là client không gửi field đó -> giữ nguyên giá trị cũ.
// Role KHÔNG nằm ở đây: đổi quyền là thao tác nhạy cảm, cần luồng riêng.
type UpdateUserInput struct {
	FullName *string
	Phone    *string
	PlanType *models.PlanType
	IsActive *bool
}

// UpdateUser cập nhật thông tin user. actorID là admin đang thao tác —
// dùng để chặn việc tự khoá chính mình ra khỏi hệ thống.
//
// LƯU Ý: đổi PlanType chỉ ghi vào app_user.plan_type (bản denormalized).
// Bảng subscription KHÔNG được đụng tới vì chưa có luồng thanh toán;
// khi làm tính năng thanh toán cần đồng bộ lại 2 nơi này.
func (s *AdminUserService) UpdateUser(id, actorID uuid.UUID, in UpdateUserInput) (*models.User, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if in.IsActive != nil && !*in.IsActive && id == actorID {
		return nil, ErrCannotLockSelf
	}

	if in.FullName != nil {
		user.FullName = *in.FullName
	}
	if in.Phone != nil {
		user.Phone = *in.Phone
	}
	if in.PlanType != nil {
		user.PlanType = *in.PlanType
	}
	if in.IsActive != nil {
		user.IsActive = *in.IsActive
	}

	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}
	return user, nil
}

// DeleteUser xoá cứng user. actorID là admin đang thao tác.
//
// CẢNH BÁO: xoá cứng kéo theo toàn bộ project -> landing page -> section ->
// media asset của user đó qua ON DELETE CASCADE, không hoàn tác được.
// Muốn tạm khoá thì dùng UpdateUser với IsActive = false.
func (s *AdminUserService) DeleteUser(id, actorID uuid.UUID) error {
	if id == actorID {
		return ErrCannotDeleteSelf
	}

	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return err
	}
	if user.Role == models.RoleSuperAdmin {
		return ErrCannotDeleteSuperAdmin
	}

	return s.userRepo.Delete(id)
}
