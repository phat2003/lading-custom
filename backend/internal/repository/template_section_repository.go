package repository

import (
	"github.com/google/uuid"
	"github.com/nhienthai/lading-custom/backend/internal/models"
	"gorm.io/gorm"
)

type TemplateSectionRepository struct {
	db *gorm.DB
}

func NewTemplateSectionRepository(db *gorm.DB) *TemplateSectionRepository {
	return &TemplateSectionRepository{db: db}
}

// Create: Thêm 1 khối mới vào Template
func (r *TemplateSectionRepository) Create(section *models.TemplateSection) error {
	return r.db.Create(section).Error
}

// FindByTemplateID: Lấy các khối của Template
func (r *TemplateSectionRepository) FindByTemplateID(templateID uuid.UUID) ([]models.TemplateSection, error) {
	var sections []models.TemplateSection
	err := r.db.Where("template_id = ?", templateID).Order("order_index asc").Find(&sections).Error
	return sections, err
}