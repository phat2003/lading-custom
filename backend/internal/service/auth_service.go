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

	token, err := middleware.GenerateToken(s.cfg.JWTSecret, s.cfg.JWTExpireHours, user.UserID, user.Role)
	if err != nil {
		return "", nil, err
	}
	return token, user, nil
}

