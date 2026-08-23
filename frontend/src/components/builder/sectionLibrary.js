// Chuẩn hóa Section Template API thành graph Builder và clone graph độc lập khi drop.
// Helper nằm trong shared core vì cả Admin/User đều dùng định dạng block, nhưng UI
// hover/reorder của User được bật riêng ở orchestration User.

const DEFAULT_SECTION_STYLE = {
  width: 820,
  height: 360,
  bgColor: '#ffffff',
  borderRadius: 0,
  columns: 1,
}

const newId = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value)

const cloneValue = (value) => {
  if (globalThis.structuredClone) return globalThis.structuredClone(value)
  return JSON.parse(JSON.stringify(value))
}

const textFrom = (content, keys) => {
  for (const key of keys) {
    if (typeof content[key] === 'string' && content[key].trim()) {
      return content[key].trim()
    }
  }
  return ''
}

const legacyContentToElements = (content, meta) => {
  if (!isObject(content)) return []

  const rootId = `library-root-${meta.sourceSectionTemplateId}`
  const title = textFrom(content, ['title', 'heading', 'headline'])
  const subtitle = textFrom(content, ['subtitle', 'text', 'description', 'body'])
  const buttonText = textFrom(content, ['buttonText', 'button_text', 'ctaText', 'cta_text'])
  const backgroundImage = textFrom(content, ['backgroundImage', 'background_image'])
  const children = []

  if (title) {
    children.push({
      id: `${rootId}-title`,
      type: 'heading',
      content: title,
      x: 60,
      y: 72,
      parentId: rootId,
      style: {
        width: 700,
        fontSize: 40,
        fontFamily: 'Inter',
        fontWeight: 800,
        color: content.textColor || content.text_color || '#0f172a',
        textAlign: content.textAlign || content.text_align || 'center',
      },
    })
  }

  if (subtitle) {
    children.push({
      id: `${rootId}-subtitle`,
      type: 'paragraph',
      content: subtitle,
      x: 100,
      y: title ? 152 : 92,
      parentId: rootId,
      style: {
        width: 620,
        fontSize: Number(content.fontSize || content.font_size) || 18,
        fontFamily: 'Inter',
        color: content.textColor || content.text_color || '#475569',
        textAlign: content.textAlign || content.text_align || 'center',
      },
    })
  }

  if (buttonText) {
    children.push({
      id: `${rootId}-button`,
      type: 'button',
      content: buttonText,
      x: 330,
      y: title || subtitle ? 236 : 100,
      parentId: rootId,
      style: {
        width: 160,
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

  if (!children.length) {
    children.push({
      id: `${rootId}-label`,
      type: 'label',
      content: meta.displayName,
      x: 60,
      y: 72,
      parentId: rootId,
      style: {
        width: 700,
        fontSize: 28,
        fontFamily: 'Inter',
        fontWeight: 700,
        color: '#475569',
        textAlign: 'center',
      },
    })
  }

  return [
    {
      id: rootId,
      type: 'section',
      content: '',
      x: 0,
      y: 0,
      parentId: null,
      sectionName: meta.displayName,
      sectionType: meta.sectionType,
      sourceSectionTemplateId: meta.sourceSectionTemplateId,
      style: {
        ...DEFAULT_SECTION_STYLE,
        height: Number(content.height) || DEFAULT_SECTION_STYLE.height,
        bgColor: content.backgroundColor || content.background_color || '#ffffff',
        ...(backgroundImage ? { backgroundImage } : {}),
      },
    },
    ...children,
  ]
}

const canonicalContentToElements = (elements, meta) => {
  if (!Array.isArray(elements) || !elements.length) return []
  const valid = elements.filter((element) => isObject(element) && element.type)
  if (!valid.length) return []

  const sourceRoot = valid.find(
    (element) => element.type === 'section' && !element.parentId,
  )
  const rootId = sourceRoot?.id || `library-root-${meta.sourceSectionTemplateId}`
  const root = sourceRoot
    ? cloneValue(sourceRoot)
    : {
        id: rootId,
        type: 'section',
        content: '',
        x: 0,
        y: 0,
        parentId: null,
        style: DEFAULT_SECTION_STYLE,
      }

  const includedIds = new Set(sourceRoot?.id ? [sourceRoot.id] : [])
  let changed = true
  while (sourceRoot && changed) {
    changed = false
    valid.forEach((element) => {
      if (
        element.id &&
        element.parentId &&
        includedIds.has(element.parentId) &&
        !includedIds.has(element.id)
      ) {
        includedIds.add(element.id)
        changed = true
      }
    })
  }

  const children = (sourceRoot
    ? valid.filter((element) => element !== sourceRoot && includedIds.has(element.id))
    : valid
  ).map((element, index) => ({
    ...cloneValue(element),
    id: element.id || `${rootId}-child-${index}`,
    parentId: sourceRoot ? element.parentId : rootId,
    style: { ...(element.style || {}) },
  }))

  return [
    {
      ...root,
      id: rootId,
      type: 'section',
      parentId: null,
      sectionName: root.sectionName || meta.displayName,
      sectionType: meta.sectionType || root.sectionType || 'custom',
      sourceSectionTemplateId: meta.sourceSectionTemplateId,
      style: { ...DEFAULT_SECTION_STYLE, ...(root.style || {}) },
    },
    ...children,
  ]
}

const toVariant = (template) => {
  if (!template || typeof template !== 'object') return null

  const sourceSectionTemplateId = template.id || template.section_template_id || ''
  const sectionType = template.sectionType || template.section_type || ''
  const displayName = (template.displayName || template.display_name || '').trim()
  const defaultContent = template.defaultContent ?? template.default_content
  if (!sourceSectionTemplateId || !sectionType || !displayName || !isObject(defaultContent)) {
    return null
  }

  const meta = { sourceSectionTemplateId, sectionType, displayName }
  const elements = Array.isArray(defaultContent.elements)
    ? canonicalContentToElements(defaultContent.elements, meta)
    : legacyContentToElements(defaultContent, meta)
  if (!elements.length) return null

  const root = elements[0]
  return {
    id: sourceSectionTemplateId,
    label: displayName,
    sectionType,
    thumbnailUrl: template.thumbnailUrl || template.thumbnail_url || '',
    block: {
      section: {
        sectionName: root.sectionName,
        sectionType: root.sectionType,
        sourceSectionTemplateId,
        style: { ...root.style },
      },
      children: elements.slice(1).map((element) => cloneValue(element)),
      elements,
    },
  }
}

export const normalizeSectionTemplateLibrary = (items = []) => {
  if (!Array.isArray(items)) return { variants: [], invalidCount: 0 }
  const mapped = items.map(toVariant)
  return {
    variants: mapped.filter(Boolean),
    invalidCount: mapped.filter((item) => !item).length,
  }
}

export const toLibraryVariants = (items = []) =>
  normalizeSectionTemplateLibrary(items).variants

const stripPersistenceMetadata = (element) => {
  const clean = cloneValue(element)
  delete clean.serverSectionId
  delete clean.landingPageId
  delete clean.orderIndex
  delete clean.isVisible
  delete clean.__looseChildren
  return clean
}

const blockElements = (blockDefinition) => {
  if (Array.isArray(blockDefinition?.elements) && blockDefinition.elements.length) {
    return blockDefinition.elements.map(stripPersistenceMetadata)
  }

  if (!blockDefinition?.section) return []
  const rootId = blockDefinition.section.id || '__block-root__'
  return [
    {
      ...stripPersistenceMetadata(blockDefinition.section),
      id: rootId,
      type: 'section',
      content: blockDefinition.section.content || '',
      parentId: null,
    },
    ...(blockDefinition.children || []).map((child, index) => ({
      ...stripPersistenceMetadata(child),
      id: child.id || `__block-child-${index}__`,
      parentId: child.parentId || rootId,
    })),
  ]
}

// Mỗi lần gọi sinh một graph mới hoàn toàn, remap cả parentId và anchor nội bộ.
export const cloneLibraryBlock = (blockDefinition, { x = 0, y = 0 } = {}) => {
  const source = blockElements(blockDefinition)
  const sourceRoot = source.find(
    (element) => element.type === 'section' && !element.parentId,
  )
  if (!sourceRoot) return []

  const idMap = new Map(source.map((element) => [element.id, newId()]))
  const rootId = idMap.get(sourceRoot.id)

  return source.map((sourceElement) => {
    const element = stripPersistenceMetadata(sourceElement)
    const internalTargetId = element.link?.targetSectionId
    const link = isObject(element.link)
      ? {
          ...element.link,
          ...(internalTargetId && idMap.has(internalTargetId)
            ? { targetSectionId: idMap.get(internalTargetId) }
            : {}),
        }
      : element.link

    return {
      ...element,
      id: idMap.get(sourceElement.id),
      parentId:
        sourceElement === sourceRoot
          ? null
          : idMap.get(sourceElement.parentId) || rootId,
      x: sourceElement === sourceRoot ? x : element.x || 0,
      y: sourceElement === sourceRoot ? y : element.y || 0,
      style: { ...(element.style || {}) },
      ...(isObject(element.mobile)
        ? {
            mobile: {
              ...element.mobile,
              style: { ...(element.mobile.style || {}) },
            },
          }
        : {}),
      ...(link ? { link } : {}),
    }
  })
}
