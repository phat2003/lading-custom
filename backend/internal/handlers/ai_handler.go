package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

// Giá trị mặc định + trần cho lịch sử AI và log Dashboard.
const (
	defaultAIHistoryPage  = 1
	defaultAIHistoryLimit = 20
	maxAIHistoryLimit     = 100
	defaultAILogLimit     = 10
	maxAILogLimit         = 50
)

// AIHandler xử lý request cho AI Generator.
type AIHandler struct {
	aiService *service.AIService
}

func NewAIHandler(aiService *service.AIService) *AIHandler {
	return &AIHandler{aiService: aiService}
}

type generateRequest struct {
	Prompt       string `json:"prompt" binding:"required,min=3,max=5000"`
	TemplateType string `json:"template_type" binding:"omitempty,max=50"`
	Style        string `json:"style" binding:"omitempty,max=50"`
}

// Generate godoc — POST /api/v1/ai/generate
//
// LƯU Ý: hiện CHƯA gọi mô hình AI nào — xem ghi chú đầu hàm
// service.AIService.Generate. Mọi lượt tạo trả về status 'failed' kèm
// error_message giải thích, và KHÔNG trừ hạn mức của user.
// Vẫn trả 201 vì yêu cầu đã được ghi nhận hợp lệ; kết quả nằm ở status.
func (h *AIHandler) Generate(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "không tìm thấy thông tin xác thực")
		return
	}

	var req generateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	generation, err := h.aiService.Generate(userID, service.GenerateInput{
		Prompt:       req.Prompt,
		TemplateType: req.TemplateType,
		Style:        req.Style,
	})
	if err != nil {
		switch {
		case errors.Is(err, service.ErrAIDisabled):
			response.Fail(c, http.StatusForbidden, err.Error())
		case errors.Is(err, service.ErrAICreditExhausted):
			response.Fail(c, http.StatusForbidden, err.Error())
		case errors.Is(err, service.ErrAIDailyLimitReached):
			response.Fail(c, http.StatusTooManyRequests, err.Error())
		default:
			response.Fail(c, http.StatusInternalServerError, "tạo thiết kế thất bại")
		}
		return
	}

	response.OK(c, http.StatusCreated, "đã tạo yêu cầu", generation)
}

// History godoc — GET /api/v1/ai/history?page=1&limit=20
// Chỉ trả lịch sử của chính người đang đăng nhập.
func (h *AIHandler) History(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "không tìm thấy thông tin xác thực")
		return
	}

	page := parsePositiveInt(c.Query("page"), defaultAIHistoryPage)
	limit := parsePositiveInt(c.Query("limit"), defaultAIHistoryLimit)
	if limit > maxAIHistoryLimit {
		limit = maxAIHistoryLimit
	}

	items, total, err := h.aiService.GetHistory(userID, page, limit)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "lấy lịch sử thất bại")
		return
	}

	response.OKWithMeta(c, http.StatusOK, "lấy lịch sử thành công", items,
		response.NewMeta(page, limit, total))
}

// Credits godoc — GET /api/v1/ai/credits
func (h *AIHandler) Credits(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "không tìm thấy thông tin xác thực")
		return
	}

	credit, err := h.aiService.GetCredits(userID)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "lấy hạn mức thất bại")
		return
	}

	response.OK(c, http.StatusOK, "lấy hạn mức thành công", gin.H{
		"used":     credit.Used,
		"total":    credit.Total,
		"reset_at": credit.ResetAt,
	})
}

// AdminLogs godoc — GET /api/v1/admin/ai/logs?limit=4
// Log của TOÀN HỆ THỐNG, dùng cho khối "AI Generator Log" trên Dashboard.
func (h *AIHandler) AdminLogs(c *gin.Context) {
	limit := parsePositiveInt(c.Query("limit"), defaultAILogLimit)
	if limit > maxAILogLimit {
		limit = maxAILogLimit
	}

	logs, err := h.aiService.GetAdminLogs(limit)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "lấy log AI thất bại")
		return
	}

	response.OK(c, http.StatusOK, "lấy log thành công", logs)
}
