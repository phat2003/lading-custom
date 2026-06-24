package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

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

// updateProfileRequest payload request để update profile
type updateProfileRequest struct {
	FullName string `json:"full_name" binding:"required"`
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

	user, err := h.userService.UpdateProfile(userID, service.UpdateProfileInput{
		FullName: req.FullName,
	})
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "cập nhật thất bại")
		return
	}

	response.OK(c, http.StatusOK, "cập nhật thành công", user)
}