package service

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"html/template"
	"sort"
	"strings"

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

// BuildHTML sinh HTML đơn giản từ landing page và danh sách section.
// Mỗi section content (JSONB) được phẳng hóa thành các cặp key/value để hiển thị.
func (s *ExportService) BuildHTML(page *models.LandingPage, sections []models.PageSection) (string, error) {
	if page == nil {
		return "", errors.New("landing page rỗng")
	}

	data := pageTemplateData{
		Title:    page.Name,
		Sections: make([]sectionView, 0, len(sections)),
	}

	for _, sec := range sections {
		// Bỏ qua section bị ẩn.
		if !sec.IsVisible {
			continue
		}

		sv := sectionView{Type: sec.SectionType}

		// Parse content JSONB thành map để lấy các trường text hiển thị.
		if len(sec.Content) > 0 {
			var raw map[string]interface{}
			if err := json.Unmarshal(sec.Content, &raw); err == nil {
				// Sắp xếp key để thứ tự render ổn định (deterministic).
				keys := make([]string, 0, len(raw))
				for k := range raw {
					keys = append(keys, k)
				}
				sort.Strings(keys)

				for _, k := range keys {
					sv.Fields = append(sv.Fields, fieldKV{
						Key:   k,
						Value: stringifyValue(raw[k]),
					})
				}
			}
		}

		data.Sections = append(data.Sections, sv)
	}

	var buf bytes.Buffer
	if err := htmlTemplate.Execute(&buf, data); err != nil {
		return "", fmt.Errorf("sinh HTML thất bại: %w", err)
	}
	return buf.String(), nil
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
