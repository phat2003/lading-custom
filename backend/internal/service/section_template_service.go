package service

import (
	
	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
	"gorm.io/datatypes"
)

type SectionTemplateService struct {
	templateRepo *repository.SectionTemplateRepository
}

func NewSectionTemplateService(templateRepo *repository.SectionTemplateRepository) *SectionTemplateService {
	return &SectionTemplateService{templateRepo: templateRepo}
}

func (s *SectionTemplateService) CreateTemplate(sectionType, displayName string, content datatypes.JSON, thumbnailUrl string) (*models.SectionTemplateLibrary, error) {
	template := &models.SectionTemplateLibrary{
		SectionType:    sectionType,
		DisplayName:    displayName,
		DefaultContent: content,
		ThumbnailURL:   thumbnailUrl,
	}

	if err := s.templateRepo.Create(template); err != nil {
		return nil, err
	}
	return template, nil
}

func (s *SectionTemplateService) GetAllTemplates(sectionType string) ([]models.SectionTemplateLibrary, error) {
	return s.templateRepo.GetAll(sectionType)
}