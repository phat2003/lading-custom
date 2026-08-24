import api from './client'

const getSectionContent = (content) =>
  content && typeof content === 'object' && !Array.isArray(content)
    ? content
    : {}

// Record chuẩn cho Builder: giữ content nguyên vẹn thay vì flatten các field legacy.
export const mapPageSectionRecordFromApi = (section) => {
  if (!section?.section_id) return null

  return {
    serverId: section.section_id,
    landingPageId: section.landing_page_id || null,
    sectionType:
      typeof section.section_type === 'string' ? section.section_type : 'custom',
    content: getSectionContent(section.content),
    orderIndex: Number.isInteger(section.order_index) ? section.order_index : 0,
    isVisible:
      typeof section.is_visible === 'boolean' ? section.is_visible : true,
  }
}

export const mapPageSectionFromApi = (section) => {
  if (!section?.section_id) return null

  return {
    ...getSectionContent(section.content),
    id: section.section_id,
    serverId: section.section_id,
    landingPageId: section.landing_page_id || null,
    type:
      typeof section.section_type === 'string'
        ? section.section_type
        : 'section',
    orderIndex:
      Number.isInteger(section.order_index) ? section.order_index : 0,
    isVisible:
      typeof section.is_visible === 'boolean' ? section.is_visible : true,
  }
}

export const mapEditorSectionToContent = (section) => {
  const content = { ...section }
  delete content.id
  delete content.serverId
  delete content.landingPageId
  delete content.type
  delete content.orderIndex
  delete content.isVisible

  return content
}

export const pageSectionsApi = {
  listByLandingPage: (landingPageId, config) =>
    api.get('/sections', {
      ...config,
      params: {
        ...config?.params,
        page_id: landingPageId,
      },
    }),
  create: (payload) => api.post('/sections', payload),
  update: (id, payload) => api.put(`/sections/${id}`, payload),
  remove: (id) => api.delete(`/sections/${id}`),
}
