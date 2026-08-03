package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

// TemplateHandler xử lý request HTTP cho system template.
type TemplateHandler struct {
	templateService *service.TemplateService
}

func NewTemplateHandler(templateService *service.TemplateService) *TemplateHandler {
	return &TemplateHandler{templateService: templateService}
}

// Giá trị mặc định + trần cho phân trang danh sách template.
const (
	defaultTemplatePage  = 1
	defaultTemplateLimit = 10
	maxTemplateLimit     = 100
)

type createTemplateRequest struct {
	Name         string `json:"name" binding:"required,min=1,max=255"`
	Category     string `json:"category" binding:"omitempty,max=50"`
	Status       string `json:"status" binding:"omitempty,oneof=draft published"`
	Tier         string `json:"tier" binding:"omitempty,oneof=free premium"`
	ThumbnailURL string `json:"thumbnail_url" binding:"omitempty,max=500"`
}

// Con trỏ cho metadata: phân biệt "không gửi field" (nil, giữ nguyên)
// với "gửi chuỗi rỗng" (xoá giá trị cũ).
type updateTemplateRequest struct {
	Name         string  `json:"name" binding:"required,min=1,max=255"`
	Category     *string `json:"category" binding:"omitempty,max=50"`
	Status       *string `json:"status" binding:"omitempty,oneof=draft published"`
	Tier         *string `json:"tier" binding:"omitempty,oneof=free premium"`
	ThumbnailURL *string `json:"thumbnail_url"`
}

// Create godoc — POST /api/v1/admin/templates
func (h *TemplateHandler) Create(c *gin.Context) {
	var req createTemplateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	t, err := h.templateService.CreateSystemTemplate(service.CreateSystemTemplateInput{
		Name:         req.Name,
		Category:     req.Category,
		Status:       models.TemplateStatus(req.Status),
		Tier:         models.TemplateTier(req.Tier),
		ThumbnailURL: req.ThumbnailURL,
	})
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "tạo template thất bại")
		return
	}

	response.OK(c, http.StatusCreated, "tạo template thành công", t)
}

// List godoc — GET /api/v1/admin/templates
// Query: ?page=1&limit=9&search=&category=all&status=all&tier=all
func (h *TemplateHandler) List(c *gin.Context) {
	page := parsePositiveInt(c.Query("page"), defaultTemplatePage)
	limit := parsePositiveInt(c.Query("limit"), defaultTemplateLimit)
	if limit > maxTemplateLimit {
		limit = maxTemplateLimit // chặn client xin cả bảng trong 1 request
	}

	status := c.Query("status")
	if !isAllowedFilter(status, "draft", "published") {
		response.Fail(c, http.StatusBadRequest, "status chỉ nhận: all | draft | published")
		return
	}
	tier := c.Query("tier")
	if !isAllowedFilter(tier, "free", "premium") {
		response.Fail(c, http.StatusBadRequest, "tier chỉ nhận: all | free | premium")
		return
	}

	templates, total, err := h.templateService.ListTemplates(service.ListTemplatesInput{
		Search:   strings.TrimSpace(c.Query("search")),
		Category: c.Query("category"),
		Status:   status,
		Tier:     tier,
		Page:     page,
		Limit:    limit,
	})
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "lấy danh sách template thất bại")
		return
	}

	response.OKWithMeta(c, http.StatusOK, "lấy danh sách thành công", templates,
		response.NewMeta(page, limit, total))
}

// parsePositiveInt đọc số nguyên dương từ query string; giá trị rỗng hoặc
// không hợp lệ (chữ, số âm, 0) đều rơi về mặc định thay vì báo lỗi.
func parsePositiveInt(raw string, fallback int) int {
	n, err := strconv.Atoi(raw)
	if err != nil || n < 1 {
		return fallback
	}
	return n
}

// isAllowedFilter kiểm tra giá trị bộ lọc. Rỗng hoặc "all" = không lọc.
func isAllowedFilter(value string, allowed ...string) bool {
	if value == "" || value == "all" {
		return true
	}
	for _, a := range allowed {
		if value == a {
			return true
		}
	}
	return false
}

// GetByID godoc — GET /api/v1/admin/templates/:id
func (h *TemplateHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "template ID không hợp lệ")
		return
	}

	t, err := h.templateService.GetTemplate(id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			response.Fail(c, http.StatusNotFound, "không tìm thấy template")
			return
		}
		response.Fail(c, http.StatusInternalServerError, "lấy template thất bại")
		return
	}

	response.OK(c, http.StatusOK, "lấy template thành công", t)
}

// Update godoc — PUT /api/v1/admin/templates/:id
func (h *TemplateHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "template ID không hợp lệ")
		return
	}

	var req updateTemplateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	in := service.UpdateTemplateInput{
		Name:         req.Name,
		Category:     req.Category,
		ThumbnailURL: req.ThumbnailURL,
	}
	// Bỏ qua chuỗi rỗng: status/tier là ENUM NOT NULL, ghi "" xuống DB sẽ lỗi.
	if req.Status != nil && *req.Status != "" {
		status := models.TemplateStatus(*req.Status)
		in.Status = &status
	}
	if req.Tier != nil && *req.Tier != "" {
		tier := models.TemplateTier(*req.Tier)
		in.Tier = &tier
	}

	t, err := h.templateService.UpdateTemplate(id, in)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			response.Fail(c, http.StatusNotFound, "không tìm thấy template")
			return
		}
		response.Fail(c, http.StatusInternalServerError, "cập nhật template thất bại")
		return
	}

	response.OK(c, http.StatusOK, "cập nhật thành công", t)
}

// Delete godoc — DELETE /api/v1/admin/templates/:id
func (h *TemplateHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "template ID không hợp lệ")
		return
	}

	if err := h.templateService.DeleteTemplate(id); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			response.Fail(c, http.StatusNotFound, "không tìm thấy template")
			return
		}
		response.Fail(c, http.StatusInternalServerError, "xoá template thất bại")
		return
	}

	response.OK(c, http.StatusOK, "xoá template thành công", nil)
}
