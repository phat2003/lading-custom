package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/datatypes"

	"github.com/nhienthai/lading-custom/backend/internal/repository"
	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

// Giá trị mặc định + trần cho phân trang thư viện section.
const (
	defaultSectionTemplatePage  = 1
	defaultSectionTemplateLimit = 9 // lưới 3x3 của trang admin Sections
	maxSectionTemplateLimit     = 100
)

type SectionTemplateHandler struct {
	templateService *service.SectionTemplateService
}

func NewSectionTemplateHandler(templateService *service.SectionTemplateService) *SectionTemplateHandler {
	return &SectionTemplateHandler{templateService: templateService}
}

type createSectionTemplateRequest struct {
	SectionType  string         `json:"section_type" binding:"required"`
	DisplayName  string         `json:"display_name" binding:"required"`
	Content      datatypes.JSON `json:"default_content" binding:"required"`
	ThumbnailURL string         `json:"thumbnail_url"`
}

// Con trỏ: phân biệt "không gửi field" (giữ nguyên) với "gửi rỗng" (ghi đè).
type updateSectionTemplateRequest struct {
	SectionType    *string         `json:"section_type" binding:"omitempty,min=1,max=50"`
	DisplayName    *string         `json:"display_name" binding:"omitempty,min=1,max=150"`
	DefaultContent *datatypes.JSON `json:"default_content"`
	ThumbnailURL   *string         `json:"thumbnail_url"`
}

// POST /admin/section-templates
func (h *SectionTemplateHandler) Create(c *gin.Context) {
	var req createSectionTemplateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	// Ghi lại admin đã tạo mẫu (cột audit created_by).
	var createdBy *uuid.UUID
	if id, ok := currentUserID(c); ok {
		createdBy = &id
	}

	template, err := h.templateService.CreateTemplate(
		req.SectionType, req.DisplayName, req.Content, req.ThumbnailURL, createdBy,
	)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.OK(c, http.StatusCreated, "Tạo mẫu Section thành công", template)
}

// GET /section-templates?type=hero
// Bản đầy đủ, KHÔNG phân trang — dùng cho panel section cạnh editor,
// nơi user thường cần thấy hết thư viện để kéo thả.
func (h *SectionTemplateHandler) GetAll(c *gin.Context) {
	sectionType := c.Query("type") // Có thể lấy tất cả hoặc lọc theo loại (hero, cta, faq)

	templates, err := h.templateService.GetAllTemplates(sectionType)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "Lỗi khi lấy danh sách mẫu")
		return
	}

	response.OK(c, http.StatusOK, "Lấy danh sách thành công", templates)
}

// List godoc — GET /admin/section-templates?page=1&limit=9&type=all&search=
// Bản có phân trang + đếm used_in cho trang quản trị.
func (h *SectionTemplateHandler) List(c *gin.Context) {
	page := parsePositiveInt(c.Query("page"), defaultSectionTemplatePage)
	limit := parsePositiveInt(c.Query("limit"), defaultSectionTemplateLimit)
	if limit > maxSectionTemplateLimit {
		limit = maxSectionTemplateLimit // chặn client xin cả bảng trong 1 request
	}

	// section_type là VARCHAR tự do (hero, cta, faq...) nên không có danh sách
	// giá trị cố định để kiểm tra — chỉ cần bỏ qua "all".
	sectionType := c.Query("type")

	templates, total, err := h.templateService.ListTemplates(service.ListSectionTemplatesInput{
		Search:      strings.TrimSpace(c.Query("search")),
		SectionType: sectionType,
		Page:        page,
		Limit:       limit,
	})
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "Lỗi khi lấy danh sách mẫu")
		return
	}

	response.OKWithMeta(c, http.StatusOK, "Lấy danh sách thành công", templates,
		response.NewMeta(page, limit, total))
}

// GetByID godoc — GET /admin/section-templates/:id
func (h *SectionTemplateHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "section template ID không hợp lệ")
		return
	}

	t, err := h.templateService.GetTemplate(id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			response.Fail(c, http.StatusNotFound, "không tìm thấy mẫu Section")
			return
		}
		response.Fail(c, http.StatusInternalServerError, "lấy mẫu Section thất bại")
		return
	}

	response.OK(c, http.StatusOK, "Lấy mẫu Section thành công", t)
}

// Update godoc — PUT /admin/section-templates/:id
func (h *SectionTemplateHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "section template ID không hợp lệ")
		return
	}

	var req updateSectionTemplateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	t, err := h.templateService.UpdateTemplate(id, service.UpdateSectionTemplateInput{
		SectionType:    req.SectionType,
		DisplayName:    req.DisplayName,
		DefaultContent: req.DefaultContent,
		ThumbnailURL:   req.ThumbnailURL,
	})
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			response.Fail(c, http.StatusNotFound, "không tìm thấy mẫu Section")
			return
		}
		response.Fail(c, http.StatusInternalServerError, "cập nhật mẫu Section thất bại")
		return
	}

	response.OK(c, http.StatusOK, "Cập nhật mẫu Section thành công", t)
}

// Delete godoc — DELETE /admin/section-templates/:id
// Template đã seed từ mẫu này không bị ảnh hưởng (source_section_template_id
// là ON DELETE SET NULL), chỉ mất dấu vết nguồn gốc.
func (h *SectionTemplateHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "section template ID không hợp lệ")
		return
	}

	if err := h.templateService.DeleteTemplate(id); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			response.Fail(c, http.StatusNotFound, "không tìm thấy mẫu Section")
			return
		}
		response.Fail(c, http.StatusInternalServerError, "xoá mẫu Section thất bại")
		return
	}

	response.OK(c, http.StatusOK, "Xoá mẫu Section thành công", nil)
}
