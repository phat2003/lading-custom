package service

import (
	"errors"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

type TemplateActionService struct {
	templateRepo    *repository.TemplateRepository
	pageRepo        *repository.LandingPageRepository
	pageSectionRepo *repository.PageSectionRepository
	projectRepo     *repository.ProjectRepository
}

func NewTemplateActionService(
	tRepo *repository.TemplateRepository,
	pRepo *repository.LandingPageRepository,
	psRepo *repository.PageSectionRepository,
	projRepo *repository.ProjectRepository,
) *TemplateActionService {
	return &TemplateActionService{
		templateRepo:    tRepo,
		pageRepo:        pRepo,
		pageSectionRepo: psRepo,
		projectRepo:     projRepo,
	}
}

// SavePageAsTemplate sẽ nhân bản 1 Landing Page thành 1 Template (loại 'user' hoặc 'system')
// Đã xóa 2 tham số thừa ở phần khai báo để giữ đúng 3 tham số như Handler truyền vào
func (s *TemplateActionService) SavePageAsTemplate(userID, pageID uuid.UUID, templateName string) (*models.Template, error) {
	// 1. BẢO MẬT: Kiểm tra trang gốc có tồn tại VÀ có thuộc về user này không.
	// Không được chỉ FindByID: nếu bỏ qua bước check chủ sở hữu thì bất kỳ user nào
	// cũng copy được toàn bộ nội dung trang của người khác thành template của mình.
	page, err := s.pageRepo.FindByID(pageID)
	if err != nil {
		return nil, fmt.Errorf("không tìm thấy landing page gốc: %w", gorm.ErrRecordNotFound)
	}
	if _, err := s.projectRepo.FindByIDAndOwnerID(page.ProjectID, userID); err != nil {
		return nil, fmt.Errorf("không được lưu trang của người khác: %w", repository.ErrForbidden)
	}

	// 2. Tạo bản ghi Template mới
	newTemplate := &models.Template{
		Name:           templateName,
		Type:           models.TemplateUser,               // Mẫu của người dùng
		TemplateSource: models.SourceSavedFromLandingPage, // Nguồn: Lưu từ Landing Page
		OwnerID:        &userID,
	}

	// 3. Lấy tất cả Sections của Landing Page gốc
	pageSections, err := s.pageSectionRepo.FindByLandingPageID(pageID)
	if err != nil {
		return nil, err
	}

	// 4. Dựng danh sách TemplateSection tương ứng (TemplateID do repo gán trong tx)
	templateSections := make([]models.TemplateSection, 0, len(pageSections))
	for _, ps := range pageSections {
		templateSections = append(templateSections, models.TemplateSection{
			SectionType:    ps.SectionType,
			SectionContent: ps.Content,
			OrderIndex:     ps.OrderIndex,
		})
	}

	// 5. Ghi template + toàn bộ section trong 1 transaction.
	// Trước đây lỗi copy section bị `continue` bỏ qua -> template lưu thiếu khối
	// nhưng API vẫn trả 201. Giờ hỏng 1 khối là rollback sạch và báo lỗi.
	if err := s.templateRepo.CreateWithSections(newTemplate, templateSections); err != nil {
		return nil, errors.New("lỗi khi tạo Template: " + err.Error())
	}

	return newTemplate, nil
}

// CreatePageFromTemplate tạo một Landing Page mới từ 1 Template có sẵn
func (s *TemplateActionService) CreatePageFromTemplate(userID, projectID, templateID uuid.UUID, pageName string) (*models.LandingPage, error) {
	// 1. Kiểm tra dự án (Project) có thuộc về User này không
	_, err := s.projectRepo.FindByIDAndOwnerID(projectID, userID)
	if err != nil {
		return nil, fmt.Errorf("dự án không tồn tại hoặc không thuộc về bạn: %w", repository.ErrForbidden)
	}

	// 2. Lấy Template (Nhờ Preload nên đã có sẵn danh sách các khối bên trong)
	template, err := s.templateRepo.FindByID(templateID)
	if err != nil {
		return nil, fmt.Errorf("không tìm thấy mẫu giao diện: %w", gorm.ErrRecordNotFound)
	}

	// BẢO MẬT: Chỉ được clone mẫu hệ thống (dùng chung) hoặc mẫu do chính mình sở hữu.
	// Mẫu 'user' của người khác là riêng tư — không cho clone.
	isSystem := template.Type == models.TemplateSystem
	isOwner := template.OwnerID != nil && *template.OwnerID == userID
	if !isSystem && !isOwner {
		return nil, fmt.Errorf("mẫu giao diện này là riêng tư: %w", repository.ErrForbidden)
	}

	// 3. Dựng trang mới + các section copy từ template
	// (LandingPageID của section do repo gán trong tx)
	newPage := &models.LandingPage{
		ProjectID: projectID,
		Name:      pageName,
		Status:    models.StatusDraft, // Trạng thái nháp
	}

	newSections := make([]models.PageSection, 0, len(template.Sections))
	for _, ts := range template.Sections {
		newSections = append(newSections, models.PageSection{
			SectionType: ts.SectionType,
			Content:     ts.SectionContent, // Bê nguyên JSON Content về lại
			OrderIndex:  ts.OrderIndex,
			IsVisible:   true,
		})
	}

	// 4. Ghi trang + toàn bộ section trong 1 transaction.
	// Trước đây lỗi copy section bị bỏ qua hoàn toàn -> trang clone thiếu khối
	// nhưng API vẫn trả 201. Giờ hỏng 1 khối là rollback sạch và báo lỗi.
	if err := s.pageRepo.CreateWithSections(newPage, newSections); err != nil {
		return nil, errors.New("không thể tạo trang đích mới: " + err.Error())
	}

	return newPage, nil
}
