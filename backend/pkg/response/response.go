package response

import "github.com/gin-gonic/gin"

// Response là cấu trúc JSON chuẩn cho toàn bộ API.
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Meta    *Meta       `json:"meta,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// Meta là khối phân trang đi kèm mọi endpoint trả danh sách.
// Frontend (component Pagination) đọc đúng 3 giá trị: page, total_pages, total.
type Meta struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

// NewMeta dựng khối meta và tự tính total_pages (làm tròn lên).
// limit <= 0 bị coi là không phân trang -> total_pages = 1.
func NewMeta(page, limit int, total int64) Meta {
	totalPages := 1
	if limit > 0 {
		totalPages = int((total + int64(limit) - 1) / int64(limit))
		if totalPages < 1 {
			totalPages = 1 // danh sách rỗng vẫn là 1 trang, tránh FE chia cho 0
		}
	}
	return Meta{Page: page, Limit: limit, Total: total, TotalPages: totalPages}
}

// OK trả về response thành công kèm data.
func OK(c *gin.Context, status int, message string, data interface{}) {
	c.JSON(status, Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// OKWithMeta trả về response thành công cho endpoint danh sách có phân trang.
func OKWithMeta(c *gin.Context, status int, message string, data interface{}, meta Meta) {
	c.JSON(status, Response{
		Success: true,
		Message: message,
		Data:    data,
		Meta:    &meta,
	})
}

// Fail trả về response lỗi.
func Fail(c *gin.Context, status int, errMsg string) {
	c.JSON(status, Response{
		Success: false,
		Error:   errMsg,
	})
}
