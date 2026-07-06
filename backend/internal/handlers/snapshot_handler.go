package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

type SnapshotHandler struct {
	snapshotService *service.SnapshotService
}

func NewSnapshotHandler(snapshotService *service.SnapshotService) *SnapshotHandler {
	return &SnapshotHandler{snapshotService: snapshotService}
}

// POST /pages/:id/publish (Yêu cầu đăng nhập)
func (h *SnapshotHandler) Publish(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uuid.UUID)

	pageID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "ID trang không hợp lệ")
		return
	}

	snapshot, err := h.snapshotService.PublishPage(userID, pageID)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.OK(c, http.StatusOK, "Xuất bản trang thành công", snapshot)
}

// GET /p/:url (Public - KHÔNG yêu cầu đăng nhập)
func (h *SnapshotHandler) ViewPublicPage(c *gin.Context) {
	publicURL := c.Param("url")

	snapshot, err := h.snapshotService.GetPublicSnapshot(publicURL)
	if err != nil {
		// Trả về giao diện 404 cho Frontend xử lý
		response.Fail(c, http.StatusNotFound, "Trang này không tồn tại hoặc đã bị gỡ")
		return
	}

	// Trả về trực tiếp cục JSON Snapshot
	response.OK(c, http.StatusOK, "Lấy dữ liệu trang thành công", snapshot.SnapshotContent)
}