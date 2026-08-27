package service

import (
	"encoding/json"
	"errors"
	"net/url"
	"strings"

	"github.com/google/uuid"
	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

var ErrInvalidSEOURL = errors.New("ảnh chia sẻ hoặc favicon phải là URL http(s) hoặc đường dẫn /uploads hợp lệ")

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

// Quy ước trả lỗi của service này:
//
// Mọi trường hợp "không tồn tại" và "tồn tại nhưng của người khác" đều trả về
// repository.ErrNotFound kèm CÙNG một thông điệp trung lập. Cố ý không phân
// biệt: nếu trả 403 "bạn không có quyền" thì chính câu đó xác nhận rằng ID vừa
// dò là có thật và đang thuộc về người khác — kẻ tấn công quét ID sẽ dựng được
// danh sách trang tồn tại trong hệ thống.
//
// Lỗi mang sentinel bên trong để handler dùng errors.Is() map ra HTTP status,
// thay vì đọc chuỗi lỗi như trước.
var (
	errPageNotFound    = "không tìm thấy trang"
	errProjectNotFound = "không tìm thấy dự án"
)

// publicError tách THÔNG ĐIỆP hiển thị cho người dùng khỏi LỖI dùng để phân loại.
//
// Nếu bọc bằng fmt.Errorf("%s: %w", msg, sentinel) thì Error() sẽ nối cả chuỗi
// của sentinel vào, và client nhận được "không tìm thấy trang: không tìm thấy
// bản ghi" — lộ từ vựng nội bộ của tầng repository ra ngoài API.
// errors.Is() vẫn hoạt động bình thường nhờ Unwrap().
type publicError struct {
	msg string
	err error
}

func (e *publicError) Error() string { return e.msg }
func (e *publicError) Unwrap() error { return e.err }

func notFound(msg string) error {
	return &publicError{msg: msg, err: repository.ErrNotFound}
}

func (s *LandingPageService) CreatePage(userID, projectID uuid.UUID, name string) (*models.LandingPage, error) {
	// BẢO MẬT: Kiểm tra xem Project này có thuộc về User đang đăng nhập hay không
	_, err := s.projectRepo.FindByIDAndOwnerID(projectID, userID)
	if err != nil {
		return nil, notFound(errProjectNotFound)
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
		return nil, notFound(errProjectNotFound)
	}
	return s.pageRepo.FindByProjectID(projectID)
}

func (s *LandingPageService) GetPageByID(userID, pageID uuid.UUID) (*models.LandingPage, error) {
	page, err := s.pageRepo.FindByID(pageID)
	if err != nil {
		return nil, notFound(errPageNotFound)
	}

	// BẢO MẬT: Check xem User có phải chủ của Project chứa Page này không.
	// Trả đúng lỗi "không tìm thấy" như nhánh trên — xem ghi chú quy ước ở đầu file.
	_, err = s.projectRepo.FindByIDAndOwnerID(page.ProjectID, userID)
	if err != nil {
		return nil, notFound(errPageNotFound)
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

// UpdateSEO lưu metadata SEO theo đúng Landing Page và vẫn tái dùng kiểm tra ownership.
// Quyền gói Pro được chặn tại middleware để mọi request đều dùng plan mới nhất từ DB.
func (s *LandingPageService) UpdateSEO(userID, pageID uuid.UUID, input models.LandingPageSEO) (*models.LandingPage, error) {
	page, err := s.GetPageByID(userID, pageID)
	if err != nil {
		return nil, err
	}

	input.Title = strings.TrimSpace(input.Title)
	input.Description = strings.TrimSpace(input.Description)
	input.Keywords = strings.TrimSpace(input.Keywords)
	input.OGImage = strings.TrimSpace(input.OGImage)
	input.Favicon = strings.TrimSpace(input.Favicon)
	if !isSEOAssetURL(input.OGImage) || !isSEOAssetURL(input.Favicon) {
		return nil, ErrInvalidSEOURL
	}

	raw, err := json.Marshal(input)
	if err != nil {
		return nil, err
	}
	page.SEOSettings = raw
	if err := s.pageRepo.Update(page); err != nil {
		return nil, err
	}
	return page, nil
}

func isSEOAssetURL(raw string) bool {
	if raw == "" || strings.HasPrefix(raw, "/uploads/") {
		return true
	}
	parsed, err := url.ParseRequestURI(raw)
	return err == nil && (parsed.Scheme == "http" || parsed.Scheme == "https") && parsed.Host != ""
}

func (s *LandingPageService) DeletePage(userID, pageID uuid.UUID) error {
	page, err := s.GetPageByID(userID, pageID)
	if err != nil {
		return err
	}
	return s.pageRepo.Delete(page)
}
