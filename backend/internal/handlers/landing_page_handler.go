package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

// failPageError map lỗi của LandingPageService ra HTTP status.
// Trước đây mỗi handler tự chọn status theo cảm tính nên cùng một lỗi
// "không tìm thấy" chỗ thì trả 403, chỗ trả 404, chỗ trả 400.
func failPageError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, repository.ErrNotFound):
		response.Fail(c, http.StatusNotFound, err.Error())
	case errors.Is(err, repository.ErrForbidden):
		response.Fail(c, http.StatusForbidden, err.Error())
	default:
		// Lỗi không phân loại được là lỗi hệ thống: không bê err.Error() ra
		// ngoài để tránh lộ chi tiết nội bộ (câu lệnh SQL, tên bảng...).
		response.Fail(c, http.StatusInternalServerError, "đã có lỗi xảy ra, vui lòng thử lại")
	}
}

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

type updateSEORequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Keywords    string `json:"keywords"`
	OGImage     string `json:"og_image"`
	Favicon     string `json:"favicon"`
}

// POST /pages
func (h *LandingPageHandler) Create(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "không xác định được người dùng")
		return
	}

	var req createPageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	projectID, _ := uuid.Parse(req.ProjectID)

	page, err := h.pageService.CreatePage(userID, projectID, req.Name)
	if err != nil {
		failPageError(c, err)
		return
	}

	response.OK(c, http.StatusCreated, "Tạo Landing Page thành công", page)
}

// GET /pages?project_id=...
func (h *LandingPageHandler) GetAll(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "không xác định được người dùng")
		return
	}

	projectIDStr := c.Query("project_id")
	projectID, err := uuid.Parse(projectIDStr)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "Thiếu hoặc sai định dạng project_id")
		return
	}

	pages, err := h.pageService.GetPagesByProject(userID, projectID)
	if err != nil {
		failPageError(c, err)
		return
	}

	response.OK(c, http.StatusOK, "Lấy danh sách thành công", pages)
}

// GET /pages/:id
func (h *LandingPageHandler) GetByID(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "không xác định được người dùng")
		return
	}

	pageID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "ID trang không hợp lệ")
		return
	}

	page, err := h.pageService.GetPageByID(userID, pageID)
	if err != nil {
		failPageError(c, err)
		return
	}

	response.OK(c, http.StatusOK, "Lấy thông tin thành công", page)
}

// PUT /pages/:id
func (h *LandingPageHandler) Update(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "không xác định được người dùng")
		return
	}

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
		failPageError(c, err)
		return
	}

	response.OK(c, http.StatusOK, "Cập nhật thành công", page)
}

// UpdateSEO — PUT /api/v1/pages/:id/seo (route yêu cầu gói Pro).
func (h *LandingPageHandler) UpdateSEO(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "không xác định được người dùng")
		return
	}

	pageID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "ID trang không hợp lệ")
		return
	}

	var req updateSEORequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, "Dữ liệu SEO không hợp lệ.")
		return
	}

	page, err := h.pageService.UpdateSEO(userID, pageID, models.LandingPageSEO{
		Title:       req.Title,
		Description: req.Description,
		Keywords:    req.Keywords,
		OGImage:     req.OGImage,
		Favicon:     req.Favicon,
	})
	if err != nil {
		if errors.Is(err, service.ErrInvalidSEOURL) {
			response.Fail(c, http.StatusBadRequest, err.Error())
			return
		}
		failPageError(c, err)
		return
	}

	response.OK(c, http.StatusOK, "Cập nhật SEO thành công", page)
}

// DELETE /pages/:id
func (h *LandingPageHandler) Delete(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "không xác định được người dùng")
		return
	}

	pageID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "ID trang không hợp lệ")
		return
	}

	if err := h.pageService.DeletePage(userID, pageID); err != nil {
		failPageError(c, err)
		return
	}

	response.OK(c, http.StatusOK, "Xóa trang thành công", nil)
}
