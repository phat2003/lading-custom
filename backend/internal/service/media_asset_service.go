package service

import (
	"github.com/google/uuid"
	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

type MediaAssetService struct {
	assetRepo *repository.MediaAssetRepository
}

func NewMediaAssetService(assetRepo *repository.MediaAssetRepository) *MediaAssetService {
	return &MediaAssetService{assetRepo: assetRepo}
}

// Lưu thông tin bản ghi vào DB
func (s *MediaAssetService) SaveAssetRecord(userID uuid.UUID, fileUrl, fileType string, fileSize int64) (*models.MediaAsset, error) {
	asset := &models.MediaAsset{
		OwnerID:  userID,
		FileURL:  fileUrl,
		FileType: fileType,
		FileSize: fileSize,
	}
	if err := s.assetRepo.Create(asset); err != nil {
		return nil, err
	}
	return asset, nil
}

// Lấy danh sách ảnh của User
func (s *MediaAssetService) GetUserAssets(userID uuid.UUID) ([]models.MediaAsset, error) {
	return s.assetRepo.FindByOwnerID(userID)
}