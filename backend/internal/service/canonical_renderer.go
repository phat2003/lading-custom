package service

import (
	"encoding/json"
	"fmt"
	"html"
	"math"
	"strconv"
	"strings"

	"github.com/nhienthai/lading-custom/backend/internal/models"
)

const canonicalDesktopWidth = 896

// PageRenderOptions cho phép các output dùng cùng semantics nhưng thay nguồn ảnh
// (HTML offline nhúng base64) và viewport khi cần.
type PageRenderOptions struct {
	Device         string
	ImageTransform func(string) string
}

type canonicalContent struct {
	Elements []canonicalElement `json:"elements"`
}

type canonicalElement struct {
	ID       string                 `json:"id"`
	Type     string                 `json:"type"`
	Content  interface{}            `json:"content"`
	X        float64                `json:"x"`
	Y        float64                `json:"y"`
	ParentID string                 `json:"parentId"`
	Style    map[string]interface{} `json:"style"`
	Mobile   *canonicalMobile       `json:"mobile"`
	Hidden   bool                   `json:"hidden"`
	Link     map[string]interface{} `json:"link"`
}

type canonicalMobile struct {
	X     *float64               `json:"x"`
	Y     *float64               `json:"y"`
	Style map[string]interface{} `json:"style"`
}

type canonicalRenderContext struct {
	elements       map[string]canonicalElement
	children       map[string][]string
	cssIDs         map[string]string
	prefix         string
	nextCSSID      int
	imageTransform func(string) string
}

// RenderLandingPageHTML là renderer tài liệu dùng chung cho preview, publish,
// PDF và HTML export. Dữ liệu canonical được render theo graph; dữ liệu legacy
// tiếp tục đi qua renderer cũ để không làm hỏng Landing Page đã tồn tại.
func RenderLandingPageHTML(page *models.LandingPage, sections []models.PageSection, options PageRenderOptions) (string, error) {
	if page == nil {
		return "", fmt.Errorf("landing page rỗng")
	}

	var body strings.Builder
	var responsiveCSS strings.Builder
	legacy := &PreviewService{}
	visibleIndex := 0
	for _, section := range sections {
		if !section.IsVisible {
			continue
		}
		fragment, mobileCSS, canonical, err := renderCanonicalSection(section, fmt.Sprintf("lp-s%d", visibleIndex), options.ImageTransform)
		if err != nil {
			// Section canonical hỏng không được làm sập toàn trang; hiển thị fallback an toàn.
			fragment = renderGenericSection(section.SectionType)
			canonical = true
		}
		if !canonical {
			fragment, err = legacy.renderLegacySectionHTML(section)
			if err != nil {
				fragment = renderGenericSection(section.SectionType)
			}
		}
		body.WriteString(fragment)
		responsiveCSS.WriteString(mobileCSS)
		visibleIndex++
	}

	seo := page.SEO()
	title := strings.TrimSpace(seo.Title)
	if title == "" {
		title = page.Name
	}
	description := strings.TrimSpace(seo.Description)
	if description == "" {
		description = buildSEODescription(sections)
	}
	keywords := strings.TrimSpace(seo.Keywords)
	ogImage := safeCanonicalImageURL(seo.OGImage, nil)
	favicon := safeCanonicalImageURL(seo.Favicon, nil)

	maxWidth := canonicalDesktopWidth
	if NormalizeDevice(options.Device) == DeviceTablet {
		maxWidth = 768
	} else if NormalizeDevice(options.Device) == DeviceMobile {
		maxWidth = 390
	}

	var head strings.Builder
	head.WriteString("<title>" + html.EscapeString(title) + "</title>")
	if description != "" {
		escaped := html.EscapeString(description)
		head.WriteString(`<meta name="description" content="` + escaped + `">`)
		head.WriteString(`<meta property="og:description" content="` + escaped + `">`)
	}
	if keywords != "" {
		head.WriteString(`<meta name="keywords" content="` + html.EscapeString(keywords) + `">`)
	}
	head.WriteString(`<meta property="og:type" content="website">`)
	head.WriteString(`<meta property="og:title" content="` + html.EscapeString(title) + `">`)
	if ogImage != "" {
		head.WriteString(`<meta property="og:image" content="` + html.EscapeString(ogImage) + `">`)
	}
	if favicon != "" {
		head.WriteString(`<link rel="icon" href="` + html.EscapeString(favicon) + `">`)
	}

	return `<!doctype html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">` +
		head.String() + `<style>` + canonicalPageCSS + fmt.Sprintf(`.lp-page{max-width:%dpx}`, maxWidth) +
		responsiveCSS.String() + `</style></head><body><main class="lp-page">` + body.String() +
		`</main></body></html>`, nil
}

func renderCanonicalSection(section models.PageSection, prefix string, imageTransform func(string) string) (string, string, bool, error) {
	var content canonicalContent
	if len(section.Content) == 0 || json.Unmarshal(section.Content, &content) != nil || len(content.Elements) == 0 {
		return "", "", false, nil
	}

	ctx := &canonicalRenderContext{
		elements:       make(map[string]canonicalElement),
		children:       make(map[string][]string),
		cssIDs:         make(map[string]string),
		prefix:         prefix,
		imageTransform: imageTransform,
	}
	order := make([]string, 0, len(content.Elements))
	for index, element := range content.Elements {
		id := strings.TrimSpace(element.ID)
		if id == "" || ctx.elements[id].ID != "" {
			id = fmt.Sprintf("__element_%d", index)
		}
		element.ID = id
		ctx.elements[id] = element
		order = append(order, id)
	}

	roots := make([]string, 0, 1)
	for _, id := range order {
		element := ctx.elements[id]
		if element.ParentID == "" || ctx.elements[element.ParentID].ID == "" {
			roots = append(roots, id)
			continue
		}
		ctx.children[element.ParentID] = append(ctx.children[element.ParentID], id)
	}
	if len(roots) == 0 {
		return "", "", true, fmt.Errorf("graph canonical không có phần tử gốc")
	}

	var fragment strings.Builder
	var mobileCSS strings.Builder
	path := make(map[string]bool)
	for _, rootID := range roots {
		part, css := ctx.renderElement(rootID, true, path)
		fragment.WriteString(part)
		mobileCSS.WriteString(css)
	}
	return fragment.String(), mobileCSS.String(), true, nil
}

func (ctx *canonicalRenderContext) renderElement(id string, root bool, path map[string]bool) (string, string) {
	element, ok := ctx.elements[id]
	if !ok || element.Hidden || path[id] {
		return "", ""
	}
	path[id] = true
	defer delete(path, id)

	cssID := ctx.cssIDs[id]
	if cssID == "" {
		ctx.nextCSSID++
		cssID = fmt.Sprintf("%s-e%d", ctx.prefix, ctx.nextCSSID)
		ctx.cssIDs[id] = cssID
	}

	var children strings.Builder
	var mobileCSS strings.Builder
	for _, childID := range ctx.children[id] {
		part, css := ctx.renderElement(childID, false, path)
		children.WriteString(part)
		mobileCSS.WriteString(css)
	}
	if rule := mobileRule(cssID, element, root, ctx.imageTransform); rule != "" {
		mobileCSS.WriteString(rule)
	}

	tag := "div"
	className := "lp-element lp-" + safeClassToken(element.Type)
	if root && element.Type == "section" {
		tag = "section"
		className = "lp-canonical-section"
	}
	anchor := ""
	if element.Type == "section" {
		anchor = ` id="lp-section-` + html.EscapeString(element.ID) + `"`
	}
	style := elementWrapperStyle(element, root, ctx.imageTransform)
	inner := ctx.renderElementContent(element)
	return `<` + tag + ` id="` + cssID + `" data-canonical-id="` + html.EscapeString(element.ID) + `" class="` + className + `" style="` + html.EscapeString(style) + `"><div` + anchor + ` class="lp-element-frame">` + inner + children.String() + `</div></` + tag + `>`, mobileCSS.String()
}

func (ctx *canonicalRenderContext) renderElementContent(element canonicalElement) string {
	content := canonicalText(element.Content)
	textStyle := canonicalTextStyle(element.Style)
	typeName := strings.ToLower(strings.TrimSpace(element.Type))
	switch typeName {
	case "section", "box":
		return ""
	case "heading":
		return `<h1 class="lp-fill lp-text" style="` + html.EscapeString(textStyle) + `">` + html.EscapeString(content) + `</h1>`
	case "paragraph":
		return `<p class="lp-fill lp-text" style="` + html.EscapeString(textStyle) + `">` + html.EscapeString(content) + `</p>`
	case "label":
		return `<div class="lp-fill lp-text" style="` + html.EscapeString(textStyle) + `">` + html.EscapeString(content) + `</div>`
	case "button":
		return `<a class="lp-fill lp-button" href="` + html.EscapeString(canonicalLink(element)) + `" style="` + html.EscapeString(textStyle) + `">` + html.EscapeString(defaultText(content, "Nút bấm")) + `</a>`
	case "image":
		src := safeCanonicalImageURL(content, ctx.imageTransform)
		if src == "" {
			return `<div class="lp-fill lp-placeholder">Ảnh</div>`
		}
		return `<img class="lp-fill lp-image" src="` + html.EscapeString(src) + `" alt="">`
	case "gallery":
		count, _ := strconv.Atoi(content)
		if count <= 0 || count > 24 {
			count = 3
		}
		var out strings.Builder
		out.WriteString(`<div class="lp-fill lp-gallery">`)
		for i := 0; i < count; i++ {
			out.WriteString(`<div class="lp-placeholder">Ảnh</div>`)
		}
		out.WriteString(`</div>`)
		return out.String()
	case "video":
		if embed := youtubeEmbedURL(content); embed != "" {
			return `<iframe class="lp-fill" src="` + html.EscapeString(embed) + `" title="Video" allowfullscreen></iframe>`
		}
		if src := safeCanonicalMediaURL(content); src != "" {
			return `<video class="lp-fill" src="` + html.EscapeString(src) + `" controls></video>`
		}
		return `<div class="lp-fill lp-placeholder">Video</div>`
	case "input":
		return `<input class="lp-fill lp-form-control" placeholder="` + html.EscapeString(content) + `" disabled>`
	case "textarea":
		return `<textarea class="lp-fill lp-form-control" placeholder="` + html.EscapeString(content) + `" disabled></textarea>`
	case "checkbox":
		return `<label class="lp-fill lp-checkbox" style="` + html.EscapeString(textStyle) + `"><input type="checkbox" disabled> ` + html.EscapeString(content) + `</label>`
	case "select":
		var out strings.Builder
		out.WriteString(`<select class="lp-fill lp-form-control" disabled>`)
		for _, option := range nonEmptyLines(content) {
			out.WriteString(`<option>` + html.EscapeString(option) + `</option>`)
		}
		out.WriteString(`</select>`)
		return out.String()
	case "list":
		var out strings.Builder
		out.WriteString(`<ul class="lp-fill lp-list" style="` + html.EscapeString(textStyle) + `">`)
		for _, item := range nonEmptyLines(content) {
			out.WriteString(`<li>` + html.EscapeString(item) + `</li>`)
		}
		out.WriteString(`</ul>`)
		return out.String()
	case "quote":
		return `<blockquote class="lp-fill lp-quote" style="` + html.EscapeString(textStyle) + `">` + html.EscapeString(content) + `</blockquote>`
	case "table":
		return renderCanonicalTable(content, textStyle)
	case "menu":
		var out strings.Builder
		out.WriteString(`<nav class="lp-fill lp-menu" style="` + html.EscapeString(textStyle) + `">`)
		for _, item := range nonEmptyLines(content) {
			out.WriteString(`<span>` + html.EscapeString(item) + `</span>`)
		}
		out.WriteString(`</nav>`)
		return out.String()
	case "rating":
		value, _ := strconv.Atoi(content)
		value = max(0, min(5, value))
		return `<div class="lp-fill lp-rating" style="` + html.EscapeString(textStyle) + `">` + strings.Repeat("★", value) + strings.Repeat("☆", 5-value) + `</div>`
	case "progress":
		value, _ := strconv.Atoi(content)
		value = max(0, min(100, value))
		barColor := safeCSSAtom(stringValue(element.Style, "color"))
		if barColor == "" {
			barColor = "#2563eb"
		}
		return fmt.Sprintf(`<div class="lp-fill lp-progress"><span style="width:%d%%;background:%s"></span></div>`, value, html.EscapeString(barColor))
	case "divider":
		lineWidth := 2.0
		if value, ok := numberValue(element.Style, "lineWidth"); ok && value > 0 {
			lineWidth = value
		}
		lineStyle := safeBorderStyle(stringValue(element.Style, "borderStyle"))
		lineColor := safeCSSAtom(stringValue(element.Style, "color"))
		if lineColor == "" {
			lineColor = "#d1d5db"
		}
		dividerStyle := fmt.Sprintf("border-top:%gpx %s %s", lineWidth, lineStyle, lineColor)
		return `<div class="lp-fill lp-divider" style="` + html.EscapeString(dividerStyle) + `"></div>`
	case "spacer":
		return ""
	case "embed":
		// Builder cho nhập HTML, nhưng output công khai không thực thi script tùy ý.
		return `<pre class="lp-fill lp-embed-source">` + html.EscapeString(content) + `</pre>`
	case "card", "iconbox":
		parts := strings.SplitN(content, "|", 2)
		result := `<div class="lp-fill lp-card" style="` + html.EscapeString(textStyle) + `"><strong>` + html.EscapeString(parts[0]) + `</strong>`
		if len(parts) == 2 {
			result += `<span>` + html.EscapeString(parts[1]) + `</span>`
		}
		return result + `</div>`
	case "countdown":
		return `<time class="lp-fill lp-countdown" style="` + html.EscapeString(textStyle) + `">` + html.EscapeString(content) + `</time>`
	case "icon":
		return `<div class="lp-fill lp-icon" style="` + html.EscapeString(textStyle) + `" aria-label="` + html.EscapeString(content) + `">✦</div>`
	default:
		return `<div class="lp-fill lp-text" style="` + html.EscapeString(textStyle) + `">` + html.EscapeString(content) + `</div>`
	}
}

func elementWrapperStyle(element canonicalElement, root bool, imageTransform func(string) string) string {
	style := element.Style
	parts := []string{"box-sizing:border-box"}
	if root && element.Type == "section" {
		parts = append(parts, "position:relative", "left:0", "top:0", "width:100%")
	} else {
		parts = append(parts, "position:absolute", cssPixels("left", element.X), cssPixels("top", element.Y))
		if value, ok := numberValue(style, "width"); ok {
			parts = append(parts, cssPixels("width", value))
		}
	}
	if value, ok := numberValue(style, "height"); ok {
		parts = append(parts, cssPixels("height", value))
	}
	appendCanonicalBoxStyle(&parts, style, imageTransform)
	return strings.Join(nonEmptyStrings(parts), ";")
}

func appendCanonicalBoxStyle(parts *[]string, style map[string]interface{}, imageTransform func(string) string) {
	appendNumberCSS(parts, style, "opacity", "opacity", false)
	appendNumberCSS(parts, style, "padding", "padding", true)
	appendNumberCSS(parts, style, "borderRadius", "border-radius", true)
	appendNumberCSS(parts, style, "zIndex", "z-index", false)
	if color := safeCSSAtom(stringValue(style, "bgColor", "backgroundColor")); color != "" {
		*parts = append(*parts, "background-color:"+color)
	}
	if shadow := safeCSSAtom(stringValue(style, "boxShadow")); shadow != "" {
		*parts = append(*parts, "box-shadow:"+shadow)
	}
	if width, ok := numberValue(style, "borderWidth"); ok && width > 0 {
		borderStyle := safeBorderStyle(stringValue(style, "borderStyle"))
		borderColor := safeCSSAtom(stringValue(style, "borderColor"))
		if borderColor == "" {
			borderColor = "#000"
		}
		*parts = append(*parts, fmt.Sprintf("border:%gpx %s %s", width, borderStyle, borderColor))
	}
	if image := safeCanonicalImageURL(stringValue(style, "backgroundImage"), imageTransform); image != "" {
		*parts = append(*parts, `background-image:url("`+strings.ReplaceAll(image, `"`, "")+`")`, "background-size:cover", "background-position:center")
	}
}

func mobileRule(cssID string, element canonicalElement, root bool, imageTransform func(string) string) string {
	if element.Mobile == nil {
		return ""
	}
	parts := make([]string, 0, 6)
	if !root {
		if element.Mobile.X != nil {
			parts = append(parts, cssPixels("left", *element.Mobile.X))
		}
		if element.Mobile.Y != nil {
			parts = append(parts, cssPixels("top", *element.Mobile.Y))
		}
	}
	for _, pair := range []struct{ key, css string }{{"width", "width"}, {"height", "height"}} {
		if value, ok := numberValue(element.Mobile.Style, pair.key); ok {
			parts = append(parts, cssPixels(pair.css, value))
		}
	}
	appendCanonicalBoxStyle(&parts, element.Mobile.Style, imageTransform)
	textStyle := canonicalTextStyle(element.Mobile.Style)
	if len(parts) == 0 && textStyle == "" {
		return ""
	}
	rule := `@media(max-width:600px){`
	if len(parts) > 0 {
		rule += `#` + cssID + `{` + strings.Join(parts, ";") + `}`
	}
	if textStyle != "" {
		rule += `#` + cssID + ` .lp-fill{` + textStyle + `}`
	}
	return rule + `}`
}

func canonicalTextStyle(style map[string]interface{}) string {
	parts := make([]string, 0, 8)
	for _, pair := range []struct{ key, css string }{{"fontSize", "font-size"}, {"fontWeight", "font-weight"}} {
		if value, ok := numberValue(style, pair.key); ok {
			unit := pair.css == "font-size"
			appendValue := strconv.FormatFloat(value, 'f', -1, 64)
			if unit {
				appendValue += "px"
			}
			parts = append(parts, pair.css+":"+appendValue)
		}
	}
	for _, pair := range []struct{ key, css string }{{"fontFamily", "font-family"}, {"fontStyle", "font-style"}, {"textDecoration", "text-decoration"}, {"textAlign", "text-align"}, {"color", "color"}} {
		if value := safeCSSAtom(stringValue(style, pair.key)); value != "" {
			parts = append(parts, pair.css+":"+value)
		}
	}
	return strings.Join(parts, ";")
}

func canonicalLink(element canonicalElement) string {
	linkType := stringValue(element.Link, "type")
	if linkType == "section" {
		if target := stringValue(element.Link, "targetSectionId"); target != "" {
			return "#lp-section-" + target
		}
	}
	if direct := stringValue(element.Link, "url", "href"); direct != "" {
		return string(safeLinkURL(direct))
	}
	return "#"
}

func renderCanonicalTable(content, textStyle string) string {
	rows := nonEmptyLines(content)
	var out strings.Builder
	out.WriteString(`<table class="lp-fill lp-table" style="` + html.EscapeString(textStyle) + `"><tbody>`)
	for rowIndex, row := range rows {
		out.WriteString("<tr>")
		for _, cell := range strings.Split(row, "|") {
			tag := "td"
			if rowIndex == 0 {
				tag = "th"
			}
			out.WriteString("<" + tag + ">" + html.EscapeString(cell) + "</" + tag + ">")
		}
		out.WriteString("</tr>")
	}
	out.WriteString("</tbody></table>")
	return out.String()
}

func youtubeEmbedURL(raw string) string {
	for _, marker := range []string{"youtube.com/watch?v=", "youtu.be/", "youtube.com/embed/"} {
		if index := strings.Index(raw, marker); index >= 0 {
			id := raw[index+len(marker):]
			if cut := strings.IndexAny(id, "?&#/"); cut >= 0 {
				id = id[:cut]
			}
			if len(id) == 11 && safeIdentifier(id) {
				return "https://www.youtube.com/embed/" + id
			}
		}
	}
	return ""
}

func safeCanonicalMediaURL(raw string) string { return safeCanonicalImageURL(raw, nil) }

func safeCanonicalImageURL(raw string, transform func(string) string) string {
	raw = strings.TrimSpace(raw)
	if transform != nil && raw != "" {
		raw = transform(raw)
	}
	return string(safeImageURL(raw))
}

func canonicalText(value interface{}) string {
	switch typed := value.(type) {
	case string:
		return typed
	case float64:
		return strconv.FormatFloat(typed, 'f', -1, 64)
	case bool:
		return strconv.FormatBool(typed)
	default:
		return ""
	}
}

func numberValue(values map[string]interface{}, key string) (float64, bool) {
	if values == nil {
		return 0, false
	}
	value, ok := values[key].(float64)
	return value, ok && !math.IsNaN(value) && !math.IsInf(value, 0)
}

func stringValue(values map[string]interface{}, keys ...string) string {
	for _, key := range keys {
		if value, ok := values[key].(string); ok {
			return strings.TrimSpace(value)
		}
	}
	return ""
}

func appendNumberCSS(parts *[]string, values map[string]interface{}, key, property string, pixel bool) {
	if value, ok := numberValue(values, key); ok {
		formatted := strconv.FormatFloat(value, 'f', -1, 64)
		if pixel {
			formatted += "px"
		}
		*parts = append(*parts, property+":"+formatted)
	}
}

func cssPixels(property string, value float64) string {
	return property + ":" + strconv.FormatFloat(value, 'f', -1, 64) + "px"
}

func safeCSSAtom(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return ""
	}
	for _, char := range value {
		if char == ';' || char == ':' || char == '<' || char == '>' || char == '{' || char == '}' || char == '\\' {
			return ""
		}
	}
	return value
}

func safeBorderStyle(value string) string {
	switch value {
	case "dashed", "dotted", "double", "none":
		return value
	default:
		return "solid"
	}
}

func safeClassToken(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	var out strings.Builder
	for _, char := range value {
		if (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char == '-' || char == '_' {
			out.WriteRune(char)
		}
	}
	if out.Len() == 0 {
		return "unknown"
	}
	return out.String()
}

func safeIdentifier(value string) bool {
	for _, char := range value {
		if !((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9') || char == '-' || char == '_') {
			return false
		}
	}
	return true
}

func nonEmptyLines(value string) []string {
	var output []string
	for _, line := range strings.Split(value, "\n") {
		if line = strings.TrimSpace(line); line != "" {
			output = append(output, line)
		}
	}
	return output
}

func nonEmptyStrings(values []string) []string {
	output := values[:0]
	for _, value := range values {
		if value != "" {
			output = append(output, value)
		}
	}
	return output
}

func defaultText(value, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}

const canonicalPageCSS = `
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#fff;color:#111827;font-family:Inter,Arial,sans-serif}.lp-page{width:100%;margin:0 auto;overflow:hidden}.lp-canonical-section{position:relative;width:100%;overflow:hidden}.lp-element{overflow:visible}.lp-element-frame,.lp-fill{width:100%;height:100%;position:relative;box-sizing:border-box}.lp-element-frame{background:inherit;border-radius:inherit}.lp-text{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.lp-button{display:flex;align-items:center;justify-content:center;text-decoration:none;background:inherit;border-radius:inherit}.lp-image{display:block;object-fit:cover;border-radius:inherit}.lp-placeholder{display:flex;align-items:center;justify-content:center;background:#e5e7eb;color:#6b7280;min-height:32px}.lp-gallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.lp-form-control{border:1px solid #d1d5db;padding:8px 12px;background:inherit;color:inherit;border-radius:inherit}.lp-checkbox{display:flex;align-items:center;gap:8px}.lp-list{margin:0;padding-left:22px}.lp-quote{margin:0;border-left:4px solid #d1d5db;padding-left:16px}.lp-table{border-collapse:collapse;text-align:left}.lp-table th,.lp-table td{border:1px solid #d1d5db;padding:5px 8px}.lp-menu{display:flex;align-items:center;justify-content:center;gap:24px}.lp-rating,.lp-countdown,.lp-icon{display:flex;align-items:center}.lp-progress{display:flex;align-items:center;border-radius:999px;background:#e5e7eb;overflow:hidden}.lp-progress span{display:block;height:100%;background:#2563eb}.lp-divider{display:flex;align-items:center;border-top:2px solid currentColor}.lp-card{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:16px;background:inherit;border-radius:inherit}.lp-embed-source{margin:0;overflow:auto;white-space:pre-wrap;background:#f8fafc;color:#334155;padding:8px}.generic-section{padding:48px 32px}.generic-section>div{padding:24px;text-align:center;opacity:.5}
@media(max-width:600px){.lp-page{max-width:390px}.lp-menu{gap:10px;flex-wrap:wrap}.lp-gallery{grid-template-columns:repeat(2,minmax(0,1fr))}}
`
