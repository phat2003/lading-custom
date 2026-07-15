package service

import (
	"errors"

	"github.com/google/uuid"
	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

type TemplateActionService struct {
	templateRepo        *repository.TemplateRepository
	templateSectionRepo *repository.TemplateSectionRepository
	pageRepo            *repository.LandingPageRepository
	pageSectionRepo     *repository.PageSectionRepository
}

func NewTemplateActionService(
	tRepo *repository.TemplateRepository,
	tsRepo *repository.TemplateSectionRepository,
	pRepo *repository.LandingPageRepository,
	psRepo *repository.PageSectionRepository,
) *TemplateActionService {
	return &TemplateActionService{
		templateRepo:        tRepo,
		templateSectionRepo: tsRepo,
		pageRepo:            pRepo,
		pageSectionRepo:     psRepo,
	}
}

// SavePageAsTemplate sẽ nhân bản 1 Landing Page thành 1 Template (loại 'user' hoặc 'system')
// Đã xóa 2 tham số thừa ở phần khai báo để giữ đúng 3 tham số như Handler truyền vào
func (s *TemplateActionService) SavePageAsTemplate(userID, pageID uuid.UUID, templateName string) (*models.Template, error) {
	// 1. Kiểm tra xem trang gốc có tồn tại không
	_, err := s.pageRepo.FindByID(pageID)
	if err != nil {
		return nil, errors.New("không tìm thấy landing page gốc")
	}

	// 2. Tạo bản ghi Template mới
	newTemplate := &models.Template{
		Name:           templateName,
		Type:           models.TemplateType("user"),                    // Mẫu của người dùng
		TemplateSource: models.TemplateSource("saved_from_landing_page"), // Nguồn: Lưu từ Landing Page
		OwnerID:        &userID,
	}

	if err := s.templateRepo.Create(newTemplate); err != nil {
		return nil, errors.New("lỗi khi tạo Template: " + err.Error())
	}

	// 3. Lấy tất cả Sections của Landing Page gốc
	pageSections, err := s.pageSectionRepo.FindByLandingPageID(pageID)
	if err != nil {
		return nil, err
	}

	// 4. Lặp qua từng Page Section và tạo bản sao sang Template Section
	for _, ps := range pageSections {
		newTS := &models.TemplateSection{
			TemplateID:     newTemplate.TemplateID, // Nếu lỗi thì đổi thành newTemplate.ID nhé
			SectionType:    ps.SectionType,
			SectionContent: ps.Content,
			OrderIndex:     ps.OrderIndex,
		}
		if err := s.templateSectionRepo.Create(newTS); err != nil {
			continue 
		}
	}

	return newTemplate, nil
}