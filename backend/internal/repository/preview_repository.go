package repository

import (
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/nhienthai/lading-custom/backend/internal/models"
)

// PreviewRepository truy vấn dữ liệu phục vụ tính năng realtime preview.
type PreviewRepository struct {
	db *gorm.DB
}

func NewPreviewRepository(db *gorm.DB) *PreviewRepository {
	return &PreviewRepository{db: db}
}

// FindLandingPage tìm landing page theo ID và kiểm tra quyền sở hữu.
// Quyền sở hữu xác định qua project.owner_id (landing page thuộc project, project thuộc user).
// Trả về gorm.ErrRecordNotFound nếu không tồn tại HOẶC user không phải chủ sở hữu
// (gộp 2 trường hợp để không lộ sự tồn tại của trang cho người lạ).
func (r *PreviewRepository) FindLandingPage(id uuid.UUID, ownerID uuid.UUID) (*models.LandingPage, error) {
	var page models.LandingPage

	err := r.db.
		Joins("JOIN project ON project.project_id = landing_page.project_id").
		Where("landing_page.landing_page_id = ? AND project.owner_id = ?", id, ownerID).
		First(&page).Error
	if err != nil {
		return nil, err
	}

	return &page, nil
}

// FindSections lấy toàn bộ section đang hiển thị của 1 landing page,
// sắp xếp theo order_index tăng dần để render đúng thứ tự trên trang.
// Section bị ẩn (is_visible = false) không được đưa vào preview.
func (r *PreviewRepository) FindSections(landingPageID uuid.UUID) ([]models.PageSection, error) {
	var sections []models.PageSection

	err := r.db.
		Where("landing_page_id = ? AND is_visible = ?", landingPageID, true).
		Order("order_index asc").
		Find(&sections).Error
	if err != nil {
		return nil, err
	}

	return sections, nil
}

// FindLatestSnapshot lấy bản snapshot publish mới nhất của landing page.
// Dùng để so sánh nội dung đang soạn (draft) với bản đã publish.
// Trả về gorm.ErrRecordNotFound nếu trang chưa từng được publish.
func (r *PreviewRepository) FindLatestSnapshot(landingPageID uuid.UUID) (*models.PublishedSnapshot, error) {
	var snapshot models.PublishedSnapshot

	err := r.db.
		Where("landing_page_id = ?", landingPageID).
		Order("published_at desc").
		First(&snapshot).Error
	if err != nil {
		return nil, err
	}

	return &snapshot, nil
}
