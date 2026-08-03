package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/repository"
	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

type UserHandler struct {
	userService *service.UserService
}

func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// GetProfile xử lý GET /api/v1/profile
func (h *UserHandler) GetProfile(c *gin.Context) {
	// Lấy ID người dùng từ Context
	userIDVal, exists := c.Get("user_id")
	if !exists {
		response.Fail(c, http.StatusUnauthorized, "không tìm thấy thông tin xác thực")
		return
	}

	// ÉP KIỂU TRỰC TIẾP: Vì Middleware đã lưu sẵn dưới dạng uuid.UUID
	userID, ok := userIDVal.(uuid.UUID)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "ID không hợp lệ")
		return
	}

	user, err := h.userService.GetProfile(userID)
	if err != nil {
		response.Fail(c, http.StatusNotFound, "không tìm thấy người dùng")
		return
	}

	response.OK(c, http.StatusOK, "lấy thông tin thành công", user)
}

// updateProfileRequest payload request để update profile.
// Con trỏ: field không gửi thì giữ nguyên, không bị ghi đè thành rỗng.
type updateProfileRequest struct {
	FullName       *string `json:"full_name" binding:"omitempty,min=1,max=150"`
	Phone          *string `json:"phone" binding:"omitempty,max=20"`
	Timezone       *string `json:"timezone" binding:"omitempty,max=64"`
	SessionTimeout *string `json:"session_timeout" binding:"omitempty,oneof=never 30m 1h 1d"`
}

// changePasswordRequest payload đổi mật khẩu của chính mình.
type changePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=6"`
}

// UpdateProfile xử lý PUT /api/v1/profile
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	// Lấy ID người dùng từ Context
	userIDVal, exists := c.Get("user_id")
	if !exists {
		response.Fail(c, http.StatusUnauthorized, "không tìm thấy thông tin xác thực")
		return
	}

	// ÉP KIỂU TRỰC TIẾP
	userID, ok := userIDVal.(uuid.UUID)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "ID không hợp lệ")
		return
	}

	var req updateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	// binding "omitempty" bỏ qua chuỗi rỗng nên phải tự chặn ở đây,
	// nếu không gửi full_name = "" sẽ âm thầm xoá mất tên.
	if req.FullName != nil {
		trimmed := strings.TrimSpace(*req.FullName)
		if trimmed == "" {
			response.Fail(c, http.StatusBadRequest, "full_name không được để trống")
			return
		}
		req.FullName = &trimmed
	}

	user, err := h.userService.UpdateProfile(userID, service.UpdateProfileInput{
		FullName:       req.FullName,
		Phone:          req.Phone,
		Timezone:       req.Timezone,
		SessionTimeout: req.SessionTimeout,
	})
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "cập nhật thất bại")
		return
	}

	response.OK(c, http.StatusOK, "cập nhật thành công", user)
}

// ChangePassword xử lý PUT /api/v1/profile/password
func (h *UserHandler) ChangePassword(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "không tìm thấy thông tin xác thực")
		return
	}

	var req changePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.userService.ChangePassword(userID, req.CurrentPassword, req.NewPassword); err != nil {
		switch {
		case errors.Is(err, service.ErrWrongPassword):
			response.Fail(c, http.StatusBadRequest, err.Error())
		case errors.Is(err, repository.ErrNotFound):
			response.Fail(c, http.StatusNotFound, "không tìm thấy người dùng")
		default:
			response.Fail(c, http.StatusInternalServerError, "đổi mật khẩu thất bại")
		}
		return
	}

	response.OK(c, http.StatusOK, "đổi mật khẩu thành công", nil)
}
