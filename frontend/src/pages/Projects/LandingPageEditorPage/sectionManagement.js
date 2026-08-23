const SECTION_GAP = 24

export const SECTION_TYPE_OPTIONS = [
  ['custom', 'Custom'],
  ['section', 'Section'],
  ['header', 'Đầu trang'],
  ['hero', 'Hero'],
  ['about', 'Giới thiệu'],
  ['features', 'Tính năng'],
  ['pricing', 'Bảng giá'],
  ['testimonial', 'Đánh giá'],
  ['faq', 'FAQ'],
  ['team', 'Đội ngũ'],
  ['stats', 'Thống kê'],
  ['cta', 'CTA'],
  ['footer', 'Chân trang'],
]

const SECTION_TYPE_NAMES = {
  ...Object.fromEntries(SECTION_TYPE_OPTIONS),
  custom: 'Section',
}

export const getOrderedSectionRoots = (elements = []) =>
  elements
    .map((element, sourceIndex) => ({ element, sourceIndex }))
    .filter(({ element }) => element.type === 'section' && !element.parentId)
    .sort(
      (a, b) =>
        (a.element.y || 0) - (b.element.y || 0) || a.sourceIndex - b.sourceIndex,
    )
    .map(({ element }) => element)

export const getSectionTypeName = (sectionType) =>
  SECTION_TYPE_NAMES[sectionType] || SECTION_TYPE_NAMES.custom

export const getSectionDisplayNames = (sections = []) => {
  const seen = new Map()
  return new Map(
    sections.map((section) => {
      const explicitName = section.sectionName?.trim()
      if (explicitName) return [section.id, explicitName]

      const sectionType = section.sectionType || 'custom'
      const count = (seen.get(sectionType) || 0) + 1
      seen.set(sectionType, count)
      const baseName = getSectionTypeName(sectionType)
      return [section.id, count > 1 ? `${baseName} ${count}` : baseName]
    }),
  )
}

const reflowByIds = (elements, orderedIds) => {
  const roots = getOrderedSectionRoots(elements)
  if (roots.length !== orderedIds.length) return elements

  const rootsById = new Map(roots.map((root) => [root.id, root]))
  if (orderedIds.some((id) => !rootsById.has(id))) return elements

  let nextY = roots.length ? Math.min(...roots.map((root) => root.y || 0)) : 0
  const layout = new Map()
  orderedIds.forEach((id, orderIndex) => {
    const root = rootsById.get(id)
    layout.set(id, { y: nextY, orderIndex })
    nextY += (root.style?.height || 300) + SECTION_GAP
  })

  const changed = roots.some((root) => {
    const next = layout.get(root.id)
    return root.y !== next.y || root.orderIndex !== next.orderIndex
  })
  if (!changed) return elements

  return elements.map((element) => {
    const next = layout.get(element.id)
    return next ? { ...element, ...next } : element
  })
}

export const moveSectionByOffset = (elements, sectionId, offset) => {
  const roots = getOrderedSectionRoots(elements)
  const currentIndex = roots.findIndex((root) => root.id === sectionId)
  const nextIndex = currentIndex + offset
  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= roots.length) return elements

  const orderedIds = roots.map((root) => root.id)
  ;[orderedIds[currentIndex], orderedIds[nextIndex]] = [
    orderedIds[nextIndex],
    orderedIds[currentIndex],
  ]
  return reflowByIds(elements, orderedIds)
}

export const reorderSectionAt = (elements, sectionId, targetId, placement = 'before') => {
  if (sectionId === targetId) return elements
  const roots = getOrderedSectionRoots(elements)
  const orderedIds = roots.map((root) => root.id)
  const fromIndex = orderedIds.indexOf(sectionId)
  const targetIndex = orderedIds.indexOf(targetId)
  if (fromIndex < 0 || targetIndex < 0) return elements

  orderedIds.splice(fromIndex, 1)
  const adjustedTargetIndex = orderedIds.indexOf(targetId)
  const insertIndex = placement === 'after' ? adjustedTargetIndex + 1 : adjustedTargetIndex
  orderedIds.splice(insertIndex, 0, sectionId)
  return reflowByIds(elements, orderedIds)
}

// Chèn một graph Section mới theo vị trí thả rồi reflow toàn bộ root Section.
// Child giữ nguyên tọa độ tương đối; order của Section List/Canvas/serializer cùng dựa trên y.
export const insertSectionGraphAt = (elements, graph, dropY) => {
  const newRoot = graph.find(
    (element) => element.type === 'section' && !element.parentId,
  )
  if (!newRoot) return elements

  const roots = getOrderedSectionRoots(elements)
  const insertIndex = roots.findIndex(
    (root) => dropY < (root.y || 0) + (root.style?.height || 300) / 2,
  )
  const orderedIds = roots.map((root) => root.id)
  orderedIds.splice(insertIndex < 0 ? orderedIds.length : insertIndex, 0, newRoot.id)

  return reflowByIds([...elements, ...graph], orderedIds)
}
