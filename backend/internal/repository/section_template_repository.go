package repository

import (
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/nhienthai/lading-custom/backend/internal/models"
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

// SectionTemplateFilter là điều kiện lọc + phân trang cho trang admin Sections.
// Chuỗi rỗng hoặc "all" nghĩa là KHÔNG lọc theo trường đó.
type SectionTemplateFilter struct {
	Search      string // tìm theo display_name
	SectionType string
	Page        int // bắt đầu từ 1
	Limit       int
}

// FindPaged trả về một trang section mẫu kèm TỔNG số bản ghi khớp bộ lọc.
func (r *SectionTemplateRepository) FindPaged(f SectionTemplateFilter) ([]models.SectionTemplateLibrary, int64, error) {
	query := r.db.Model(&models.SectionTemplateLibrary{})

	if f.Search != "" {
		query = query.Where("display_name ILIKE ?", "%"+escapeLike(f.Search)+"%")
	}
	if f.SectionType != "" && f.SectionType != "all" {
		query = query.Where("section_type = ?", f.SectionType)
	}

	// Đếm trước khi phân trang để meta.total là tổng toàn bộ, không phải số dòng trang này.
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Khởi tạo non-nil để JSON trả [] thay vì null khi không có kết quả.
	templates := []models.SectionTemplateLibrary{}
	err := query.
		Order("created_at DESC").
		Limit(f.Limit).
		Offset((f.Page - 1) * f.Limit).
		Find(&templates).Error

	return templates, total, err
}

// Lấy 1 mẫu cụ thể theo ID
func (r *SectionTemplateRepository) FindByID(id uuid.UUID) (*models.SectionTemplateLibrary, error) {
	var template models.SectionTemplateLibrary
	err := r.db.First(&template, "section_template_id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &template, nil
}

// Update lưu thay đổi của 1 mẫu Section.
func (r *SectionTemplateRepository) Update(template *models.SectionTemplateLibrary) error {
	return r.db.Save(template).Error
}

// Delete xoá mẫu Section khỏi thư viện.
// Các template_section đã seed từ mẫu này KHÔNG bị xoá theo: cột
// source_section_template_id là ON DELETE SET NULL, nên nội dung khách hàng
// đã dùng vẫn còn nguyên, chỉ mất dấu vết nguồn gốc.
func (r *SectionTemplateRepository) Delete(id uuid.UUID) error {
	result := r.db.Delete(&models.SectionTemplateLibrary{}, "section_template_id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrNotFound
	}
	return nil
}

// CountUsageByIDs đếm số TEMPLATE đang dùng mỗi section mẫu (cột "used_in").
// Đếm DISTINCT template_id: một template dùng cùng một mẫu ở 2 vị trí vẫn tính là 1.
// Mẫu chưa được dùng sẽ không xuất hiện trong map -> phía gọi đọc ra 0.
func (r *SectionTemplateRepository) CountUsageByIDs(ids []uuid.UUID) (map[uuid.UUID]int64, error) {
	counts := make(map[uuid.UUID]int64, len(ids))
	if len(ids) == 0 {
		return counts, nil
	}

	var rows []struct {
		SourceSectionTemplateID uuid.UUID
		Total                   int64
	}
	err := r.db.Model(&models.TemplateSection{}).
		Select("source_section_template_id, COUNT(DISTINCT template_id) AS total").
		Where("source_section_template_id IN ?", ids).
		Group("source_section_template_id").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	for _, row := range rows {
		counts[row.SourceSectionTemplateID] = row.Total
	}
	return counts, nil
}
