export const CTA_LINK_TYPE_SECTION = 'section'

export const getSectionAnchorId = (sectionId) =>
  sectionId ? `lp-section-${encodeURIComponent(sectionId)}` : undefined

export const getSectionLinkTargetId = (element) =>
  element?.link?.type === CTA_LINK_TYPE_SECTION
    ? element.link.targetSectionId || ''
    : ''
