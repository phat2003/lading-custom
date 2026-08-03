package service

import (
	"github.com/google/uuid"
	"gorm.io/datatypes"

	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

type SectionTemplateService struct {
	templateRepo *repository.SectionTemplateRepository
}

func NewSectionTemplateService(templateRepo *repository.SectionTemplateRepository) *SectionTemplateService {
	return &SectionTemplateService{templateRepo: templateRepo}
}

// CreateTemplate thêm mẫu section mới vào thư viện.
// createdBy là admin thao tác (cột audit created_by); nil nếu không xác định được.
func (s *SectionTemplateService) CreateTemplate(
	sectionType, displayName string,
	content datatypes.JSON,
	thumbnailUrl string,
	createdBy *uuid.UUID,
) (*models.SectionTemplateLibrary, error) {
	template := &models.SectionTemplateLibrary{
		SectionType:    sectionType,
		DisplayName:    displayName,
		DefaultContent: content,
		ThumbnailURL:   thumbnailUrl,
		CreatedBy:      createdBy,
	}

	if err := s.templateRepo.Create(template); err != nil {
		return nil, err
	}
	return template, nil
}

// GetAllTemplates trả toàn bộ thư viện (không phân trang) — dùng cho panel
// section cạnh editor, nơi user cần kéo thả nên phải thấy hết một lượt.
func (s *SectionTemplateService) GetAllTemplates(sectionType string) ([]models.SectionTemplateLibrary, error) {
	return s.templateRepo.GetAll(sectionType)
}

// ListSectionTemplatesInput điều kiện lọc + phân trang cho trang admin Sections.
type ListSectionTemplatesInput struct {
	Search      string
	SectionType string
	Page        int
	Limit       int
}

// ListTemplates trả một trang section mẫu kèm tổng số bản ghi khớp bộ lọc.
// Mỗi mẫu được gán sẵn UsedIn để FE hiển thị "Dùng trong 14 template".
func (s *SectionTemplateService) ListTemplates(in ListSectionTemplatesInput) ([]models.SectionTemplateLibrary, int64, error) {
	templates, total, err := s.templateRepo.FindPaged(repository.SectionTemplateFilter{
		Search:      in.Search,
		SectionType: in.SectionType,
		Page:        in.Page,
		Limit:       in.Limit,
	})
	if err != nil {
		return nil, 0, err
	}

	ids := make([]uuid.UUID, 0, len(templates))
	for _, t := range templates {
		ids = append(ids, t.SectionTemplateID)
	}
	counts, err := s.templateRepo.CountUsageByIDs(ids)
	if err != nil {
		return nil, 0, err
	}
	for i := range templates {
		templates[i].UsedIn = counts[templates[i].SectionTemplateID] // không có key -> 0
	}

	return templates, total, nil
}

// GetTemplate lấy 1 mẫu theo ID, kèm số template đang dùng nó.
func (s *SectionTemplateService) GetTemplate(id uuid.UUID) (*models.SectionTemplateLibrary, error) {
	t, err := s.templateRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	counts, err := s.templateRepo.CountUsageByIDs([]uuid.UUID{id})
	if err != nil {
		return nil, err
	}
	t.UsedIn = counts[id]
	return t, nil
}

// UpdateSectionTemplateInput các trường được phép sửa.
// Con trỏ = nil nghĩa là client không gửi field đó -> giữ nguyên giá trị cũ.
type UpdateSectionTemplateInput struct {
	SectionType    *string
	DisplayName    *string
	DefaultContent *datatypes.JSON
	ThumbnailURL   *string
}

// UpdateTemplate cập nhật 1 mẫu section trong thư viện.
//
// LƯU Ý: sửa mẫu KHÔNG ảnh hưởng tới template/landing page đã seed từ nó.
// default_content chỉ được sao chép tại thời điểm kéo section vào trang,
// nên nội dung khách hàng đang dùng vẫn giữ nguyên như cũ.
func (s *SectionTemplateService) UpdateTemplate(id uuid.UUID, in UpdateSectionTemplateInput) (*models.SectionTemplateLibrary, error) {
	t, err := s.templateRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if in.SectionType != nil {
		t.SectionType = *in.SectionType
	}
	if in.DisplayName != nil {
		t.DisplayName = *in.DisplayName
	}
	if in.DefaultContent != nil {
		t.DefaultContent = *in.DefaultContent
	}
	if in.ThumbnailURL != nil {
		t.ThumbnailURL = *in.ThumbnailURL
	}

	if err := s.templateRepo.Update(t); err != nil {
		return nil, err
	}
	return t, nil
}

// DeleteTemplate xoá 1 mẫu khỏi thư viện.
func (s *SectionTemplateService) DeleteTemplate(id uuid.UUID) error {
	return s.templateRepo.Delete(id)
}
