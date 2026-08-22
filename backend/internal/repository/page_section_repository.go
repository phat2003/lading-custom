package repository

import (
	"github.com/google/uuid"
	"github.com/nhienthai/lading-custom/backend/internal/models"
	"gorm.io/gorm"
)

type PageSectionRepository struct {
	db *gorm.DB
}

func NewPageSectionRepository(db *gorm.DB) *PageSectionRepository {
	return &PageSectionRepository{db: db}
}

func (r *PageSectionRepository) Create(section *models.PageSection) error {
	return r.db.Create(section).Error
}

func (r *PageSectionRepository) FindByLandingPageID(pageID uuid.UUID) ([]models.PageSection, error) {
	var sections []models.PageSection
	// Sắp xếp theo order_index để các khối hiển thị đúng thứ tự
	err := r.db.Where("landing_page_id = ?", pageID).Order("order_index asc").Find(&sections).Error
	return sections, err
}

func (r *PageSectionRepository) FindByID(id uuid.UUID) (*models.PageSection, error) {
	var section models.PageSection
	err := r.db.Where("section_id = ?", id).First(&section).Error
	if err != nil {
		return nil, err
	}
	return &section, nil
}

func (r *PageSectionRepository) Update(section *models.PageSection) error {
	return r.db.Save(section).Error
}

func (r *PageSectionRepository) Delete(section *models.PageSection) error {
	return r.db.Delete(section).Error
}
