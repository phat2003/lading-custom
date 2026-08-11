package repository

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/nhienthai/lading-custom/backend/internal/models"
)

type ProjectRepository struct {
	db *gorm.DB
}

func NewProjectRepository(db *gorm.DB) *ProjectRepository {
	return &ProjectRepository{db: db}
}

// Create: Thêm dự án mới
func (r *ProjectRepository) Create(project *models.Project) error {
	return r.db.Create(project).Error
}

// FindAllByOwnerID: Lấy tất cả dự án của một User
func (r *ProjectRepository) FindAllByOwnerID(ownerID uuid.UUID) ([]models.Project, error) {
	var projects []models.Project
	err := r.db.Where("owner_id = ?", ownerID).Order("created_at desc").Find(&projects).Error
	return projects, err
}

// CountByOwnerID: Đếm số dự án của 1 User (panel chi tiết user ở trang admin)
func (r *ProjectRepository) CountByOwnerID(ownerID uuid.UUID) (int64, error) {
	var total int64
	err := r.db.Model(&models.Project{}).Where("owner_id = ?", ownerID).Count(&total).Error
	return total, err
}

// FindByIDAndOwnerID: Lấy 1 dự án cụ thể (phải đúng chủ sở hữu mới lấy được)
func (r *ProjectRepository) FindByIDAndOwnerID(id, ownerID uuid.UUID) (*models.Project, error) {
	var project models.Project
	err := r.db.Where("project_id = ? AND owner_id = ?", id, ownerID).First(&project).Error
	if err != nil {
		return nil, err
	}
	return &project, nil
}

// Update: Cập nhật thông tin dự án
func (r *ProjectRepository) Update(project *models.Project) error {
	return r.db.Save(project).Error
}

// Delete: Xóa dự án
func (r *ProjectRepository) Delete(project *models.Project) error {
	return r.db.Delete(project).Error
}

// DeleteByID: Xóa dự án theo ID, KHÔNG kiểm tra chủ sở hữu (chỉ dùng cho admin).
// CASCADE kéo theo landing page -> page section -> snapshot của dự án đó.
func (r *ProjectRepository) DeleteByID(id uuid.UUID) error {
	result := r.db.Delete(&models.Project{}, "project_id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrNotFound
	}
	return nil
}

// AdminProjectFilter là điều kiện lọc + phân trang cho trang admin Projects.
type AdminProjectFilter struct {
	Search string // tìm trong tên dự án, tên và email chủ sở hữu
	Status string // all | published | draft
	Page   int    // bắt đầu từ 1
	Limit  int
}

// AdminProjectRow là 1 dòng dữ liệu thô của bảng Projects toàn hệ thống.
// Không phải entity — là read model ghép từ project + app_user + landing_page.
type AdminProjectRow struct {
	ProjectID    uuid.UUID `gorm:"column:project_id"`
	Name         string    `gorm:"column:name"`
	CreatedAt    time.Time `gorm:"column:created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at"`
	OwnerID      uuid.UUID `gorm:"column:owner_id"`
	OwnerName    string    `gorm:"column:owner_name"`
	OwnerEmail   string    `gorm:"column:owner_email"`
	PageCount    int64     `gorm:"column:page_count"`
	HasPublished bool      `gorm:"column:has_published"`
}

// Câu điều kiện "dự án có ít nhất 1 landing page đã publish".
// Dùng EXISTS thay vì HAVING để câu đếm tổng không phải gom nhóm.
const existsPublishedPage = `EXISTS (
	SELECT 1 FROM landing_page lp2
	WHERE lp2.project_id = p.project_id AND lp2.status = 'published'
)`

// FindPagedForAdmin trả một trang dự án của TOÀN HỆ THỐNG kèm tổng số bản ghi.
// project không có cột status/domain — trạng thái được suy ra từ landing_page:
// dự án coi là "published" nếu có ít nhất 1 trang đã publish.
func (r *ProjectRepository) FindPagedForAdmin(f AdminProjectFilter) ([]AdminProjectRow, int64, error) {
	// Dựng lại query từ đầu cho mỗi lần dùng: tái sử dụng cùng một *gorm.DB
	// cho Count rồi Find sẽ mang theo điều kiện thừa của lần trước.
	buildBase := func() *gorm.DB {
		q := r.db.Table("project AS p").
			Joins("JOIN app_user AS u ON u.user_id = p.owner_id")

		if f.Search != "" {
			kw := "%" + escapeLike(f.Search) + "%"
			q = q.Where("p.name ILIKE ? OR u.full_name ILIKE ? OR u.email ILIKE ?", kw, kw, kw)
		}
		switch f.Status {
		case "published":
			q = q.Where(existsPublishedPage)
		case "draft":
			q = q.Where("NOT " + existsPublishedPage)
		}
		return q
	}

	var total int64
	if err := buildBase().Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Khởi tạo non-nil để JSON trả [] thay vì null khi không có kết quả.
	rows := []AdminProjectRow{}
	err := buildBase().
		Select(`p.project_id, p.name, p.created_at, p.updated_at,
			u.user_id AS owner_id, u.full_name AS owner_name, u.email AS owner_email,
			COUNT(lp.landing_page_id) AS page_count,
			COALESCE(BOOL_OR(lp.status = 'published'), false) AS has_published`).
		Joins("LEFT JOIN landing_page AS lp ON lp.project_id = p.project_id").
		// project_id và user_id đều là khóa chính nên Postgres cho phép
		// select các cột còn lại của 2 bảng mà không cần liệt kê trong GROUP BY.
		Group("p.project_id, u.user_id").
		Order("p.updated_at DESC").
		Limit(f.Limit).
		Offset((f.Page - 1) * f.Limit).
		Scan(&rows).Error

	return rows, total, err
}

// FindTemplateNamesByProjectIDs lấy tên template gốc đại diện cho mỗi dự án.
// Một dự án có thể có nhiều trang từ nhiều template khác nhau, nên lấy template
// của trang ĐƯỢC TẠO SỚM NHẤT mà có nguồn gốc template (bỏ qua trang tạo từ Blank).
// Dự án không có trang nào từ template sẽ không xuất hiện trong map.
func (r *ProjectRepository) FindTemplateNamesByProjectIDs(ids []uuid.UUID) (map[uuid.UUID]string, error) {
	names := make(map[uuid.UUID]string, len(ids))
	if len(ids) == 0 {
		return names, nil
	}

	var rows []struct {
		ProjectID    uuid.UUID
		TemplateName string
	}
	err := r.db.Raw(`
		SELECT DISTINCT ON (lp.project_id) lp.project_id, t.name AS template_name
		FROM landing_page lp
		JOIN template t ON t.template_id = lp.source_template_id
		WHERE lp.project_id IN ?
		ORDER BY lp.project_id, lp.created_at ASC
	`, ids).Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	for _, row := range rows {
		names[row.ProjectID] = row.TemplateName
	}
	return names, nil
}

// FindPublishedURLsByProjectIDs lấy slug công khai đại diện cho mỗi dự án.
// Dự án có nhiều trang đã publish thì lấy slug của trang cập nhật gần nhất.
// Chỉ tính trang đang ở trạng thái published: trang đã unpublish vẫn giữ slug
// trong DB nhưng /p/:slug trả 404 nên không được hiển thị như link đang sống.
func (r *ProjectRepository) FindPublishedURLsByProjectIDs(ids []uuid.UUID) (map[uuid.UUID]string, error) {
	urls := make(map[uuid.UUID]string, len(ids))
	if len(ids) == 0 {
		return urls, nil
	}

	var rows []struct {
		ProjectID    uuid.UUID
		PublishedURL string
	}
	err := r.db.Raw(`
		SELECT DISTINCT ON (lp.project_id) lp.project_id, lp.published_url
		FROM landing_page lp
		WHERE lp.project_id IN ?
		  AND lp.status = 'published'
		  AND lp.published_url IS NOT NULL
		ORDER BY lp.project_id, lp.updated_at DESC
	`, ids).Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	for _, row := range rows {
		urls[row.ProjectID] = row.PublishedURL
	}
	return urls, nil
}
