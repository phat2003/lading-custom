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
}
