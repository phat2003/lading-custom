package service

import (
	"archive/zip"
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	wkhtmltopdf "github.com/SebastiaanKlippert/go-wkhtmltopdf"
	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

// ExportService xử lý logic sinh HTML và convert sang PDF cho landing page.
type ExportService struct {
	exportRepo *repository.ExportRepository
}

func NewExportService(exportRepo *repository.ExportRepository) *ExportService {
	return &ExportService{exportRepo: exportRepo}
}

// ExportPagePDF điều phối toàn bộ quy trình export:
// lấy dữ liệu (có check quyền) -> sinh HTML -> convert PDF.
// Trả về []byte của file PDF và landing page tương ứng.
func (s *ExportService) ExportPagePDF(userID, pageID uuid.UUID) ([]byte, *models.LandingPage, error) {
	// Lấy landing page + section, đồng thời kiểm tra quyền sở hữu.
	page, sections, err := s.exportRepo.FindLandingPageWithSections(pageID, userID)
	if err != nil {
		return nil, nil, err
	}

	// Sinh HTML từ các section.
	htmlContent, err := s.BuildHTML(page, sections)
	if err != nil {
		return nil, nil, err
	}

	// Convert HTML sang PDF.
	pdfBytes, err := s.ExportToPDF(htmlContent)
	if err != nil {
		return nil, nil, err
	}

	return pdfBytes, page, nil
}

// pageTemplateData là dữ liệu truyền vào HTML template.
type pageTemplateData struct {
	Title    string
	Sections []sectionView
}

// sectionView đại diện cho 1 section khi render ra HTML.
type sectionView struct {
	Type   string
	Fields []fieldKV
}

// fieldKV là 1 cặp key/value trong content JSONB của section.
type fieldKV struct {
	Key   string
	Value string
}

// htmlTemplate là template HTML đơn giản cho toàn trang.
// Mỗi section render thành 1 div với class = section_type.
var htmlTemplate = template.Must(template.New("page").Parse(`<!DOCTYPE html>
<html lang="vi">
<head>
	<meta charset="UTF-8">
	<title>{{ .Title }}</title>
	<style>
		body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; color: #1a1a1a; }
		.section { padding: 32px 40px; border-bottom: 1px solid #eee; }
		.section h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin: 0 0 12px; }
		.field { margin-bottom: 8px; }
		.field .key { font-weight: bold; color: #555; }
		.field .value { color: #1a1a1a; }
	</style>
</head>
<body>
	{{ range .Sections }}
	<div class="section section-{{ .Type }}">
		<h2>{{ .Type }}</h2>
		{{ range .Fields }}
		<div class="field">
			<span class="key">{{ .Key }}:</span>
			<span class="value">{{ .Value }}</span>
		</div>
		{{ end }}
	</div>
	{{ end }}
</body>
</html>`))

// BuildHTML sinh tài liệu HTML trực quan từ cùng canonical renderer được dùng
// cho preview, publish và HTML export. Hàm này là đầu vào duy nhất của PDF.
func (s *ExportService) BuildHTML(page *models.LandingPage, sections []models.PageSection) (string, error) {
	return RenderLandingPageHTML(page, sections, PageRenderOptions{})
}

// stringifyValue chuyển 1 giá trị JSON bất kỳ thành chuỗi để hiển thị.
func stringifyValue(v interface{}) string {
	switch val := v.(type) {
	case string:
		return val
	case nil:
		return ""
	default:
		// Với object/array/number/bool: serialize lại thành JSON gọn.
		b, err := json.Marshal(val)
		if err != nil {
			return strings.TrimSpace(fmt.Sprintf("%v", val))
		}
		return string(b)
	}
}

// ================== EXPORT HTML/CSS/JS (ZIP) — CHỈ GÓI PRO ==================

// ExportPageHTML điều phối quy trình export ra file ZIP (HTML self-contained):
// lấy dữ liệu (có check quyền) -> sinh HTML hoàn chỉnh -> đóng gói ZIP.
// offline=true: nhúng CSS trực tiếp + ảnh base64, mở được không cần internet.
// offline=false: dùng CDN (Tailwind, Google Fonts, Material Symbols).
// Trả về []byte của file ZIP và landing page tương ứng.
func (s *ExportService) ExportPageHTML(userID, pageID uuid.UUID, offline bool) ([]byte, *models.LandingPage, error) {
	// Lấy landing page + section, đồng thời kiểm tra quyền sở hữu qua project.owner_id.
	page, sections, err := s.exportRepo.FindLandingPageWithSections(pageID, userID)
	if err != nil {
		return nil, nil, err
	}

	// Sinh HTML hoàn chỉnh, self-contained.
	var htmlContent string
	if offline {
		htmlContent, err = s.BuildFullHTMLOffline(page, sections)
	} else {
		htmlContent, err = s.BuildFullHTML(page, sections)
	}
	if err != nil {
		return nil, nil, err
	}

	// Đóng gói HTML + README thành file ZIP trong bộ nhớ.
	zipBytes, err := s.BuildZip(htmlContent, page.Name)
	if err != nil {
		return nil, nil, err
	}

	return zipBytes, page, nil
}

// --- Cấu trúc dữ liệu render cho HTML đầy đủ ---

// fullPageData là dữ liệu truyền vào template HTML hoàn chỉnh.
type fullPageData struct {
	Title    string
	Sections []fullSectionView
}

// fullSectionView đại diện cho 1 section đã được chuẩn hóa để render.
type fullSectionView struct {
	Type       string
	Title      string
	Subtitle   string
	ButtonText string
	BgStyle    template.CSS // style nền (đã được làm sạch) cho hero
	Copyright  string
	Items      []featureItemView // dùng cho "features"
	Quotes     []testimonialView // dùng cho "testimonials"
	Faqs       []faqItemView     // dùng cho "faq"
	Links      []linkView        // dùng cho "footer"
	RawJSON    string            // dùng cho section không xác định (generic)
}

type featureItemView struct {
	Icon  string
	Title string
	Desc  string
}

type testimonialView struct {
	Author string
	Text   string
	Avatar template.URL // đã sanitize; cho phép data: URI (base64) mà html/template mặc định chặn
}

type faqItemView struct {
	Question string
	Answer   string
}

type linkView struct {
	Label string
	URL   string
}

// BuildFullHTML sinh HTML dùng CDN (Tailwind, Google Fonts Inter, Material Symbols).
// File mở được bằng trình duyệt nhưng cần internet để tải CSS/font/ảnh từ CDN.
func (s *ExportService) BuildFullHTML(landingPage *models.LandingPage, sections []models.PageSection) (string, error) {
	return s.buildHTML(landingPage, sections, false)
}

// BuildFullHTMLOffline sinh HTML offline hoàn toàn: CSS nhúng trực tiếp (không CDN),
// font hệ thống, ảnh (avatar...) được nhúng dạng base64 data URI.
// File mở được mà KHÔNG cần internet.
func (s *ExportService) BuildFullHTMLOffline(landingPage *models.LandingPage, sections []models.PageSection) (string, error) {
	return s.buildHTML(landingPage, sections, true)
}

// buildHTML là logic chung sinh HTML cho cả 2 chế độ (CDN và offline).
// Khi offline=true: nhúng ảnh thành base64 và dùng template có CSS inline.
func (s *ExportService) buildHTML(landingPage *models.LandingPage, sections []models.PageSection, offline bool) (string, error) {
	options := PageRenderOptions{}
	if offline {
		options.ImageTransform = s.embedImage
	}
	return RenderLandingPageHTML(landingPage, sections, options)
}

// embedImage chuyển 1 nguồn ảnh (URL hoặc đường dẫn cục bộ) thành data URI base64.
// - Nếu đã là data URI: giữ nguyên.
// - Nếu là http/https: tải về (giới hạn thời gian & dung lượng).
// - Ngược lại: coi như file trong thư mục ./uploads.
// Bất kỳ lỗi nào -> trả lại nguồn gốc để không làm hỏng trang.
func (s *ExportService) embedImage(src string) string {
	src = strings.TrimSpace(src)
	if src == "" || strings.HasPrefix(src, "data:") {
		return src
	}

	var (
		data []byte
		mime string
		err  error
	)
	if strings.HasPrefix(src, "http://") || strings.HasPrefix(src, "https://") {
		data, mime, err = fetchRemoteImage(src)
	} else {
		data, mime, err = readLocalImage(src)
	}
	if err != nil || len(data) == 0 {
		// Không nhúng được: giữ URL gốc (chấp nhận cần mạng cho ảnh này).
		return src
	}
	if mime == "" {
		mime = http.DetectContentType(data)
	}
	return "data:" + mime + ";base64," + base64.StdEncoding.EncodeToString(data)
}

// fetchRemoteImage tải ảnh từ URL http/https với timeout và giới hạn dung lượng 5MB.
func fetchRemoteImage(url string) ([]byte, string, error) {
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return nil, "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, "", fmt.Errorf("tải ảnh thất bại: HTTP %d", resp.StatusCode)
	}
	// Giới hạn 5MB để tránh nhúng file quá lớn.
	data, err := io.ReadAll(io.LimitReader(resp.Body, 5<<20))
	if err != nil {
		return nil, "", err
	}
	return data, resp.Header.Get("Content-Type"), nil
}

// readLocalImage đọc ảnh từ thư mục ./uploads (nơi server phục vụ file tĩnh).
// Có chặn path traversal: chỉ đọc trong phạm vi thư mục uploads.
func readLocalImage(src string) ([]byte, string, error) {
	// Bỏ query string / fragment nếu có (vd: /uploads/a.png?v=2).
	if i := strings.IndexAny(src, "?#"); i >= 0 {
		src = src[:i]
	}
	rel := filepath.Clean(strings.TrimPrefix(src, "/"))
	// Nếu đường dẫn không nằm trong "uploads" hoặc cố thoát ra ngoài -> ép về uploads/<tên file>.
	if strings.Contains(rel, "..") || !strings.HasPrefix(rel, "uploads") {
		rel = filepath.Join("uploads", filepath.Base(rel))
	}
	data, err := os.ReadFile(rel)
	if err != nil {
		return nil, "", err
	}
	return data, mimeByExt(rel), nil
}

// mimeByExt suy ra MIME type của ảnh từ phần mở rộng file.
func mimeByExt(name string) string {
	switch strings.ToLower(filepath.Ext(name)) {
	case ".png":
		return "image/png"
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".gif":
		return "image/gif"
	case ".webp":
		return "image/webp"
	case ".svg":
		return "image/svg+xml"
	default:
		return "" // để embedImage tự đoán qua http.DetectContentType
	}
}

// BuildZip đóng gói HTML thành file ZIP trong bộ nhớ, gồm index.html và README.txt.
func (s *ExportService) BuildZip(htmlContent string, landingPageName string) ([]byte, error) {
	var buf bytes.Buffer
	zw := zip.NewWriter(&buf)

	// Thêm index.html.
	indexFile, err := zw.Create("index.html")
	if err != nil {
		return nil, fmt.Errorf("tạo index.html trong ZIP thất bại: %w", err)
	}
	if _, err := indexFile.Write([]byte(htmlContent)); err != nil {
		return nil, fmt.Errorf("ghi index.html thất bại: %w", err)
	}

	// Thêm README.txt hướng dẫn sử dụng.
	readme := "Hướng dẫn sử dụng:\n" +
		"1. Giải nén file ZIP\n" +
		"2. Mở file index.html bằng trình duyệt\n" +
		"3. File hoạt động hoàn toàn offline, không cần server\n"
	readmeFile, err := zw.Create("README.txt")
	if err != nil {
		return nil, fmt.Errorf("tạo README.txt trong ZIP thất bại: %w", err)
	}
	if _, err := readmeFile.Write([]byte(readme)); err != nil {
		return nil, fmt.Errorf("ghi README.txt thất bại: %w", err)
	}

	// Bắt buộc đóng writer để flush toàn bộ dữ liệu ZIP vào buffer.
	if err := zw.Close(); err != nil {
		return nil, fmt.Errorf("đóng ZIP thất bại: %w", err)
	}
	return buf.Bytes(), nil
}

// pickString lấy giá trị string đầu tiên tìm được theo danh sách key ưu tiên.
func pickString(m map[string]interface{}, keys ...string) string {
	for _, k := range keys {
		if v, ok := m[k]; ok {
			switch val := v.(type) {
			case string:
				if val != "" {
					return val
				}
			case float64:
				return strings.TrimRight(strings.TrimRight(fmt.Sprintf("%f", val), "0"), ".")
			case bool:
				return fmt.Sprintf("%t", val)
			}
		}
	}
	return ""
}

// pickArray lấy mảng object đầu tiên tìm được theo danh sách key ưu tiên.
func pickArray(m map[string]interface{}, keys ...string) []map[string]interface{} {
	for _, k := range keys {
		v, ok := m[k]
		if !ok {
			continue
		}
		raw, ok := v.([]interface{})
		if !ok {
			continue
		}
		out := make([]map[string]interface{}, 0, len(raw))
		for _, item := range raw {
			if obj, ok := item.(map[string]interface{}); ok {
				out = append(out, obj)
			}
		}
		return out
	}
	return nil
}

// safeBgStyle làm sạch giá trị màu và trả về chuỗi style an toàn cho html/template.
// Chỉ chấp nhận ký tự hợp lệ của giá trị màu CSS để tránh chèn CSS độc hại.
func safeBgStyle(color string) template.CSS {
	color = strings.TrimSpace(color)
	if color == "" {
		return ""
	}
	for _, r := range color {
		switch {
		case r >= '0' && r <= '9',
			r >= 'a' && r <= 'z',
			r >= 'A' && r <= 'Z',
			r == '#', r == '(', r == ')', r == ',', r == '.', r == '%', r == ' ', r == '-':
			// hợp lệ
		default:
			return ""
		}
	}
	return template.CSS("background-color:" + color + ";")
}

// safeImageURL cho phép nguồn ảnh an toàn để dùng trong thuộc tính src.
// Chấp nhận data:image (base64 tự sinh), http(s), đường dẫn tương đối và neo #.
// Chặn các scheme lạ (vd: javascript:) bằng cách trả về rỗng — tránh XSS.
func safeImageURL(src string) template.URL {
	src = strings.TrimSpace(src)
	if src == "" {
		return ""
	}
	low := strings.ToLower(src)
	switch {
	case strings.HasPrefix(low, "data:image/"),
		strings.HasPrefix(low, "http://"),
		strings.HasPrefix(low, "https://"),
		strings.HasPrefix(src, "/"),
		strings.HasPrefix(src, "#"):
		return template.URL(src)
	default:
		return ""
	}
}

// fullHTMLTemplate là template HTML5 hoàn chỉnh, self-contained, dark theme.
var fullHTMLTemplate = template.Must(template.New("fullpage").Parse(`<!DOCTYPE html>
<html lang="vi">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>{{ .Title }}</title>
	<!-- Tailwind CSS qua CDN -->
	<script src="https://cdn.tailwindcss.com"></script>
	<!-- Google Fonts: Inter -->
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
	<!-- Material Symbols Outlined -->
	<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet">
	<style>
		:root { color-scheme: dark; }
		body {
			background-color: #131315;
			color: #e5e1e4;
			font-family: 'Inter', system-ui, sans-serif;
			margin: 0;
		}
		.material-symbols-outlined {
			font-family: 'Material Symbols Outlined';
			font-weight: normal;
			font-style: normal;
			font-size: 24px;
			line-height: 1;
			display: inline-block;
			vertical-align: middle;
		}
		a { color: inherit; }
	</style>
</head>
<body>
{{ range .Sections }}
{{ if eq .Type "hero" }}
	<section class="px-6 py-24 text-center" style="{{ .BgStyle }}">
		<div class="mx-auto max-w-3xl">
			{{ if .Title }}<h1 class="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">{{ .Title }}</h1>{{ end }}
			{{ if .Subtitle }}<p class="text-lg md:text-xl text-white/70 mb-10">{{ .Subtitle }}</p>{{ end }}
			{{ if .ButtonText }}<a href="#" class="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-black hover:bg-white/90 transition">{{ .ButtonText }}</a>{{ end }}
		</div>
	</section>
{{ else if eq .Type "features" }}
	<section class="px-6 py-20">
		<div class="mx-auto max-w-6xl">
			{{ if .Title }}<h2 class="text-3xl md:text-4xl font-bold text-center mb-14">{{ .Title }}</h2>{{ end }}
			<div class="grid gap-8 md:grid-cols-3">
				{{ range .Items }}
				<div class="rounded-2xl border border-white/10 bg-white/5 p-8">
					{{ if .Icon }}<span class="material-symbols-outlined mb-4 text-4xl text-white/80">{{ .Icon }}</span>{{ end }}
					{{ if .Title }}<h3 class="text-xl font-semibold mb-2">{{ .Title }}</h3>{{ end }}
					{{ if .Desc }}<p class="text-white/60">{{ .Desc }}</p>{{ end }}
				</div>
				{{ end }}
			</div>
		</div>
	</section>
{{ else if eq .Type "testimonials" }}
	<section class="px-6 py-20">
		<div class="mx-auto max-w-6xl">
			{{ if .Title }}<h2 class="text-3xl md:text-4xl font-bold text-center mb-14">{{ .Title }}</h2>{{ end }}
			<div class="grid gap-8 md:grid-cols-3">
				{{ range .Quotes }}
				<figure class="rounded-2xl border border-white/10 bg-white/5 p-8">
					{{ if .Text }}<blockquote class="text-white/80 mb-6">&ldquo;{{ .Text }}&rdquo;</blockquote>{{ end }}
					<figcaption class="flex items-center gap-3">
						{{ if .Avatar }}<img src="{{ .Avatar }}" alt="{{ .Author }}" class="h-10 w-10 rounded-full object-cover">{{ end }}
						{{ if .Author }}<span class="font-semibold">{{ .Author }}</span>{{ end }}
					</figcaption>
				</figure>
				{{ end }}
			</div>
		</div>
	</section>
{{ else if eq .Type "faq" }}
	<section class="px-6 py-20">
		<div class="mx-auto max-w-3xl">
			{{ if .Title }}<h2 class="text-3xl md:text-4xl font-bold text-center mb-14">{{ .Title }}</h2>{{ end }}
			<div class="space-y-4">
				{{ range .Faqs }}
				<details class="rounded-xl border border-white/10 bg-white/5 p-5">
					<summary class="cursor-pointer font-semibold">{{ .Question }}</summary>
					<p class="mt-3 text-white/60">{{ .Answer }}</p>
				</details>
				{{ end }}
			</div>
		</div>
	</section>
{{ else if eq .Type "cta" }}
	<section class="px-6 py-24 text-center">
		<div class="mx-auto max-w-3xl">
			{{ if .Title }}<h2 class="text-3xl md:text-5xl font-bold mb-5">{{ .Title }}</h2>{{ end }}
			{{ if .Subtitle }}<p class="text-lg text-white/70 mb-10">{{ .Subtitle }}</p>{{ end }}
			{{ if .ButtonText }}<a href="#" class="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-black hover:bg-white/90 transition">{{ .ButtonText }}</a>{{ end }}
		</div>
	</section>
{{ else if eq .Type "footer" }}
	<footer class="border-t border-white/10 px-6 py-12">
		<div class="mx-auto flex max-w-6xl flex-col items-center gap-4 md:flex-row md:justify-between">
			{{ if .Copyright }}<p class="text-sm text-white/50">{{ .Copyright }}</p>{{ end }}
			{{ if .Links }}
			<nav class="flex flex-wrap gap-6 text-sm text-white/60">
				{{ range .Links }}<a href="{{ .URL }}" class="hover:text-white">{{ .Label }}</a>{{ end }}
			</nav>
			{{ end }}
		</div>
	</footer>
{{ else }}
	<section class="px-6 py-16">
		<div class="mx-auto max-w-3xl">
			<h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">{{ .Type }}</h2>
			<pre class="overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">{{ .RawJSON }}</pre>
		</div>
	</section>
{{ end }}
{{ end }}
</body>
</html>`))

// fullHTMLTemplateOffline là template HTML5 offline hoàn toàn:
// CSS nhúng trực tiếp (không CDN), font hệ thống, ảnh đã ở dạng base64.
// Dùng class ngữ nghĩa thay cho Tailwind utility để CSS tự viết áp dụng được.
var fullHTMLTemplateOffline = template.Must(template.New("fullpage_offline").Parse(`<!DOCTYPE html>
<html lang="vi">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>{{ .Title }}</title>
	<style>
		:root { color-scheme: dark; }
		* { box-sizing: border-box; }
		body {
			margin: 0;
			background-color: #131315;
			color: #e5e1e4;
			font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
			line-height: 1.5;
		}
		a { color: inherit; text-decoration: none; }
		.container { max-width: 1100px; margin: 0 auto; }
		.container--narrow { max-width: 768px; }
		.section { padding: 80px 24px; }
		.hero, .cta { padding: 96px 24px; text-align: center; }
		.title { font-size: clamp(2rem, 5vw, 3.75rem); font-weight: 800; letter-spacing: -0.02em; margin: 0 0 24px; }
		.heading { font-size: clamp(1.6rem, 4vw, 2.5rem); font-weight: 700; text-align: center; margin: 0 0 56px; }
		.subtitle { font-size: 1.125rem; color: rgba(255,255,255,0.7); margin: 0 0 40px; }
		.btn {
			display: inline-block; background: #ffffff; color: #000000;
			padding: 12px 32px; border-radius: 8px; font-weight: 600;
		}
		.grid { display: grid; gap: 32px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
		.card {
			border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05);
			border-radius: 16px; padding: 32px;
		}
		.feature-icon {
			width: 44px; height: 44px; border-radius: 12px;
			background: rgba(255,255,255,0.1); margin-bottom: 16px;
		}
		.card-title { font-size: 1.25rem; font-weight: 600; margin: 0 0 8px; }
		.muted { color: rgba(255,255,255,0.6); margin: 0; }
		.quote { color: rgba(255,255,255,0.8); margin: 0 0 24px; }
		.figcaption { display: flex; align-items: center; gap: 12px; }
		.avatar { width: 40px; height: 40px; border-radius: 9999px; object-fit: cover; }
		.author { font-weight: 600; }
		.faq-list { display: flex; flex-direction: column; gap: 16px; }
		.faq-item {
			border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05);
			border-radius: 12px; padding: 20px;
		}
		.faq-item summary { cursor: pointer; font-weight: 600; }
		.faq-item p { margin: 12px 0 0; color: rgba(255,255,255,0.6); }
		.footer { border-top: 1px solid rgba(255,255,255,0.1); padding: 48px 24px; }
		.footer-inner { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between; }
		.footer-links { display: flex; flex-wrap: wrap; gap: 24px; font-size: 0.875rem; color: rgba(255,255,255,0.6); }
		.copyright { font-size: 0.875rem; color: rgba(255,255,255,0.5); margin: 0; }
		.generic-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); margin: 0 0 16px; }
		pre {
			overflow-x: auto; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05);
			border-radius: 12px; padding: 20px; font-size: 0.875rem; color: rgba(255,255,255,0.7);
		}
	</style>
</head>
<body>
{{ range .Sections }}
{{ if eq .Type "hero" }}
	<section class="hero" style="{{ .BgStyle }}">
		<div class="container container--narrow">
			{{ if .Title }}<h1 class="title">{{ .Title }}</h1>{{ end }}
			{{ if .Subtitle }}<p class="subtitle">{{ .Subtitle }}</p>{{ end }}
			{{ if .ButtonText }}<a href="#" class="btn">{{ .ButtonText }}</a>{{ end }}
		</div>
	</section>
{{ else if eq .Type "features" }}
	<section class="section">
		<div class="container">
			{{ if .Title }}<h2 class="heading">{{ .Title }}</h2>{{ end }}
			<div class="grid">
				{{ range .Items }}
				<div class="card">
					<div class="feature-icon" title="{{ .Icon }}"></div>
					{{ if .Title }}<h3 class="card-title">{{ .Title }}</h3>{{ end }}
					{{ if .Desc }}<p class="muted">{{ .Desc }}</p>{{ end }}
				</div>
				{{ end }}
			</div>
		</div>
	</section>
{{ else if eq .Type "testimonials" }}
	<section class="section">
		<div class="container">
			{{ if .Title }}<h2 class="heading">{{ .Title }}</h2>{{ end }}
			<div class="grid">
				{{ range .Quotes }}
				<figure class="card">
					{{ if .Text }}<blockquote class="quote">&ldquo;{{ .Text }}&rdquo;</blockquote>{{ end }}
					<figcaption class="figcaption">
						{{ if .Avatar }}<img src="{{ .Avatar }}" alt="{{ .Author }}" class="avatar">{{ end }}
						{{ if .Author }}<span class="author">{{ .Author }}</span>{{ end }}
					</figcaption>
				</figure>
				{{ end }}
			</div>
		</div>
	</section>
{{ else if eq .Type "faq" }}
	<section class="section">
		<div class="container container--narrow">
			{{ if .Title }}<h2 class="heading">{{ .Title }}</h2>{{ end }}
			<div class="faq-list">
				{{ range .Faqs }}
				<details class="faq-item">
					<summary>{{ .Question }}</summary>
					<p>{{ .Answer }}</p>
				</details>
				{{ end }}
			</div>
		</div>
	</section>
{{ else if eq .Type "cta" }}
	<section class="cta">
		<div class="container container--narrow">
			{{ if .Title }}<h2 class="title">{{ .Title }}</h2>{{ end }}
			{{ if .Subtitle }}<p class="subtitle">{{ .Subtitle }}</p>{{ end }}
			{{ if .ButtonText }}<a href="#" class="btn">{{ .ButtonText }}</a>{{ end }}
		</div>
	</section>
{{ else if eq .Type "footer" }}
	<footer class="footer">
		<div class="container footer-inner">
			{{ if .Copyright }}<p class="copyright">{{ .Copyright }}</p>{{ end }}
			{{ if .Links }}
			<nav class="footer-links">
				{{ range .Links }}<a href="{{ .URL }}">{{ .Label }}</a>{{ end }}
			</nav>
			{{ end }}
		</div>
	</footer>
{{ else }}
	<section class="section">
		<div class="container container--narrow">
			<h2 class="generic-label">{{ .Type }}</h2>
			<pre>{{ .RawJSON }}</pre>
		</div>
	</section>
{{ end }}
{{ end }}
</body>
</html>`))

// ExportToPDF dùng go-wkhtmltopdf convert chuỗi HTML sang PDF, trả về []byte.
func (s *ExportService) ExportToPDF(htmlContent string) ([]byte, error) {
	// Khởi tạo generator (yêu cầu binary wkhtmltopdf có trong PATH của máy chủ).
	pdfg, err := wkhtmltopdf.NewPDFGenerator()
	if err != nil {
		return nil, fmt.Errorf("khởi tạo trình tạo PDF thất bại: %w", err)
	}

	// Nạp HTML từ chuỗi vào 1 page.
	page := wkhtmltopdf.NewPageReader(strings.NewReader(htmlContent))
	pdfg.AddPage(page)

	// Cấu hình cơ bản.
	pdfg.Dpi.Set(300)
	pdfg.Orientation.Set(wkhtmltopdf.OrientationPortrait)

	// Thực thi convert.
	if err := pdfg.Create(); err != nil {
		return nil, fmt.Errorf("tạo PDF thất bại: %w", err)
	}

	return pdfg.Bytes(), nil
}
