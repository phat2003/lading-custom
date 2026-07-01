package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"

	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
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

// POST /section-templates
func (h *SectionTemplateHandler) Create(c *gin.Context) {
	var req createSectionTemplateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	template, err := h.templateService.CreateTemplate(req.SectionType, req.DisplayName, req.Content, req.ThumbnailURL)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.OK(c, http.StatusCreated, "Tạo mẫu Section thành công", template)
}

// GET /section-templates?type=hero
func (h *SectionTemplateHandler) GetAll(c *gin.Context) {
	sectionType := c.Query("type") // Có thể lấy tất cả hoặc lọc theo loại (hero, cta, faq)

	templates, err := h.templateService.GetAllTemplates(sectionType)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "Lỗi khi lấy danh sách mẫu")
		return
	}

	response.OK(c, http.StatusOK, "Lấy danh sách thành công", templates)
}