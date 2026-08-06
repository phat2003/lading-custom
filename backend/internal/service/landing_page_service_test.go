package service

import (
	"errors"
	"testing"

	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

// Handler phân loại lỗi bằng errors.Is, nên sentinel phải xuyên qua được lớp bọc.
func TestNotFound_PhanLoaiDuocBangErrorsIs(t *testing.T) {
	err := notFound(errPageNotFound)

	if !errors.Is(err, repository.ErrNotFound) {
		t.Fatal("errors.Is phải nhận ra repository.ErrNotFound")
	}
	if errors.Is(err, repository.ErrForbidden) {
		t.Fatal("không được khớp nhầm sang ErrForbidden")
	}
}

// Thông điệp trả ra API phải sạch, không dính từ vựng nội bộ của repository.
func TestNotFound_ThongDiepKhongLoChiTietNoiBo(t *testing.T) {
	err := notFound(errPageNotFound)

	if err.Error() != errPageNotFound {
		t.Errorf("thông điệp = %q, mong đợi %q", err.Error(), errPageNotFound)
	}
	if err.Error() == repository.ErrNotFound.Error() {
		t.Error("không được dùng nguyên văn thông điệp của repository")
	}
}

// Trang của người khác và trang không tồn tại phải trả về THÔNG ĐIỆP GIỐNG HỆT
// nhau. Khác nhau một chữ là đủ để kẻ tấn công quét ID và biết trang nào có thật.
func TestNotFound_KhongPhanBietTrangCuaNguoiKhacVaTrangKhongTonTai(t *testing.T) {
	khongTonTai := notFound(errPageNotFound)
	cuaNguoiKhac := notFound(errPageNotFound)

	if khongTonTai.Error() != cuaNguoiKhac.Error() {
		t.Errorf("hai trường hợp phải giống nhau: %q vs %q",
			khongTonTai.Error(), cuaNguoiKhac.Error())
	}
}

func TestNotFound_PhanBietTrangVaDuAn(t *testing.T) {
	if notFound(errPageNotFound).Error() == notFound(errProjectNotFound).Error() {
		t.Error("lỗi của trang và của dự án phải khác nhau để FE hiển thị đúng")
	}
}
