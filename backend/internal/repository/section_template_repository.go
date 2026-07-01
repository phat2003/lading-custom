package repository

import (
	"github.com/google/uuid"
	"github.com/nhienthai/lading-custom/backend/internal/models"
	"gorm.io/gorm"
)

type SectionTemplateRepository struct {
	db *gorm.DB
}

func NewSectionTemplateRepository(db *gorm.DB) *SectionTemplateRepository {
	return &SectionTemplateRepository{db: db}
}

// Thêm 1 mẫu Section mới vào thư viện (thường do Admin thao tác)
func (r *SectionTemplateRepository) Create(template *models.SectionTemplateLibrary) error {
	return r.db.Create(template).Error
}

// Lấy danh sách mẫu Section (có hỗ trợ lọc theo loại, ví dụ: type=hero)
func (r *SectionTemplateRepository) GetAll(sectionType string) ([]models.SectionTemplateLibrary, error) {
	var templates []models.SectionTemplateLibrary
	query := r.db.Order("created_at desc")
	
	if sectionType != "" {
		query = query.Where("section_type = ?", sectionType)
	}
	
	err := query.Find(&templates).Error
	return templates, err
}

// Lấy 1 mẫu cụ thể theo ID
func (r *SectionTemplateRepository) FindByID(id uuid.UUID) (*models.SectionTemplateLibrary, error) {
	var template models.SectionTemplateLibrary
	// 👉 LƯU Ý: Nếu GORM báo lỗi "column id does not exist", bạn hãy sửa "id = ?" thành tên cột khóa chính của bảng (ví dụ: "section_template_library_id = ?")
	err := r.db.Where("id = ?", id).First(&template).Error
	if err != nil {
		return nil, err
	}
	return &template, nil
}