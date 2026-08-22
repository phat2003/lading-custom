export const CTA_LINK_TYPE_SECTION = 'section'
export const CTA_LINK_TYPE_LANDING_PAGE = 'landingPage'

export const createCtaLink = (type, targetId = '') => {
  if (type === CTA_LINK_TYPE_SECTION) {
    return targetId
      ? { type: CTA_LINK_TYPE_SECTION, targetSectionId: targetId }
      : { type: CTA_LINK_TYPE_SECTION }
  }

  if (type === CTA_LINK_TYPE_LANDING_PAGE) {
    return targetId
      ? { type: CTA_LINK_TYPE_LANDING_PAGE, targetLandingPageId: targetId }
      : { type: CTA_LINK_TYPE_LANDING_PAGE }
  }

  return undefined
}

export const getSectionAnchorId = (sectionId) =>
  sectionId ? `lp-section-${encodeURIComponent(sectionId)}` : undefined

export const getSectionLinkTargetId = (element) =>
  element?.link?.type === CTA_LINK_TYPE_SECTION
    ? element.link.targetSectionId || ''
    : ''

export const getLandingPageLinkTargetId = (element) =>
  element?.link?.type === CTA_LINK_TYPE_LANDING_PAGE
    ? element.link.targetLandingPageId || ''
    : ''
