// Chuyển đổi hai chiều giữa canvas của builder và bảng `template_section`.
//
//   Canvas : mảng phẳng element, Section là element gốc (parentId = null),
//            phần tử bên trong có parentId trỏ về Section.
//   API    : mảng section, mỗi section mang section_content = { elements: [...] }
//
// Quy ước: section_content chứa CẢ element Section lẫn các con của nó, để nạp
// lại là dựng đúng nguyên trạng (giữ nền, chiều cao, số cột... của Section).

const PAGE_WIDTH = 896

// Section tự sinh khi người dùng thả phần tử thẳng ra trang, không nằm trong
// Section nào. Không có bước này thì các phần tử đó sẽ bị mất khi lưu.
const wrapperSection = (id, y, height) => ({
  id,
  type: 'section',
  content: '',
  x: 0,
  y,
  parentId: null,
  sectionType: 'custom',
  style: { width: PAGE_WIDTH, height, bgColor: '#ffffff', borderRadius: 0, columns: 1 },
})

const newId = () =>
  crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())

/**
 * Canvas -> payload cho PUT /admin/templates/:id/sections
 * Thứ tự section theo toạ độ y (trên xuống dưới) đúng như trang hiển thị,
 * không dùng thứ tự trong mảng vì đó là thứ tự lớp (z-index).
 */
export const elementsToSections = (elements = []) => {
  const roots = elements.filter((el) => !el.parentId)
  const sectionRoots = roots.filter((el) => el.type === 'section')
  const loose = roots.filter((el) => el.type !== 'section')

  const sections = sectionRoots
    .slice()
    .sort((a, b) => (a.y || 0) - (b.y || 0))
    .map((sec) => ({
      section_type: sec.sectionType || 'custom',
      section_content: {
        elements: [sec, ...elements.filter((c) => c.parentId === sec.id)],
      },
      source_section_template_id: sec.sourceSectionTemplateId || null,
    }))

  // Gom phần tử rời vào một Section bọc để không mất dữ liệu khi lưu.
  // Section bọc ôm sát đúng vùng chứa chúng — nếu đặt ở y=0 với chiều cao lớn
  // thì nó sẽ phủ đè lên các section khác trên canvas.
  if (loose.length > 0) {
    const wrapperId = newId()
    const top = Math.min(...loose.map((el) => el.y || 0))
    const bottom = Math.max(...loose.map((el) => (el.y || 0) + (el.style?.height || 60)))
    sections.push({
      section_type: 'custom',
      section_content: {
        elements: [
          wrapperSection(wrapperId, top, Math.max(120, Math.ceil(bottom - top) + 40)),
          // Toạ độ con đổi sang tương đối so với section bọc.
          ...loose.map((el) => ({ ...el, parentId: wrapperId, y: (el.y || 0) - top })),
        ],
      },
      source_section_template_id: null,
    })
  }

  return sections
}

/**
 * Chiều ngược lại: sections từ API -> mảng phẳng cho canvas.
 *
 * Giữ NGUYÊN toạ độ y đã lưu để "lưu sao mở ra vậy" — admin cố ý chừa khoảng
 * cách giữa các section thì không bị dồn lại. Chỉ khi bản ghi thiếu y (dữ liệu
 * cũ / do nơi khác sinh ra) mới xếp chồng nối tiếp theo order_index.
 */
export const sectionsToElements = (sections = []) => {
  const ordered = [...sections].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
  const out = []
  let fallbackY = 0

  ordered.forEach((s) => {
    const els = s.section_content?.elements
    if (!Array.isArray(els) || els.length === 0) return

    const root = els.find((el) => el.type === 'section' && !el.parentId)
    const rootY = typeof root?.y === 'number' ? root.y : fallbackY

    out.push(
      ...els.map((el) =>
        el.parentId
          ? { ...el } // con giữ toạ độ tương đối trong Section
          : { ...el, y: rootY, sectionType: el.sectionType || s.section_type },
      ),
    )
    fallbackY = rootY + (root?.style?.height || 300) + 1
  })

  return out
}

// Chiều cao trang tối thiểu đủ chứa hết section vừa nạp.
export const contentHeight = (elements = []) => {
  const roots = elements.filter((el) => !el.parentId)
  if (roots.length === 0) return 900
  const bottom = Math.max(...roots.map((el) => (el.y || 0) + (el.style?.height || 0)))
  return Math.max(900, Math.ceil(bottom) + 200)
}
