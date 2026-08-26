import api from './client'

export const mapLandingPageFromApi = (landingPage) => {
  if (!landingPage?.landing_page_id) return null

  return {
    id: landingPage.landing_page_id,
    projectId: landingPage.project_id || null,
    name: typeof landingPage.name === 'string' ? landingPage.name : '',
    sourceTemplateId: landingPage.source_template_id || null,
    status:
      typeof landingPage.status === 'string' ? landingPage.status : null,
    publishedUrl: landingPage.published_url || null,
    createdAt: landingPage.created_at || null,
    updatedAt: landingPage.updated_at || null,
  }
}

export const mapPublishResultFromApi = (result) => {
  if (
    result?.status !== 'published' ||
    typeof result.public_link !== 'string' ||
    !result.public_link.trim()
  ) {
    return null
  }

  let publicLink
  try {
    publicLink = new URL(result.public_link.trim())
  } catch {
    return null
  }
  if (!['http:', 'https:'].includes(publicLink.protocol)) return null

  return {
    status: result.status,
    publishedUrl:
      typeof result.published_url === 'string'
        ? result.published_url
        : null,
    publicLink: publicLink.toString(),
  }
}

export const mapStaticPreviewResultFromApi = (result) => {
  if (typeof result?.html !== 'string') return null

  const html = result.html.trim()
  if (
    !html ||
    !/<(?:!doctype\s+html|html|head|body|main|section|div)(?:\s|>)/i.test(
      html,
    )
  ) {
    return null
  }

  return { html }
}

export const resolveLandingPagePublicUrl = (landingPage) => {
  if (landingPage?.status !== 'published') return null

  const slug = landingPage.publishedUrl?.trim()
  if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) return null

  try {
    const apiBaseUrl = new URL(
      api.defaults.baseURL,
      globalThis.location?.origin || 'http://localhost',
    )
    return new URL(`/p/${encodeURIComponent(slug)}`, apiBaseUrl.origin).toString()
  } catch {
    return null
  }
}

export const landingPagesApi = {
  listByProject: (projectId, config) =>
    api.get('/pages', {
      ...config,
      params: {
        ...config?.params,
        project_id: projectId,
      },
    }),
  get: (id, config) => api.get(`/pages/${id}`, config),
  create: (payload) => api.post('/pages', payload),
  createFromTemplate: (payload) => api.post('/pages/from-template', payload),
  saveAsTemplate: (payload, config) =>
    api.post('/pages/save-as-template', payload, config),
  generateStaticPreview: (id, config) =>
    api.post(`/landing-pages/${id}/generate-static`, undefined, config),
  exportPdf: (id, config) =>
    api.get(`/landing-pages/${id}/export/pdf`, {
      ...config,
      responseType: 'blob',
    }),
  exportHtml: (id, config) =>
    api.get(`/landing-pages/${id}/export/html`, {
      ...config,
      params: {
        ...config?.params,
        offline: true,
      },
      responseType: 'blob',
    }),
  publish: (id, config) =>
    api.post(`/landing-pages/${id}/publish`, undefined, config),
  update: (id, payload) => api.put(`/pages/${id}`, payload),
  remove: (id) => api.delete(`/pages/${id}`),
}
