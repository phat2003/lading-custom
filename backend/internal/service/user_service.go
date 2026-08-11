package service

import (
	"errors"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

// ErrWrongPassword — mật khẩu hiện tại không khớp khi đổi mật khẩu.
var ErrWrongPassword = errors.New("mật khẩu hiện tại không đúng")

// UserService chứa logic xử lý cho người dùng
type UserService struct {
	userRepo *repository.UserRepository
}

func NewUserService(userRepo *repository.UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
}

// GetProfile lấy thông tin dựa vào ID
func (s *UserService) GetProfile(id uuid.UUID) (*models.User, error) {
	return s.userRepo.FindByID(id)
}

// UpdateProfileInput định nghĩa dữ liệu được phép cập nhật.
// Con trỏ = nil nghĩa là client không gửi field đó -> giữ nguyên giá trị cũ.
type UpdateProfileInput struct {
	FullName       *string
	Phone          *string
	Timezone       *string
	SessionTimeout *string
}

// UpdateProfile cập nhật thông tin cá nhân
func (s *UserService) UpdateProfile(id uuid.UUID, in UpdateProfileInput) (*models.User, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// Ghi đè các trường được gửi lên
	if in.FullName != nil {
		user.FullName = *in.FullName
	}
	if in.Phone != nil {
		user.Phone = *in.Phone
	}
	if in.Timezone != nil {
		user.Timezone = *in.Timezone
	}
	if in.SessionTimeout != nil {
		user.SessionTimeout = *in.SessionTimeout
	}

	// Lưu xuống Database
	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}

	return user, nil
}

// ChangePassword đổi mật khẩu của chính người đang đăng nhập.
// Bắt buộc nhập đúng mật khẩu hiện tại: nếu không, ai mượn được phiên đăng nhập
// đang mở cũng đổi được mật khẩu và chiếm luôn tài khoản.
func (s *UserService) ChangePassword(id uuid.UUID, currentPassword, newPassword string) error {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(currentPassword)); err != nil {
		return ErrWrongPassword
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.PasswordHash = string(hash)
	return s.userRepo.Update(user)
}
