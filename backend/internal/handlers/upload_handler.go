package handlers

import (
	"errors"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

const (
	maxImageSize    = 5 << 20 // 5 MB — thumbnail của admin (ảnh nhỏ minh hoạ)
	maxTemplateSize = 2 << 20 // 2 MB — file HTML template đầy đủ
	thumbnailDir    = "uploads/thumbnails"
	templateFileDir = "uploads/templates"

	// multipartOverhead là phần dự phòng cho boundary/field khác của multipart,
	// cộng thêm vào giới hạn file khi đặt trần cứng cho toàn body (MaxBytesReader).
	multipartOverhead = 1 << 20 // 1 MB
)

// Whitelist MIME THẬT -> phần mở rộng chuẩn hoá. ext luôn sinh từ đây, không
// bao giờ lấy từ tên file client gửi lên.
// Lưu ý: cố tình KHÔNG có image/svg+xml vì SVG có thể chứa <script> (XSS).
var allowedImageMIME = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/webp": ".webp",
}

// Template chỉ chấp nhận HTML thật.
var allowedTemplateMIME = map[string]string{
	"text/html": ".html",
}

// extInlineImages là các đuôi ảnh được phép hiển thị inline khi serve.
// Mọi đuôi khác (kể cả .html, .svg) sẽ bị ép tải về (attachment), không thực thi.
var extInlineImages = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".webp": true,
	".gif":  true,
}

// UploadHandler xử lý request HTTP upload file ảnh và file template.
type UploadHandler struct {
	assetService  *service.MediaAssetService
	publicBaseURL string
}

func NewUploadHandler(assetService *service.MediaAssetService, publicBaseURL string) *UploadHandler {
	return &UploadHandler{assetService: assetService, publicBaseURL: publicBaseURL}
}

// currentUserID lấy user_id do middleware AuthRequired set vào context, có kiểm
// tra kiểu an toàn (tránh panic nếu vì lý do nào đó không có/không đúng kiểu).
func currentUserID(c *gin.Context) (uuid.UUID, bool) {
	v, ok := c.Get("user_id")
	if !ok {
		return uuid.Nil, false
	}
	id, ok := v.(uuid.UUID)
	return id, ok
}

// buildPublicFileURL dựng URL tuyệt đối cho file đã upload.
// Ưu tiên base cấu hình (PublicBaseURL); nếu trống thì suy từ request, ưu tiên
// X-Forwarded-Proto để đúng scheme khi đứng sau proxy/TLS terminator.
func buildPublicFileURL(c *gin.Context, base, dir, filename string) string {
	origin := strings.TrimRight(base, "/")
	if origin == "" {
		scheme := "http"
		if proto := c.GetHeader("X-Forwarded-Proto"); proto != "" {
			scheme = proto
		} else if c.Request.TLS != nil {
			scheme = "https"
		}
		origin = scheme + "://" + c.Request.Host
	}
	return origin + "/" + dir + "/" + filename
}

// removeFileOnError chạy dbFn (thao tác ghi DB) sau khi file đã ghi xuống đĩa.
// Nếu dbFn lỗi -> xoá file tại dir/filename để không để lại file mồ côi, rồi trả
// về lỗi GỐC của dbFn (đó mới là cái client cần biết, không phải lỗi dọn dẹp).
// Nếu os.Remove cũng lỗi -> chỉ log cảnh báo kèm đường dẫn để vận hành dọn tay.
//
// Dùng chung cho mọi endpoint theo pattern "ghi file -> ghi DB -> rollback file".
func removeFileOnError(dir, filename string, dbFn func() error) error {
	err := dbFn()
	if err == nil {
		return nil
	}

	fullPath := filepath.Join(dir, filename)
	if rmErr := os.Remove(fullPath); rmErr != nil {
		log.Printf("[upload] CẢNH BÁO: ghi DB thất bại và KHÔNG xoá được file mồ côi %q (cần dọn tay): %v | lỗi DB gốc: %v", fullPath, rmErr, err)
	} else {
		log.Printf("[upload] đã rollback (xoá) file %q sau khi ghi DB thất bại", fullPath)
	}
	return err
}

// failFormFile chuyển lỗi c.FormFile thành response phù hợp: vượt trần
// MaxBytesReader -> 413, còn lại coi như thiếu/sai file -> 400.
func failFormFile(c *gin.Context, err error) {
	var maxErr *http.MaxBytesError
	if errors.As(err, &maxErr) {
		response.Fail(c, http.StatusRequestEntityTooLarge, "file vượt quá kích thước cho phép")
		return
	}
	response.Fail(c, http.StatusBadRequest, "không nhận được file — đảm bảo gửi multipart/form-data với field \"file\"")
}

// UploadThumbnail godoc — POST /api/v1/admin/media/upload
// Nhận file ảnh (multipart/form-data, field "file"), lưu vào uploads/thumbnails/.
func (h *UploadHandler) UploadThumbnail(c *gin.Context) {
	// Trần cứng cho toàn body — chặn stream body khổng lồ trước khi parse (chống DoS).
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxImageSize+multipartOverhead)

	fileHeader, err := c.FormFile("file")
	if err != nil {
		failFormFile(c, err)
		return
	}

	// Chặn file rỗng.
	if fileHeader.Size == 0 {
		response.Fail(c, http.StatusBadRequest, "file rỗng (0 byte)")
		return
	}

	// Kiểm tra kích thước tối đa 5MB.
	if fileHeader.Size > maxImageSize {
		response.Fail(c, http.StatusRequestEntityTooLarge, "file vượt quá kích thước tối đa 5MB")
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		log.Printf("[UploadThumbnail] không mở được file upload: %v", err)
		response.Fail(c, http.StatusInternalServerError, "không mở được file")
		return
	}
	defer file.Close()

	// Lấy id admin đang upload (owner của bản ghi media_asset).
	adminID, ok := currentUserID(c)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "không xác định được người dùng")
		return
	}

	// Nhận diện MIME THẬT từ nội dung; ext sinh từ whitelist, không tin header/tên client.
	ext, mime, err := service.DetectExtension(file, allowedImageMIME)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "chỉ chấp nhận ảnh định dạng JPEG, PNG hoặc WebP")
		return
	}

	filename, err := service.SaveFile(file, thumbnailDir, ext)
	if err != nil {
		log.Printf("[UploadThumbnail] lưu file thất bại: %v", err)
		response.Fail(c, http.StatusInternalServerError, "lưu file thất bại")
		return
	}

	fileURL := buildPublicFileURL(c, h.publicBaseURL, thumbnailDir, filename)

	// Thumbnail LÀ media (ảnh) -> ghi media_asset: file_type = MIME thật,
	// owner_id = admin, landing_page_id = null (chưa gắn page cụ thể).
	// Nếu ghi DB thất bại, removeFileOnError xoá file vừa lưu để tránh mồ côi.
	err = removeFileOnError(thumbnailDir, filename, func() error {
		_, e := h.assetService.SaveAssetRecord(adminID, fileURL, mime, fileHeader.Size)
		return e
	})
	if err != nil {
		log.Printf("[UploadThumbnail] ghi media_asset thất bại: %v", err)
		response.Fail(c, http.StatusInternalServerError, "lưu thông tin file thất bại")
		return
	}

	response.OK(c, http.StatusOK, "upload thumbnail thành công", gin.H{"file_url": fileURL})
}

// UploadTemplateFile godoc — POST /api/v1/admin/templates/upload
// Nhận file HTML (multipart/form-data, field "file"), lưu vào uploads/templates/.
func (h *UploadHandler) UploadTemplateFile(c *gin.Context) {
	// Trần cứng cho toàn body — chặn stream body khổng lồ trước khi parse (chống DoS).
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxTemplateSize+multipartOverhead)

	fileHeader, err := c.FormFile("file")
	if err != nil {
		failFormFile(c, err)
		return
	}

	// Chặn file rỗng.
	if fileHeader.Size == 0 {
		response.Fail(c, http.StatusBadRequest, "file rỗng (0 byte)")
		return
	}

	// Kiểm tra kích thước tối đa 2MB.
	if fileHeader.Size > maxTemplateSize {
		response.Fail(c, http.StatusRequestEntityTooLarge, "file vượt quá kích thước tối đa 2MB")
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		log.Printf("[UploadTemplateFile] không mở được file upload: %v", err)
		response.Fail(c, http.StatusInternalServerError, "không mở được file")
		return
	}
	defer file.Close()

	// Nhận diện MIME THẬT; chỉ nhận text/html, ext luôn là .html.
	ext, _, err := service.DetectExtension(file, allowedTemplateMIME)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "chỉ chấp nhận file HTML (text/html)")
		return
	}

	filename, err := service.SaveFile(file, templateFileDir, ext)
	if err != nil {
		log.Printf("[UploadTemplateFile] lưu file thất bại: %v", err)
		response.Fail(c, http.StatusInternalServerError, "lưu file thất bại")
		return
	}

	// TODO: track file này khi luồng tạo Template được xây để tham chiếu nó.
	// Lúc đó cân nhắc thêm template.file_url hoặc bảng template_file. Cố tình
	// CHƯA ghi media_asset vì chưa có cạnh tham chiếu -> bản ghi sẽ là dữ liệu
	// chết, không GC được, chỉ gây ô nhiễm ngữ nghĩa bảng media.
	fileURL := buildPublicFileURL(c, h.publicBaseURL, templateFileDir, filename)
	response.OK(c, http.StatusOK, "upload template file thành công", gin.H{"file_url": fileURL})
}

// ServeUploadedFile serve file trong thư mục uploads/ một cách AN TOÀN, thay cho
// gin.Static. Đặt các header chống thực thi để triệt tiêu Stored XSS:
//   - X-Content-Type-Options: nosniff  -> trình duyệt không tự đoán lại kiểu file
//   - Content-Security-Policy: default-src 'none' -> chặn mọi script/subresource
//   - Với file KHÔNG phải ảnh (vd .html, .svg): Content-Disposition: attachment
//     buộc tải về thay vì render -> không chạy được trong origin của app.
//
// root là thư mục gốc (vd "./uploads").
func ServeUploadedFile(root string) gin.HandlerFunc {
	absRoot, _ := filepath.Abs(root)

	return func(c *gin.Context) {
		// c.Param("filepath") có dạng "/thumbnails/xxx.png".
		rel := strings.TrimPrefix(c.Param("filepath"), "/")

		// Chống path traversal ở tầng serve: làm sạch rồi kiểm tra vẫn nằm trong root.
		fullPath := filepath.Join(absRoot, filepath.Clean("/"+rel))
		if fullPath != absRoot && !strings.HasPrefix(fullPath, absRoot+string(os.PathSeparator)) {
			c.Status(http.StatusNotFound)
			return
		}

		info, err := os.Stat(fullPath)
		if err != nil || info.IsDir() {
			c.Status(http.StatusNotFound)
			return
		}

		// Header chống thực thi cho MỌI file được serve từ uploads/.
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("Content-Security-Policy", "default-src 'none'")

		// Chỉ ảnh mới được hiển thị inline; còn lại ép tải về để không thực thi.
		if !extInlineImages[strings.ToLower(filepath.Ext(fullPath))] {
			c.Header("Content-Disposition", "attachment")
		}

		c.File(fullPath)
	}
}
