package handlers

import (
	"errors"
	"strings"
	"testing"

	"github.com/go-playground/validator/v10"
)

func TestRegisterValidationMessage_KhongLoThongTinValidator(t *testing.T) {
	validate := validator.New()
	validate.SetTagName("binding")
	req := registerRequest{Email: "abc@", Password: "123456", FullName: "Nguyen Van A"}
	err := validate.Struct(req)
	if err == nil {
		t.Fatal("email sai định dạng phải tạo lỗi validation")
	}

	message := registerValidationMessage(err)
	if message != "Email không đúng định dạng. Ví dụ: ten@example.com" {
		t.Fatalf("thông báo email không đúng: %q", message)
	}
	for _, internal := range []string{"registerRequest", "Field validation", "'email' tag"} {
		if strings.Contains(message, internal) {
			t.Fatalf("thông báo làm lộ chi tiết validator: %q", message)
		}
	}
}

func TestRegisterValidationMessage_JSONHong(t *testing.T) {
	message := registerValidationMessage(errors.New("khong phai loi validator"))
	if message != "Dữ liệu đăng ký không hợp lệ." {
		t.Fatalf("thông báo fallback không đúng: %q", message)
	}
}
