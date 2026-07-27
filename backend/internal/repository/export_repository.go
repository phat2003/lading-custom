package repository

import (
	"github.com/google/uuid"
	"github.com/nhienthai/lading-custom/backend/internal/models"
	"gorm.io/gorm"
)

// ExportRepository truy vấn dữ liệu phục vụ tính năng export PDF.
type ExportRepository struct {
	db *gorm.DB
}

func NewExportRepository(db *gorm.DB) *ExportRepository {
	return &ExportRepository{db: db}
}

// FindLandingPageWithSections tìm landing page theo ID và đảm bảo user (ownerID)
// là chủ sở hữu — quyền sở hữu được xác định qua project.owner_id.
// Trả về landing page kèm danh sách section đã sắp xếp theo order_index ASC.
func (r *ExportRepository) FindLandingPageWithSections(landingPageID uuid.UUID, ownerID uuid.UUID) (*models.LandingPage, []models.PageSection, error) {
	var page models.LandingPage

	// JOIN sang bảng project để kiểm tra owner_id — chỉ chủ dự án mới export được.
	err := r.db.
		Joins("JOIN project ON project.project_id = landing_page.project_id").
		Where("landing_page.landing_page_id = ? AND project.owner_id = ?", landingPageID, ownerID).
		First(&page).Error
	if err != nil {
		return nil, nil, err
	}

	// Lấy toàn bộ section của landing page, sắp xếp theo order_index tăng dần.
	var sections []models.PageSection
	err = r.db.
		Where("landing_page_id = ?", landingPageID).
		Order("order_index asc").
		Find(&sections).Error
	if err != nil {
		return nil, nil, err
	}

	return &page, sections, nil
}
