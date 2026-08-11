package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

type TemplateActionHandler struct {
	actionService *service.TemplateActionService
}

func NewTemplateActionHandler(actionService *service.TemplateActionService) *TemplateActionHandler {
	return &TemplateActionHandler{actionService: actionService}
}

// failFromError map lỗi từ service sang đúng HTTP status:
//   - 404: trang/mẫu không tồn tại
//   - 403: tài nguyên tồn tại nhưng thuộc user khác
//   - 500: lỗi thật (DB, clone section...)
func (h *TemplateActionHandler) failFromError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, gorm.ErrRecordNotFound):
		response.Fail(c, http.StatusNotFound, "không tìm thấy trang hoặc mẫu giao diện")
	// Tách khỏi nhánh 403 bên dưới: frontend cần phân biệt "không có quyền"
	// (bế tắc) với "cần nâng cấp gói" (mời nâng cấp) để hiện đúng thông báo.
	case errors.Is(err, service.ErrUpgradeRequired):
		response.Fail(c, http.StatusPaymentRequired, err.Error())
	case errors.Is(err, repository.ErrForbidden):
		response.Fail(c, http.StatusForbidden, "bạn không có quyền thao tác trên tài nguyên này")
	default:
		response.Fail(c, http.StatusInternalServerError, "thao tác với template thất bại: "+err.Error())
	}
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
		h.failFromError(c, err)
		return
	}

	response.OK(c, http.StatusCreated, "Đã lưu Landing Page thành Template", template)
}

type createFromTemplateReq struct {
	TemplateID string `json:"template_id" binding:"required,uuid"`
	ProjectID  string `json:"project_id" binding:"required,uuid"`
	Name       string `json:"name" binding:"required,min=2"`
}

// currentPlanType đọc gói dịch vụ do AuthRequired nạp từ DB vào context.
// Không có/sai kiểu -> coi như gói free: mặc định về phía hạn chế, vì nhầm sang
// pro nghĩa là phát không nội dung trả phí.
func currentPlanType(c *gin.Context) models.PlanType {
	v, ok := c.Get("plan_type")
	if !ok {
		return models.PlanFree
	}
	plan, ok := v.(models.PlanType)
	if !ok {
		return models.PlanFree
	}
	return plan
}

// POST /pages/from-template
func (h *TemplateActionHandler) CreateFromTemplate(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "không xác định được người dùng")
		return
	}

	var req createFromTemplateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	templateID, _ := uuid.Parse(req.TemplateID)
	projectID, _ := uuid.Parse(req.ProjectID)

	page, err := h.actionService.CreatePageFromTemplate(userID, projectID, templateID, req.Name, currentPlanType(c))
	if err != nil {
		h.failFromError(c, err)
		return
	}

	response.OK(c, http.StatusCreated, "Tạo trang từ Mẫu thành công", page)
}
