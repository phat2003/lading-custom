package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

// maxUserMediaSize — giới hạn ảnh nội dung của user (10MB, rộng hơn thumbnail
// admin 5MB vì ảnh chụp/GIF thật dễ lớn hơn ảnh minh hoạ).
const maxUserMediaSize = 10 << 20

// userMediaDir — thư mục lưu ảnh nội dung của user.
const userMediaDir = "uploads/user_media"

// Whitelist MIME THẬT cho user media -> ext. Rộng hơn thumbnail admin (có GIF),
// nhưng vẫn loại image/svg+xml vì SVG có thể chứa <script>.
var allowedUserMediaMIME = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/webp": ".webp",
	"image/gif":  ".gif",
}

type MediaAssetHandler struct {
	mediaAssetService *service.MediaAssetService
	publicBaseURL     string
}

func NewMediaAssetHandler(mediaAssetService *service.MediaAssetService, publicBaseURL string) *MediaAssetHandler {
	return &MediaAssetHandler{mediaAssetService: mediaAssetService, publicBaseURL: publicBaseURL}
}

// POST /upload
func (h *MediaAssetHandler) UploadImage(c *gin.Context) {
	// Trần cứng cho toàn body — chặn stream body khổng lồ trước khi parse (chống DoS).
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxUserMediaSize+multipartOverhead)

	userID, ok := currentUserID(c)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "Không xác định được người dùng")
		return
	}

	fileHeader, err := c.FormFile("file")
	if err != nil {
		failFormFile(c, err)
		return
	}

	// Chặn file rỗng.
	if fileHeader.Size == 0 {
		response.Fail(c, http.StatusBadRequest, "File rỗng (0 byte)")
		return
	}

	// Kiểm tra kích thước tối đa 10MB.
	if fileHeader.Size > maxUserMediaSize {
		response.Fail(c, http.StatusRequestEntityTooLarge, "File vượt quá kích thước tối đa 10MB")
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		log.Printf("[UploadImage] không mở được file upload: %v", err)
		response.Fail(c, http.StatusInternalServerError, "Không thể đọc file")
		return
	}
	defer file.Close()

	// Nhận diện MIME THẬT từ nội dung — dùng cho cả ext lẫn file_type lưu DB,
	// không tin Content-Type hay tên file client gửi lên.
	ext, mime, err := service.DetectExtension(file, allowedUserMediaMIME)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "Chỉ chấp nhận ảnh JPEG, PNG, WebP hoặc GIF")
		return
	}

	// 1. TÁI SỬ DỤNG HÀM CỦA ĐỒNG ĐỘI ĐỂ LƯU FILE VÀO THƯ MỤC "uploads/user_media".
	filename, err := service.SaveFile(file, userMediaDir, ext)
	if err != nil {
		log.Printf("[UploadImage] lưu file thất bại: %v", err)
		response.Fail(c, http.StatusInternalServerError, "Lỗi khi lưu file vào hệ thống")
		return
	}

	// 2. Tạo URL công khai (tuyệt đối, nhất quán với admin upload).
	fileURL := buildPublicFileURL(c, h.publicBaseURL, userMediaDir, filename)

	// 3. Ghi thông tin vào DB (file_type = MIME thật vừa sniff). Nếu ghi DB thất bại,
	// removeFileOnError sẽ xoá file vừa lưu để không để lại file mồ côi.
	var asset *models.MediaAsset
	err = removeFileOnError(userMediaDir, filename, func() error {
		var e error
		asset, e = h.mediaAssetService.SaveAssetRecord(userID, fileURL, mime, fileHeader.Size)
		return e
	})
	if err != nil {
		log.Printf("[UploadImage] ghi media_asset thất bại: %v", err)
		response.Fail(c, http.StatusInternalServerError, "Lỗi khi lưu thông tin vào Database")
		return
	}

	response.OK(c, http.StatusCreated, "Tải ảnh lên thành công", asset)
}

// GET /upload/assets
func (h *MediaAssetHandler) GetAssets(c *gin.Context) {
	userID, ok := currentUserID(c)
	if !ok {
		response.Fail(c, http.StatusUnauthorized, "Không xác định được người dùng")
		return
	}

	assets, err := h.mediaAssetService.GetUserAssets(userID)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "Lỗi khi lấy danh sách ảnh")
		return
	}

	response.OK(c, http.StatusOK, "Lấy danh sách thành công", assets)
}
