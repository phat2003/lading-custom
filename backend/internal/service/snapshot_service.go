package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
	"gorm.io/datatypes"
)

type SnapshotService struct {
	snapshotRepo *repository.SnapshotRepository
	pageService  *LandingPageService
	sectionRepo  *repository.PageSectionRepository
}

func NewSnapshotService(snapshotRepo *repository.SnapshotRepository, pageService *LandingPageService, sectionRepo *repository.PageSectionRepository) *SnapshotService {
	return &SnapshotService{
		snapshotRepo: snapshotRepo,
		pageService:  pageService,
		sectionRepo:  sectionRepo,
	}
}

// Hàm Publish đóng gói toàn bộ trang thành 1 Snapshot
func (s *SnapshotService) PublishPage(userID, pageID uuid.UUID) (*models.PublishedSnapshot, error) {
	// 1. Kiểm tra quyền và lấy thông tin Page
	page, err := s.pageService.GetPageByID(userID, pageID)
	if err != nil {
		return nil, errors.New("bạn không có quyền xuất bản trang này")
	}

	// 2. Lấy tất cả Sections của Page này
	sections, err := s.sectionRepo.FindByLandingPageID(pageID)
	if err != nil {
		return nil, errors.New("lỗi khi lấy dữ liệu các khối giao diện")
	}

	// 3. Đóng gói Page và Sections thành 1 map JSON
	snapshotData := map[string]interface{}{
		"page_info": map[string]interface{}{
			"name":       page.Name,
			"project_id": page.ProjectID,
		},
		"sections": sections,
	}

	// Chuyển đổi map thành bytes JSON
	jsonBytes, err := json.Marshal(snapshotData)
	if err != nil {
		return nil, errors.New("lỗi khi đóng gói dữ liệu Snapshot")
	}

	// 4. Tạo URL public độc nhất (Dùng UUID thu gọn)
	publicURL := fmt.Sprintf("%s-%d", uuid.New().String()[:8], time.Now().Unix())

	// 5. Lưu vào Database
	snapshot := &models.PublishedSnapshot{
		LandingPageID:   pageID,
		PublishedURL:    publicURL,
		PublishedBy:     &userID,
		SnapshotContent: datatypes.JSON(jsonBytes),
	}

	if err := s.snapshotRepo.Create(snapshot); err != nil {
		return nil, errors.New("không thể lưu bản Snapshot")
	}

	// 6. Cập nhật trạng thái của Page thành "published"
	_, _ = s.pageService.UpdatePage(userID, pageID, "", "published")

	return snapshot, nil
}

// Hàm lấy dữ liệu Public cho người xem (Không cần check UserID)
func (s *SnapshotService) GetPublicSnapshot(publicURL string) (*models.PublishedSnapshot, error) {
	return s.snapshotRepo.FindByPublicURL(publicURL)
}