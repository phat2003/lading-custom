package main

import (
	"log"

	"github.com/nhienthai/lading-custom/backend/internal/config"
	"github.com/nhienthai/lading-custom/backend/internal/router"
)

func main() {
	// 1. Đọc cấu hình
	cfg := config.Load()

	// 2. Kết nối database
	db := config.ConnectDB(cfg)

	// 3. Khởi tạo router + routes
	r := router.Setup(db, cfg)

	// 4. Chạy server
	addr := ":" + cfg.AppPort
	log.Printf("server đang chạy tại http://localhost%s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("không khởi động được server: %v", err)
	}
}

