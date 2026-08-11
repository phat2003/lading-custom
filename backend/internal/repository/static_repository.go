package repository

import (
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/nhienthai/lading-custom/backend/internal/models"
)

// ErrForbidden — trang có tồn tại nhưng người gọi không phải chủ sở hữu.
// Tách riêng khỏi gorm.ErrRecordNotFound để handler trả đúng 403 thay vì 404.
var ErrForbidden = errors.New("không có quyền thao tác trên trang này")

// StaticRepository truy vấn dữ liệu phục vụ tính năng sinh HTML tĩnh (static preview)
// và publish landing page ra link công khai.
type StaticRepository struct {
	db *gorm.DB
}

func NewStaticRepository(db *gorm.DB) *StaticRepository {
	return &StaticRepository{db: db}
}

// FindPageWithSections lấy landing page cùng toàn bộ section đang hiển thị,
// sắp theo order_index tăng dần.
//
// Lỗi trả về được tách bạch để handler map đúng HTTP status:
//   - gorm.ErrRecordNotFound: trang không tồn tại  -> 404
//   - ErrForbidden:           trang của user khác  -> 403
func (r *StaticRepository) FindPageWithSections(pageID uuid.UUID, ownerID uuid.UUID) (*models.LandingPage, []models.PageSection, error) {
	page, err := r.FindPageOwned(pageID, ownerID)
	if err != nil {
		return nil, nil, err
	}

	// Section bị ẩn (is_visible = false) không được đưa vào bản publish.
	var sections []models.PageSection
	err = r.db.
		Where("landing_page_id = ? AND is_visible = ?", pageID, true).
		Order("order_index asc").
		Find(&sections).Error
	if err != nil {
		return nil, nil, err
	}

	return page, sections, nil
}

// FindPageOwned lấy landing page và kiểm tra quyền sở hữu, không kèm section.
// Dùng cho các thao tác chỉ cần đổi trạng thái (vd: unpublish).
// Lỗi tách bạch giống FindPageWithSections: gorm.ErrRecordNotFound (404) / ErrForbidden (403).
func (r *StaticRepository) FindPageOwned(pageID uuid.UUID, ownerID uuid.UUID) (*models.LandingPage, error) {
	var page models.LandingPage
	if err := r.db.Where("landing_page_id = ?", pageID).First(&page).Error; err != nil {
		return nil, err // gorm.ErrRecordNotFound nếu không tồn tại
	}

	// Quyền sở hữu xác định qua project.owner_id (landing page thuộc project, project thuộc user).
	var project models.Project
	if err := r.db.Where("project_id = ?", page.ProjectID).First(&project).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Trang mồ côi (project đã bị xóa) -> không ai có quyền thao tác.
			return nil, ErrForbidden
		}
		return nil, err
	}
	if project.OwnerID != ownerID {
		return nil, ErrForbidden
	}

	return &page, nil
}

// FindPublishedPageBySlug tìm trang ĐANG được publish theo slug — dùng cho route công khai /p/:slug.
// Điều kiện status = 'published' khiến trang đã unpublish tự động trả 404 mà không cần
// xóa snapshot: dữ liệu vẫn còn, chỉ là không phục vụ ra ngoài nữa.
// Trả về gorm.ErrRecordNotFound nếu slug lạ HOẶC trang đã bị gỡ.
func (r *StaticRepository) FindPublishedPageBySlug(slug string) (*models.LandingPage, error) {
	var page models.LandingPage

	err := r.db.
		Where("published_url = ? AND status = ?", slug, models.StatusPublished).
		First(&page).Error
	if err != nil {
		return nil, err
	}

	return &page, nil
}

// FindLatestSnapshot lấy snapshot MỚI NHẤT của trang — đây là bản đang live.
// Nhờ vậy slug cũ không thể serve nội dung lỗi thời: chỉ có 1 slug/trang và nó
// luôn trỏ tới bản publish gần nhất.
func (r *StaticRepository) FindLatestSnapshot(pageID uuid.UUID) (*models.PublishedSnapshot, error) {
	var snapshot models.PublishedSnapshot

	err := r.db.
		Where("landing_page_id = ?", pageID).
		Order("published_at desc").
		First(&snapshot).Error
	if err != nil {
		return nil, err
	}

	return &snapshot, nil
}

// PublishInTx thực hiện TOÀN BỘ thao tác publish trong 1 transaction:
//  1. insert snapshot mới,
//  2. gán published_url (chỉ ở lần publish đầu — setSlug = true),
//  3. đổi status sang 'published'.
//
// Ba lệnh ghi phải cùng thành công hoặc cùng rollback: nếu rớt giữa chừng mà không có
// transaction, DB sẽ lệch trạng thái (vd: có snapshot nhưng trang vẫn 'draft',
// hoặc trang 'published' mà chưa có slug -> link công khai không tra được).
func (r *StaticRepository) PublishInTx(snapshot *models.PublishedSnapshot, slug string, setSlug bool) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(snapshot).Error; err != nil {
			return err
		}

		if setSlug {
			// Unique index trên published_url là chốt chặn cuối nếu 2 request publish
			// đồng thời cùng sinh trúng 1 slug: 1 request thắng, request kia rollback sạch.
			err := tx.Model(&models.LandingPage{}).
				Where("landing_page_id = ?", snapshot.LandingPageID).
				Update("published_url", slug).Error
			if err != nil {
				return err
			}
		}

		return tx.Model(&models.LandingPage{}).
			Where("landing_page_id = ?", snapshot.LandingPageID).
			Update("status", models.StatusPublished).Error
	})
}

// SlugExists kiểm tra slug đã được trang nào dùng chưa.
// Slug nằm trên landing_page (unique) — xem migration 002_move_slug_to_page.
func (r *StaticRepository) SlugExists(slug string) (bool, error) {
	var count int64

	err := r.db.
		Model(&models.LandingPage{}).
		Where("published_url = ?", slug).
		Count(&count).Error
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// UpdatePageStatus cập nhật trạng thái của landing page.
// Publish đi qua PublishInTx (nhiều lệnh ghi); hàm này dành cho unpublish —
// unpublish chỉ có ĐÚNG 1 lệnh ghi nên không cần transaction.
func (r *StaticRepository) UpdatePageStatus(pageID uuid.UUID, status models.LandingPageStatus) error {
	return r.db.
		Model(&models.LandingPage{}).
		Where("landing_page_id = ?", pageID).
		Update("status", status).Error
}
