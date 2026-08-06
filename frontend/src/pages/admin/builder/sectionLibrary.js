// Quy đổi section mẫu lấy từ API (Section Template Library) sang dạng "block"
// mà canvas hiểu được: 1 Section cha + danh sách phần tử con.
//
// Backend lưu default_content = { elements: [...] } — mảng phẳng có parentId,
// đúng dạng builder sinh ra khi admin bấm "Lưu Section".

const DEFAULT_SECTION_STYLE = {
  width: 860,
  height: 400,
  bgColor: '#ffffff',
  borderRadius: 0,
  columns: 1,
}

// elements phẳng -> { section, children }. Trả null nếu dữ liệu không dùng được.
// meta mang section_type + id nguồn để khi lưu template còn biết section này
// thuộc loại gì và bắt nguồn từ mẫu nào trong thư viện.
const toBlock = (elements, meta = {}) => {
  if (!Array.isArray(elements) || elements.length === 0) return null

  const root = elements.find((el) => el.type === 'section' && !el.parentId)
  // Không tìm thấy Section gốc (dữ liệu cũ/lạ) -> gom mọi phần tử vào 1 Section mặc định.
  const source = root ? elements.filter((el) => el.parentId === root.id) : elements

  const children = source.map(({ type, content, x, y, style }) => ({
    type,
    content,
    x,
    y,
    style: { ...style },
  }))

  if (!root && children.length === 0) return null
  return {
    section: {
      style: { ...(root?.style || DEFAULT_SECTION_STYLE) },
      sectionType: meta.sectionType || 'custom',
      sourceSectionTemplateId: meta.sourceSectionTemplateId || null,
    },
    children,
  }
}

// Danh sách từ API -> danh sách biến thể kéo-thả cho ElementPanel.
// Bỏ qua bản ghi rỗng/hỏng thay vì để panel vỡ.
export const toLibraryVariants = (items = []) =>
  items
    .map((s) => {
      const block = toBlock(s.default_content?.elements, {
        sectionType: s.section_type,
        sourceSectionTemplateId: s.section_template_id,
      })
      if (!block) return null
      return {
        label: s.display_name,
        block,
        thumbnailUrl: s.thumbnail_url || '',
      }
    })
    .filter(Boolean)
