package service

import (
	"archive/zip"
	"bytes"
	"io"
	"strconv"
	"strings"
	"testing"

	"github.com/google/uuid"
	"gorm.io/datatypes"

	"github.com/nhienthai/lading-custom/backend/internal/models"
)

func canonicalTestPage() *models.LandingPage {
	return &models.LandingPage{
		LandingPageID: uuid.New(),
		Name:          "Trang mặc định",
		SEOSettings: datatypes.JSON([]byte(`{
			"title":"TC04 SEO Test Title",
			"description":"TC04 SEO Test Description",
			"keywords":"tc04, seo",
			"og_image":"https://example.com/og.png",
			"favicon":"/uploads/favicon.png"
		}`)),
	}
}

func TestCanonicalRenderer_RenderGraphVaSEO(t *testing.T) {
	section := sectionMau("custom", `{
		"elements":[
			{"id":"root","type":"section","content":"","x":0,"y":0,"parentId":null,"style":{"width":896,"height":360,"bgColor":"#ffffff"}},
			{"id":"heading","type":"heading","content":"Tiêu đề canonical","x":40,"y":30,"parentId":"root","style":{"width":500,"height":55,"fontSize":36,"fontWeight":800,"color":"#111827"}},
			{"id":"button","type":"button","content":"Bắt đầu","x":40,"y":110,"parentId":"root","style":{"width":140,"height":44,"bgColor":"#2563eb","color":"#ffffff"},"link":{"type":"section","targetSectionId":"root"}},
			{"id":"card","type":"card","content":"Gói Pro|Nội dung thẻ","x":220,"y":100,"parentId":"root","style":{"width":220,"height":140,"bgColor":"#f8fafc"}}
		]
	}`)

	output, err := RenderLandingPageHTML(canonicalTestPage(), []models.PageSection{section}, PageRenderOptions{})
	if err != nil {
		t.Fatalf("render canonical lỗi: %v", err)
	}
	for _, expected := range []string{
		"Tiêu đề canonical", "Bắt đầu", "Gói Pro", "Nội dung thẻ",
		"<title>TC04 SEO Test Title</title>",
		`name="description" content="TC04 SEO Test Description"`,
		`name="keywords" content="tc04, seo"`,
		`property="og:image" content="https://example.com/og.png"`,
		`rel="icon" href="/uploads/favicon.png"`,
	} {
		if !strings.Contains(output, expected) {
			t.Errorf("output thiếu %q", expected)
		}
	}
	for _, forbidden := range []string{"Section: custom", "elements: [{", `"elements"`} {
		if strings.Contains(output, forbidden) {
			t.Errorf("output còn chứa fallback/debug %q", forbidden)
		}
	}
}

func TestCanonicalRenderer_SEOFallbackChoTrangCu(t *testing.T) {
	page := &models.LandingPage{LandingPageID: uuid.New(), Name: "Tên Landing Page cũ"}
	section := sectionMau("custom", `{"elements":[
		{"id":"root","type":"section","parentId":null,"style":{"width":896,"height":160}},
		{"id":"paragraph","type":"paragraph","content":"Mô tả lấy từ nội dung canonical","x":20,"y":20,"parentId":"root","style":{"width":500,"height":60}}
	]}`)

	output, err := RenderLandingPageHTML(page, []models.PageSection{section}, PageRenderOptions{})
	if err != nil {
		t.Fatalf("render SEO fallback lỗi: %v", err)
	}
	for _, expected := range []string{
		"<title>Tên Landing Page cũ</title>",
		`name="description" content="Mô tả lấy từ nội dung canonical"`,
		`property="og:title" content="Tên Landing Page cũ"`,
	} {
		if !strings.Contains(output, expected) {
			t.Errorf("output thiếu SEO fallback %q", expected)
		}
	}
}

func TestCanonicalRenderer_HoTroTatCaLoaiElementUserBuilder(t *testing.T) {
	types := []string{
		"heading", "paragraph", "label", "list", "quote", "button", "image",
		"gallery", "icon", "divider", "box", "input", "textarea", "checkbox",
		"select", "video", "section", "countdown", "rating", "progress", "table",
		"menu", "embed", "card", "iconbox", "spacer",
	}
	elements := []string{`{"id":"root","type":"section","parentId":null,"style":{"width":896,"height":2400}}`}
	for index, elementType := range types {
		content := "Nội dung " + elementType
		if elementType == "image" {
			content = "https://example.com/image.png"
		} else if elementType == "rating" || elementType == "progress" || elementType == "gallery" {
			content = "3"
		} else if elementType == "table" {
			content = "Tên|Vai trò\\nAn|Admin"
		}
		elements = append(elements, `{"id":"e`+string(rune('a'+index))+`","type":"`+elementType+`","content":`+strconv.Quote(content)+`,"x":10,"y":`+strconv.Itoa(20+index*80)+`,"parentId":"root","style":{"width":240,"height":60}}`)
	}
	section := sectionMau("custom", `{"elements":[`+strings.Join(elements, ",")+`]}`)

	output, err := RenderLandingPageHTML(canonicalTestPage(), []models.PageSection{section}, PageRenderOptions{})
	if err != nil {
		t.Fatalf("render danh sách element lỗi: %v", err)
	}
	for _, elementType := range types {
		if !strings.Contains(output, "lp-"+elementType) {
			t.Errorf("renderer chưa tạo output cho type %s", elementType)
		}
	}
}

func TestCanonicalRenderer_FallbackLegacyVaGraphHong(t *testing.T) {
	legacy := sectionMau("hero", `{"title":"Hero legacy","subtitle":"Vẫn hoạt động"}`)
	broken := sectionMau("custom", `{"elements":[
		{"id":"a","type":"heading","content":"A","parentId":"b","style":{}},
		{"id":"b","type":"heading","content":"B","parentId":"a","style":{}}
	]}`)

	output, err := RenderLandingPageHTML(canonicalTestPage(), []models.PageSection{legacy, broken}, PageRenderOptions{})
	if err != nil {
		t.Fatalf("render trang hỗn hợp lỗi: %v", err)
	}
	if !strings.Contains(output, "Hero legacy") {
		t.Fatal("nội dung legacy bị mất")
	}
	if !strings.Contains(output, "Section: custom") {
		t.Fatal("graph cycle phải fallback an toàn thay vì làm sập trang")
	}
}

func TestCanonicalRenderer_StyleMobileVaAnToan(t *testing.T) {
	section := sectionMau("custom", `{"elements":[
		{"id":"root","type":"section","parentId":null,"style":{"width":896,"height":240,"backgroundImage":"/uploads/hero.png"}},
		{"id":"heading","type":"heading","content":"<script>alert(1)</script>","x":20,"y":20,"parentId":"root","style":{"width":400,"height":60,"fontSize":32},"mobile":{"x":10,"y":12,"style":{"width":260,"fontSize":22,"color":"#334155"}}},
		{"id":"divider","type":"divider","content":"","x":20,"y":100,"parentId":"root","style":{"width":300,"height":12,"lineWidth":4,"borderStyle":"dashed","color":"#112233"}},
		{"id":"orphan","type":"button","content":"Liên kết an toàn","x":0,"y":180,"parentId":"missing","style":{"width":120,"height":40},"link":{"url":"javascript:alert(1)"}},
		{"id":"hidden","type":"paragraph","content":"Không được render","x":0,"y":0,"parentId":"root","hidden":true,"style":{}}
	]}`)

	output, err := RenderLandingPageHTML(canonicalTestPage(), []models.PageSection{section}, PageRenderOptions{
		ImageTransform: func(string) string { return "data:image/png;base64,AA==" },
	})
	if err != nil {
		t.Fatalf("render style/mobile lỗi: %v", err)
	}
	for _, expected := range []string{
		"&lt;script&gt;alert(1)&lt;/script&gt;",
		"border-top:4px dashed #112233",
		"data:image/png;base64,AA==",
		"left:10px", "top:12px", "font-size:22px", "color:#334155",
		`href="#"`, "Liên kết an toàn",
	} {
		if !strings.Contains(output, expected) {
			t.Errorf("output thiếu %q", expected)
		}
	}
	if strings.Contains(output, "Không được render") || strings.Contains(output, "<script>") {
		t.Fatal("output render element ẩn hoặc HTML không escape")
	}
}

func TestExportService_DungCanonicalRendererChoPDFVaHTMLZip(t *testing.T) {
	section := sectionMau("team", `{"elements":[
		{"id":"root","type":"section","parentId":null,"style":{"width":896,"height":280}},
		{"id":"heading","type":"heading","content":"Nội dung export canonical","x":24,"y":24,"parentId":"root","style":{"width":600,"height":60}}
	]}`)
	service := &ExportService{}

	pdfInput, err := service.BuildHTML(canonicalTestPage(), []models.PageSection{section})
	if err != nil {
		t.Fatalf("sinh HTML đầu vào PDF lỗi: %v", err)
	}
	assertCanonicalExportHTML(t, pdfInput)

	htmlInput, err := service.BuildFullHTML(canonicalTestPage(), []models.PageSection{section})
	if err != nil {
		t.Fatalf("sinh HTML export lỗi: %v", err)
	}
	assertCanonicalExportHTML(t, htmlInput)
	offlineHTML, err := service.BuildFullHTMLOffline(canonicalTestPage(), []models.PageSection{section})
	if err != nil {
		t.Fatalf("sinh HTML export offline lỗi: %v", err)
	}
	assertCanonicalExportHTML(t, offlineHTML)

	zipBytes, err := service.BuildZip(htmlInput, "Trang canonical")
	if err != nil {
		t.Fatalf("đóng gói ZIP lỗi: %v", err)
	}
	zipReader, err := zip.NewReader(bytes.NewReader(zipBytes), int64(len(zipBytes)))
	if err != nil {
		t.Fatalf("đọc ZIP lỗi: %v", err)
	}
	files := map[string]string{}
	for _, file := range zipReader.File {
		reader, openErr := file.Open()
		if openErr != nil {
			t.Fatalf("mở %s trong ZIP lỗi: %v", file.Name, openErr)
		}
		data, readErr := io.ReadAll(reader)
		_ = reader.Close()
		if readErr != nil {
			t.Fatalf("đọc %s trong ZIP lỗi: %v", file.Name, readErr)
		}
		files[file.Name] = string(data)
	}
	if _, ok := files["README.txt"]; !ok {
		t.Fatal("ZIP thiếu README.txt")
	}
	assertCanonicalExportHTML(t, files["index.html"])
}

func assertCanonicalExportHTML(t *testing.T, output string) {
	t.Helper()
	if !strings.Contains(output, "Nội dung export canonical") {
		t.Fatal("output thiếu element canonical")
	}
	for _, forbidden := range []string{"Section: team", "elements: [{", `\"elements\"`} {
		if strings.Contains(output, forbidden) {
			t.Fatalf("output còn chứa placeholder/debug %q", forbidden)
		}
	}
}
