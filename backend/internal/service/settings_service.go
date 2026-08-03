package service

import (
	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

// PlatformInfo — nhóm "Nền tảng" trên trang Settings.
type PlatformInfo struct {
	Name    string `json:"name"`
	LogoURL string `json:"logo_url"`
}

// AIEngineInfo — nhóm "AI Engine" trên trang Settings.
type AIEngineInfo struct {
	Enabled         bool   `json:"enabled"`
	DailyLimit      int    `json:"daily_limit"`
	DefaultModel    string `json:"default_model"`
	ConcurrentLimit int    `json:"concurrent_limit"`
}

// AccountInfo — nhóm "Quản lý tài khoản": thông tin của ADMIN ĐANG ĐĂNG NHẬP,
// lấy từ app_user chứ không phải bảng cấu hình hệ thống.
type AccountInfo struct {
	FullName       string          `json:"full_name"`
	Email          string          `json:"email"`
	Role           models.UserRole `json:"role"`
	Timezone       string          `json:"timezone"`
	SessionTimeout string          `json:"session_timeout"`
}

// Settings là toàn bộ dữ liệu trang Settings, gom từ 2 nguồn khác nhau.
type Settings struct {
	Platform PlatformInfo `json:"platform"`
	AIEngine AIEngineInfo `json:"ai_engine"`
	Account  AccountInfo  `json:"account"`
}

// SettingsService gom cấu hình hệ thống + thông tin tài khoản admin.
type SettingsService struct {
	settingRepo *repository.PlatformSettingRepository
	userRepo    *repository.UserRepository
}

func NewSettingsService(
	settingRepo *repository.PlatformSettingRepository,
	userRepo *repository.UserRepository,
) *SettingsService {
	return &SettingsService{settingRepo: settingRepo, userRepo: userRepo}
}

// GetSettings trả cấu hình hệ thống kèm thông tin tài khoản của admin đang đăng nhập.
func (s *SettingsService) GetSettings(actorID uuid.UUID) (*Settings, error) {
	setting, err := s.settingRepo.Get()
	if err != nil {
		return nil, err
	}

	user, err := s.userRepo.FindByID(actorID)
	if err != nil {
		return nil, err
	}

	return &Settings{
		Platform: PlatformInfo{Name: setting.PlatformName, LogoURL: setting.LogoURL},
		AIEngine: AIEngineInfo{
			Enabled:         setting.AIEnabled,
			DailyLimit:      setting.AIDailyLimit,
			DefaultModel:    setting.AIDefaultModel,
			ConcurrentLimit: setting.AIConcurrentLimit,
		},
		Account: AccountInfo{
			FullName:       user.FullName,
			Email:          user.Email,
			Role:           user.Role,
			Timezone:       user.Timezone,
			SessionTimeout: user.SessionTimeout,
		},
	}, nil
}

// UpdateSettingsInput các trường được phép sửa.
// Con trỏ = nil nghĩa là client không gửi field đó -> giữ nguyên giá trị cũ.
//
// KHÔNG có nhóm account ở đây: họ tên / múi giờ / thời gian phiên thuộc app_user,
// sửa qua PUT /api/v1/profile.
type UpdateSettingsInput struct {
	PlatformName      *string
	LogoURL           *string
	AIEnabled         *bool
	AIDailyLimit      *int
	AIDefaultModel    *string
	AIConcurrentLimit *int
}

// UpdateSettings cập nhật cấu hình hệ thống. actorID được ghi vào cột audit updated_by.
func (s *SettingsService) UpdateSettings(actorID uuid.UUID, in UpdateSettingsInput) (*Settings, error) {
	setting, err := s.settingRepo.Get()
	if err != nil {
		return nil, err
	}

	if in.PlatformName != nil {
		setting.PlatformName = *in.PlatformName
	}
	if in.LogoURL != nil {
		setting.LogoURL = *in.LogoURL
	}
	if in.AIEnabled != nil {
		setting.AIEnabled = *in.AIEnabled
	}
	if in.AIDailyLimit != nil {
		setting.AIDailyLimit = *in.AIDailyLimit
	}
	if in.AIDefaultModel != nil {
		setting.AIDefaultModel = *in.AIDefaultModel
	}
	if in.AIConcurrentLimit != nil {
		setting.AIConcurrentLimit = *in.AIConcurrentLimit
	}
	setting.UpdatedBy = &actorID

	if err := s.settingRepo.Update(setting); err != nil {
		return nil, err
	}

	return s.GetSettings(actorID)
}

// UpdateLogo lưu URL logo mới sau khi file đã được ghi xuống đĩa.
func (s *SettingsService) UpdateLogo(actorID uuid.UUID, logoURL string) (*Settings, error) {
	return s.UpdateSettings(actorID, UpdateSettingsInput{LogoURL: &logoURL})
}
