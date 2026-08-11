package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/nhienthai/lading-custom/backend/internal/repository"
	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

// StaticHandler xử lý sinh HTML tĩnh, publish landing page và serve link công khai.
type StaticHandler struct {
	staticService *service.StaticService
}

func NewStaticHandler(staticService *service.StaticService) *StaticHandler {
	return &StaticHandler{staticService: staticService}
}

// GenerateStatic — POST /api/v1/landing-pages/:id/generate-static
// Sinh HTML tĩnh để xem trước bản sẽ publish (chưa lưu snapshot).
func (h *StaticHandler) GenerateStatic(c *gin.Context) {
	pageID, userID, ok := h.parseParams(c)
	if !ok {
		return
	}

	html, err := h.staticService.GenerateStaticHTML(userID, pageID)
	if err != nil {
		h.failFromError(c, err)
		return
	}

	response.OK(c, http.StatusOK, "sinh HTML tĩnh thành công", gin.H{
		"html": html,
	})
}

// PublishPage — POST /api/v1/landing-pages/:id/publish
// Sinh HTML tĩnh, lưu thành snapshot với slug duy nhất và chuyển trang sang trạng thái published.
func (h *StaticHandler) PublishPage(c *gin.Context) {
	pageID, userID, ok := h.parseParams(c)
	if !ok {
		return
	}

	// Publish lại giữ nguyên slug cũ của trang -> link công khai không đổi.
	_, slug, err := h.staticService.GenerateAndSaveSnapshot(userID, pageID)
	if err != nil {
		h.failFromError(c, err)
		return
	}

	response.OK(c, http.StatusOK, "publish trang thành công", gin.H{
		"published_url": slug,
		"public_link":   h.buildPublicLink(c, slug),
		"status":        "published",
	})
}

// UnpublishPage — POST /api/v1/landing-pages/:id/unpublish
// Gỡ trang khỏi link công khai (status về 'draft'). Snapshot cũ được GIỮ LẠI trong DB.
func (h *StaticHandler) UnpublishPage(c *gin.Context) {
	pageID, userID, ok := h.parseParams(c)
	if !ok {
		return
	}

	if err := h.staticService.UnpublishPage(userID, pageID); err != nil {
		h.failFromError(c, err)
		return
	}

	response.OK(c, http.StatusOK, "gỡ xuất bản thành công", gin.H{
		"status": "draft",
	})
}

// ServePublic — GET /p/:slug (route công khai, KHÔNG cần đăng nhập)
// Trả thẳng HTML đã đóng băng trong snapshot.
func (h *StaticHandler) ServePublic(c *gin.Context) {
	slug := c.Param("slug")

	html, err := h.staticService.GetPublicHTML(slug)
	if err != nil {
		// Slug lạ, trang đã unpublish, hoặc snapshot hỏng -> đều trả 404 HTML (không phải JSON,
		// vì đây là link người dùng cuối mở thẳng trên trình duyệt). Không phân biệt lý do
		// để không lộ việc slug đó từng tồn tại.
		c.Data(http.StatusNotFound, "text/html; charset=utf-8", []byte(notFoundHTML))
		return
	}

	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
}

// buildPublicLink dựng link công khai đầy đủ từ host của request hiện tại,
// vd: http://localhost:8080/p/a3f9k2xy
func (h *StaticHandler) buildPublicLink(c *gin.Context, slug string) string {
	scheme := "http"
	if c.Request.TLS != nil || c.GetHeader("X-Forwarded-Proto") == "https" {
		scheme = "https"
	}
	return scheme + "://" + c.Request.Host + "/p/" + slug
}

// parseParams lấy landing_page_id từ URL param và user_id từ context (do AuthRequired set).
// Trả về ok=false nếu đã ghi response lỗi — caller chỉ cần return.
func (h *StaticHandler) parseParams(c *gin.Context) (uuid.UUID, uuid.UUID, bool) {
	pageID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "landing_page_id không hợp lệ")
		return uuid.Nil, uuid.Nil, false
	}

	userIDVal, exists := c.Get("user_id")
	if !exists {
		response.Fail(c, http.StatusUnauthorized, "không xác định được người dùng")
		return uuid.Nil, uuid.Nil, false
	}
	userID, ok := userIDVal.(uuid.UUID)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "thông tin người dùng không hợp lệ")
		return uuid.Nil, uuid.Nil, false
	}

	return pageID, userID, true
}

// failFromError map lỗi từ service sang đúng HTTP status:
//   - 404: trang không tồn tại
//   - 403: trang tồn tại nhưng thuộc user khác
//   - 500: lỗi thật (DB, render, sinh slug...)
func (h *StaticHandler) failFromError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, gorm.ErrRecordNotFound):
		response.Fail(c, http.StatusNotFound, "không tìm thấy trang")
	case errors.Is(err, repository.ErrForbidden):
		response.Fail(c, http.StatusForbidden, "bạn không có quyền thao tác trên trang này")
	default:
		response.Fail(c, http.StatusInternalServerError, "xử lý trang tĩnh thất bại: "+err.Error())
	}
}

// notFoundHTML là trang 404 tối giản cho link công khai không tồn tại.
const notFoundHTML = `<!DOCTYPE html>
<html lang="vi">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>404 — Không tìm thấy trang</title>
	<style>
		body {
			margin: 0;
			min-height: 100vh;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			background-color: #131315;
			color: #e5e1e4;
			font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
			text-align: center;
		}
		h1 { font-size: 64px; margin: 0; }
		p { opacity: 0.6; margin-top: 12px; }
	</style>
</head>
<body>
	<h1>404</h1>
	<p>Trang bạn tìm không tồn tại hoặc đã bị gỡ.</p>
</body>
</html>`
