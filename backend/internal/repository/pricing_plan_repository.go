package repository

import (
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/nhienthai/lading-custom/backend/internal/models"
)

// PricingPlanRepository truy vấn bảng giá (pricing_plan + plan_feature).
type PricingPlanRepository struct {
	db *gorm.DB
}

func NewPricingPlanRepository(db *gorm.DB) *PricingPlanRepository {
	return &PricingPlanRepository{db: db}
}

// FindAll trả toàn bộ gói kèm tính năng, sắp theo sort_order.
// includeInactive = false thì bỏ qua gói đã bị ẩn (is_active = false).
// Không phân trang: bảng giá chỉ có vài dòng và trang cần hiển thị hết một lượt.
func (r *PricingPlanRepository) FindAll(includeInactive bool) ([]models.PricingPlan, error) {
	query := r.db.
		Preload("Features", func(db *gorm.DB) *gorm.DB {
			return db.Order("sort_order ASC")
		}).
		Order("sort_order ASC")

	if !includeInactive {
		query = query.Where("is_active = ?", true)
	}

	plans := []models.PricingPlan{}
	err := query.Find(&plans).Error
	return plans, err
}

// FindByID lấy 1 gói kèm tính năng.
func (r *PricingPlanRepository) FindByID(id uuid.UUID) (*models.PricingPlan, error) {
	var plan models.PricingPlan
	err := r.db.
		Preload("Features", func(db *gorm.DB) *gorm.DB {
			return db.Order("sort_order ASC")
		}).
		First(&plan, "plan_id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &plan, err
}

// ExistsByCode kiểm tra mã gói đã tồn tại chưa (code là UNIQUE).
// excludeID khác uuid.Nil thì bỏ qua chính gói đó — dùng khi cập nhật.
func (r *PricingPlanRepository) ExistsByCode(code string, excludeID uuid.UUID) (bool, error) {
	query := r.db.Model(&models.PricingPlan{}).Where("code = ?", code)
	if excludeID != uuid.Nil {
		query = query.Where("plan_id <> ?", excludeID)
	}

	var count int64
	err := query.Count(&count).Error
	return count > 0, err
}

// CreateWithFeatures tạo gói kèm toàn bộ tính năng trong 1 transaction.
// Phải nguyên tử: ghi được gói mà hỏng ở tính năng sẽ để lại một gói trống
// trên bảng giá mà admin vẫn thấy báo "tạo thành công".
func (r *PricingPlanRepository) CreateWithFeatures(plan *models.PricingPlan, features []models.PlanFeature) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Tách Features ra khỏi struct để GORM không tự ghi association
		// trước khi plan có ID.
		plan.Features = nil
		if err := tx.Create(plan).Error; err != nil {
			return err
		}
		for i := range features {
			features[i].PlanID = plan.PlanID
			if err := tx.Create(&features[i]).Error; err != nil {
				return err
			}
		}
		plan.Features = features
		return nil
	})
}

// UpdateWithFeatures cập nhật gói và THAY THẾ toàn bộ danh sách tính năng.
//
// Thay thế cả cụm (xoá hết rồi ghi lại) thay vì so khớp từng dòng: form sửa gói
// cho phép thêm/bớt/đổi thứ tự tuỳ ý, so khớp từng dòng sẽ phức tạp mà không
// được lợi gì — feature_id không được tham chiếu từ bảng nào khác.
// features = nil nghĩa là client không gửi danh sách -> giữ nguyên tính năng cũ.
func (r *PricingPlanRepository) UpdateWithFeatures(plan *models.PricingPlan, features []models.PlanFeature) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		plan.Features = nil
		if err := tx.Save(plan).Error; err != nil {
			return err
		}

		if features == nil {
			return nil
		}

		if err := tx.Where("plan_id = ?", plan.PlanID).Delete(&models.PlanFeature{}).Error; err != nil {
			return err
		}
		for i := range features {
			features[i].FeatureID = uuid.Nil // để DB sinh ID mới
			features[i].PlanID = plan.PlanID
			if err := tx.Create(&features[i]).Error; err != nil {
				return err
			}
		}
		plan.Features = features
		return nil
	})
}

// Delete xoá gói. plan_feature có ON DELETE CASCADE nên tính năng đi theo.
func (r *PricingPlanRepository) Delete(id uuid.UUID) error {
	result := r.db.Delete(&models.PricingPlan{}, "plan_id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrNotFound
	}
	return nil
}
