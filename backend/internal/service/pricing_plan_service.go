package service

import (
	"errors"

	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

// ErrPlanCodeExists — mã gói bị trùng (cột code là UNIQUE).
var ErrPlanCodeExists = errors.New("mã gói đã tồn tại")

// PricingPlanService chứa business logic cho trang admin Pricing Plans.
type PricingPlanService struct {
	planRepo *repository.PricingPlanRepository
}

func NewPricingPlanService(planRepo *repository.PricingPlanRepository) *PricingPlanService {
	return &PricingPlanService{planRepo: planRepo}
}

// PlanFeatureInput là 1 dòng tính năng do client gửi lên.
type PlanFeatureInput struct {
	Label    string
	Included bool
}

// toFeatureModels gán sort_order theo đúng thứ tự client gửi,
// để danh sách hiển thị lại y như lúc admin sắp xếp.
func toFeatureModels(inputs []PlanFeatureInput) []models.PlanFeature {
	features := make([]models.PlanFeature, 0, len(inputs))
	for i, in := range inputs {
		features = append(features, models.PlanFeature{
			Label:     in.Label,
			Included:  in.Included,
			SortOrder: i + 1,
		})
	}
	return features
}

// ListPlans trả toàn bộ gói kèm tính năng.
// includeInactive = true (trang admin) thì lấy cả gói đang ẩn.
func (s *PricingPlanService) ListPlans(includeInactive bool) ([]models.PricingPlan, error) {
	return s.planRepo.FindAll(includeInactive)
}

// GetPlan lấy 1 gói theo ID.
func (s *PricingPlanService) GetPlan(id uuid.UUID) (*models.PricingPlan, error) {
	return s.planRepo.FindByID(id)
}

// CreatePlanInput dữ liệu đầu vào tạo gói mới.
type CreatePlanInput struct {
	Code        string
	Name        string
	Label       string
	Price       int64
	Unit        string
	Highlighted bool
	Badge       string
	SortOrder   int
	Features    []PlanFeatureInput
}

// CreatePlan tạo gói mới kèm danh sách tính năng.
func (s *PricingPlanService) CreatePlan(in CreatePlanInput) (*models.PricingPlan, error) {
	exists, err := s.planRepo.ExistsByCode(in.Code, uuid.Nil)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrPlanCodeExists
	}

	unit := in.Unit
	if unit == "" {
		unit = "/tháng"
	}

	plan := &models.PricingPlan{
		Code:        in.Code,
		Name:        in.Name,
		Label:       in.Label,
		Price:       in.Price,
		Unit:        unit,
		Highlighted: in.Highlighted,
		Badge:       in.Badge,
		SortOrder:   in.SortOrder,
		IsActive:    true, // gói mới tạo thì hiển thị ngay
	}
	if err := s.planRepo.CreateWithFeatures(plan, toFeatureModels(in.Features)); err != nil {
		return nil, err
	}
	return plan, nil
}

// UpdatePlanInput các trường được phép sửa.
// Con trỏ = nil nghĩa là client không gửi field đó -> giữ nguyên giá trị cũ.
// Features = nil thì giữ nguyên danh sách tính năng cũ; gửi mảng rỗng là xoá hết.
type UpdatePlanInput struct {
	Code        *string
	Name        *string
	Label       *string
	Price       *int64
	Unit        *string
	Highlighted *bool
	Badge       *string
	SortOrder   *int
	IsActive    *bool
	Features    []PlanFeatureInput
	HasFeatures bool
}

// UpdatePlan cập nhật gói và (tuỳ chọn) thay thế danh sách tính năng.
func (s *PricingPlanService) UpdatePlan(id uuid.UUID, in UpdatePlanInput) (*models.PricingPlan, error) {
	plan, err := s.planRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if in.Code != nil && *in.Code != plan.Code {
		exists, err := s.planRepo.ExistsByCode(*in.Code, id)
		if err != nil {
			return nil, err
		}
		if exists {
			return nil, ErrPlanCodeExists
		}
		plan.Code = *in.Code
	}
	if in.Name != nil {
		plan.Name = *in.Name
	}
	if in.Label != nil {
		plan.Label = *in.Label
	}
	if in.Price != nil {
		plan.Price = *in.Price
	}
	if in.Unit != nil {
		plan.Unit = *in.Unit
	}
	if in.Highlighted != nil {
		plan.Highlighted = *in.Highlighted
	}
	if in.Badge != nil {
		plan.Badge = *in.Badge
	}
	if in.SortOrder != nil {
		plan.SortOrder = *in.SortOrder
	}
	if in.IsActive != nil {
		plan.IsActive = *in.IsActive
	}

	// nil = không đụng tới tính năng; mảng rỗng = xoá sạch tính năng.
	var features []models.PlanFeature
	if in.HasFeatures {
		features = toFeatureModels(in.Features)
		if features == nil {
			features = []models.PlanFeature{}
		}
	}

	if err := s.planRepo.UpdateWithFeatures(plan, features); err != nil {
		return nil, err
	}
	return plan, nil
}

// DeletePlan xoá gói khỏi bảng giá.
//
// LƯU Ý: không ảnh hưởng tới user đang ở gói đó — app_user.plan_type là ENUM
// riêng, không tham chiếu sang bảng này. Muốn ngừng bán mà vẫn giữ dữ liệu thì
// dùng UpdatePlan với IsActive = false.
func (s *PricingPlanService) DeletePlan(id uuid.UUID) error {
	return s.planRepo.Delete(id)
}
