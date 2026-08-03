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

// Giá trị mặc định + trần cho phân trang danh sách dự án.
const (
	defaultProjectPage  = 1
	defaultProjectLimit = 10
	maxProjectLimit     = 100
)

// AdminProjectHandler xử lý request HTTP cho trang admin Projects.
type AdminProjectHandler struct {
	adminProjectService *service.AdminProjectService
}

func NewAdminProjectHandler(adminProjectService *service.AdminProjectService) *AdminProjectHandler {
	return &AdminProjectHandler{adminProjectService: adminProjectService}
}

// List godoc — GET /api/v1/admin/projects
// Query: ?page=1&limit=10&search=&status=all
func (h *AdminProjectHandler) List(c *gin.Context) {
	page := parsePositiveInt(c.Query("page"), defaultProjectPage)
	limit := parsePositiveInt(c.Query("limit"), defaultProjectLimit)
	if limit > maxProjectLimit {
		limit = maxProjectLimit // chặn client xin cả bảng trong 1 request
	}

	status := c.Query("status")
	if !isAllowedFilter(status, "published", "draft") {
		response.Fail(c, http.StatusBadRequest, "status chỉ nhận: all | published | draft")
		return
	}

	projects, total, err := h.adminProjectService.ListProjects(service.ListProjectsInput{
		Search: strings.TrimSpace(c.Query("search")),
		Status: status,
		Page:   page,
		Limit:  limit,
	})
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "lấy danh sách dự án thất bại")
		return
	}

	response.OKWithMeta(c, http.StatusOK, "lấy danh sách thành công", projects,
		response.NewMeta(page, limit, total))
}

// Delete godoc — DELETE /api/v1/admin/projects/:id
// XOÁ CỨNG: kéo theo landing page, section và snapshot của dự án (CASCADE).
// Trang đang publish sẽ chết link ngay.
func (h *AdminProjectHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "project ID không hợp lệ")
		return
	}

	if err := h.adminProjectService.DeleteProject(id); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			response.Fail(c, http.StatusNotFound, "không tìm thấy dự án")
			return
		}
		response.Fail(c, http.StatusInternalServerError, "xoá dự án thất bại")
		return
	}

	response.OK(c, http.StatusOK, "xoá dự án thành công", nil)
}
