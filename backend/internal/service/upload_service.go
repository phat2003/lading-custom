package service

import (
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
)

// ErrUnsupportedMIME báo MIME thật của file không nằm trong whitelist cho phép.
// Handler nên chuyển lỗi này thành HTTP 400.
var ErrUnsupportedMIME = errors.New("định dạng file không được hỗ trợ")

// DetectExtension đọc 512 byte đầu để nhận diện MIME THẬT của file (không tin
// Content-Type do client khai, cũng không tin phần mở rộng trong tên file),
// đối chiếu với whitelist truyền vào và trả về phần mở rộng chuẩn hoá cùng
// MIME thật đã nhận diện.
//
// allowed là map[MIME]ext, ví dụ {"image/jpeg": ".jpg"}. Nếu MIME thật không
// nằm trong whitelist -> trả ErrUnsupportedMIME.
//
// Hàm tự tua con trỏ file về đầu sau khi đọc để SaveFile ghi được đầy đủ nội dung.
func DetectExtension(file multipart.File, allowed map[string]string) (ext, mime string, err error) {
	buf := make([]byte, 512)
	n, err := file.Read(buf)
	if err != nil && err != io.EOF {
		return "", "", fmt.Errorf("không đọc được nội dung file để nhận diện định dạng: %w", err)
	}

	// Tua con trỏ về đầu để bước ghi file không bị mất 512 byte đã đọc.
	if _, err := file.Seek(0, io.SeekStart); err != nil {
		return "", "", fmt.Errorf("không tua được con trỏ file: %w", err)
	}

	// http.DetectContentType có thể trả kèm charset, ví dụ "text/html; charset=utf-8".
	mime = http.DetectContentType(buf[:n])
	if i := strings.IndexByte(mime, ';'); i >= 0 {
		mime = mime[:i]
	}
	mime = strings.TrimSpace(mime)

	ext, ok := allowed[mime]
	if !ok {
		return "", "", ErrUnsupportedMIME
	}
	return ext, mime, nil
}

// SaveFile lưu file upload vào thư mục chỉ định với tên UUID unique.
// Phần mở rộng (ext) do caller quyết định dựa trên MIME thật — KHÔNG lấy từ
// tên file client gửi lên, để tránh path traversal và ext độc hại.
// Trả về tên file đã lưu (không phải full path).
func SaveFile(file multipart.File, dir, ext string) (string, error) {
	// Tạo thư mục nếu chưa tồn tại (0755 thay vì 0777 để không world-writable).
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", fmt.Errorf("không tạo được thư mục %s: %w", dir, err)
	}

	// Dùng UUID làm tên để tránh trùng lặp và loại bỏ mọi ký tự do người dùng kiểm soát.
	filename := uuid.New().String() + ext
	fullPath := filepath.Join(dir, filename)

	out, err := os.Create(fullPath)
	if err != nil {
		return "", fmt.Errorf("không tạo được file: %w", err)
	}
	defer out.Close()

	if _, err := io.Copy(out, file); err != nil {
		// Ghi dở giữa chừng -> xoá file rác trước khi trả lỗi để không để lại file mồ côi.
		out.Close()
		if rmErr := os.Remove(fullPath); rmErr != nil {
			return "", fmt.Errorf("không ghi được nội dung file: %w (và không xoá được file dở: %v)", err, rmErr)
		}
		return "", fmt.Errorf("không ghi được nội dung file: %w", err)
	}

	return filename, nil
}
