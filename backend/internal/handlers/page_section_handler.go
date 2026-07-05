package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/datatypes"

	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

type PageSectionHandler struct {
	sectionService *service.PageSectionService
}

func NewPageSectionHandler(sectionService *service.PageSectionService) *PageSectionHandler {
	return &PageSectionHandler{sectionService: sectionService}
}

type createSectionRequest struct {
	LandingPageID string         `json:"landing_page_id" binding:"required,uuid"`
	SectionType   string         `json:"section_type" binding:"required"`
	OrderIndex    int            `json:"order_index"`
	Content       datatypes.JSON `json:"content" binding:"required"`
}

func (h *PageSectionHandler) Create(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uuid.UUID)

	var req createSectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	pageID, _ := uuid.Parse(req.LandingPageID)

	section, err := h.sectionService.CreateSection(userID, pageID, req.SectionType, req.OrderIndex, req.Content)
	if err != nil {
		response.Fail(c, http.StatusForbidden, err.Error())
		return
	}

	response.OK(c, http.StatusCreated, "Thêm Section thành công", section)
}

func (h *PageSectionHandler) GetAll(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uuid.UUID)

	pageIDStr := c.Query("page_id")
	pageID, err := uuid.Parse(pageIDStr)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "Thiếu hoặc sai định dạng page_id")
		return
	}

	sections, err := h.sectionService.GetSectionsByPage(userID, pageID)
	if err != nil {
		response.Fail(c, http.StatusForbidden, err.Error())
		return
	}

	response.OK(c, http.StatusOK, "Lấy danh sách thành công", sections)
}

type updateSectionRequest struct {
	Content    datatypes.JSON `json:"content"`
	OrderIndex *int           `json:"order_index"`
	IsVisible  *bool          `json:"is_visible"`
}

func (h *PageSectionHandler) Update(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uuid.UUID)

	sectionID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "ID section không hợp lệ")
		return
	}

	var req updateSectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	section, err := h.sectionService.UpdateSection(userID, sectionID, req.Content, req.OrderIndex, req.IsVisible)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	response.OK(c, http.StatusOK, "Cập nhật Section thành công", section)
}

func (h *PageSectionHandler) Delete(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uuid.UUID)

	sectionID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "ID section không hợp lệ")
		return
	}

	if err := h.sectionService.DeleteSection(userID, sectionID); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	response.OK(c, http.StatusOK, "Xóa Section thành công", nil)
}