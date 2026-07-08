package repository

import (
	
	"github.com/nhienthai/lading-custom/backend/internal/models"
	"gorm.io/gorm"
)

type SnapshotRepository struct {
	db *gorm.DB
}

func NewSnapshotRepository(db *gorm.DB) *SnapshotRepository {
	return &SnapshotRepository{db: db}
}

// Lưu một bản Snapshot mới khi Publish
func (r *SnapshotRepository) Create(snapshot *models.PublishedSnapshot) error {
	return r.db.Create(snapshot).Error
}

// Lấy thông tin Snapshot public dựa vào URL
func (r *SnapshotRepository) FindByPublicURL(url string) (*models.PublishedSnapshot, error) {
	var snapshot models.PublishedSnapshot
	err := r.db.Where("published_url = ?", url).First(&snapshot).Error
	if err != nil {
		return nil, err
	}
	return &snapshot, nil
}