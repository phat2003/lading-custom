package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

type MediaAssetHandler struct {
	mediaAssetService *service.MediaAssetService
}

func NewMediaAssetHandler(mediaAssetService *service.MediaAssetService) *MediaAssetHandler {
	return &MediaAssetHandler{mediaAssetService: mediaAssetService}
}

// POST /upload
func (h *MediaAssetHandler) UploadImage(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uuid.UUID)

	fileHeader, err := c.FormFile("file")
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "Không tìm thấy file tải lên")
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "Không thể đọc file")
		return
	}
	defer file.Close()

	// 1. TÁI SỬ DỤNG HÀM CỦA ĐỒNG ĐỘI ĐỂ LƯU FILE VÀO THƯ MỤC "uploads/user_media"
	filename, err := service.SaveFile(file, fileHeader, "uploads/user_media")
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "Lỗi khi lưu file vào hệ thống")
		return
	}

	// 2. Tạo URL công khai để trả về
	scheme := "http"
	if c.Request.TLS != nil {
		scheme = "https"
	}
	fileURL := fmt.Sprintf("%s://%s/uploads/user_media/%s", scheme, c.Request.Host, filename)

	// 3. Gọi hàm của bạn để lưu thông tin vào Database
	asset, err := h.mediaAssetService.SaveAssetRecord(userID, fileURL, fileHeader.Header.Get("Content-Type"), fileHeader.Size)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "Lỗi khi lưu thông tin vào Database")
		return
	}

	response.OK(c, http.StatusCreated, "Tải ảnh lên thành công", asset)
}

// GET /upload/assets
func (h *MediaAssetHandler) GetAssets(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uuid.UUID)

	assets, err := h.mediaAssetService.GetUserAssets(userID)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "Lỗi khi lấy danh sách ảnh")
		return
	}

	response.OK(c, http.StatusOK, "Lấy danh sách thành công", assets)
}