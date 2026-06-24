package repository

import (
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/nhienthai/lading-custom/backend/internal/models"
)

// TemplateRepository xử lý truy vấn liên quan tới bảng template.
type TemplateRepository struct {
	db *gorm.DB
}

func NewTemplateRepository(db *gorm.DB) *TemplateRepository {
	return &TemplateRepository{db: db}
}

// Create thêm template mới kèm sections (nếu có).
func (r *TemplateRepository) Create(t *models.Template) error {
	return r.db.Create(t).Error
}

// FindAll trả toàn bộ template, preload sections.
func (r *TemplateRepository) FindAll() ([]models.Template, error) {
	var templates []models.Template
	err := r.db.Preload("Sections").Find(&templates).Error
	return templates, err
}

// FindByID tìm template theo ID, preload sections.
func (r *TemplateRepository) FindByID(id uuid.UUID) (*models.Template, error) {
	var t models.Template
	err := r.db.Preload("Sections").First(&t, "template_id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &t, err
}

// Update lưu toàn bộ thay đổi của template (không cập nhật sections).
func (r *TemplateRepository) Update(t *models.Template) error {
	return r.db.Save(t).Error
}

// Delete xoá template theo ID.
func (r *TemplateRepository) Delete(id uuid.UUID) error {
	result := r.db.Delete(&models.Template{}, "template_id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrNotFound
	}
	return nil
}
