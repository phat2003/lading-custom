package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

// Giá trị mặc định + trần cho phân trang danh sách user.
const (
	defaultUserPage  = 1
	defaultUserLimit = 10
	maxUserLimit     = 100
)

// AdminUserHandler xử lý request HTTP cho trang admin Users.
type AdminUserHandler struct {
	adminUserService *service.AdminUserService
}

func NewAdminUserHandler(adminUserService *service.AdminUserService) *AdminUserHandler {
	return &AdminUserHandler{adminUserService: adminUserService}
}

type createUserRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	FullName string `json:"full_name" binding:"required"`
	Phone    string `json:"phone" binding:"omitempty,max=20"`
	Role     string `json:"role" binding:"omitempty,oneof=user admin"`
	PlanType string `json:"plan_type" binding:"omitempty,oneof=free pro"`
}

// Con trỏ cho mọi field: phân biệt "không gửi" (giữ nguyên) với
// "gửi giá trị rỗng/false" (ghi đè thật).
type updateUserRequest struct {
	FullName *string `json:"full_name" binding:"omitempty,min=1"`
	Phone    *string `json:"phone" binding:"omitempty,max=20"`
	PlanType *string `json:"plan_type" binding:"omitempty,oneof=free pro"`
	IsActive *bool   `json:"is_active"`
}

// List godoc — GET /api/v1/admin/users
// Query: ?page=1&limit=10&search=&plan=all&status=all
func (h *AdminUserHandler) List(c *gin.Context) {
	page := parsePositiveInt(c.Query("page"), defaultUserPage)
	limit := parsePositiveInt(c.Query("limit"), defaultUserLimit)
	if limit > maxUserLimit {
		limit = maxUserLimit // chặn client xin cả bảng trong 1 request
	}

	plan := c.Query("plan")
	if !isAllowedFilter(plan, "free", "pro") {
		response.Fail(c, http.StatusBadRequest, "plan chỉ nhận: all | free | pro")
		return
	}
	status := c.Query("status")
	if !isAllowedFilter(status, "active", "inactive") {
		response.Fail(c, http.StatusBadRequest, "status chỉ nhận: all | active | inactive")
		return
	}

	users, total, err := h.adminUserService.ListUsers(service.ListUsersInput{
		Search: strings.TrimSpace(c.Query("search")),
		Plan:   plan,
		Status: status,
		Page:   page,
		Limit:  limit,
	})
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "lấy danh sách user thất bại")
		return
	}

	response.OKWithMeta(c, http.StatusOK, "lấy danh sách thành công", users,
		response.NewMeta(page, limit, total))
}

// GetByID godoc — GET /api/v1/admin/users/:id
func (h *AdminUserHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "user ID không hợp lệ")
		return
	}

	detail, err := h.adminUserService.GetUser(id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			response.Fail(c, http.StatusNotFound, "không tìm thấy user")
			return
		}
		response.Fail(c, http.StatusInternalServerError, "lấy thông tin user thất bại")
		return
	}

	response.OK(c, http.StatusOK, "lấy thông tin thành công", detail)
}

// Create godoc — POST /api/v1/admin/users
func (h *AdminUserHandler) Create(c *gin.Context) {
	var req createUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	user, err := h.adminUserService.CreateUser(service.CreateUserInput{
		Email:    req.Email,
		Password: req.Password,
		FullName: req.FullName,
		Phone:    req.Phone,
		Role:     models.UserRole(req.Role),
		PlanType: models.PlanType(req.PlanType),
	})
	if err != nil {
		if errors.Is(err, service.ErrEmailExists) {
			response.Fail(c, http.StatusConflict, err.Error())
			return
		}
		response.Fail(c, http.StatusInternalServerError, "tạo user thất bại")
		return
	}

	response.OK(c, http.StatusCreated, "tạo user thành công", user)
}

// Update godoc — PUT /api/v1/admin/users/:id
// Phục vụ 2 nút "Upgrade Plan" / "Cancel Plan" và công tắc khoá tài khoản.
func (h *AdminUserHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "user ID không hợp lệ")
		return
	}

	actorID, ok := currentUserID(c)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "không tìm thấy thông tin xác thực")
		return
	}

	var req updateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	// binding "omitempty" bỏ qua chuỗi rỗng nên phải tự chặn ở đây,
	// nếu không gửi full_name = "" sẽ âm thầm xoá mất tên user.
	if req.FullName != nil {
		trimmed := strings.TrimSpace(*req.FullName)
		if trimmed == "" {
			response.Fail(c, http.StatusBadRequest, "full_name không được để trống")
			return
		}
		req.FullName = &trimmed
	}

	in := service.UpdateUserInput{
		FullName: req.FullName,
		Phone:    req.Phone,
		IsActive: req.IsActive,
	}
	if req.PlanType != nil {
		plan := models.PlanType(*req.PlanType)
		in.PlanType = &plan
	}

	user, err := h.adminUserService.UpdateUser(id, actorID, in)
	if err != nil {
		switch {
		case errors.Is(err, repository.ErrNotFound):
			response.Fail(c, http.StatusNotFound, "không tìm thấy user")
		case errors.Is(err, service.ErrCannotLockSelf):
			response.Fail(c, http.StatusBadRequest, err.Error())
		default:
			response.Fail(c, http.StatusInternalServerError, "cập nhật user thất bại")
		}
		return
	}

	response.OK(c, http.StatusOK, "cập nhật thành công", user)
}

// Delete godoc — DELETE /api/v1/admin/users/:id
// XOÁ CỨNG: kéo theo toàn bộ project / landing page / media của user (CASCADE).
func (h *AdminUserHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "user ID không hợp lệ")
		return
	}

	actorID, ok := currentUserID(c)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "không tìm thấy thông tin xác thực")
		return
	}

	if err := h.adminUserService.DeleteUser(id, actorID); err != nil {
		switch {
		case errors.Is(err, repository.ErrNotFound):
			response.Fail(c, http.StatusNotFound, "không tìm thấy user")
		case errors.Is(err, service.ErrCannotDeleteSelf):
			response.Fail(c, http.StatusBadRequest, err.Error())
		case errors.Is(err, service.ErrCannotDeleteSuperAdmin):
			response.Fail(c, http.StatusForbidden, err.Error())
		default:
			response.Fail(c, http.StatusInternalServerError, "xoá user thất bại")
		}
		return
	}

	response.OK(c, http.StatusOK, "xoá user thành công", nil)
}
