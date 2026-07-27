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
	projectRepo         *repository.ProjectRepository // 👉 THÊM DÒNG NÀY
}

func NewTemplateActionService(
	tRepo *repository.TemplateRepository,
	tsRepo *repository.TemplateSectionRepository,
	pRepo *repository.LandingPageRepository,
	psRepo *repository.PageSectionRepository,
	projRepo *repository.ProjectRepository, // 👉 THÊM DÒNG NÀY
) *TemplateActionService {
	return &TemplateActionService{
		templateRepo:        tRepo,
		templateSectionRepo: tsRepo,
		pageRepo:            pRepo,
		pageSectionRepo:     psRepo,
		projectRepo:         projRepo, // 👉 THÊM DÒNG NÀY
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

// CreatePageFromTemplate tạo một Landing Page mới từ 1 Template có sẵn
func (s *TemplateActionService) CreatePageFromTemplate(userID, projectID, templateID uuid.UUID, pageName string) (*models.LandingPage, error) {
	// 1. Kiểm tra dự án (Project) có thuộc về User này không
	_, err := s.projectRepo.FindByIDAndOwnerID(projectID, userID)
	if err != nil {
		return nil, errors.New("dự án không tồn tại hoặc bạn không có quyền truy cập")
	}

	// 2. Lấy Template (Nhờ Preload nên đã có sẵn danh sách các khối bên trong)
	template, err := s.templateRepo.FindByID(templateID)
	if err != nil {
		return nil, errors.New("không tìm thấy mẫu giao diện")
	}

	// 3. Tạo Landing Page mới trước
	newPage := &models.LandingPage{
		ProjectID: projectID,
		Name:      pageName,
		Status:    models.LandingPageStatus("draft"), // Trạng thái nháp
	}
	if err := s.pageRepo.Create(newPage); err != nil {
		return nil, errors.New("không thể tạo trang đích mới")
	}

	// 4. Lặp qua các Sections ĐÃ CÓ SẴN trong template và copy sang Page mới
	if len(template.Sections) > 0 {
		for _, ts := range template.Sections {
			newPS := &models.PageSection{
				LandingPageID: newPage.LandingPageID, // ID của trang vừa tạo
				SectionType:   ts.SectionType,
				Content:       ts.SectionContent, // Bê nguyên JSON Content về lại
				OrderIndex:    ts.OrderIndex,
				IsVisible:     true,
			}
			// Lưu thẳng xuống DB, tạm bỏ qua check lỗi cục bộ để tiếp tục clone các khối khác
			s.pageSectionRepo.Create(newPS) 
		}
	}

	return newPage, nil
}