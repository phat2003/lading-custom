package service

import (
	"github.com/google/uuid"
	"gorm.io/datatypes"

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

// TemplateSectionInput là một khối nội dung do builder gửi lên.
// OrderIndex KHÔNG nhận từ client: thứ tự lấy theo vị trí trong mảng, tránh
// trường hợp client gửi trùng số hoặc thiếu số làm khối hiển thị sai chỗ.
type TemplateSectionInput struct {
	SectionType             string
	SectionContent          datatypes.JSON
	SourceSectionTemplateID *uuid.UUID
}

// toTemplateSections đổi input của builder thành model, gán OrderIndex theo vị trí.
// TemplateID để trống — repository gán bên trong transaction sau khi template có ID.
func toTemplateSections(in []TemplateSectionInput) []models.TemplateSection {
	sections := make([]models.TemplateSection, 0, len(in))
	for i, s := range in {
		sections = append(sections, models.TemplateSection{
			SectionType:             s.SectionType,
			SectionContent:          s.SectionContent,
			OrderIndex:              i,
			SourceSectionTemplateID: s.SourceSectionTemplateID,
		})
	}
	return sections
}

// CreateSystemTemplateInput dữ liệu đầu vào tạo system template.
// Các trường metadata để rỗng thì dùng mặc định của DB (status=draft, tier=free).
type CreateSystemTemplateInput struct {
	Name         string
	Category     string
	Status       models.TemplateStatus
	Tier         models.TemplateTier
	ThumbnailURL string

	// Sections có thể rỗng: admin được phép tạo vỏ template trước rồi dựng
	// nội dung sau bằng ReplaceTemplateSections.
	Sections []TemplateSectionInput
}

// CreateSystemTemplate tạo template loại system do admin khởi tạo.
func (s *TemplateService) CreateSystemTemplate(in CreateSystemTemplateInput) (*models.Template, error) {
	status := in.Status
	if status == "" {
		status = models.TemplateStatusDraft // template mới luôn là bản nháp cho tới khi admin publish
	}
	tier := in.Tier
	if tier == "" {
		tier = models.TierFree
	}

	t := &models.Template{
		Name:           in.Name,
		Type:           models.TemplateSystem,
		OwnerID:        nil, // system template không có owner theo DB constraint
		TemplateSource: models.SourceCreatedByAdmin,
		Category:       in.Category,
		Status:         status,
		Tier:           tier,
		ThumbnailURL:   in.ThumbnailURL,
	}
	// Luôn đi qua CreateWithSections, kể cả khi chưa có khối nào: template và
	// section phải vào DB cùng một transaction. Trước đây chỗ này gọi Create()
	// nên chỉ lưu metadata — admin dựng xong mẫu mà user clone về vẫn nhận
	// trang trắng vì không khối nào được ghi.
	sections := toTemplateSections(in.Sections)
	if err := s.templateRepo.CreateWithSections(t, sections); err != nil {
		return nil, err
	}
	t.Sections = sections
	t.SectionCount = int64(len(sections))
	return t, nil
}

// ReplaceTemplateSections ghi đè toàn bộ nội dung của một template.
// Dùng cho nút "Xuất bản" của builder: mỗi lần bấm là chốt lại trạng thái hiện tại.
func (s *TemplateService) ReplaceTemplateSections(id uuid.UUID, in []TemplateSectionInput) (*models.Template, error) {
	sections := toTemplateSections(in)
	if err := s.templateRepo.ReplaceSections(id, sections); err != nil {
		return nil, err
	}
	return s.GetTemplate(id)
}

// ListTemplatesInput điều kiện lọc + phân trang từ query string.
type ListTemplatesInput struct {
	Search   string
	Category string
	Status   string
	Tier     string
	Page     int
	Limit    int

	// VisibleToUserID: chỉ trả mẫu user này được phép dùng (system đã publish
	// hoặc mẫu của chính họ). Nil = xem tất cả, chỉ dành cho admin.
	VisibleToUserID *uuid.UUID
}

// ListTemplates trả một trang template kèm tổng số bản ghi khớp bộ lọc.
// Mỗi template được gán sẵn SectionCount để FE hiển thị "6 sections".
func (s *TemplateService) ListTemplates(in ListTemplatesInput) ([]models.Template, int64, error) {
	templates, total, err := s.templateRepo.FindPaged(repository.TemplateFilter{
		Search:   in.Search,
		Category: in.Category,
		Status:   in.Status,
		Tier:     in.Tier,
		Page:     in.Page,
		Limit:    in.Limit,

		VisibleToUserID: in.VisibleToUserID,
	})
	if err != nil {
		return nil, 0, err
	}

	ids := make([]uuid.UUID, 0, len(templates))
	for _, t := range templates {
		ids = append(ids, t.TemplateID)
	}
	counts, err := s.templateRepo.CountSectionsByTemplateIDs(ids)
	if err != nil {
		return nil, 0, err
	}
	for i := range templates {
		templates[i].SectionCount = counts[templates[i].TemplateID] // không có key -> 0
	}

	return templates, total, nil
}

// GetTemplate lấy một template theo ID (kèm sections).
func (s *TemplateService) GetTemplate(id uuid.UUID) (*models.Template, error) {
	t, err := s.templateRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	// Sections đã được preload nên đếm tại chỗ, khỏi truy vấn thêm.
	t.SectionCount = int64(len(t.Sections))
	return t, nil
}

// UpdateTemplateInput các trường được phép cập nhật.
// Dùng con trỏ cho metadata: nil = client không gửi field đó -> giữ nguyên giá trị cũ.
type UpdateTemplateInput struct {
	Name         string
	Category     *string
	Status       *models.TemplateStatus
	Tier         *models.TemplateTier
	ThumbnailURL *string
}

// UpdateTemplate cập nhật tên và metadata của template.
func (s *TemplateService) UpdateTemplate(id uuid.UUID, in UpdateTemplateInput) (*models.Template, error) {
	t, err := s.templateRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	t.Name = in.Name
	if in.Category != nil {
		t.Category = *in.Category
	}
	if in.Status != nil {
		t.Status = *in.Status
	}
	if in.Tier != nil {
		t.Tier = *in.Tier
	}
	if in.ThumbnailURL != nil {
		t.ThumbnailURL = *in.ThumbnailURL
	}

	if err := s.templateRepo.Update(t); err != nil {
		return nil, err
	}
	t.SectionCount = int64(len(t.Sections))
	return t, nil
}

// DeleteTemplate xoá template theo ID.
func (s *TemplateService) DeleteTemplate(id uuid.UUID) error {
	return s.templateRepo.Delete(id)
}
