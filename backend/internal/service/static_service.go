package service

import (
	"bytes"
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"html/template"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"

	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

// StaticService sinh HTML tĩnh của landing page để publish và serve link công khai.
//
// Khác biệt so với PreviewService (realtime preview):
//   - Realtime: HTML tạm, đổi theo device, phục vụ iframe trong editor, không lưu DB.
//   - Static: HTML "đóng băng" nội dung tại thời điểm generate, self-contained,
//     responsive theo media query (không khóa bề rộng theo device), có meta SEO,
//     được lưu vào published_snapshot và serve tại /p/:slug.
//
// Phần render từng section dùng lại RenderSectionHTML của PreviewService để
// HTML publish luôn khớp với những gì user thấy trong editor.
type StaticService struct {
	staticRepo *repository.StaticRepository

	// renderer chỉ dùng cho việc render section (RenderSectionHTML không đụng DB),
	// nên khởi tạo rỗng là đủ — tránh trùng lặp logic template giữa 2 service.
	renderer *PreviewService
}

func NewStaticService(staticRepo *repository.StaticRepository) *StaticService {
	return &StaticService{
		staticRepo: staticRepo,
		renderer:   &PreviewService{},
	}
}

// slugLength là độ dài slug công khai (vd: "a3f9k2xy").
const slugLength = 8

// slugAlphabet — chỉ chữ thường + số, tránh ký tự dễ nhìn nhầm và ký tự cần escape trong URL.
const slugAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789"

// maxSlugAttempts — số lần thử sinh lại slug khi bị trùng trong DB.
const maxSlugAttempts = 5

// GenerateStaticHTML sinh HTML tĩnh hoàn chỉnh của landing page (chưa lưu DB).
// Dùng cho endpoint xem trước bản tĩnh trước khi bấm publish.
func (s *StaticService) GenerateStaticHTML(userID uuid.UUID, pageID uuid.UUID) (string, error) {
	html, _, _, err := s.renderPage(userID, pageID)
	return html, err
}

// renderPage lấy dữ liệu (kèm check quyền) rồi dựng HTML tĩnh.
// Trả kèm page (để biết slug đã có chưa) và sections (để lưu dữ liệu gốc vào snapshot).
// Lỗi từ repo được trả nguyên trạng: gorm.ErrRecordNotFound (404) / repository.ErrForbidden (403).
func (s *StaticService) renderPage(userID uuid.UUID, pageID uuid.UUID) (string, *models.LandingPage, []models.PageSection, error) {
	page, sections, err := s.staticRepo.FindPageWithSections(pageID, userID)
	if err != nil {
		return "", nil, nil, err
	}
	if page == nil {
		return "", nil, nil, errors.New("landing page rỗng")
	}

	// Render từng section. Một section lỗi không được làm sập cả trang publish:
	// fallback về khung generic để các section còn lại vẫn hiển thị.
	htmlParts := make([]string, 0, len(sections))
	for _, sec := range sections {
		if !sec.IsVisible {
			continue
		}

		part, err := s.renderer.RenderSectionHTML(sec)
		if err != nil {
			part = renderGenericSection(sec.SectionType)
		}
		htmlParts = append(htmlParts, part)
	}

	html := s.wrapStaticHTML(htmlParts, page.Name, buildSEODescription(sections))
	return html, page, sections, nil
}

// GenerateAndSaveSnapshot sinh HTML tĩnh, lưu thành 1 snapshot mới và chuyển trang sang published.
//
// Slug (published_url) nằm trên landing_page nên:
//   - Publish lần ĐẦU: sinh slug ngẫu nhiên duy nhất rồi gán cho trang.
//   - Publish LẠI (kể cả sau khi unpublish): GIỮ NGUYÊN slug cũ, chỉ thêm snapshot mới.
//     Link đã chia sẻ không bao giờ chết, và vì /p/:slug luôn lấy snapshot mới nhất
//     nên không có chuyện slug cũ serve nội dung lỗi thời.
//
// Trả về snapshot vừa tạo kèm slug công khai của trang.
func (s *StaticService) GenerateAndSaveSnapshot(userID uuid.UUID, pageID uuid.UUID) (*models.PublishedSnapshot, string, error) {
	html, page, sections, err := s.renderPage(userID, pageID)
	if err != nil {
		return nil, "", err
	}

	// Trang đã có slug (từng publish trước đó) -> tái dùng; chưa có -> sinh slug mới.
	slug := ""
	if page.PublishedURL != nil {
		slug = strings.TrimSpace(*page.PublishedURL)
	}
	isFirstPublish := slug == ""
	if isFirstPublish {
		slug, err = s.generateUniqueSlug()
		if err != nil {
			return nil, "", err
		}
	}

	// Nội dung snapshot lưu dạng JSONB gồm:
	//   - html:     bản đã "đóng băng", serve thẳng tại /p/:slug
	//   - sections: dữ liệu gốc tại thời điểm publish -> vẫn re-render/khôi phục được
	//               nếu sau này đổi theme hoặc cần dựng lại trang
	//   - generated_at: thời điểm sinh
	content, err := json.Marshal(snapshotContent{
		HTML:        html,
		Sections:    sections,
		GeneratedAt: time.Now().UTC().Format(time.RFC3339),
	})
	if err != nil {
		return nil, "", fmt.Errorf("đóng gói nội dung snapshot thất bại: %w", err)
	}

	publishedBy := userID
	snapshot := &models.PublishedSnapshot{
		LandingPageID:   pageID,
		SnapshotContent: datatypes.JSON(content),
		PublishedBy:     &publishedBy,
		PublishedAt:     time.Now().UTC(),
	}

	// Insert snapshot + gán slug (nếu là lần đầu) + đổi status: gói trong 1 transaction
	// để rớt giữa chừng thì rollback sạch, không để lại trạng thái lệch.
	if err := s.staticRepo.PublishInTx(snapshot, slug, isFirstPublish); err != nil {
		return nil, "", err
	}

	return snapshot, slug, nil
}

// UnpublishPage gỡ trang khỏi link công khai: chỉ đổi status về 'draft'.
// KHÔNG xóa snapshot (giữ lịch sử) và KHÔNG xóa published_url khỏi trang —
// nhờ vậy publish lại sẽ dùng đúng slug cũ, link bền qua cả chu kỳ unpublish -> republish.
// Sau khi gỡ, /p/:slug trả 404 vì query công khai lọc theo status = 'published'.
func (s *StaticService) UnpublishPage(userID uuid.UUID, pageID uuid.UUID) error {
	// Check quyền: gorm.ErrRecordNotFound (404) / repository.ErrForbidden (403).
	if _, err := s.staticRepo.FindPageOwned(pageID, userID); err != nil {
		return err
	}

	return s.staticRepo.UpdatePageStatus(pageID, models.StatusDraft)
}

// snapshotContent là cấu trúc JSONB lưu trong cột published_snapshot.snapshot_content.
// Giữ cả HTML lẫn dữ liệu section gốc: HTML để serve ngay, sections để còn đường
// re-render/khôi phục bản đã publish khi đổi theme sau này.
type snapshotContent struct {
	HTML        string               `json:"html"`
	Sections    []models.PageSection `json:"sections"`
	GeneratedAt string               `json:"generated_at"`
}

// GetPublicHTML lấy HTML đang live theo slug để serve tại /p/:slug (không cần đăng nhập).
//
// Slug tra trên landing_page (chỉ trang status = 'published'), rồi lấy snapshot MỚI NHẤT.
// Nhờ vậy: trang đã unpublish -> 404 dù snapshot vẫn còn trong DB; và không có slug cũ
// nào có thể serve nội dung lỗi thời vì mỗi trang chỉ có đúng 1 slug.
// Trả về gorm.ErrRecordNotFound nếu slug lạ, trang đã gỡ, hoặc trang chưa có snapshot nào.
func (s *StaticService) GetPublicHTML(slug string) (string, error) {
	page, err := s.staticRepo.FindPublishedPageBySlug(strings.TrimSpace(slug))
	if err != nil {
		return "", err
	}

	snapshot, err := s.staticRepo.FindLatestSnapshot(page.LandingPageID)
	if err != nil {
		return "", err
	}

	var content snapshotContent
	if err := json.Unmarshal(snapshot.SnapshotContent, &content); err != nil {
		return "", fmt.Errorf("nội dung snapshot hỏng: %w", err)
	}
	if strings.TrimSpace(content.HTML) == "" {
		return "", errors.New("snapshot không chứa HTML")
	}

	return content.HTML, nil
}

// generateUniqueSlug sinh slug ngẫu nhiên 8 ký tự, thử lại nếu trùng trong DB.
func (s *StaticService) generateUniqueSlug() (string, error) {
	for i := 0; i < maxSlugAttempts; i++ {
		slug, err := randomSlug(slugLength)
		if err != nil {
			return "", err
		}

		exists, err := s.staticRepo.SlugExists(slug)
		if err != nil {
			return "", err
		}
		if !exists {
			return slug, nil
		}
	}

	return "", errors.New("không sinh được slug duy nhất, vui lòng thử lại")
}

// randomSlug sinh chuỗi ngẫu nhiên bằng crypto/rand (an toàn hơn math/rand:
// slug không đoán trước được nên người lạ không dò ra link chưa công bố).
func randomSlug(n int) (string, error) {
	buf := make([]byte, n)
	if _, err := rand.Read(buf); err != nil {
		return "", fmt.Errorf("sinh slug ngẫu nhiên thất bại: %w", err)
	}

	var sb strings.Builder
	sb.Grow(n)
	for _, b := range buf {
		sb.WriteByte(slugAlphabet[int(b)%len(slugAlphabet)])
	}

	return sb.String(), nil
}

// buildSEODescription lấy mô tả SEO từ subtitle (hoặc title) của section đầu tiên có nội dung —
// thường là hero. Không có gì phù hợp thì trả về chuỗi rỗng (meta description sẽ bị bỏ qua).
func buildSEODescription(sections []models.PageSection) string {
	for _, sec := range sections {
		if !sec.IsVisible || len(sec.Content) == 0 {
			continue
		}

		var content map[string]interface{}
		if err := json.Unmarshal(sec.Content, &content); err != nil {
			continue // content hỏng -> bỏ qua, không làm sập việc publish
		}

		desc := pickString(content, "subtitle", "description", "title")
		if desc != "" {
			return truncateText(desc, 160) // giới hạn 160 ký tự theo chuẩn meta description
		}
	}

	return ""
}

// truncateText cắt bớt chuỗi quá dài (cắt theo rune để không vỡ tiếng Việt có dấu).
func truncateText(s string, max int) string {
	runes := []rune(strings.TrimSpace(s))
	if len(runes) <= max {
		return string(runes)
	}
	return strings.TrimSpace(string(runes[:max])) + "..."
}

// --- Dựng trang HTML tĩnh ---

// staticPageData là dữ liệu của layout trang tĩnh.
type staticPageData struct {
	Title       string
	Description string
	Sections    []template.HTML
	CustomCSS   template.CSS
}

// wrapStaticHTML ghép các mảnh section thành 1 trang HTML5 self-contained để publish:
//   - CSS utility nhúng sẵn trong layout (KHÔNG tải Tailwind từ CDN) + Google Fonts.
//   - Meta SEO cơ bản: title, description, og:title, og:description.
//   - Viewport responsive chuẩn; lưới features co theo màn hình (desktop 3 / tablet 2 / mobile 1 cột).
//   - Script nhỏ xử lý accordion FAQ.
func (s *StaticService) wrapStaticHTML(sections []string, title string, description string) string {
	// Các mảnh section đã sinh bằng html/template (dữ liệu user đã được escape),
	// nên đánh dấu template.HTML để không bị escape lần hai.
	body := make([]template.HTML, 0, len(sections))
	for _, part := range sections {
		body = append(body, template.HTML(part))
	}

	data := staticPageData{
		Title:       title,
		Description: description,
		Sections:    body,
		// CSS tùy chỉnh của user (khi có) luôn đi qua sanitizeCustomCSS để không thoát được thẻ <style>.
		CustomCSS: sanitizeCustomCSS(""),
	}

	var buf bytes.Buffer
	if err := staticLayoutTemplate.Execute(&buf, data); err != nil {
		// Layout là template tĩnh do ta kiểm soát nên gần như không thể lỗi.
		return "<!DOCTYPE html><html><body>Không dựng được trang</body></html>"
	}
	return buf.String()
}

// staticLayoutTemplate là khung trang publish — CSS/JS nhúng cố định, không tải asset từ backend.
var staticLayoutTemplate = template.Must(template.New("static_layout").Parse(`<!DOCTYPE html>
<html lang="vi">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<!-- Meta SEO cơ bản -->
	<title>{{ .Title }}</title>
	{{ if .Description }}<meta name="description" content="{{ .Description }}">{{ end }}
	<meta property="og:type" content="website">
	<meta property="og:title" content="{{ .Title }}">
	{{ if .Description }}<meta property="og:description" content="{{ .Description }}">{{ end }}

	<!-- KHÔNG dùng cdn.tailwindcss.com ở trang publish.
	     Script đó là bản dev: nó tải ~300KB JS rồi biên dịch CSS ngay trong trình
	     duyệt, và biến mọi trang khách hàng đã publish thành phụ thuộc vào một
	     host bên ngoài — CDN chết là toàn bộ trang mất sạch style cùng lúc.
	     Thay bằng đúng những utility mà renderer sinh ra, nhúng thẳng bên dưới. -->

	<!-- Google Fonts: Inter + Material Symbols Outlined (icon cho features) -->
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
	<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet">

	<style>
		:root { color-scheme: dark; }
		* { box-sizing: border-box; }

		body {
			margin: 0;
			background-color: #131315;
			color: #e5e1e4;
			font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
			line-height: 1.5;
		}
		a { color: inherit; text-decoration: none; }
		img { max-width: 100%; }

		.static-root {
			width: 100%;
			max-width: 1280px;
			margin: 0 auto;
		}

` + rendererUtilityCSS + `
		/* Lưới features/testimonials responsive: mobile 1 cột (mặc định).
		   !important để thắng grid-cols-* khai báo ngay phía trên. */
		.preview-grid {
			grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
		}
		/* Tablet: 2 cột */
		@media (min-width: 768px) {
			.preview-grid {
				grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
			}
		}
		/* Desktop: 3 cột */
		@media (min-width: 1024px) {
			.features-section .preview-grid {
				grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
			}
		}

		.material-symbols-outlined {
			font-family: 'Material Symbols Outlined';
			font-weight: normal;
			font-style: normal;
			line-height: 1;
			display: inline-block;
			vertical-align: middle;
		}

		.static-empty {
			padding: 96px 24px;
			text-align: center;
			opacity: 0.5;
		}

		{{ .CustomCSS }}
	</style>
</head>
<body>
	<div class="static-root">
		{{ if .Sections }}
			{{ range .Sections }}{{ . }}
			{{ end }}
		{{ else }}
			<div class="static-empty">Trang chưa có nội dung.</div>
		{{ end }}
	</div>

	<script>
		// Accordion FAQ: mở 1 câu hỏi thì tự đóng các câu còn lại.
		document.querySelectorAll('details.faq-item').forEach(function (item) {
			item.addEventListener('toggle', function () {
				if (!item.open) return;
				document.querySelectorAll('details.faq-item').forEach(function (other) {
					if (other !== item) other.open = false;
				});
			});
		});
	</script>
</body>
</html>`))
