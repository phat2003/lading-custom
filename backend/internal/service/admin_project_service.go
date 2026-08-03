package service

import (
	"time"

	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

// ProjectOwner là thông tin rút gọn của chủ sở hữu dự án.
type ProjectOwner struct {
	UserID   uuid.UUID `json:"user_id"`
	FullName string    `json:"full_name"`
	Email    string    `json:"email"`
}

// AdminProject là 1 dòng của bảng Projects toàn hệ thống.
// Ghép từ project + app_user + landing_page + template.
type AdminProject struct {
	ProjectID    uuid.UUID                `json:"project_id"`
	Name         string                   `json:"name"`
	Owner        ProjectOwner             `json:"owner"`
	TemplateName string                   `json:"template_name"`
	Status       models.LandingPageStatus `json:"status"`
	PageCount    int64                    `json:"page_count"`
	PublishedURL string                   `json:"published_url"`
	CreatedAt    time.Time                `json:"created_at"`
	UpdatedAt    time.Time                `json:"updated_at"`
}

// AdminProjectService chứa business logic cho trang admin Projects
// (xem dự án của MỌI user, khác ProjectService chỉ thao tác dự án của chính mình).
type AdminProjectService struct {
	projectRepo *repository.ProjectRepository
}

func NewAdminProjectService(projectRepo *repository.ProjectRepository) *AdminProjectService {
	return &AdminProjectService{projectRepo: projectRepo}
}

// ListProjectsInput điều kiện lọc + phân trang từ query string.
type ListProjectsInput struct {
	Search string
	Status string
	Page   int
	Limit  int
}

// ListProjects trả một trang dự án toàn hệ thống kèm tổng số bản ghi.
// Tên template và slug công khai được lấy gộp theo lô (2 truy vấn phụ)
// thay vì hỏi từng dự án một.
func (s *AdminProjectService) ListProjects(in ListProjectsInput) ([]AdminProject, int64, error) {
	rows, total, err := s.projectRepo.FindPagedForAdmin(repository.AdminProjectFilter{
		Search: in.Search,
		Status: in.Status,
		Page:   in.Page,
		Limit:  in.Limit,
	})
	if err != nil {
		return nil, 0, err
	}

	ids := make([]uuid.UUID, 0, len(rows))
	for _, r := range rows {
		ids = append(ids, r.ProjectID)
	}

	templateNames, err := s.projectRepo.FindTemplateNamesByProjectIDs(ids)
	if err != nil {
		return nil, 0, err
	}
	publishedURLs, err := s.projectRepo.FindPublishedURLsByProjectIDs(ids)
	if err != nil {
		return nil, 0, err
	}

	projects := make([]AdminProject, 0, len(rows))
	for _, r := range rows {
		// Bảng project không có cột status — suy từ landing page con:
		// có ít nhất 1 trang đã publish thì cả dự án coi là published.
		status := models.StatusDraft
		if r.HasPublished {
			status = models.StatusPublished
		}

		projects = append(projects, AdminProject{
			ProjectID: r.ProjectID,
			Name:      r.Name,
			Owner: ProjectOwner{
				UserID:   r.OwnerID,
				FullName: r.OwnerName,
				Email:    r.OwnerEmail,
			},
			TemplateName: templateNames[r.ProjectID], // "" nếu mọi trang đều tạo từ Blank
			Status:       status,
			PageCount:    r.PageCount,
			PublishedURL: publishedURLs[r.ProjectID], // "" nếu chưa publish trang nào
			CreatedAt:    r.CreatedAt,
			UpdatedAt:    r.UpdatedAt,
		})
	}

	return projects, total, nil
}

// DeleteProject xoá cứng 1 dự án bất kỳ (không giới hạn chủ sở hữu).
//
// CẢNH BÁO: CASCADE kéo theo toàn bộ landing page -> page section ->
// published snapshot của dự án. Trang đã publish sẽ chết link ngay lập tức.
func (s *AdminProjectService) DeleteProject(id uuid.UUID) error {
	return s.projectRepo.DeleteByID(id)
}
