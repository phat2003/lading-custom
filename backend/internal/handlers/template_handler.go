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

// TemplateHandler xử lý request HTTP cho system template.
type TemplateHandler struct {
	templateService *service.TemplateService
}

func NewTemplateHandler(templateService *service.TemplateService) *TemplateHandler {
	return &TemplateHandler{templateService: templateService}
}

type createTemplateRequest struct {
	Name string `json:"name" binding:"required,min=1,max=255"`
}

type updateTemplateRequest struct {
	Name string `json:"name" binding:"required,min=1,max=255"`
}

// Create godoc — POST /api/v1/admin/templates
func (h *TemplateHandler) Create(c *gin.Context) {
	var req createTemplateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	// Lấy admin ID từ context (đã được AuthRequired set trước đó).
	adminIDVal, _ := c.Get("user_id")
	adminID := adminIDVal.(uuid.UUID)

	t, err := h.templateService.CreateSystemTemplate(service.CreateSystemTemplateInput{
		Name:    req.Name,
		AdminID: adminID,
	})
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "tạo template thất bại")
		return
	}

	response.OK(c, http.StatusCreated, "tạo template thành công", t)
}

// List godoc — GET /api/v1/admin/templates
func (h *TemplateHandler) List(c *gin.Context) {
	templates, err := h.templateService.ListTemplates()
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "lấy danh sách template thất bại")
		return
	}
	response.OK(c, http.StatusOK, "lấy danh sách thành công", templates)
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

	t, err := h.templateService.UpdateTemplate(id, service.UpdateTemplateInput{Name: req.Name})
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
