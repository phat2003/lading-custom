package repository

import (
	"github.com/google/uuid"
	"github.com/nhienthai/lading-custom/backend/internal/models"
	"gorm.io/gorm"
)

type ProjectRepository struct {
	db *gorm.DB
}

func NewProjectRepository(db *gorm.DB) *ProjectRepository {
	return &ProjectRepository{db: db}
}

// Create: Thêm dự án mới
func (r *ProjectRepository) Create(project *models.Project) error {
	return r.db.Create(project).Error
}

// FindAllByOwnerID: Lấy tất cả dự án của một User
func (r *ProjectRepository) FindAllByOwnerID(ownerID uuid.UUID) ([]models.Project, error) {
	var projects []models.Project
	err := r.db.Where("owner_id = ?", ownerID).Order("created_at desc").Find(&projects).Error
	return projects, err
}

// FindByIDAndOwnerID: Lấy 1 dự án cụ thể (phải đúng chủ sở hữu mới lấy được)
func (r *ProjectRepository) FindByIDAndOwnerID(id, ownerID uuid.UUID) (*models.Project, error) {
	var project models.Project
	err := r.db.Where("project_id = ? AND owner_id = ?", id, ownerID).First(&project).Error
	if err != nil {
		return nil, err
	}
	return &project, nil
}

// Update: Cập nhật thông tin dự án
func (r *ProjectRepository) Update(project *models.Project) error {
	return r.db.Save(project).Error
}

// Delete: Xóa dự án
func (r *ProjectRepository) Delete(project *models.Project) error {
	return r.db.Delete(project).Error
}