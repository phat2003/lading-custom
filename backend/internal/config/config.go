package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

// Config chứa toàn bộ cấu hình ứng dụng, đọc từ biến môi trường.
type Config struct {
	AppPort        string
	AppEnv         string
	JWTSecret      string
	JWTExpireHours int

	// PublicBaseURL là origin công khai của backend (vd https://api.example.com)
	// dùng để dựng URL tuyệt đối cho file upload. Để trống -> tự suy từ request.
	PublicBaseURL string

	// CORSAllowedOrigins đọc từ CORS_ALLOWED_ORIGINS, ngăn cách bằng dấu phẩy.
	// Để trống -> ["*"], chỉ chấp nhận được ở môi trường dev.
	CORSAllowedOrigins []string

	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string

	MomoPartnerCode string
	MomoAccessKey   string
	MomoSecretKey   string
	MomoReturnURL   string
	MomoNotifyURL   string
}

// Load đọc file .env (nếu có) rồi nạp các biến môi trường vào struct Config.
func Load() *Config {
	// .env là tùy chọn — khi chạy trong Docker thường truyền env trực tiếp.
	if err := godotenv.Load(); err != nil {
		log.Println("không tìm thấy file .env, dùng biến môi trường hệ thống")
	}

	cfg := &Config{
		AppPort:            getEnv("APP_PORT", "8080"),
		AppEnv:             getEnv("APP_ENV", "development"),
		JWTSecret:          getEnv("JWT_SECRET", defaultJWTSecret),
		JWTExpireHours:     getEnvInt("JWT_EXPIRE_HOURS", 72),
		PublicBaseURL:      getEnv("PUBLIC_BASE_URL", ""),
		CORSAllowedOrigins: getEnvList("CORS_ALLOWED_ORIGINS", []string{"*"}),

		DBHost:     getEnv("POSTGRES_HOST", "localhost"),
		DBPort:     getEnv("POSTGRES_PORT", "5432"),
		DBUser:     getEnv("POSTGRES_USER", "lpbuilder"),
		DBPassword: getEnv("POSTGRES_PASSWORD", defaultDBPassword),
		DBName:     getEnv("POSTGRES_DB", "lpbuilder"),
	}

	if err := cfg.validateProduction(); err != nil {
		log.Fatalf("cấu hình production không hợp lệ: %v", err)
	}

	//các dòng đọc biến môi trường .env cho momo payment
	cfg.MomoPartnerCode = os.Getenv("MOMO_PARTNER_CODE")
	cfg.MomoAccessKey = os.Getenv("MOMO_ACCESS_KEY")
	cfg.MomoSecretKey = os.Getenv("MOMO_SECRET_KEY")
	cfg.MomoReturnURL = os.Getenv("MOMO_RETURN_URL")
	cfg.MomoNotifyURL = os.Getenv("MOMO_NOTIFY_URL")
	return cfg
}

// Giá trị mặc định dùng cho dev. Chúng nằm trong repo công khai nên ai cũng
// biết — production mà vẫn dùng thì coi như không có bảo mật.
const (
	defaultJWTSecret  = "default-secret-change-me"
	defaultDBPassword = "changeme"
)

// validateProduction chặn các giá trị mặc định nguy hiểm khi APP_ENV=production.
// Cố tình để app SẬP lúc khởi động: chạy được mà JWT_SECRET vẫn là chuỗi mặc
// định thì bất kỳ ai cũng tự ký được token admin, và sẽ không ai phát hiện ra
// cho tới lúc có sự cố.
func (c *Config) validateProduction() error {
	if c.AppEnv != "production" {
		return nil
	}

	var missing []string
	if c.JWTSecret == defaultJWTSecret || c.JWTSecret == "" {
		missing = append(missing, "JWT_SECRET (đang dùng giá trị mặc định)")
	}
	if c.DBPassword == defaultDBPassword || c.DBPassword == "" {
		missing = append(missing, "POSTGRES_PASSWORD (đang dùng giá trị mặc định)")
	}
	for _, o := range c.CORSAllowedOrigins {
		if o == "*" {
			missing = append(missing, `CORS_ALLOWED_ORIGINS (không được để "*")`)
			break
		}
	}

	if len(missing) > 0 {
		return fmt.Errorf("phải đặt các biến môi trường sau: %s", strings.Join(missing, ", "))
	}
	return nil
}

// DSN trả về chuỗi kết nối PostgreSQL cho GORM.
func (c *Config) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable TimeZone=UTC",
		c.DBHost, c.DBPort, c.DBUser, c.DBPassword, c.DBName,
	)
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return fallback
}

// getEnvList đọc danh sách ngăn cách bằng dấu phẩy, bỏ khoảng trắng thừa và
// phần tử rỗng ("a, b," -> ["a","b"]). Chuỗi rỗng -> dùng fallback.
func getEnvList(key string, fallback []string) []string {
	raw, ok := os.LookupEnv(key)
	if !ok {
		return fallback
	}
	items := make([]string, 0)
	for _, part := range strings.Split(raw, ",") {
		if v := strings.TrimSpace(part); v != "" {
			items = append(items, v)
		}
	}
	if len(items) == 0 {
		return fallback
	}
	return items
}

func getEnvInt(key string, fallback int) int {
	if v, ok := os.LookupEnv(key); ok {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}
