package repository

import (
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/nhienthai/lading-custom/backend/internal/models"
)

var ErrNotFound = errors.New("không tìm thấy bản ghi")

// UserRepository xử lý truy vấn liên quan tới bảng app_user.
type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create thêm user mới.
func (r *UserRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

// FindByEmail tìm user theo email (dùng cho login).
func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &user, err
}

// FindByID tìm user theo ID.
func (r *UserRepository) FindByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, "user_id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &user, err
}

// ExistsByEmail kiểm tra email đã tồn tại chưa.
func (r *UserRepository) ExistsByEmail(email string) (bool, error) {
	var count int64
	err := r.db.Model(&models.User{}).Where("email = ?", email).Count(&count).Error
	return count > 0, err
}

// Update cập nhật thông tin user.
func (r *UserRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}

// UserFilter là điều kiện lọc + phân trang cho danh sách user ở trang admin.
// Chuỗi rỗng hoặc "all" nghĩa là KHÔNG lọc theo trường đó.
type UserFilter struct {
	Search string // tìm đồng thời trong full_name và email
	Plan   string // all | free | pro
	Status string // all | active | inactive
	Page   int    // bắt đầu từ 1
	Limit  int
}

// FindPaged trả về một trang user kèm TỔNG số bản ghi khớp bộ lọc.
func (r *UserRepository) FindPaged(f UserFilter) ([]models.User, int64, error) {
	query := r.db.Model(&models.User{})

	if f.Search != "" {
		kw := "%" + escapeLike(f.Search) + "%"
		query = query.Where("full_name ILIKE ? OR email ILIKE ?", kw, kw)
	}
	if f.Plan != "" && f.Plan != "all" {
		query = query.Where("plan_type = ?", f.Plan)
	}
	switch f.Status {
	case "active":
		query = query.Where("is_active = ?", true)
	case "inactive":
		query = query.Where("is_active = ?", false)
	}

	// Đếm trước khi phân trang để meta.total là tổng toàn bộ, không phải số dòng trang này.
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Khởi tạo non-nil để JSON trả [] thay vì null khi không có kết quả.
	users := []models.User{}
	err := query.
		Order("created_at DESC").
		Limit(f.Limit).
		Offset((f.Page - 1) * f.Limit).
		Find(&users).Error

	return users, total, err
}

// Delete xoá cứng user theo ID.
// CASCADE trong schema sẽ kéo theo project -> landing page -> section -> media
// của user đó. Mọi ràng buộc nghiệp vụ (không tự xoá mình, không xoá super_admin)
// phải được kiểm tra ở tầng service TRƯỚC khi gọi hàm này.
func (r *UserRepository) Delete(id uuid.UUID) error {
	result := r.db.Delete(&models.User{}, "user_id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrNotFound
	}
	return nil
}

// FindActiveSubscription lấy subscription đang hiệu lực của user (nếu có).
// Đặt ở đây thay vì tạo repository riêng vì subscription chỉ được đọc kèm
// thông tin user trong panel chi tiết. Không có gói active -> (nil, nil).
func (r *UserRepository) FindActiveSubscription(userID uuid.UUID) (*models.Subscription, error) {
	var sub models.Subscription
	err := r.db.
		Where("user_id = ? AND status = ?", userID, models.SubActive).
		First(&sub).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &sub, nil
}
