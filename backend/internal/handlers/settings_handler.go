package handlers

import (
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

// logoDir — nơi lưu logo nền tảng, tách khỏi thumbnails cho dễ vận hành.
const logoDir = "uploads/logos"

// SettingsHandler xử lý request cho trang admin Settings.
type SettingsHandler struct {
	settingsService *service.SettingsService
	publicBaseURL   string
}

func NewSettingsHandler(settingsService *service.SettingsService, publicBaseURL string) *SettingsHandler {
	return &SettingsHandler{settingsService: settingsService, publicBaseURL: publicBaseURL}
}

// Nhóm platform/ai_engine dùng con trỏ để phân biệt "không gửi" với "gửi rỗng".
// Nhóm account KHÔNG nhận ở đây — nó thuộc app_user, sửa qua PUT /profile.
type updateSettingsRequest struct {
	Platform *struct {
		Name    *string `json:"name" binding:"omitempty,min=1,max=150"`
		LogoURL *string `json:"logo_url"`
	} `json:"platform"`
	AIEngine *struct {
		Enabled         *bool   `json:"enabled"`
		DailyLimit      *int    `json:"daily_limit" binding:"omitempty,min=0"`
		DefaultModel    *string `json:"default_model" binding:"omitempty,max=50"`
		ConcurrentLimit *int    `json:"concurrent_limit" binding:"omitempty,min=0"`
	} `json:"ai_engine"`
}

// Get godoc — GET /api/v1/admin/settings
func (h *SettingsHandler) Get(c *gin.Context) {
	actorID, ok := currentUserID(c)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "không tìm thấy thông tin xác thực")
		return
	}

	settings, err := h.settingsService.GetSettings(actorID)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "lấy cấu hình thất bại")
		return
	}

	response.OK(c, http.StatusOK, "lấy cấu hình thành công", settings)
}

// Update godoc — PUT /api/v1/admin/settings
func (h *SettingsHandler) Update(c *gin.Context) {
	actorID, ok := currentUserID(c)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "không tìm thấy thông tin xác thực")
		return
	}

	var req updateSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	var in service.UpdateSettingsInput
	if req.Platform != nil {
		if req.Platform.Name != nil {
			trimmed := strings.TrimSpace(*req.Platform.Name)
			if trimmed == "" {
				response.Fail(c, http.StatusBadRequest, "tên nền tảng không được để trống")
				return
			}
			in.PlatformName = &trimmed
		}
		in.LogoURL = req.Platform.LogoURL
	}
	if req.AIEngine != nil {
		in.AIEnabled = req.AIEngine.Enabled
		in.AIDailyLimit = req.AIEngine.DailyLimit
		in.AIDefaultModel = req.AIEngine.DefaultModel
		in.AIConcurrentLimit = req.AIEngine.ConcurrentLimit
	}

	settings, err := h.settingsService.UpdateSettings(actorID, in)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "cập nhật cấu hình thất bại")
		return
	}

	response.OK(c, http.StatusOK, "cập nhật cấu hình thành công", settings)
}

// UploadLogo godoc — POST /api/v1/admin/settings/logo
// Nhận ảnh (multipart/form-data, field "file"), lưu vào uploads/logos/
// rồi ghi luôn URL vào cấu hình hệ thống.
func (h *SettingsHandler) UploadLogo(c *gin.Context) {
	// Trần cứng cho toàn body — chặn stream body khổng lồ trước khi parse (chống DoS).
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxImageSize+multipartOverhead)

	actorID, ok := currentUserID(c)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "không tìm thấy thông tin xác thực")
		return
	}

	fileHeader, err := c.FormFile("file")
	if err != nil {
		failFormFile(c, err)
		return
	}
	if fileHeader.Size == 0 {
		response.Fail(c, http.StatusBadRequest, "file rỗng (0 byte)")
		return
	}
	if fileHeader.Size > maxImageSize {
		response.Fail(c, http.StatusRequestEntityTooLarge, "file vượt quá kích thước tối đa 5MB")
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		log.Printf("[UploadLogo] không mở được file upload: %v", err)
		response.Fail(c, http.StatusInternalServerError, "không mở được file")
		return
	}
	defer file.Close()

	// Nhận diện MIME THẬT từ nội dung; ext sinh từ whitelist, không tin tên file client.
	ext, _, err := service.DetectExtension(file, allowedImageMIME)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "chỉ chấp nhận ảnh định dạng JPEG, PNG hoặc WebP")
		return
	}

	filename, err := service.SaveFile(file, logoDir, ext)
	if err != nil {
		log.Printf("[UploadLogo] lưu file thất bại: %v", err)
		response.Fail(c, http.StatusInternalServerError, "lưu file thất bại")
		return
	}

	logoURL := buildPublicFileURL(c, h.publicBaseURL, logoDir, filename)

	// Ghi DB thất bại thì xoá file vừa lưu để không để lại file mồ côi.
	var settings *service.Settings
	err = removeFileOnError(logoDir, filename, func() error {
		s, e := h.settingsService.UpdateLogo(actorID, logoURL)
		settings = s
		return e
	})
	if err != nil {
		log.Printf("[UploadLogo] cập nhật logo_url thất bại: %v", err)
		response.Fail(c, http.StatusInternalServerError, "lưu thông tin logo thất bại")
		return
	}

	response.OK(c, http.StatusOK, "upload logo thành công", settings)
}
