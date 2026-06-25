package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

type ProjectHandler struct {
	projectService *service.ProjectService
}

func NewProjectHandler(projectService *service.ProjectService) *ProjectHandler {
	return &ProjectHandler{projectService: projectService}
}

type projectRequest struct {
	Name string `json:"name" binding:"required,min=3,max=150"`
}

// POST /projects
func (h *ProjectHandler) Create(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uuid.UUID) // Ép kiểu an toàn nhờ Middleware đã làm trước

	var req projectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	project, err := h.projectService.CreateProject(req.Name, userID)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "không thể tạo dự án")
		return
	}

	response.OK(c, http.StatusCreated, "tạo dự án thành công", project)
}

// GET /projects
func (h *ProjectHandler) GetAll(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uuid.UUID)

	projects, err := h.projectService.GetUserProjects(userID)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "lỗi khi lấy danh sách dự án")
		return
	}

	response.OK(c, http.StatusOK, "lấy danh sách thành công", projects)
}

// GET /projects/:id
func (h *ProjectHandler) GetByID(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uuid.UUID)

	projectID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "ID dự án không hợp lệ")
		return
	}

	project, err := h.projectService.GetProjectByID(projectID, userID)
	if err != nil {
		response.Fail(c, http.StatusNotFound, "không tìm thấy dự án hoặc bạn không có quyền")
		return
	}

	response.OK(c, http.StatusOK, "lấy thông tin thành công", project)
}

// PUT /projects/:id
func (h *ProjectHandler) Update(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uuid.UUID)

	projectID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "ID dự án không hợp lệ")
		return
	}

	var req projectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	project, err := h.projectService.UpdateProject(projectID, userID, req.Name)
	if err != nil {
		response.Fail(c, http.StatusNotFound, "không tìm thấy dự án để cập nhật")
		return
	}

	response.OK(c, http.StatusOK, "cập nhật thành công", project)
}

// DELETE /projects/:id
func (h *ProjectHandler) Delete(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uuid.UUID)

	projectID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "ID dự án không hợp lệ")
		return
	}

	if err := h.projectService.DeleteProject(projectID, userID); err != nil {
		response.Fail(c, http.StatusNotFound, "không tìm thấy dự án để xóa")
		return
	}

	response.OK(c, http.StatusOK, "xóa thành công", nil)
}