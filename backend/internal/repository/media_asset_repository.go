package repository

import (
	"github.com/google/uuid"
	"github.com/nhienthai/lading-custom/backend/internal/models"
	"gorm.io/gorm"
)

type MediaAssetRepository struct {
	db *gorm.DB
}

func NewMediaAssetRepository(db *gorm.DB) *MediaAssetRepository {
	return &MediaAssetRepository{db: db}
}

// Lưu thông tin file vào Database
func (r *MediaAssetRepository) Create(asset *models.MediaAsset) error {
	return r.db.Create(asset).Error
}

// Lấy danh sách toàn bộ ảnh mà user đã tải lên (Thư viện ảnh)
func (r *MediaAssetRepository) FindByOwnerID(ownerID uuid.UUID) ([]models.MediaAsset, error) {
	var assets []models.MediaAsset
	err := r.db.Where("owner_id = ?", ownerID).Order("created_at desc").Find(&assets).Error
	return assets, err
}