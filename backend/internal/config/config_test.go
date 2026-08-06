package config

import (
	"strings"
	"testing"
)

// Config hợp lệ cho production, dùng làm điểm xuất phát rồi bẻ từng field.
func prodConfig() *Config {
	return &Config{
		AppEnv:             "production",
		JWTSecret:          "mot-secret-that-su-ngau-nhien",
		DBPassword:         "mat-khau-that",
		CORSAllowedOrigins: []string{"https://app.example.com"},
	}
}

func TestValidateProduction_CauHinhDayDuThiQua(t *testing.T) {
	if err := prodConfig().validateProduction(); err != nil {
		t.Fatalf("cấu hình hợp lệ không được báo lỗi, nhận: %v", err)
	}
}

// Ngoài production thì không chặn gì, để dev chạy được ngay sau khi clone.
func TestValidateProduction_BoQuaOMoiTruongDev(t *testing.T) {
	c := prodConfig()
	c.AppEnv = "development"
	c.JWTSecret = defaultJWTSecret
	c.DBPassword = defaultDBPassword
	c.CORSAllowedOrigins = []string{"*"}

	if err := c.validateProduction(); err != nil {
		t.Fatalf("môi trường dev không được chặn, nhận: %v", err)
	}
}

func TestValidateProduction_ChanGiaTriMacDinh(t *testing.T) {
	cases := []struct {
		name    string
		mutate  func(*Config)
		wantHas string
	}{
		{
			name:    "JWT_SECRET còn mặc định",
			mutate:  func(c *Config) { c.JWTSecret = defaultJWTSecret },
			wantHas: "JWT_SECRET",
		},
		{
			name:    "JWT_SECRET rỗng",
			mutate:  func(c *Config) { c.JWTSecret = "" },
			wantHas: "JWT_SECRET",
		},
		{
			name:    "mật khẩu DB còn mặc định",
			mutate:  func(c *Config) { c.DBPassword = defaultDBPassword },
			wantHas: "POSTGRES_PASSWORD",
		},
		{
			name:    "CORS mở toang",
			mutate:  func(c *Config) { c.CORSAllowedOrigins = []string{"*"} },
			wantHas: "CORS_ALLOWED_ORIGINS",
		},
		{
			name:    "CORS có * lẫn trong danh sách",
			mutate:  func(c *Config) { c.CORSAllowedOrigins = []string{"https://a.com", "*"} },
			wantHas: "CORS_ALLOWED_ORIGINS",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			c := prodConfig()
			tc.mutate(c)

			err := c.validateProduction()
			if err == nil {
				t.Fatal("mong đợi báo lỗi, nhưng cấu hình được chấp nhận")
			}
			if !strings.Contains(err.Error(), tc.wantHas) {
				t.Errorf("thông báo lỗi phải nhắc tới %q, nhận: %v", tc.wantHas, err)
			}
		})
	}
}

// Lỗi phải gom hết một lần, tránh cảnh sửa 1 biến rồi deploy lại mới lòi ra biến kế.
func TestValidateProduction_GomNhieuLoiTrongMotThongBao(t *testing.T) {
	c := prodConfig()
	c.JWTSecret = defaultJWTSecret
	c.DBPassword = defaultDBPassword
	c.CORSAllowedOrigins = []string{"*"}

	err := c.validateProduction()
	if err == nil {
		t.Fatal("mong đợi báo lỗi")
	}
	for _, want := range []string{"JWT_SECRET", "POSTGRES_PASSWORD", "CORS_ALLOWED_ORIGINS"} {
		if !strings.Contains(err.Error(), want) {
			t.Errorf("thiếu %q trong thông báo: %v", want, err)
		}
	}
}

func TestGetEnvList(t *testing.T) {
	fallback := []string{"*"}

	cases := []struct {
		name  string
		set   bool
		value string
		want  []string
	}{
		{"không set thì dùng mặc định", false, "", fallback},
		{"một origin", true, "https://a.com", []string{"https://a.com"}},
		{"nhiều origin", true, "https://a.com,https://b.com", []string{"https://a.com", "https://b.com"}},
		{"bỏ khoảng trắng thừa", true, " https://a.com , https://b.com ", []string{"https://a.com", "https://b.com"}},
		{"bỏ phần tử rỗng", true, "https://a.com,,", []string{"https://a.com"}},
		{"toàn dấu phẩy thì về mặc định", true, ",,,", fallback},
		{"chuỗi rỗng thì về mặc định", true, "", fallback},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			const key = "TEST_CORS_LIST"
			if tc.set {
				t.Setenv(key, tc.value)
			}

			got := getEnvList(key, fallback)
			if len(got) != len(tc.want) {
				t.Fatalf("nhận %v, mong đợi %v", got, tc.want)
			}
			for i := range got {
				if got[i] != tc.want[i] {
					t.Fatalf("nhận %v, mong đợi %v", got, tc.want)
				}
			}
		})
	}
}
