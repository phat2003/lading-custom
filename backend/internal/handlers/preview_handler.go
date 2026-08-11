package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

// PreviewHandler xử lý các request preview realtime landing page.
// Mỗi lần user sửa 1 section, FE gọi lại các API này để lấy HTML mới và nạp vào iframe.
type PreviewHandler struct {
	previewService *service.PreviewService
}

func NewPreviewHandler(previewService *service.PreviewService) *PreviewHandler {
	return &PreviewHandler{previewService: previewService}
}

// GetRealtimePreview — GET /api/v1/landing-pages/:id/preview
// Trả về JSON chứa HTML preview. FE dùng để nhét vào iframe qua srcdoc.
func (h *PreviewHandler) GetRealtimePreview(c *gin.Context) {
	pageID, userID, ok := h.parseParams(c)
	if !ok {
		return
	}

	// Device có thể truyền kèm (mặc định desktop) để JSON và HTML thống nhất.
	device := service.NormalizeDevice(c.Query("device"))

	html, updatedAt, err := h.previewService.GetPreview(userID, pageID, device)
	if err != nil {
		h.failFromError(c, err)
		return
	}

	response.OK(c, http.StatusOK, "lấy preview thành công", gin.H{
		"html":       html,
		"updated_at": updatedAt,
	})
}

// GetStaticPreview — GET /api/v1/landing-pages/:id/preview/static
// Trả HTML thẳng (text/html) để FE trỏ thẳng iframe src vào endpoint này.
func (h *PreviewHandler) GetStaticPreview(c *gin.Context) {
	pageID, userID, ok := h.parseParams(c)
	if !ok {
		return
	}

	device := service.NormalizeDevice(c.Query("device"))

	html, _, err := h.previewService.GetPreview(userID, pageID, device)
	if err != nil {
		h.failFromError(c, err)
		return
	}

	// Preview luôn phản ánh dữ liệu mới nhất -> cấm cache để iframe không hiện bản cũ.
	c.Header("Cache-Control", "no-store")
	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
}

// PreviewByDevice — GET /api/v1/landing-pages/:id/preview/device?device=desktop|tablet|mobile
// Giống GetStaticPreview nhưng nhấn mạnh việc đổi khung xem theo thiết bị:
//
//	desktop: width=1280px
//	tablet:  width=768px
//	mobile:  width=375px
//
// Meta viewport và bề rộng khung được đặt tương ứng trong HTML trả về.
func (h *PreviewHandler) PreviewByDevice(c *gin.Context) {
	pageID, userID, ok := h.parseParams(c)
	if !ok {
		return
	}

	// Giá trị device không hợp lệ sẽ tự fallback về desktop thay vì báo lỗi.
	device := service.NormalizeDevice(c.Query("device"))

	html, _, err := h.previewService.GetPreview(userID, pageID, device)
	if err != nil {
		h.failFromError(c, err)
		return
	}

	c.Header("Cache-Control", "no-store")
	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
}

// parseParams lấy landing_page_id từ URL param và user_id từ context (do AuthRequired set).
// Trả về ok=false nếu đã ghi response lỗi — caller chỉ cần return.
func (h *PreviewHandler) parseParams(c *gin.Context) (uuid.UUID, uuid.UUID, bool) {
	pageID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "landing_page_id không hợp lệ")
		return uuid.Nil, uuid.Nil, false
	}

	userIDVal, exists := c.Get("user_id")
	if !exists {
		response.Fail(c, http.StatusUnauthorized, "không xác định được người dùng")
		return uuid.Nil, uuid.Nil, false
	}
	userID, ok := userIDVal.(uuid.UUID)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "thông tin người dùng không hợp lệ")
		return uuid.Nil, uuid.Nil, false
	}

	return pageID, userID, true
}

// failFromError chuyển lỗi từ service thành response chuẩn.
// Không tìm thấy trang và không có quyền được gộp chung thành 404
// để không lộ sự tồn tại của trang thuộc user khác.
func (h *PreviewHandler) failFromError(c *gin.Context, err error) {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		response.Fail(c, http.StatusNotFound, "không tìm thấy trang hoặc bạn không có quyền xem")
		return
	}
	response.Fail(c, http.StatusInternalServerError, "tạo preview thất bại: "+err.Error())
}
