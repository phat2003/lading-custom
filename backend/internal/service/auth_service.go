package service

import (
	"errors"

	"golang.org/x/crypto/bcrypt"

	"github.com/nhienthai/lading-custom/backend/internal/config"
	"github.com/nhienthai/lading-custom/backend/internal/middleware"
	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

var (
	ErrEmailExists        = errors.New("email đã được đăng ký")
	ErrInvalidCredentials = errors.New("email hoặc mật khẩu không đúng")
	ErrAccountLocked      = errors.New("tài khoản đã bị khoá, vui lòng liên hệ quản trị viên")
)

// AuthService chứa business logic đăng ký / đăng nhập.
type AuthService struct {
	userRepo *repository.UserRepository
	cfg      *config.Config
}

func NewAuthService(userRepo *repository.UserRepository, cfg *config.Config) *AuthService {
	return &AuthService{userRepo: userRepo, cfg: cfg}
}

// RegisterInput dữ liệu đầu vào đăng ký.
type RegisterInput struct {
	Email    string
	Password string
	FullName string
}

// Register tạo user mới với mật khẩu đã hash.
func (s *AuthService) Register(in RegisterInput) (*models.User, error) {
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

	user := &models.User{
		Email:        in.Email,
		PasswordHash: string(hash),
		FullName:     in.FullName,
		Role:         models.RoleUser,
		PlanType:     models.PlanFree,
		IsActive:     true, // set tường minh: GORM bỏ qua bool false khi INSERT
	}
	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}
	return user, nil
}

// Login kiểm tra thông tin đăng nhập và trả về JWT token.
func (s *AuthService) Login(email, password string) (string, *models.User, error) {
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return "", nil, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", nil, ErrInvalidCredentials
	}

	// Kiểm tra SAU khi đã xác thực mật khẩu: báo "tài khoản bị khoá" cho người
	// chưa nhập đúng mật khẩu sẽ tiết lộ email nào có thật trong hệ thống.
	if !user.IsActive {
		return "", nil, ErrAccountLocked
	}

	token, err := middleware.GenerateToken(s.cfg.JWTSecret, s.cfg.JWTExpireHours, user.UserID, user.Role, user.PlanType)
	if err != nil {
		return "", nil, err
	}
	return token, user, nil
}
