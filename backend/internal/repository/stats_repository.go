package repository

import (
	"time"

	"gorm.io/gorm"

	"github.com/nhienthai/lading-custom/backend/internal/models"
)

// StatsRepository chứa các truy vấn tổng hợp cho Admin Dashboard.
// Tách riêng vì đây là câu đếm cắt ngang nhiều bảng, không thuộc về
// repository của riêng entity nào.
type StatsRepository struct {
	db *gorm.DB
}

func NewStatsRepository(db *gorm.DB) *StatsRepository {
	return &StatsRepository{db: db}
}

// CountUsers đếm tổng số tài khoản (kể cả tài khoản đang bị khoá).
func (r *StatsRepository) CountUsers() (int64, error) {
	var total int64
	err := r.db.Model(&models.User{}).Count(&total).Error
	return total, err
}

// CountUsersSince đếm số tài khoản tạo mới từ mốc thời gian trở đi.
func (r *StatsRepository) CountUsersSince(since time.Time) (int64, error) {
	var total int64
	err := r.db.Model(&models.User{}).Where("created_at >= ?", since).Count(&total).Error
	return total, err
}

// CountProjects đếm tổng số dự án của toàn hệ thống.
func (r *StatsRepository) CountProjects() (int64, error) {
	var total int64
	err := r.db.Model(&models.Project{}).Count(&total).Error
	return total, err
}

// CountProjectsSince đếm số dự án tạo mới từ mốc thời gian trở đi.
func (r *StatsRepository) CountProjectsSince(since time.Time) (int64, error) {
	var total int64
	err := r.db.Model(&models.Project{}).Where("created_at >= ?", since).Count(&total).Error
	return total, err
}

// CountSectionTemplates đếm số mẫu trong thư viện section toàn cục.
// KHÔNG phải đếm page_section — số liệu này là "thư viện có bao nhiêu mẫu".
func (r *StatsRepository) CountSectionTemplates() (int64, error) {
	var total int64
	err := r.db.Model(&models.SectionTemplateLibrary{}).Count(&total).Error
	return total, err
}
