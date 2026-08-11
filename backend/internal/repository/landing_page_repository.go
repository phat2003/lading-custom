package repository

import (
	"github.com/google/uuid"
	"github.com/nhienthai/lading-custom/backend/internal/models"
	"gorm.io/gorm"
)

type LandingPageRepository struct {
	db *gorm.DB
}

func NewLandingPageRepository(db *gorm.DB) *LandingPageRepository {
	return &LandingPageRepository{db: db}
}

// Create: Thêm trang mới
func (r *LandingPageRepository) Create(page *models.LandingPage) error {
	return r.db.Create(page).Error
}

// CreateWithSections tạo trang kèm TOÀN BỘ section con trong 1 transaction.
// Dùng khi clone từ template: nếu copy nửa chừng rồi lỗi thì rollback sạch,
// tránh để lại trang mất khối mà API vẫn báo tạo thành công.
// LandingPageID của từng section được gán bên trong tx, sau khi trang có ID.
func (r *LandingPageRepository) CreateWithSections(page *models.LandingPage, sections []models.PageSection) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(page).Error; err != nil {
			return err
		}
		for i := range sections {
			sections[i].LandingPageID = page.LandingPageID
			if err := tx.Create(&sections[i]).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

// FindByProjectID: Lấy tất cả các trang thuộc về 1 dự án
func (r *LandingPageRepository) FindByProjectID(projectID uuid.UUID) ([]models.LandingPage, error) {
	var pages []models.LandingPage
	err := r.db.Where("project_id = ?", projectID).Order("created_at desc").Find(&pages).Error
	return pages, err
}

// FindByID: Lấy 1 trang cụ thể
func (r *LandingPageRepository) FindByID(id uuid.UUID) (*models.LandingPage, error) {
	var page models.LandingPage
	// LƯU Ý: Nếu DB của bạn cột khóa chính tên là "landing_page_id", hãy đổi "id = ?" thành "landing_page_id = ?" nhé!
	err := r.db.Where("landing_page_id = ?", id).First(&page).Error
	if err != nil {
		return nil, err
	}
	return &page, nil
}

// Update: Cập nhật thông tin trang
func (r *LandingPageRepository) Update(page *models.LandingPage) error {
	return r.db.Save(page).Error
}

// Delete: Xóa trang
func (r *LandingPageRepository) Delete(page *models.LandingPage) error {
	return r.db.Delete(page).Error
}
