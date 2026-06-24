package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

const (
	maxImageSize    = 5 << 20 // 5 MB
	thumbnailDir    = "uploads/thumbnails"
	templateFileDir = "uploads/templates"
)

// UploadHandler xử lý request HTTP upload file ảnh và file template.
type UploadHandler struct{}

func NewUploadHandler() *UploadHandler {
	return &UploadHandler{}
}

// UploadThumbnail godoc — POST /api/v1/admin/media/upload
// Nhận file ảnh (multipart/form-data, field "file"), lưu vào uploads/thumbnails/.
func (h *UploadHandler) UploadThumbnail(c *gin.Context) {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "không nhận được file — đảm bảo gửi multipart/form-data với field \"file\"")
		return
	}

	// Kiểm tra kích thước tối đa 5MB.
	if fileHeader.Size > maxImageSize {
		response.Fail(c, http.StatusBadRequest, "file vượt quá kích thước tối đa 5MB")
		return
	}

	// Kiểm tra content type — chỉ nhận JPEG, PNG, WebP.
	ct := fileHeader.Header.Get("Content-Type")
	allowedImages := map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/webp": true,
	}
	if !allowedImages[ct] {
		response.Fail(c, http.StatusBadRequest, "chỉ chấp nhận ảnh định dạng JPEG, PNG hoặc WebP")
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "không mở được file")
		return
	}
	defer file.Close()

	filename, err := service.SaveFile(file, fileHeader, thumbnailDir)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "lưu file thất bại")
		return
	}

	fileURL := "/" + thumbnailDir + "/" + filename
	response.OK(c, http.StatusOK, "upload thumbnail thành công", gin.H{"file_url": fileURL})
}

// UploadTemplateFile godoc — POST /api/v1/admin/templates/upload
// Nhận file HTML (multipart/form-data, field "file"), lưu vào uploads/templates/.
func (h *UploadHandler) UploadTemplateFile(c *gin.Context) {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "không nhận được file — đảm bảo gửi multipart/form-data với field \"file\"")
		return
	}

	// Kiểm tra content type — chỉ nhận text/html (có thể kèm charset).
	ct := fileHeader.Header.Get("Content-Type")
	if !strings.HasPrefix(ct, "text/html") {
		response.Fail(c, http.StatusBadRequest, "chỉ chấp nhận file HTML (text/html)")
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "không mở được file")
		return
	}
	defer file.Close()

	filename, err := service.SaveFile(file, fileHeader, templateFileDir)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "lưu file thất bại")
		return
	}

	fileURL := "/" + templateFileDir + "/" + filename
	response.OK(c, http.StatusOK, "upload template file thành công", gin.H{"file_url": fileURL})
}
