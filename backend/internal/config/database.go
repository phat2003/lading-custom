package config

import (
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// ConnectDB mở kết nối tới PostgreSQL qua GORM và trả về *gorm.DB.
func ConnectDB(cfg *Config) *gorm.DB {
	gormLogLevel := logger.Silent
	if cfg.AppEnv == "development" {
		gormLogLevel = logger.Info
	}

	db, err := gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(gormLogLevel),
	})
	if err != nil {
		log.Fatalf("không kết nối được database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("không lấy được sql.DB: %v", err)
	}

	// Cấu hình connection pool
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	log.Println("kết nối database thành công")
	return db
}
