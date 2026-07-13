package handlers

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

// ExportHandler xử lý request export landing page ra file PDF.
type ExportHandler struct {
	exportService *service.ExportService
}

func NewExportHandler(exportService *service.ExportService) *ExportHandler {
	return &ExportHandler{exportService: exportService}
}

// ExportPDF — GET /api/v1/landing-pages/:id/export/pdf
// Export 1 landing page ra file PDF (miễn phí, không phân biệt gói).
func (h *ExportHandler) ExportPDF(c *gin.Context) {
	// Lấy landing_page_id từ URL param và validate định dạng UUID.
	pageID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "landing_page_id không hợp lệ")
		return
	}

	// Lấy user_id đã được AuthRequired middleware set vào context.
	userIDVal, exists := c.Get("user_id")
	if !exists {
		response.Fail(c, http.StatusUnauthorized, "không xác định được người dùng")
		return
	}
	userID, ok := userIDVal.(uuid.UUID)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "thông tin người dùng không hợp lệ")
		return
	}

	// Service lo: check quyền -> lấy section -> sinh HTML -> convert PDF.
	pdfBytes, page, err := h.exportService.ExportPagePDF(userID, pageID)
	if err != nil {
		// Không tìm thấy trang HOẶC user không phải chủ sở hữu.
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.Fail(c, http.StatusNotFound, "không tìm thấy trang hoặc bạn không có quyền export")
			return
		}
		response.Fail(c, http.StatusInternalServerError, "export PDF thất bại: "+err.Error())
		return
	}

	// Tạo tên file theo tên trang (fallback nếu rỗng).
	filename := "landing-page.pdf"
	if page != nil && page.Name != "" {
		filename = fmt.Sprintf("%s.pdf", page.Name)
	}

	// Trả file PDF về client.
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	c.Data(http.StatusOK, "application/pdf", pdfBytes)
}
