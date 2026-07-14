package service

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"html/template"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

// PreviewService sinh HTML preview realtime cho landing page đang soạn thảo.
// HTML sinh ra là self-contained (CSS inline + CDN), nhúng thẳng vào <iframe> của editor
// mà không dính lỗi CORS vì không tải file CSS/JS từ origin khác của backend.
type PreviewService struct {
	previewRepo *repository.PreviewRepository
}

func NewPreviewService(previewRepo *repository.PreviewRepository) *PreviewService {
	return &PreviewService{previewRepo: previewRepo}
}

// --- Thiết bị preview ---

// Các device được hỗ trợ. Mọi giá trị lạ sẽ fallback về desktop.
const (
	DeviceDesktop = "desktop"
	DeviceTablet  = "tablet"
	DeviceMobile  = "mobile"
)

// deviceConfig mô tả cách render cho từng loại thiết bị.
type deviceConfig struct {
	Viewport string // nội dung thẻ <meta name="viewport">
	Width    string // bề rộng khung preview (CSS)
	Columns  int    // số cột của lưới features/testimonials
}

// deviceConfigs map device -> cấu hình render tương ứng.
var deviceConfigs = map[string]deviceConfig{
	DeviceDesktop: {Viewport: "width=1280", Width: "1280px", Columns: 3},
	DeviceTablet:  {Viewport: "width=768", Width: "768px", Columns: 2},
	DeviceMobile:  {Viewport: "width=device-width,initial-scale=1", Width: "375px", Columns: 1},
}

// NormalizeDevice chuẩn hóa query param device; giá trị không hợp lệ -> desktop.
func NormalizeDevice(device string) string {
	d := strings.ToLower(strings.TrimSpace(device))
	if _, ok := deviceConfigs[d]; ok {
		return d
	}
	return DeviceDesktop
}

// --- Điều phối: lấy dữ liệu (check quyền) rồi render ---

// GetPreview là entrypoint cho handler: kiểm tra quyền sở hữu, lấy section
// (đã lọc is_visible và sắp theo order_index) rồi sinh HTML preview.
// Trả về HTML, thời điểm cập nhật gần nhất của trang, và lỗi (nếu có).
func (s *PreviewService) GetPreview(userID, pageID uuid.UUID, device string) (string, time.Time, error) {
	// Trả về gorm.ErrRecordNotFound nếu trang không tồn tại hoặc user không phải chủ sở hữu.
	page, err := s.previewRepo.FindLandingPage(pageID, userID)
	if err != nil {
		return "", time.Time{}, err
	}

	sections, err := s.previewRepo.FindSections(pageID)
	if err != nil {
		return "", time.Time{}, err
	}

	html, err := s.RenderPreview(page, sections, device)
	if err != nil {
		return "", time.Time{}, err
	}

	// updated_at = lần sửa gần nhất của trang HOẶC của bất kỳ section nào,
	// để FE biết bản preview này ứng với trạng thái dữ liệu nào.
	updatedAt := page.UpdatedAt
	for _, sec := range sections {
		if sec.UpdatedAt.After(updatedAt) {
			updatedAt = sec.UpdatedAt
		}
	}

	return html, updatedAt, nil
}

// RenderPreview sinh HTML preview hoàn chỉnh từ landing page + danh sách section.
// device quyết định meta viewport và bề rộng khung preview.
func (s *PreviewService) RenderPreview(page *models.LandingPage, sections []models.PageSection, device string) (string, error) {
	if page == nil {
		return "", errors.New("landing page rỗng")
	}

	// Render từng section thành 1 mảnh HTML độc lập.
	htmlParts := make([]string, 0, len(sections))
	for _, sec := range sections {
		// Bỏ qua section bị ẩn (phòng khi caller không lọc sẵn).
		if !sec.IsVisible {
			continue
		}

		part, err := s.RenderSectionHTML(sec)
		if err != nil {
			// Một section lỗi không được làm hỏng cả trang preview:
			// thay bằng khung generic để user vẫn thấy các section còn lại.
			part = renderGenericSection(sec.SectionType)
		}
		htmlParts = append(htmlParts, part)
	}

	// Ghép các mảnh thành trang hoàn chỉnh. customCSS để rỗng — dành sẵn cho
	// tính năng "CSS tùy chỉnh của user" sau này.
	return s.WrapFullHTML(htmlParts, page.Name, device, ""), nil
}

// RenderSectionHTML render 1 section thành chuỗi HTML theo section_type.
// Content (JSONB) được unmarshal thành map, các trường được lấy an toàn qua
// pickString/pickArray (dùng chung với export_service.go).
// Nếu content sai định dạng hoặc section_type lạ -> render generic section.
func (s *PreviewService) RenderSectionHTML(section models.PageSection) (string, error) {
	// Parse content JSONB. Content lỗi -> coi như rỗng, vẫn render khung section
	// để user thấy được section nào đang có vấn đề thay vì trang trắng.
	var content map[string]interface{}
	if len(section.Content) > 0 {
		if err := json.Unmarshal(section.Content, &content); err != nil {
			return renderGenericSection(section.SectionType), nil
		}
	}
	if content == nil {
		content = map[string]interface{}{}
	}

	// Chọn template theo section_type; type lạ -> generic.
	tmpl, ok := sectionTemplates[strings.ToLower(strings.TrimSpace(section.SectionType))]
	if !ok {
		return renderGenericSection(section.SectionType), nil
	}

	data := buildSectionData(section.SectionType, content)

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", fmt.Errorf("render section %s thất bại: %w", section.SectionType, err)
	}
	return buf.String(), nil
}

// WrapFullHTML ghép các mảnh HTML section thành 1 trang HTML5 hoàn chỉnh.
// - Nhúng Tailwind qua CDN + Google Fonts Inter + Material Symbols Outlined.
// - CSS viết inline trong <style> (không tải file ngoài -> tránh CORS khi embed iframe).
// - Dark theme: nền #131315, chữ #e5e1e4.
// - Meta viewport và bề rộng khung đặt theo device.
// - Kèm script nhỏ xử lý accordion FAQ (mở 1 câu thì đóng các câu còn lại).
func (s *PreviewService) WrapFullHTML(sections []string, title string, device string, customCSS string) string {
	cfg := deviceConfigs[NormalizeDevice(device)]

	// Các mảnh section đã được sinh bằng html/template (đã escape dữ liệu user),
	// nên đánh dấu template.HTML để không bị escape lần hai.
	body := make([]template.HTML, 0, len(sections))
	for _, part := range sections {
		body = append(body, template.HTML(part))
	}

	data := previewPageData{
		Title:     title,
		Viewport:  cfg.Viewport,
		Width:     cfg.Width,
		Columns:   cfg.Columns,
		Sections:  body,
		CustomCSS: sanitizeCustomCSS(customCSS),
	}

	var buf bytes.Buffer
	if err := previewLayoutTemplate.Execute(&buf, data); err != nil {
		// Layout là template tĩnh do ta kiểm soát nên gần như không thể lỗi;
		// nếu có thì trả về trang báo lỗi tối thiểu thay vì chuỗi rỗng.
		return "<!DOCTYPE html><html><body>Không dựng được preview</body></html>"
	}
	return buf.String()
}

// --- Dữ liệu truyền vào template ---

// previewPageData là dữ liệu của layout trang preview.
type previewPageData struct {
	Title     string
	Viewport  string
	Width     string
	Columns   int
	Sections  []template.HTML
	CustomCSS template.CSS
}

// previewSectionData gom toàn bộ trường có thể dùng cho mọi loại section.
// Mỗi template chỉ đọc các trường liên quan tới nó.
type previewSectionData struct {
	Type       string
	Title      string
	Subtitle   string
	ButtonText string
	ButtonURL  template.URL
	BgStyle    template.CSS
	Copyright  string
	Items      []previewItem      // features / faq
	Quotes     []previewQuote     // testimonials
	Links      []previewFooterURL // footer
}

// previewItem dùng chung cho feature card và câu hỏi FAQ.
type previewItem struct {
	Icon     string
	Title    string
	Desc     string
	Question string
	Answer   string
}

// previewQuote là 1 lời chứng thực (testimonial).
type previewQuote struct {
	Text   string
	Author string
	Avatar template.URL
}

// previewFooterURL là 1 link ở footer.
type previewFooterURL struct {
	Label string
	URL   template.URL
}

// buildSectionData bóc tách content JSONB thành struct render theo từng section_type.
// Hỗ trợ nhiều tên key khác nhau (vd: button_text / buttonText) để tương thích
// dữ liệu cũ và dữ liệu FE gửi lên.
func buildSectionData(sectionType string, content map[string]interface{}) previewSectionData {
	d := previewSectionData{Type: sectionType}

	switch strings.ToLower(strings.TrimSpace(sectionType)) {
	case "hero":
		d.Title = pickString(content, "title")
		d.Subtitle = pickString(content, "subtitle")
		d.ButtonText = pickString(content, "button_text", "buttonText")
		d.ButtonURL = safeLinkURL(pickString(content, "button_url", "buttonUrl"))
		d.BgStyle = safeBgStyle(pickString(content, "bg_color", "bgColor", "background"))

	case "cta":
		d.Title = pickString(content, "title")
		d.Subtitle = pickString(content, "subtitle")
		d.ButtonText = pickString(content, "button_text", "buttonText")
		d.ButtonURL = safeLinkURL(pickString(content, "button_url", "buttonUrl"))

	case "features":
		d.Title = pickString(content, "title")
		for _, it := range pickArray(content, "items") {
			d.Items = append(d.Items, previewItem{
				Icon:  pickString(it, "icon"),
				Title: pickString(it, "title"),
				Desc:  pickString(it, "desc", "description"),
			})
		}

	case "testimonials":
		d.Title = pickString(content, "title")
		for _, q := range pickArray(content, "quotes", "items") {
			d.Quotes = append(d.Quotes, previewQuote{
				Text:   pickString(q, "text", "quote"),
				Author: pickString(q, "author", "name"),
				Avatar: safeImageURL(pickString(q, "avatar", "avatar_url")),
			})
		}

	case "faq":
		d.Title = pickString(content, "title")
		for _, f := range pickArray(content, "items", "faqs", "questions") {
			d.Items = append(d.Items, previewItem{
				Question: pickString(f, "question", "q"),
				Answer:   pickString(f, "answer", "a"),
			})
		}

	case "footer":
		d.Copyright = pickString(content, "copyright")
		for _, l := range pickArray(content, "links") {
			d.Links = append(d.Links, previewFooterURL{
				Label: pickString(l, "label", "text", "title"),
				URL:   safeLinkURL(pickString(l, "url", "href")),
			})
		}
	}

	return d
}

// renderGenericSection dựng khung placeholder cho section_type không xác định
// hoặc section có content lỗi định dạng.
func renderGenericSection(sectionType string) string {
	var buf bytes.Buffer
	// Template generic chỉ có 1 biến string nên lỗi Execute là không thể xảy ra.
	_ = genericSectionTemplate.Execute(&buf, sectionType)
	return buf.String()
}

// safeLinkURL lọc URL cho thuộc tính href: chỉ cho phép http(s), đường dẫn tương đối,
// neo #, mailto và tel. Scheme lạ (vd: javascript:) -> trả về "#" để tránh XSS.
func safeLinkURL(raw string) template.URL {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return template.URL("#")
	}
	low := strings.ToLower(raw)
	switch {
	case strings.HasPrefix(low, "http://"),
		strings.HasPrefix(low, "https://"),
		strings.HasPrefix(low, "mailto:"),
		strings.HasPrefix(low, "tel:"),
		strings.HasPrefix(raw, "/"),
		strings.HasPrefix(raw, "#"):
		return template.URL(raw)
	default:
		return template.URL("#")
	}
}

// sanitizeCustomCSS làm sạch CSS tùy chỉnh trước khi nhúng vào thẻ <style>.
// Loại bỏ ký tự "<" để user không thể đóng sớm thẻ style rồi chèn <script> (XSS).
func sanitizeCustomCSS(css string) template.CSS {
	css = strings.TrimSpace(css)
	if css == "" {
		return ""
	}
	return template.CSS(strings.ReplaceAll(css, "<", ""))
}

// --- Template từng loại section ---

// sectionTemplates map section_type -> template render tương ứng.
var sectionTemplates = map[string]*template.Template{
	"hero":         template.Must(template.New("hero").Parse(heroTmpl)),
	"features":     template.Must(template.New("features").Parse(featuresTmpl)),
	"testimonials": template.Must(template.New("testimonials").Parse(testimonialsTmpl)),
	"faq":          template.Must(template.New("faq").Parse(faqTmpl)),
	"cta":          template.Must(template.New("cta").Parse(ctaTmpl)),
	"footer":       template.Must(template.New("footer").Parse(footerTmpl)),
}

// genericSectionTemplate render placeholder cho section không xác định.
var genericSectionTemplate = template.Must(template.New("generic").Parse(genericTmpl))

const heroTmpl = `<section class="hero-section py-20 px-8 text-center" style="{{ .BgStyle }}">
	{{ if .Title }}<h1 class="text-5xl font-bold mb-4">{{ .Title }}</h1>{{ end }}
	{{ if .Subtitle }}<p class="text-xl mb-8 opacity-80">{{ .Subtitle }}</p>{{ end }}
	{{ if .ButtonText }}<a href="{{ .ButtonURL }}" class="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg">{{ .ButtonText }}</a>{{ end }}
</section>`

const featuresTmpl = `<section class="features-section py-16 px-8">
	{{ if .Title }}<h2 class="text-3xl font-bold text-center mb-12">{{ .Title }}</h2>{{ end }}
	<div class="preview-grid grid grid-cols-3 gap-8">
		{{ range .Items }}
		<div class="feature-card p-6 rounded-xl bg-white/5">
			{{ if .Icon }}<span class="material-symbols-outlined text-4xl">{{ .Icon }}</span>{{ end }}
			{{ if .Title }}<h3 class="text-xl font-semibold mt-4">{{ .Title }}</h3>{{ end }}
			{{ if .Desc }}<p class="mt-2 opacity-70">{{ .Desc }}</p>{{ end }}
		</div>
		{{ end }}
	</div>
</section>`

const testimonialsTmpl = `<section class="testimonials-section py-16 px-8">
	{{ if .Title }}<h2 class="text-3xl font-bold text-center mb-12">{{ .Title }}</h2>{{ end }}
	<div class="preview-grid grid grid-cols-2 gap-6">
		{{ range .Quotes }}
		<div class="quote-card p-6 rounded-xl bg-white/5">
			{{ if .Text }}<p class="italic opacity-80">&ldquo;{{ .Text }}&rdquo;</p>{{ end }}
			<div class="flex items-center mt-4">
				{{ if .Avatar }}<img src="{{ .Avatar }}" alt="{{ .Author }}" class="w-10 h-10 rounded-full object-cover">{{ end }}
				{{ if .Author }}<span class="ml-3 font-semibold">{{ .Author }}</span>{{ end }}
			</div>
		</div>
		{{ end }}
	</div>
</section>`

const faqTmpl = `<section class="faq-section py-16 px-8 max-w-3xl mx-auto">
	{{ if .Title }}<h2 class="text-3xl font-bold text-center mb-12">{{ .Title }}</h2>{{ end }}
	{{ range .Items }}
	<details class="faq-item mb-4 p-4 rounded-lg bg-white/5">
		<summary class="font-semibold cursor-pointer">{{ .Question }}</summary>
		<p class="mt-3 opacity-70">{{ .Answer }}</p>
	</details>
	{{ end }}
</section>`

const ctaTmpl = `<section class="cta-section py-20 px-8 text-center bg-blue-600/20">
	{{ if .Title }}<h2 class="text-4xl font-bold mb-4">{{ .Title }}</h2>{{ end }}
	{{ if .Subtitle }}<p class="text-xl mb-8 opacity-80">{{ .Subtitle }}</p>{{ end }}
	{{ if .ButtonText }}<a href="{{ .ButtonURL }}" class="inline-block bg-blue-600 text-white px-10 py-4 rounded-lg text-lg">{{ .ButtonText }}</a>{{ end }}
</section>`

const footerTmpl = `<footer class="footer-section py-12 px-8 border-t border-white/10">
	<div class="flex justify-between items-center">
		<p class="opacity-50">{{ .Copyright }}</p>
		<div class="flex gap-6">
			{{ range .Links }}
			<a href="{{ .URL }}" class="opacity-70 hover:opacity-100">{{ .Label }}</a>
			{{ end }}
		</div>
	</div>
</footer>`

const genericTmpl = `<section class="generic-section py-12 px-8">
	<div class="p-6 rounded-xl bg-white/5 text-center opacity-50">
		Section: {{ . }}
	</div>
</section>`

// previewLayoutTemplate là khung trang preview hoàn chỉnh.
// Toàn bộ CSS nằm inline trong <style>, chỉ Tailwind/font lấy từ CDN công cộng
// -> nhúng vào <iframe> của editor không bị chặn CORS.
var previewLayoutTemplate = template.Must(template.New("preview_layout").Parse(`<!DOCTYPE html>
<html lang="vi">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="{{ .Viewport }}">
	<title>{{ .Title }}</title>

	<!-- Tailwind CSS qua CDN (không dùng file tĩnh của backend -> tránh CORS trong iframe) -->
	<script src="https://cdn.tailwindcss.com"></script>

	<!-- Google Fonts: Inter -->
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

	<!-- Material Symbols Outlined (icon cho features) -->
	<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet">

	<style>
		:root { color-scheme: dark; }
		* { box-sizing: border-box; }

		/* Dark theme mặc định của trình dựng trang */
		body {
			margin: 0;
			background-color: #131315;
			color: #e5e1e4;
			font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
			line-height: 1.5;
		}
		a { color: inherit; text-decoration: none; }
		img { max-width: 100%; }

		/* Khung preview: giới hạn bề rộng đúng theo thiết bị đang chọn */
		.preview-root {
			width: 100%;
			max-width: {{ .Width }};
			margin: 0 auto;
		}

		/* Lưới features/testimonials co lại theo thiết bị (tablet 2 cột, mobile 1 cột) */
		.preview-grid {
			grid-template-columns: repeat({{ .Columns }}, minmax(0, 1fr));
		}

		.material-symbols-outlined {
			font-family: 'Material Symbols Outlined';
			font-weight: normal;
			font-style: normal;
			line-height: 1;
			display: inline-block;
			vertical-align: middle;
		}

		/* Trạng thái trang chưa có section nào */
		.preview-empty {
			padding: 96px 24px;
			text-align: center;
			opacity: 0.5;
		}

		{{ .CustomCSS }}
	</style>
</head>
<body>
	<div class="preview-root">
		{{ if .Sections }}
			{{ range .Sections }}{{ . }}
			{{ end }}
		{{ else }}
			<div class="preview-empty">Trang chưa có section nào — hãy thêm section để xem preview.</div>
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
