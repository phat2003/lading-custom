import { viewOf } from '../../../components/builder/deviceLayout.js'
import { getOrderedSectionRoots } from './sectionManagement.js'

export const RESPONSIVE_PREVIEW_VIEWPORTS = {
  desktop: { label: 'Desktop', width: 1920, height: 1080 },
  tablet: { label: 'Tablet', width: 1024, height: 768 },
  mobile: { label: 'Mobile', width: 360, height: 800 },
}

const TEXT_TYPES = new Set(['heading', 'paragraph', 'label', 'list', 'quote'])
const MEDIA_TYPES = new Set(['image', 'gallery', 'video'])
const MOBILE_COLUMN_GAP = 20
const MIN_HEIGHTS = {
  button: 44,
  countdown: 72,
  embed: 80,
  iconbox: 120,
  menu: 96,
  table: 120,
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const round = (value) => Math.round(value * 1000) / 1000
const numberOr = (value, fallback) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const cloneElement = (element) => ({
  ...element,
  style: { ...(element.style || {}) },
  ...(element.mobile
    ? { mobile: { ...element.mobile, style: { ...(element.mobile.style || {}) } } }
    : {}),
  ...(element.link ? { link: { ...element.link } } : {}),
})

const scaleStyle = (style, scale) => {
  const next = { ...(style || {}) }
  ;['width', 'height', 'fontSize', 'padding', 'borderRadius', 'borderWidth'].forEach(
    (key) => {
      if (typeof next[key] === 'number') next[key] = round(next[key] * scale)
    },
  )
  return next
}

const directChildrenOf = (elements, parentId) =>
  elements.filter((element) => element.parentId === parentId)

const visibleDirectChildrenOf = (elements, parentId) =>
  directChildrenOf(elements, parentId).filter((element) => !element.hidden)

const sourceElementHeight = (element) => {
  if (!element) return 0
  const style = element.style || {}
  if (typeof style.height === 'number') return style.height
  if (TEXT_TYPES.has(element.type)) {
    return Math.max(24, numberOr(style.fontSize, 16) * 1.5)
  }
  return MIN_HEIGHTS[element.type] || 44
}

const sourceBounds = (elements) => {
  if (!elements.length) return null
  return elements.reduce(
    (bounds, element) => {
      const x = numberOr(element.x, 0)
      const y = numberOr(element.y, 0)
      const width = numberOr(element.style?.width, 0)
      const height = sourceElementHeight(element)
      return {
        left: Math.min(bounds.left, x),
        top: Math.min(bounds.top, y),
        right: Math.max(bounds.right, x + width),
        bottom: Math.max(bounds.bottom, y + height),
      }
    },
    { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity },
  )
}

const mergeBounds = (left, right) => {
  if (!left) return right
  if (!right) return left
  return {
    left: Math.min(left.left, right.left),
    top: Math.min(left.top, right.top),
    right: Math.max(left.right, right.right),
    bottom: Math.max(left.bottom, right.bottom),
  }
}

const sourceSubtreeBounds = (elements, element, offsetX = 0, offsetY = 0) => {
  if (!element || element.hidden) return null
  const x = offsetX + numberOr(element.x, 0)
  const y = offsetY + numberOr(element.y, 0)
  let bounds = {
    left: x,
    top: y,
    right: x + numberOr(element.style?.width, 0),
    bottom: y + sourceElementHeight(element),
  }
  visibleDirectChildrenOf(elements, element.id).forEach((child) => {
    bounds = mergeBounds(bounds, sourceSubtreeBounds(elements, child, x, y))
  })
  return bounds
}

const projectedGap = (previousRoot, root, scale, device) => {
  const sourceGap = previousRoot
    ? numberOr(root.y, 0) -
      (numberOr(previousRoot.y, 0) + numberOr(previousRoot.style?.height, 0))
    : numberOr(root.y, 0)
  const [minimum, maximum] = device === 'mobile' ? [8, 32] : [12, 64]
  return clamp(round(Math.max(0, sourceGap) * scale), minimum, maximum)
}

const rootBottomPadding = (root, children, scale, device) => {
  const bounds = sourceBounds(children)
  if (!bounds) return device === 'mobile' ? 12 : 16
  const sourcePadding = Math.max(
    0,
    numberOr(root.style?.height, 0) - bounds.bottom,
  )
  return clamp(
    round(sourcePadding * scale),
    device === 'mobile' ? 12 : 16,
    device === 'mobile' ? 80 : 160,
  )
}

const projectDescendants = ({
  elements,
  projected,
  parentSource,
  parentProjected,
  sourceDevice = 'desktop',
}) => {
  const children = directChildrenOf(elements, parentSource.id)
  if (!children.length) return
  const sourceParent = sourceDevice === 'mobile' ? viewOf(parentSource, 'mobile') : parentSource
  const sourceWidth = Math.max(1, numberOr(sourceParent.style?.width, 1))
  const scale = numberOr(parentProjected.style?.width, sourceWidth) / sourceWidth

  children.forEach((canonicalChild) => {
    const source = sourceDevice === 'mobile'
      ? viewOf(canonicalChild, 'mobile')
      : canonicalChild
    const next = {
      ...cloneElement(canonicalChild),
      x: round(numberOr(source.x, 0) * scale),
      y: round(numberOr(source.y, 0) * scale),
      style: scaleStyle(source.style, scale),
    }
    projected.set(canonicalChild.id, next)
    projectDescendants({
      elements,
      projected,
      parentSource: canonicalChild,
      parentProjected: next,
      sourceDevice,
    })
  })
}

const projectedSubtreeBottom = (elements, projected, element, offsetY = 0) => {
  const next = projected.get(element.id)
  if (!next || next.hidden) return offsetY
  const nextOffset = offsetY + numberOr(next.y, 0)
  return Math.max(
    nextOffset + sourceElementHeight(next),
    ...visibleDirectChildrenOf(elements, element.id).map((child) =>
      projectedSubtreeBottom(elements, projected, child, nextOffset),
    ),
  )
}

const projectedContentBottom = (elements, projected, children) =>
  children.reduce(
    (bottom, child) =>
      Math.max(bottom, projectedSubtreeBottom(elements, projected, child)),
    0,
  )

const projectTablet = (elements, settings) => {
  const viewport = RESPONSIVE_PREVIEW_VIEWPORTS.tablet
  const designWidth = settings?.desktopWidth || 896
  const scale = viewport.width / designWidth
  const roots = getOrderedSectionRoots(elements).filter((root) => !root.hidden)
  const projected = new Map(elements.map((element) => [element.id, cloneElement(element)]))
  let previousRoot = null
  let nextRootY = 0

  roots.forEach((root) => {
    nextRootY += projectedGap(previousRoot, root, scale, 'tablet')
    const sourceChildren = visibleDirectChildrenOf(elements, root.id)
    const rootWidth = round(numberOr(root.style?.width, designWidth) * scale)
    const rootProjected = {
      ...cloneElement(root),
      x: round(numberOr(root.x, 0) * scale),
      y: nextRootY,
      style: {
        ...(root.style || {}),
        width: rootWidth,
        height: round(numberOr(root.style?.height, 300) * scale),
      },
    }
    projected.set(root.id, rootProjected)
    projectDescendants({ elements, projected, parentSource: root, parentProjected: rootProjected })

    const contentBottom = projectedContentBottom(elements, projected, sourceChildren)
    const rootHeight = Math.max(
      rootProjected.style.height,
      contentBottom + rootBottomPadding(root, sourceChildren, scale, 'tablet'),
    )
    rootProjected.style.height = round(rootHeight)
    nextRootY += rootHeight
    previousRoot = root
  })

  return {
    elements: elements.map((element) => projected.get(element.id)),
    contentWidth: viewport.width,
    contentHeight: Math.max(viewport.height, nextRootY),
    renderScale: 1,
  }
}

const verticalOverlapRatio = (left, right) => {
  const leftTop = numberOr(left.y, 0)
  const rightTop = numberOr(right.y, 0)
  const leftHeight = sourceElementHeight(left)
  const rightHeight = sourceElementHeight(right)
  const overlap = Math.max(
    0,
    Math.min(leftTop + leftHeight, rightTop + rightHeight) - Math.max(leftTop, rightTop),
  )
  return overlap / Math.max(1, Math.min(leftHeight, rightHeight))
}

const buildVisualGroups = (children) => {
  const sorted = children.slice().sort(
    (left, right) =>
      numberOr(left.y, 0) - numberOr(right.y, 0) ||
      numberOr(left.x, 0) - numberOr(right.x, 0),
  )
  const groups = []

  sorted.forEach((child) => {
    const matching = groups.find((group) =>
      group.items.some((item) => verticalOverlapRatio(item, child) >= 0.3),
    )
    if (matching) {
      matching.items.push(child)
      matching.items.sort((left, right) => numberOr(left.x, 0) - numberOr(right.x, 0))
      matching.top = Math.min(matching.top, numberOr(child.y, 0))
      matching.bottom = Math.max(
        matching.bottom,
        numberOr(child.y, 0) + sourceElementHeight(child),
      )
      return
    }
    groups.push({
      items: [child],
      top: numberOr(child.y, 0),
      bottom: numberOr(child.y, 0) + sourceElementHeight(child),
    })
  })
  return groups.sort((left, right) => left.top - right.top)
}

const horizontalOverlapRatio = (left, right) => {
  const overlap = Math.max(
    0,
    Math.min(left.right, right.right) - Math.max(left.left, right.left),
  )
  return overlap / Math.max(1, Math.min(left.right - left.left, right.right - right.left))
}

const clusterHorizontalBands = (items) => {
  const clusters = []
  items
    .slice()
    .sort((left, right) => left.bounds.left - right.bounds.left)
    .forEach((item) => {
      const itemCenter = (item.bounds.left + item.bounds.right) / 2
      const match = clusters.find((cluster) => {
        const clusterCenter = (cluster.bounds.left + cluster.bounds.right) / 2
        const narrowWidth = Math.min(
          item.bounds.right - item.bounds.left,
          cluster.bounds.right - cluster.bounds.left,
        )
        return (
          horizontalOverlapRatio(item.bounds, cluster.bounds) >= 0.35 ||
          Math.abs(itemCenter - clusterCenter) <= narrowWidth * 0.28
        )
      })
      if (match) {
        match.items.push(item.element)
        match.bounds = mergeBounds(match.bounds, item.bounds)
      } else {
        clusters.push({ items: [item.element], bounds: item.bounds })
      }
    })
  return clusters.sort((left, right) => left.bounds.left - right.bounds.left)
}

const detectMobileColumnLayout = (elements, root, children) => {
  if (children.length < 2) return null
  const rootWidth = Math.max(1, numberOr(root.style?.width, 0))
  const items = children
    .map((element) => ({ element, bounds: sourceSubtreeBounds(elements, element) }))
    .filter((item) => item.bounds)
  const explicitColumns = clamp(Math.round(numberOr(root.style?.columns, 1)), 1, 3)

  const leading = items.filter((item) => {
    const width = item.bounds.right - item.bounds.left
    const center = (item.bounds.left + item.bounds.right) / 2
    const belowCount = items.filter(
      (other) => other !== item && other.bounds.top >= item.bounds.bottom - 4,
    ).length
    return (
      width >= rootWidth * 0.62 ||
      (belowCount >= 2 && Math.abs(center - rootWidth / 2) <= rootWidth * 0.2)
    )
  })
  const leadingIds = new Set(leading.map((item) => item.element.id))
  const columnItems = items.filter((item) => !leadingIds.has(item.element.id))
  if (columnItems.length < 2) return null

  let columns
  if (explicitColumns > 1) {
    const bandWidth = rootWidth / explicitColumns
    columns = Array.from({ length: explicitColumns }, () => ({ items: [], bounds: null }))
    columnItems.forEach((item) => {
      const center = (item.bounds.left + item.bounds.right) / 2
      const index = clamp(Math.floor(center / bandWidth), 0, explicitColumns - 1)
      columns[index].items.push(item.element)
      columns[index].bounds = mergeBounds(columns[index].bounds, item.bounds)
    })
    columns = columns.filter((column) => column.items.length)
  } else {
    columns = clusterHorizontalBands(columnItems)
  }

  if (columns.length < 2 || columns.length > 3) return null
  columns.forEach((column) => {
    column.items.sort(
      (left, right) =>
        numberOr(left.y, 0) - numberOr(right.y, 0) ||
        numberOr(left.x, 0) - numberOr(right.x, 0),
    )
  })
  return {
    leading: leading
      .map((item) => item.element)
      .sort(
        (left, right) =>
          numberOr(left.y, 0) - numberOr(right.y, 0) ||
          numberOr(left.x, 0) - numberOr(right.x, 0),
      ),
    columns,
  }
}

const estimateTextHeight = (element, width, fontSize) => {
  const content = String(element.content || '')
  const charsPerLine = Math.max(8, Math.floor(width / Math.max(7, fontSize * 0.55)))
  const lines = content.split('\n').reduce(
    (total, line) => total + Math.max(1, Math.ceil(line.length / charsPerLine)),
    0,
  )
  return Math.max(round(fontSize * 1.5), round(lines * fontSize * 1.4))
}

const mobileElementBox = (element, source, availableWidth, sourceScale) => {
  const style = source.style || {}
  const sourceWidth = Math.max(1, numberOr(style.width, availableWidth))
  const sourceHeight = sourceElementHeight(source)
  const fontSize = typeof style.fontSize === 'number'
    ? clamp(round(style.fontSize * 0.76), 14, 38)
    : undefined
  let width
  let height

  if (TEXT_TYPES.has(element.type)) {
    width = availableWidth
    height = estimateTextHeight(element, width, fontSize || 14)
  } else if (element.type === 'button') {
    width = clamp(sourceWidth, 100, availableWidth)
    height = Math.max(44, sourceHeight)
  } else if (MEDIA_TYPES.has(element.type)) {
    width = Math.min(sourceWidth, availableWidth)
    height = Math.max(72, round((sourceHeight / sourceWidth) * width))
  } else {
    width = Math.min(Math.max(sourceWidth * sourceScale, 44), availableWidth)
    height = Math.max(
      MIN_HEIGHTS[element.type] || 44,
      round(sourceHeight * sourceScale),
    )
  }

  return {
    width,
    height,
    style: {
      ...style,
      width,
      height,
      ...(fontSize ? { fontSize } : {}),
      ...(typeof style.padding === 'number'
        ? { padding: Math.max(4, round(style.padding * 0.76)) }
        : {}),
    },
  }
}

const hasMeaningfulStoredMobileLayout = (children, settings) => {
  if (!children.length || children.some((child) => !child.mobile)) return false
  const defaultScale = (settings?.mobileWidth || 390) / (settings?.desktopWidth || 896)
  return children.some((child) => {
    const mobile = viewOf(child, 'mobile')
    return (
      Math.abs(numberOr(mobile.x, 0) - numberOr(child.x, 0) * defaultScale) > 3 ||
      Math.abs(numberOr(mobile.y, 0) - numberOr(child.y, 0) * defaultScale) > 3 ||
      Math.abs(
        numberOr(mobile.style?.width, 0) -
          numberOr(child.style?.width, 0) * defaultScale,
      ) > 3
    )
  })
}

const projectStoredMobileChildren = ({
  elements,
  projected,
  root,
  children,
  rootWidth,
  settings,
}) => {
  const mobileSourceWidth = settings?.mobileWidth || 390
  const scale = rootWidth / mobileSourceWidth
  children.forEach((child) => {
    const source = viewOf(child, 'mobile')
    const next = {
      ...cloneElement(child),
      x: round(numberOr(source.x, 0) * scale),
      y: round(numberOr(source.y, 0) * scale),
      style: scaleStyle(source.style, scale),
    }
    projected.set(child.id, next)
    projectDescendants({
      elements,
      projected,
      parentSource: child,
      parentProjected: next,
      sourceDevice: 'mobile',
    })
  })
  return children.reduce((bottom, child) => {
    const next = projected.get(child.id)
    return Math.max(bottom, numberOr(next?.y, 0) + sourceElementHeight(next))
  }, 0)
}

const projectMobileDescendantsWithinParent = ({
  elements,
  projected,
  parentSource,
  parentProjected,
}) => {
  const children = visibleDirectChildrenOf(elements, parentSource.id).sort(
    (left, right) =>
      numberOr(left.y, 0) - numberOr(right.y, 0) ||
      numberOr(left.x, 0) - numberOr(right.x, 0),
  )
  if (!children.length) return sourceElementHeight(parentProjected)
  const parentWidth = Math.max(1, numberOr(parentProjected.style?.width, 1))
  const sourceParentWidth = Math.max(1, numberOr(parentSource.style?.width, parentWidth))
  const scale = Math.min(1, parentWidth / sourceParentWidth)
  let contentBottom = 0

  children.forEach((child) => {
    const sourceX = round(numberOr(child.x, 0) * scale)
    const availableWidth = Math.max(44, parentWidth - sourceX)
    const box = mobileElementBox(child, child, availableWidth, scale)
    const x = clamp(sourceX, 0, Math.max(0, parentWidth - box.width))
    const y = round(numberOr(child.y, 0) * scale)
    const next = {
      ...cloneElement(child),
      x,
      y,
      style: box.style,
    }
    projected.set(child.id, next)
    const descendantBottom = projectMobileDescendantsWithinParent({
      elements,
      projected,
      parentSource: child,
      parentProjected: next,
    })
    next.style.height = Math.max(numberOr(next.style.height, 0), descendantBottom)
    contentBottom = Math.max(contentBottom, y + next.style.height)
  })

  return Math.max(
    sourceElementHeight(parentProjected),
    contentBottom + clamp(round(parentWidth * 0.04), 8, 16),
  )
}

const projectMobileColumnLayout = ({
  elements,
  projected,
  root,
  rootWidth,
  layout,
}) => {
  const rootSourceWidth = Math.max(1, numberOr(root.style?.width, rootWidth))
  const sourceScale = rootWidth / rootSourceWidth
  const horizontalPadding = clamp(round(rootWidth * 0.045), 12, 20)
  const availableWidth = rootWidth - horizontalPadding * 2
  const firstColumnTop = Math.min(...layout.columns.map((column) => column.bounds.top))
  const firstSourceTop = Math.min(
    firstColumnTop,
    ...layout.leading.map((element) => numberOr(element.y, firstColumnTop)),
  )
  let cursor = clamp(round(firstSourceTop * sourceScale), 12, 96)
  let previousSourceBottom = firstSourceTop

  const projectMember = (member, bounds, columnIndex = null) => {
    const sourceGap = Math.max(0, numberOr(member.y, 0) - previousSourceBottom)
    cursor += clamp(round(sourceGap * sourceScale), previousSourceBottom === firstSourceTop ? 0 : 8, 32)
    const columnWidth = Math.max(1, bounds.right - bounds.left)
    const memberScale = Math.min(1, availableWidth / columnWidth)
    const box = mobileElementBox(member, member, availableWidth, memberScale)
    const sourceCenter = numberOr(member.x, 0) + numberOr(member.style?.width, box.width) / 2
    const normalizedCenter = clamp((sourceCenter - bounds.left) / columnWidth, 0, 1)
    let x = horizontalPadding
    if (!TEXT_TYPES.has(member.type) && box.width < availableWidth) {
      x = clamp(
        round(horizontalPadding + normalizedCenter * availableWidth - box.width / 2),
        horizontalPadding,
        rootWidth - horizontalPadding - box.width,
      )
    }
    const next = {
      ...cloneElement(member),
      ...(columnIndex === null ? {} : { previewColumnIndex: columnIndex }),
      x,
      y: cursor,
      style: box.style,
    }
    projected.set(member.id, next)
    const subtreeHeight = projectMobileDescendantsWithinParent({
      elements,
      projected,
      parentSource: member,
      parentProjected: next,
    })
    next.style.height = Math.max(numberOr(next.style.height, 0), subtreeHeight)
    cursor += next.style.height
    previousSourceBottom = numberOr(member.y, 0) + sourceElementHeight(member)
  }

  layout.leading.forEach((member) => {
    projectMember(member, { left: 0, right: rootSourceWidth })
  })
  if (layout.leading.length) {
    const sourceGap = Math.max(0, firstColumnTop - previousSourceBottom)
    cursor += clamp(round(sourceGap * sourceScale), 12, 32)
  }

  const columnBounds = []
  layout.columns.forEach((column, columnIndex) => {
    if (columnIndex > 0) cursor += MOBILE_COLUMN_GAP
    const columnTop = cursor
    previousSourceBottom = column.bounds.top
    column.items.forEach((member) => projectMember(member, column.bounds, columnIndex))
    columnBounds.push({
      index: columnIndex,
      x: horizontalPadding,
      y: columnTop,
      width: availableWidth,
      height: cursor - columnTop,
    })
  })
  return { contentBottom: cursor, columnBounds }
}

const projectFallbackMobileChildren = ({
  elements,
  projected,
  root,
  children,
  rootWidth,
}) => {
  const rootSourceWidth = Math.max(1, numberOr(root.style?.width, rootWidth))
  const sourceScale = rootWidth / rootSourceWidth
  const horizontalPadding = clamp(round(rootWidth * 0.045), 12, 20)
  const availableWidth = rootWidth - horizontalPadding * 2
  const groups = buildVisualGroups(children)
  let cursor = groups.length ? clamp(round(groups[0].top * sourceScale), 12, 96) : 0
  let previousGroup = null

  groups.forEach((group) => {
    if (previousGroup) {
      const sourceGap = Math.max(0, group.top - previousGroup.bottom)
      cursor += clamp(round(sourceGap * sourceScale), 10, 32)
    }
    group.items.forEach((child, itemIndex) => {
      if (itemIndex > 0) cursor += 12
      const box = mobileElementBox(child, child, availableWidth, sourceScale)
      const sourceCenter = numberOr(child.x, 0) + numberOr(child.style?.width, box.width) / 2
      const normalizedCenter = clamp(sourceCenter / rootSourceWidth, 0, 1)
      let x = horizontalPadding
      if (!TEXT_TYPES.has(child.type) && !MEDIA_TYPES.has(child.type)) {
        x = clamp(
          round(normalizedCenter * rootWidth - box.width / 2),
          horizontalPadding,
          rootWidth - horizontalPadding - box.width,
        )
      } else if (MEDIA_TYPES.has(child.type) && box.width < availableWidth) {
        x = clamp(
          round(normalizedCenter * rootWidth - box.width / 2),
          horizontalPadding,
          rootWidth - horizontalPadding - box.width,
        )
      }
      const next = {
        ...cloneElement(child),
        x,
        y: cursor,
        style: box.style,
      }
      projected.set(child.id, next)
      projectDescendants({ elements, projected, parentSource: child, parentProjected: next })
      cursor += box.height
    })
    previousGroup = group
  })
  return cursor
}

const projectMobile = (elements, settings) => {
  const viewport = RESPONSIVE_PREVIEW_VIEWPORTS.mobile
  const designWidth = settings?.desktopWidth || 896
  const scale = viewport.width / designWidth
  const roots = getOrderedSectionRoots(elements).filter((root) => !root.hidden)
  const projected = new Map(elements.map((element) => [element.id, cloneElement(element)]))
  let previousRoot = null
  let nextRootY = 0

  roots.forEach((root) => {
    nextRootY += projectedGap(previousRoot, root, scale, 'mobile')
    const children = visibleDirectChildrenOf(elements, root.id)
    const rootWidth = round(numberOr(root.style?.width, designWidth) * scale)
    const rootProjected = {
      ...cloneElement(root),
      x: round(numberOr(root.x, 0) * scale),
      y: nextRootY,
      style: {
        ...(root.style || {}),
        width: rootWidth,
        height: round(numberOr(root.style?.height, 300) * scale),
      },
    }
    projected.set(root.id, rootProjected)

    const columnLayout = detectMobileColumnLayout(elements, root, children)
    let contentBottom
    if (columnLayout) {
      const columnProjection = projectMobileColumnLayout({
        elements,
        projected,
        root,
        rootWidth,
        layout: columnLayout,
      })
      contentBottom = columnProjection.contentBottom
      rootProjected.previewColumnBounds = columnProjection.columnBounds
    } else if (hasMeaningfulStoredMobileLayout(children, settings)) {
      contentBottom = projectStoredMobileChildren({
        elements,
        projected,
        root,
        children,
        rootWidth,
        settings,
      })
    } else {
      contentBottom = projectFallbackMobileChildren({
        elements,
        projected,
        root,
        children,
        rootWidth,
      })
    }
    const subtreeBottom = Math.max(
      contentBottom,
      projectedContentBottom(elements, projected, children),
    )
    const rootHeight = Math.max(
      rootProjected.style.height,
      subtreeBottom + rootBottomPadding(root, children, scale, 'mobile'),
    )
    rootProjected.style.height = round(rootHeight)
    nextRootY += rootHeight
    previousRoot = root
  })

  return {
    elements: elements.map((element) => projected.get(element.id)),
    contentWidth: viewport.width,
    contentHeight: Math.max(viewport.height, nextRootY),
    renderScale: 1,
  }
}

export const projectElementsForPreview = (
  elements = [],
  device = 'desktop',
  settings = {},
) => {
  const viewport = RESPONSIVE_PREVIEW_VIEWPORTS[device] || RESPONSIVE_PREVIEW_VIEWPORTS.desktop
  if (device === 'tablet') return projectTablet(elements, settings)
  if (device === 'mobile') return projectMobile(elements, settings)

  const designWidth = settings?.desktopWidth || 896
  const renderScale = viewport.width / designWidth
  const roots = getOrderedSectionRoots(elements).filter((root) => !root.hidden)
  return {
    elements,
    contentWidth: designWidth,
    contentHeight: Math.max(
      viewport.height / renderScale,
      ...roots.map((root) => numberOr(root.y, 0) + numberOr(root.style?.height, 0)),
    ),
    renderScale,
  }
}
