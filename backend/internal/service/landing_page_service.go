package service

import (
	"errors"

	"github.com/google/uuid"
	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

type LandingPageService struct {
	pageRepo    *repository.LandingPageRepository
	projectRepo *repository.ProjectRepository // Cần Repo này để check quyền
}

func NewLandingPageService(pageRepo *repository.LandingPageRepository, projectRepo *repository.ProjectRepository) *LandingPageService {
	return &LandingPageService{
		pageRepo:    pageRepo,
		projectRepo: projectRepo,
	}
}

func (s *LandingPageService) CreatePage(userID, projectID uuid.UUID, name string) (*models.LandingPage, error) {
	// BẢO MẬT: Kiểm tra xem Project này có thuộc về User đang đăng nhập hay không
	_, err := s.projectRepo.FindByIDAndOwnerID(projectID, userID)
	if err != nil {
		return nil, errors.New("dự án không tồn tại hoặc bạn không có quyền truy cập")
	}

	page := &models.LandingPage{
		ProjectID: projectID,
		Name:      name,
		Status:    models.LandingPageStatus("draft"), // Ép kiểu an toàn
	}

	if err := s.pageRepo.Create(page); err != nil {
		return nil, err
	}
	return page, nil
}

func (s *LandingPageService) GetPagesByProject(userID, projectID uuid.UUID) ([]models.LandingPage, error) {
	// BẢO MẬT: Check quyền chủ dự án
	_, err := s.projectRepo.FindByIDAndOwnerID(projectID, userID)
	if err != nil {
		return nil, errors.New("bạn không có quyền xem dự án này")
	}
	return s.pageRepo.FindByProjectID(projectID)
}

func (s *LandingPageService) GetPageByID(userID, pageID uuid.UUID) (*models.LandingPage, error) {
	page, err := s.pageRepo.FindByID(pageID)
	if err != nil {
		return nil, errors.New("không tìm thấy trang")
	}

	// BẢO MẬT: Check xem User có phải chủ của Project chứa Page này không
	_, err = s.projectRepo.FindByIDAndOwnerID(page.ProjectID, userID)
	if err != nil {
		return nil, errors.New("bạn không có quyền truy cập trang này")
	}

	return page, nil
}

func (s *LandingPageService) UpdatePage(userID, pageID uuid.UUID, name, status string) (*models.LandingPage, error) {
	// Tận dụng hàm GetPageByID (đã có sẵn check bảo mật ở trên)
	page, err := s.GetPageByID(userID, pageID)
	if err != nil {
		return nil, err
	}

	if name != "" {
		page.Name = name
	}
	if status != "" {
		// Ép kiểu từ string sang models.LandingPageStatus
		page.Status = models.LandingPageStatus(status)
	}

	if err := s.pageRepo.Update(page); err != nil {
		return nil, err
	}
	return page, nil
}

func (s *LandingPageService) DeletePage(userID, pageID uuid.UUID) error {
	page, err := s.GetPageByID(userID, pageID)
	if err != nil {
		return err
	}
	return s.pageRepo.Delete(page)
}