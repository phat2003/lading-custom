const PAGE_WIDTH = 896
const SECTION_GAP = 24

const newId = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value)

const makeUniqueId = (candidate, usedIds) => {
  let next = typeof candidate === 'string' && candidate ? candidate : newId()
  while (usedIds.has(next)) next = newId()
  usedIds.add(next)
  return next
}

const cloneElement = (element) => ({
  ...element,
  style: { ...(element.style || {}) },
  ...(isObject(element.mobile)
    ? { mobile: { ...element.mobile, style: { ...(element.mobile.style || {}) } } }
    : {}),
})

const legacyText = (content, keys) => {
  for (const key of keys) {
    if (typeof content[key] === 'string' && content[key].trim()) return content[key]
  }
  return ''
}

const legacyToElements = (record, rootId, rootY) => {
  const content = record.content || {}
  const height = Number(content.height) || 320
  const root = {
    id: rootId,
    type: 'section',
    content: '',
    x: 0,
    y: rootY,
    parentId: null,
    sectionType: record.sectionType || content.type || 'custom',
    style: {
      width: PAGE_WIDTH,
      height,
      bgColor: content.backgroundColor || content.background_color || '#ffffff',
      borderRadius: Number(content.borderRadius || content.border_radius) || 0,
      columns: Number(content.columns) || 1,
    },
  }
  const children = []
  const title = legacyText(content, ['title', 'heading', 'headline'])
  const text = legacyText(content, ['text', 'subtitle', 'description', 'body'])
  const buttonText = legacyText(content, ['buttonText', 'button_text', 'ctaText', 'cta_text'])
  const color = content.textColor || content.text_color || '#0f172a'
  const textAlign = content.textAlign || content.text_align || 'left'

  if (title) {
    children.push({
      id: newId(),
      type: 'heading',
      content: title,
      x: 48,
      y: 54,
      parentId: rootId,
      style: {
        width: PAGE_WIDTH - 96,
        fontSize: Number(content.titleSize || content.title_size) || 36,
        fontFamily: 'Inter',
        fontWeight: 800,
        color,
        textAlign,
      },
    })
  }
  if (text) {
    children.push({
      id: newId(),
      type: 'paragraph',
      content: text,
      x: 48,
      y: title ? 128 : 72,
      parentId: rootId,
      style: {
        width: PAGE_WIDTH - 96,
        fontSize: Number(content.fontSize || content.font_size) || 16,
        fontFamily: 'Inter',
        color,
        textAlign,
      },
    })
  }
  if (buttonText) {
    children.push({
      id: newId(),
      type: 'button',
      content: buttonText,
      x: 48,
      y: title || text ? 220 : 80,
      parentId: rootId,
      style: {
        width: 156,
        height: 44,
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: 600,
        color: content.buttonTextColor || content.button_text_color || '#ffffff',
        bgColor: content.buttonColor || content.button_color || '#2563eb',
        borderRadius: Number(content.buttonRadius || content.button_radius) || 8,
      },
    })
  }

  // Dữ liệu legacy rất tối giản vẫn có một label để người dùng nhận biết loại Section.
  if (!children.length) {
    children.push({
      id: newId(),
      type: 'label',
      content: record.sectionType || 'Section',
      x: 48,
      y: 48,
      parentId: rootId,
      style: { width: 240, fontSize: 18, fontFamily: 'Inter', color: '#64748b' },
    })
  }
  return [root, ...children]
}

const graphToElements = (record, rootY, usedIds) => {
  const raw = Array.isArray(record.content?.elements) ? record.content.elements : []
  if (!raw.length) {
    const rootId = makeUniqueId(null, usedIds)
    return legacyToElements(record, rootId, rootY).map((element, index) => {
      if (index > 0) usedIds.add(element.id)
      return element
    })
  }

  const rawRoot = raw.find((element) => element?.type === 'section' && !element.parentId)
  const rootId = makeUniqueId(rawRoot?.id, usedIds)
  const idMap = new Map()
  if (rawRoot?.id) idMap.set(rawRoot.id, rootId)
  raw.forEach((element) => {
    if (!element || element === rawRoot) return
    idMap.set(element.id, makeUniqueId(element.id, usedIds))
  })

  const root = rawRoot
    ? {
        ...cloneElement(rawRoot),
        id: rootId,
        parentId: null,
        y: typeof rawRoot.y === 'number' ? rawRoot.y : rootY,
      }
    : {
        id: rootId,
        type: 'section',
        content: '',
        x: 0,
        y: rootY,
        parentId: null,
        style: { width: PAGE_WIDTH, height: 320, bgColor: '#ffffff', columns: 1 },
      }

  const children = raw
    .filter((element) => element && element !== rawRoot)
    .map((element) => ({
      ...cloneElement(element),
      id: idMap.get(element.id),
      parentId: element.parentId ? idMap.get(element.parentId) || rootId : rootId,
    }))
  return [root, ...children]
}

// PageSection API -> element graph. Metadata server chỉ gắn vào Section root.
export const pageSectionsToBuilderElements = (records = []) => {
  const ordered = [...records].sort((a, b) => a.orderIndex - b.orderIndex)
  const usedIds = new Set()
  const output = []
  let fallbackY = 0

  ordered.forEach((record) => {
    const graph = graphToElements(record, fallbackY, usedIds)
    const root = graph[0]
    root.sectionType = root.sectionType || record.sectionType || 'custom'
    root.serverSectionId = record.serverId || null
    root.landingPageId = record.landingPageId || null
    root.orderIndex = record.orderIndex
    root.isVisible = record.isVisible !== false
    root.hidden = record.isVisible === false
    output.push(...graph)
    fallbackY = (root.y || 0) + (root.style?.height || 300) + SECTION_GAP
  })
  return output
}

const stripServerMetadata = (element) => {
  const clean = cloneElement(element)
  delete clean.serverSectionId
  delete clean.landingPageId
  delete clean.orderIndex
  delete clean.isVisible
  return clean
}

const collectDescendants = (elements, rootId) => {
  const ids = new Set([rootId])
  let changed = true
  while (changed) {
    changed = false
    elements.forEach((element) => {
      if (element.parentId && ids.has(element.parentId) && !ids.has(element.id)) {
        ids.add(element.id)
        changed = true
      }
    })
  }
  return elements.filter((element) => element.id !== rootId && ids.has(element.id))
}

// Element graph -> PageSection payload. order_index luôn theo vị trí y của top-level Section.
export const builderElementsToPageSections = (elements = [], landingPageId) => {
  const roots = elements.filter((element) => !element.parentId)
  const sectionRoots = roots
    .filter((element) => element.type === 'section')
    .slice()
    .sort((a, b) => (a.y || 0) - (b.y || 0))
  const loose = roots.filter((element) => element.type !== 'section')

  if (loose.length) {
    const wrapperId = newId()
    const top = Math.min(...loose.map((element) => element.y || 0))
    const bottom = Math.max(
      ...loose.map((element) => (element.y || 0) + (element.style?.height || 60)),
    )
    const wrapper = {
      id: wrapperId,
      type: 'section',
      content: '',
      x: 0,
      y: top,
      parentId: null,
      sectionType: 'custom',
      style: {
        width: PAGE_WIDTH,
        height: Math.max(120, Math.ceil(bottom - top) + 40),
        bgColor: '#ffffff',
        borderRadius: 0,
        columns: 1,
      },
      __looseChildren: loose.map((element) => ({
        ...cloneElement(element),
        parentId: wrapperId,
        y: (element.y || 0) - top,
      })),
    }
    sectionRoots.push(wrapper)
    sectionRoots.sort((a, b) => (a.y || 0) - (b.y || 0))
  }

  return sectionRoots.map((root, orderIndex) => {
    const descendants = root.__looseChildren || collectDescendants(elements, root.id)
    const cleanRoot = stripServerMetadata(root)
    delete cleanRoot.__looseChildren
    return {
      serverId: root.serverSectionId || null,
      landingPageId,
      sectionType: root.sectionType || 'custom',
      orderIndex,
      isVisible: !root.hidden,
      content: {
        elements: [cleanRoot, ...descendants.map(stripServerMetadata)],
      },
    }
  })
}

export const pageSectionSignature = (section) =>
  JSON.stringify({
    sectionType: section?.sectionType || 'custom',
    content: section?.content || {},
    isVisible: section?.isVisible !== false,
  })
