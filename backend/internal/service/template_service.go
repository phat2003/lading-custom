package service

import (
	"github.com/google/uuid"
	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

// TemplateService chứa business logic cho system template.
type TemplateService struct {
	templateRepo *repository.TemplateRepository
}

func NewTemplateService(templateRepo *repository.TemplateRepository) *TemplateService {
	return &TemplateService{templateRepo: templateRepo}
}

// CreateSystemTemplateInput dữ liệu đầu vào tạo system template.
type CreateSystemTemplateInput struct {
	Name string
}

// CreateSystemTemplate tạo template loại system do admin khởi tạo.
func (s *TemplateService) CreateSystemTemplate(in CreateSystemTemplateInput) (*models.Template, error) {
	t := &models.Template{
		Name:           in.Name,
		Type:           models.TemplateSystem,
		OwnerID:        nil, // system template không có owner theo DB constraint
		TemplateSource: models.SourceCreatedByAdmin,
	}
	if err := s.templateRepo.Create(t); err != nil {
		return nil, err
	}
	return t, nil
}

// ListTemplates trả toàn bộ template.
func (s *TemplateService) ListTemplates() ([]models.Template, error) {
	return s.templateRepo.FindAll()
}

// GetTemplate lấy một template theo ID.
func (s *TemplateService) GetTemplate(id uuid.UUID) (*models.Template, error) {
	return s.templateRepo.FindByID(id)
}

// UpdateTemplateInput các trường được phép cập nhật.
type UpdateTemplateInput struct {
	Name string
}

// UpdateTemplate cập nhật tên template.
func (s *TemplateService) UpdateTemplate(id uuid.UUID, in UpdateTemplateInput) (*models.Template, error) {
	t, err := s.templateRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	t.Name = in.Name
	if err := s.templateRepo.Update(t); err != nil {
		return nil, err
	}
	return t, nil
}

// DeleteTemplate xoá template theo ID.
func (s *TemplateService) DeleteTemplate(id uuid.UUID) error {
	return s.templateRepo.Delete(id)
}
