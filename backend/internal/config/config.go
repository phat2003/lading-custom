package config

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config chứa toàn bộ cấu hình ứng dụng, đọc từ biến môi trường.
type Config struct {
	AppPort        string
	AppEnv         string
	JWTSecret      string
	JWTExpireHours int

	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
}

// Load đọc file .env (nếu có) rồi nạp các biến môi trường vào struct Config.
func Load() *Config {
	// .env là tùy chọn — khi chạy trong Docker thường truyền env trực tiếp.
	if err := godotenv.Load(); err != nil {
		log.Println("không tìm thấy file .env, dùng biến môi trường hệ thống")
	}

	return &Config{
		AppPort:        getEnv("APP_PORT", "8080"),
		AppEnv:         getEnv("APP_ENV", "development"),
		JWTSecret:      getEnv("JWT_SECRET", "default-secret-change-me"),
		JWTExpireHours: getEnvInt("JWT_EXPIRE_HOURS", 72),

		DBHost:     getEnv("POSTGRES_HOST", "localhost"),
		DBPort:     getEnv("POSTGRES_PORT", "5432"),
		DBUser:     getEnv("POSTGRES_USER", "lpbuilder"),
		DBPassword: getEnv("POSTGRES_PASSWORD", "changeme"),
		DBName:     getEnv("POSTGRES_DB", "lpbuilder"),
	}
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

func getEnvInt(key string, fallback int) int {
	if v, ok := os.LookupEnv(key); ok {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}

