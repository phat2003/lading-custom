package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

type TemplateActionHandler struct {
	actionService *service.TemplateActionService
}

func NewTemplateActionHandler(actionService *service.TemplateActionService) *TemplateActionHandler {
	return &TemplateActionHandler{actionService: actionService}
}

type saveAsTemplateReq struct {
	PageID   string `json:"page_id" binding:"required,uuid"`
	Name     string `json:"name" binding:"required,min=2"`
	IsPublic bool   `json:"is_public"` // True nếu muốn chia sẻ lên marketplace
}

// POST /pages/save-as-template
func (h *TemplateActionHandler) SaveAsTemplate(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uuid.UUID)

	var req saveAsTemplateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	pageID, _ := uuid.Parse(req.PageID)

	// Mặc định lưu thành mẫu cá nhân (user)
	template, err := h.actionService.SavePageAsTemplate(userID, pageID, req.Name)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.OK(c, http.StatusCreated, "Đã lưu Landing Page thành Template", template)
}

type createFromTemplateReq struct {
	TemplateID string `json:"template_id" binding:"required,uuid"`
	ProjectID  string `json:"project_id" binding:"required,uuid"`
	Name       string `json:"name" binding:"required,min=2"`
}

// POST /pages/from-template
func (h *TemplateActionHandler) CreateFromTemplate(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uuid.UUID)

	var req createFromTemplateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	templateID, _ := uuid.Parse(req.TemplateID)
	projectID, _ := uuid.Parse(req.ProjectID)

	page, err := h.actionService.CreatePageFromTemplate(userID, projectID, templateID, req.Name)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.OK(c, http.StatusCreated, "Tạo trang từ Mẫu thành công", page)
}