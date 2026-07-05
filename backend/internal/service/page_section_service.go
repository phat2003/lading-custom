package service

import (
	"errors"

	"github.com/google/uuid"
	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
	"gorm.io/datatypes"
)

type PageSectionService struct {
	sectionRepo *repository.PageSectionRepository
	pageService *LandingPageService // Bơm LandingPageService vào để tái sử dụng logic check quyền
}

func NewPageSectionService(sectionRepo *repository.PageSectionRepository, pageService *LandingPageService) *PageSectionService {
	return &PageSectionService{
		sectionRepo: sectionRepo,
		pageService: pageService,
	}
}

func (s *PageSectionService) CreateSection(userID, pageID uuid.UUID, sectionType string, orderIndex int, content datatypes.JSON) (*models.PageSection, error) {
	// BẢO MẬT: Kiểm tra xem User có quyền truy cập vào Landing Page này không
	_, err := s.pageService.GetPageByID(userID, pageID)
	if err != nil {
		return nil, errors.New("bạn không có quyền thao tác trên trang này")
	}

	section := &models.PageSection{
		LandingPageID: pageID,
		SectionType:   sectionType,
		Content:       content,
		OrderIndex:    orderIndex,
		IsVisible:     true,
	}

	if err := s.sectionRepo.Create(section); err != nil {
		return nil, err
	}
	return section, nil
}

func (s *PageSectionService) GetSectionsByPage(userID, pageID uuid.UUID) ([]models.PageSection, error) {
	_, err := s.pageService.GetPageByID(userID, pageID)
	if err != nil {
		return nil, errors.New("bạn không có quyền truy cập trang này")
	}
	return s.sectionRepo.FindByLandingPageID(pageID)
}

func (s *PageSectionService) UpdateSection(userID, sectionID uuid.UUID, content datatypes.JSON, orderIndex *int, isVisible *bool) (*models.PageSection, error) {
	section, err := s.sectionRepo.FindByID(sectionID)
	if err != nil {
		return nil, errors.New("không tìm thấy section")
	}

	// BẢO MẬT: Kiểm tra quyền dựa trên LandingPageID của section
	_, err = s.pageService.GetPageByID(userID, section.LandingPageID)
	if err != nil {
		return nil, errors.New("bạn không có quyền chỉnh sửa section này")
	}

	if content != nil {
		section.Content = content
	}
	if orderIndex != nil {
		section.OrderIndex = *orderIndex
	}
	if isVisible != nil {
		section.IsVisible = *isVisible
	}

	if err := s.sectionRepo.Update(section); err != nil {
		return nil, err
	}
	return section, nil
}

func (s *PageSectionService) DeleteSection(userID, sectionID uuid.UUID) error {
	section, err := s.sectionRepo.FindByID(sectionID)
	if err != nil {
		return errors.New("không tìm thấy section")
	}

	_, err = s.pageService.GetPageByID(userID, section.LandingPageID)
	if err != nil {
		return errors.New("bạn không có quyền xóa section này")
	}

	return s.sectionRepo.Delete(section)
}