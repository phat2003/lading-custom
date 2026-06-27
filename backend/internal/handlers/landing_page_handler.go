package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

type LandingPageHandler struct {
	pageService *service.LandingPageService
}

func NewLandingPageHandler(pageService *service.LandingPageService) *LandingPageHandler {
	return &LandingPageHandler{pageService: pageService}
}

// Request khi tạo Landing Page
type createPageRequest struct {
	ProjectID string `json:"project_id" binding:"required,uuid"`
	Name      string `json:"name" binding:"required,min=2,max=150"`
}

// Request khi cập nhật Landing Page
type updatePageRequest struct {
	Name   string `json:"name"`
	Status string `json:"status"` // draft, published
}

// POST /pages
func (h *LandingPageHandler) Create(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uuid.UUID)

	var req createPageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	projectID, _ := uuid.Parse(req.ProjectID)

	page, err := h.pageService.CreatePage(userID, projectID, req.Name)
	if err != nil {
		response.Fail(c, http.StatusForbidden, err.Error())
		return
	}

	response.OK(c, http.StatusCreated, "Tạo Landing Page thành công", page)
}

// GET /pages?project_id=...
func (h *LandingPageHandler) GetAll(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uuid.UUID)

	projectIDStr := c.Query("project_id")
	projectID, err := uuid.Parse(projectIDStr)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "Thiếu hoặc sai định dạng project_id")
		return
	}

	pages, err := h.pageService.GetPagesByProject(userID, projectID)
	if err != nil {
		response.Fail(c, http.StatusForbidden, err.Error())
		return
	}

	response.OK(c, http.StatusOK, "Lấy danh sách thành công", pages)
}

// GET /pages/:id
func (h *LandingPageHandler) GetByID(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uuid.UUID)

	pageID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "ID trang không hợp lệ")
		return
	}

	page, err := h.pageService.GetPageByID(userID, pageID)
	if err != nil {
		response.Fail(c, http.StatusNotFound, err.Error())
		return
	}

	response.OK(c, http.StatusOK, "Lấy thông tin thành công", page)
}

// PUT /pages/:id
func (h *LandingPageHandler) Update(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uuid.UUID)

	pageID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "ID trang không hợp lệ")
		return
	}

	var req updatePageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	page, err := h.pageService.UpdatePage(userID, pageID, req.Name, req.Status)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	response.OK(c, http.StatusOK, "Cập nhật thành công", page)
}

// DELETE /pages/:id
func (h *LandingPageHandler) Delete(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uuid.UUID)

	pageID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "ID trang không hợp lệ")
		return
	}

	if err := h.pageService.DeletePage(userID, pageID); err != nil {
		response.Fail(c, http.StatusNotFound, err.Error())
		return
	}

	response.OK(c, http.StatusOK, "Xóa trang thành công", nil)
}