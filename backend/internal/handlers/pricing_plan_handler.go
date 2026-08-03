package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/repository"
	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

// PricingPlanHandler xử lý request cho trang admin Pricing Plans.
type PricingPlanHandler struct {
	planService *service.PricingPlanService
}

func NewPricingPlanHandler(planService *service.PricingPlanService) *PricingPlanHandler {
	return &PricingPlanHandler{planService: planService}
}

type planFeatureRequest struct {
	Label    string `json:"label" binding:"required,max=200"`
	Included *bool  `json:"included"` // không gửi -> mặc định true (có tính năng)
}

type createPlanRequest struct {
	Code        string               `json:"code" binding:"required,max=30"`
	Name        string               `json:"name" binding:"required,max=100"`
	Label       string               `json:"label" binding:"omitempty,max=100"`
	Price       int64                `json:"price" binding:"min=0"`
	Unit        string               `json:"unit" binding:"omitempty,max=20"`
	Highlighted bool                 `json:"highlighted"`
	Badge       string               `json:"badge" binding:"omitempty,max=50"`
	SortOrder   int                  `json:"sort_order"`
	Features    []planFeatureRequest `json:"features"`
}

type updatePlanRequest struct {
	Code        *string               `json:"code" binding:"omitempty,max=30"`
	Name        *string               `json:"name" binding:"omitempty,min=1,max=100"`
	Label       *string               `json:"label" binding:"omitempty,max=100"`
	Price       *int64                `json:"price" binding:"omitempty,min=0"`
	Unit        *string               `json:"unit" binding:"omitempty,max=20"`
	Highlighted *bool                 `json:"highlighted"`
	Badge       *string               `json:"badge" binding:"omitempty,max=50"`
	SortOrder   *int                  `json:"sort_order"`
	IsActive    *bool                 `json:"is_active"`
	Features    *[]planFeatureRequest `json:"features"` // nil = giữ nguyên tính năng cũ
}

// toFeatureInputs quy đổi request sang input của service.
// included không gửi thì hiểu là true — dòng tính năng mặc định là "có".
func toFeatureInputs(reqs []planFeatureRequest) []service.PlanFeatureInput {
	inputs := make([]service.PlanFeatureInput, 0, len(reqs))
	for _, r := range reqs {
		included := true
		if r.Included != nil {
			included = *r.Included
		}
		inputs = append(inputs, service.PlanFeatureInput{Label: r.Label, Included: included})
	}
	return inputs
}

// List godoc — GET /api/v1/admin/plans
// Trang admin thấy cả gói đang ẩn (?include_inactive=false để chỉ lấy gói đang bán).
func (h *PricingPlanHandler) List(c *gin.Context) {
	includeInactive := c.Query("include_inactive") != "false"

	plans, err := h.planService.ListPlans(includeInactive)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "lấy danh sách gói thất bại")
		return
	}

	response.OK(c, http.StatusOK, "lấy danh sách thành công", plans)
}

// GetByID godoc — GET /api/v1/admin/plans/:id
func (h *PricingPlanHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "plan ID không hợp lệ")
		return
	}

	plan, err := h.planService.GetPlan(id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			response.Fail(c, http.StatusNotFound, "không tìm thấy gói")
			return
		}
		response.Fail(c, http.StatusInternalServerError, "lấy thông tin gói thất bại")
		return
	}

	response.OK(c, http.StatusOK, "lấy thông tin thành công", plan)
}

// Create godoc — POST /api/v1/admin/plans
func (h *PricingPlanHandler) Create(c *gin.Context) {
	var req createPlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	plan, err := h.planService.CreatePlan(service.CreatePlanInput{
		Code:        req.Code,
		Name:        req.Name,
		Label:       req.Label,
		Price:       req.Price,
		Unit:        req.Unit,
		Highlighted: req.Highlighted,
		Badge:       req.Badge,
		SortOrder:   req.SortOrder,
		Features:    toFeatureInputs(req.Features),
	})
	if err != nil {
		if errors.Is(err, service.ErrPlanCodeExists) {
			response.Fail(c, http.StatusConflict, err.Error())
			return
		}
		response.Fail(c, http.StatusInternalServerError, "tạo gói thất bại")
		return
	}

	response.OK(c, http.StatusCreated, "tạo gói thành công", plan)
}

// Update godoc — PUT /api/v1/admin/plans/:id
func (h *PricingPlanHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "plan ID không hợp lệ")
		return
	}

	var req updatePlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	in := service.UpdatePlanInput{
		Code:        req.Code,
		Name:        req.Name,
		Label:       req.Label,
		Price:       req.Price,
		Unit:        req.Unit,
		Highlighted: req.Highlighted,
		Badge:       req.Badge,
		SortOrder:   req.SortOrder,
		IsActive:    req.IsActive,
	}
	if req.Features != nil {
		in.HasFeatures = true
		in.Features = toFeatureInputs(*req.Features)
	}

	plan, err := h.planService.UpdatePlan(id, in)
	if err != nil {
		switch {
		case errors.Is(err, repository.ErrNotFound):
			response.Fail(c, http.StatusNotFound, "không tìm thấy gói")
		case errors.Is(err, service.ErrPlanCodeExists):
			response.Fail(c, http.StatusConflict, err.Error())
		default:
			response.Fail(c, http.StatusInternalServerError, "cập nhật gói thất bại")
		}
		return
	}

	response.OK(c, http.StatusOK, "cập nhật thành công", plan)
}

// Delete godoc — DELETE /api/v1/admin/plans/:id
// Không ảnh hưởng user đang ở gói đó (app_user.plan_type là ENUM riêng).
// Muốn ngừng bán mà giữ dữ liệu thì PUT với is_active = false.
func (h *PricingPlanHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "plan ID không hợp lệ")
		return
	}

	if err := h.planService.DeletePlan(id); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			response.Fail(c, http.StatusNotFound, "không tìm thấy gói")
			return
		}
		response.Fail(c, http.StatusInternalServerError, "xoá gói thất bại")
		return
	}

	response.OK(c, http.StatusOK, "xoá gói thành công", nil)
}
