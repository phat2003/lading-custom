package service

import (
	"github.com/google/uuid"
	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

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

// UpdateProfileInput định nghĩa dữ liệu được phép cập nhật
type UpdateProfileInput struct {
	FullName string
}

// UpdateProfile cập nhật thông tin cá nhân
func (s *UserService) UpdateProfile(id uuid.UUID, in UpdateProfileInput) (*models.User, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// Ghi đè các trường mới
	user.FullName = in.FullName

	// Lưu xuống Database
	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}

	return user, nil
}