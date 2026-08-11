package repository

import (
	"errors"

	"gorm.io/gorm"

	"github.com/nhienthai/lading-custom/backend/internal/models"
)

// PlatformSettingRepository truy vấn bảng cấu hình hệ thống (1 dòng duy nhất).
type PlatformSettingRepository struct {
	db *gorm.DB
}

func NewPlatformSettingRepository(db *gorm.DB) *PlatformSettingRepository {
	return &PlatformSettingRepository{db: db}
}

// Get lấy dòng cấu hình duy nhất.
// Nếu bảng rỗng (DB dựng từ migration mà chưa chạy câu INSERT khởi tạo, hoặc
// dòng bị xoá tay) thì tự tạo lại dòng mặc định thay vì trả lỗi — trang Settings
// không nên chết chỉ vì thiếu dữ liệu khởi tạo.
func (r *PlatformSettingRepository) Get() (*models.PlatformSetting, error) {
	var setting models.PlatformSetting
	err := r.db.First(&setting).Error
	if err == nil {
		return &setting, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Giá trị mặc định khớp DEFAULT trong migration 005.
	setting = models.PlatformSetting{
		PlatformName:      "Amazing Tech — Template Studio",
		AIEnabled:         true,
		AIDailyLimit:      2500,
		AIDefaultModel:    "amazing-ui-v2.0",
		AIConcurrentLimit: 100,
		IsSingleton:       true,
	}
	if err := r.db.Create(&setting).Error; err != nil {
		return nil, err
	}
	return &setting, nil
}

// Update lưu toàn bộ thay đổi của dòng cấu hình.
func (r *PlatformSettingRepository) Update(setting *models.PlatformSetting) error {
	return r.db.Save(setting).Error
}
