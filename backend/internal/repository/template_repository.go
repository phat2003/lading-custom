package repository

import (
	"errors"
	"strings"

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

// CreateWithSections tạo template kèm TOÀN BỘ section con trong 1 transaction.
// Phải nguyên tử: nếu ghi nửa chừng rồi lỗi, DB sẽ còn lại một template thiếu khối
// mà người dùng vẫn thấy "lưu thành công" — mẫu hỏng nhưng không ai biết.
// TemplateID của từng section được gán bên trong tx, sau khi template có ID.
func (r *TemplateRepository) CreateWithSections(t *models.Template, sections []models.TemplateSection) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(t).Error; err != nil {
			return err
		}
		for i := range sections {
			sections[i].TemplateID = t.TemplateID
			if err := tx.Create(&sections[i]).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

// TemplateFilter là điều kiện lọc + phân trang cho danh sách template ở trang admin.
// Chuỗi rỗng hoặc "all" nghĩa là KHÔNG lọc theo trường đó.
type TemplateFilter struct {
	Search   string // tìm theo tên template
	Category string
	Status   string
	Tier     string
	Page     int // bắt đầu từ 1
	Limit    int
}

// FindPaged trả về một trang template kèm TỔNG số bản ghi khớp bộ lọc.
// KHÔNG preload sections: danh sách chỉ cần số lượng section (đếm riêng bằng
// CountSectionsByTemplateIDs), preload nội dung sẽ kéo về JSONB rất nặng.
func (r *TemplateRepository) FindPaged(f TemplateFilter) ([]models.Template, int64, error) {
	query := r.db.Model(&models.Template{})

	if f.Search != "" {
		query = query.Where("name ILIKE ?", "%"+escapeLike(f.Search)+"%")
	}
	if f.Category != "" && f.Category != "all" {
		query = query.Where("category = ?", f.Category)
	}
	if f.Status != "" && f.Status != "all" {
		query = query.Where("status = ?", f.Status)
	}
	if f.Tier != "" && f.Tier != "all" {
		query = query.Where("tier = ?", f.Tier)
	}

	// Đếm trước khi phân trang để meta.total là tổng toàn bộ, không phải số dòng trang này.
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Khởi tạo non-nil để JSON trả [] thay vì null khi không có kết quả.
	templates := []models.Template{}
	offset := (f.Page - 1) * f.Limit
	err := query.
		Order("updated_at DESC").
		Limit(f.Limit).
		Offset(offset).
		Find(&templates).Error

	return templates, total, err
}

// CountSectionsByTemplateIDs đếm số section của nhiều template trong 1 câu truy vấn
// (tránh N+1 khi render danh sách). Template không có section sẽ không xuất hiện
// trong map -> phía gọi đọc ra 0.
func (r *TemplateRepository) CountSectionsByTemplateIDs(ids []uuid.UUID) (map[uuid.UUID]int64, error) {
	counts := make(map[uuid.UUID]int64, len(ids))
	if len(ids) == 0 {
		return counts, nil
	}

	var rows []struct {
		TemplateID uuid.UUID
		Total      int64
	}
	err := r.db.Model(&models.TemplateSection{}).
		Select("template_id, COUNT(*) AS total").
		Where("template_id IN ?", ids).
		Group("template_id").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	for _, row := range rows {
		counts[row.TemplateID] = row.Total
	}
	return counts, nil
}

// escapeLike vô hiệu hoá các ký tự đại diện của LIKE trong từ khoá người dùng nhập,
// để "100%" được tìm đúng nghĩa đen thay vì khớp mọi thứ.
func escapeLike(s string) string {
	replacer := strings.NewReplacer(`\`, `\\`, `%`, `\%`, `_`, `\_`)
	return replacer.Replace(s)
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
