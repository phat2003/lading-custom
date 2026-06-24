package service

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"

	"github.com/google/uuid"
)

// SaveFile lưu file upload vào thư mục chỉ định với tên UUID unique.
// Trả về tên file đã lưu (không phải full path).
func SaveFile(file multipart.File, header *multipart.FileHeader, dir string) (string, error) {
	// Tạo thư mục nếu chưa tồn tại.
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		return "", fmt.Errorf("không tạo được thư mục %s: %w", dir, err)
	}

	// Giữ phần mở rộng gốc, dùng UUID làm tên để tránh trùng lặp.
	ext := filepath.Ext(header.Filename)
	filename := uuid.New().String() + ext

	out, err := os.Create(filepath.Join(dir, filename))
	if err != nil {
		return "", fmt.Errorf("không tạo được file: %w", err)
	}
	defer out.Close()

	if _, err := io.Copy(out, file); err != nil {
		return "", fmt.Errorf("không ghi được nội dung file: %w", err)
	}

	return filename, nil
}
