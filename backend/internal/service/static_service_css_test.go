package service

import (
	"regexp"
	"sort"
	"strings"
	"testing"

	"gorm.io/datatypes"

	"github.com/nhienthai/lading-custom/backend/internal/models"
)

// Class do renderer sinh ra nhưng KHÔNG cần quy tắc trong <style> của trang
// publish: hoặc là hook ngữ nghĩa dùng cho selector khác, hoặc do CSS sẵn có
// định nghĩa theo cách riêng.
var classKhongCanQuyTacRieng = map[string]bool{
	"hero-section":         true,
	"cta-section":          true,
	"features-section":     true,
	"testimonials-section": true,
	"faq-section":          true,
	"footer-section":       true,
	"generic-section":      true,
	"feature-card":         true,
	"quote-card":           true,
	"faq-item":             true,
	"preview-root":         true,
	"preview-empty":        true,
	"preview-grid":         true, // có quy tắc riêng + media query
	"static-root":          true,
	"static-empty":         true,
}

var reClassAttr = regexp.MustCompile(`class="([^"]*)"`)

// classTrongHTML rút mọi tên class xuất hiện trong đoạn HTML.
func classTrongHTML(html string) []string {
	var out []string
	for _, m := range reClassAttr.FindAllStringSubmatch(html, -1) {
		for _, c := range strings.Fields(m[1]) {
			out = append(out, c)
		}
	}
	return out
}

// cssCoDinhNghia kiểm tra layout publish có quy tắc cho class này không.
// Dấu "/" và ":" trong tên class Tailwind phải được escape bằng "\" trong CSS.
func cssCoDinhNghia(css, class string) bool {
	escaped := strings.NewReplacer("/", `\/`, ":", `\:`).Replace(class)
	return strings.Contains(css, "."+escaped+" ") ||
		strings.Contains(css, "."+escaped+"{") ||
		strings.Contains(css, "."+escaped+",") ||
		strings.Contains(css, "."+escaped+":")
}

func sectionMau(sectionType, contentJSON string) models.PageSection {
	return models.PageSection{
		SectionType: sectionType,
		Content:     datatypes.JSON([]byte(contentJSON)),
		IsVisible:   true,
	}
}

// Trang publish không còn tải Tailwind từ CDN, nên MỌI utility mà renderer sinh
// ra phải có quy tắc nhúng sẵn trong layout. Thiếu một class là trang khách hàng
// vỡ layout ở đúng chỗ đó — và hỏng âm thầm, không có lỗi nào được ném ra.
func TestLayoutPublish_PhuHetClassMaRendererSinhRa(t *testing.T) {
	svc := &PreviewService{}

	sections := []models.PageSection{
		sectionMau("hero", `{"title":"A","subtitle":"B","button_text":"C","button_url":"https://x.com"}`),
		sectionMau("cta", `{"title":"A","subtitle":"B","button_text":"C","button_url":"https://x.com"}`),
		sectionMau("features", `{"title":"A","items":[{"title":"i1","description":"d1","icon":"star"}]}`),
		sectionMau("testimonials", `{"title":"A","items":[{"quote":"q","author":"n","role":"r"}]}`),
		sectionMau("faq", `{"title":"A","items":[{"question":"q","answer":"a"}]}`),
		sectionMau("footer", `{"text":"A","links":[{"label":"l","url":"https://x.com"}]}`),
		sectionMau("khong-ton-tai", `{}`),
	}

	// Kiểm cả 2 layout: publish và preview trong editor. Hai bên chạy cùng bộ
	// renderer nên cùng tập class; layout nào thiếu là bên đó hiển thị sai.
	layouts := map[string]string{
		"trang publish":        renderPageHTMLChoTest(t),
		"preview trong editor": renderPreviewHTMLChoTest(t),
	}

	for tenLayout, css := range layouts {
		t.Run(tenLayout, func(t *testing.T) {
			thieu := map[string]bool{}
			for _, sec := range sections {
				html, err := svc.RenderSectionHTML(sec)
				if err != nil {
					t.Fatalf("render %s lỗi: %v", sec.SectionType, err)
				}
				for _, class := range classTrongHTML(html) {
					if classKhongCanQuyTacRieng[class] {
						continue
					}
					if !cssCoDinhNghia(css, class) {
						thieu[class] = true
					}
				}
			}

			if len(thieu) > 0 {
				var ds []string
				for c := range thieu {
					ds = append(ds, c)
				}
				sort.Strings(ds)
				t.Fatalf("%s thiếu quy tắc CSS cho %d class: %s\n"+
					"=> renderer sinh ra class này nhưng layout không có style cho nó",
					tenLayout, len(ds), strings.Join(ds, ", "))
			}
		})
	}
}

// Chốt lại điều kiện tiên quyết: nếu ai đó thêm lại thẻ script CDN thì test này
// đỏ ngay, kèm lý do.
func TestLayout_KhongPhuThuocTailwindCDN(t *testing.T) {
	layouts := map[string]string{
		"trang publish":        renderPageHTMLChoTest(t),
		"preview trong editor": renderPreviewHTMLChoTest(t),
	}

	for ten, html := range layouts {
		if strings.Contains(html, "cdn.tailwindcss.com") {
			t.Errorf("%s không được tải Tailwind từ CDN: đó là bản dev (biên dịch "+
				"CSS trong trình duyệt) và biến trang thành phụ thuộc vào một host "+
				"bên ngoài", ten)
		}
	}
}

func renderPreviewHTMLChoTest(t *testing.T) string {
	t.Helper()

	svc := &PreviewService{}
	html := svc.WrapFullHTML(
		[]string{`<section class="hero-section"></section>`},
		"Trang Thử", "desktop", "",
	)
	if html == "" {
		t.Fatal("WrapFullHTML trả chuỗi rỗng")
	}
	return html
}

func renderPageHTMLChoTest(t *testing.T) string {
	t.Helper()

	svc := &StaticService{}
	html := svc.wrapStaticHTML(
		[]string{`<section class="hero-section"></section>`},
		"Trang Thử",
		"mô tả",
	)
	if html == "" {
		t.Fatal("wrapStaticHTML trả chuỗi rỗng")
	}
	return html
}
