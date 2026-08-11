package repository

import "testing"

// escapeLike phải vô hiệu hoá ký tự đại diện của LIKE, nếu không thì người dùng
// gõ "100%" sẽ khớp mọi template, còn "_" khớp mọi ký tự đơn.
func TestEscapeLike(t *testing.T) {
	cases := []struct {
		name string
		in   string
		want string
	}{
		{"chuỗi thường giữ nguyên", "landing page", "landing page"},
		{"thoát dấu phần trăm", "100%", `100\%`},
		{"thoát gạch dưới", "hero_section", `hero\_section`},
		{"thoát dấu gạch chéo ngược", `a\b`, `a\\b`},
		{"nhiều ký tự đặc biệt", "%_%", `\%\_\%`},
		{"chuỗi rỗng", "", ""},
		// Gạch chéo phải được thoát TRƯỚC, nếu không "\%" sẽ thành "\\%" sai nghĩa.
		{"gạch chéo đứng trước phần trăm", `\%`, `\\\%`},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := escapeLike(tc.in); got != tc.want {
				t.Errorf("escapeLike(%q) = %q, mong đợi %q", tc.in, got, tc.want)
			}
		})
	}
}
