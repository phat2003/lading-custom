import api from './client'

const resolveAssetUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return ''

  try {
    const apiBaseUrl = new URL(
      api.defaults.baseURL,
      globalThis.location?.origin || 'http://localhost',
    )
    const url = new URL(value.trim(), `${apiBaseUrl.origin}/`)
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : ''
  } catch {
    return ''
  }
}

export const mapSectionTemplateFromApi = (template) => {
  if (!template || typeof template !== 'object') return null

  return {
    id: template.section_template_id || '',
    sectionType:
      typeof template.section_type === 'string' ? template.section_type : '',
    displayName:
      typeof template.display_name === 'string' ? template.display_name : '',
    defaultContent: template.default_content,
    thumbnailUrl: resolveAssetUrl(template.thumbnail_url),
    createdBy: template.created_by || null,
    createdAt: template.created_at || null,
  }
}

// Section Template Library — thư viện section mẫu toàn cục.
//
// Quyền ĐỌC và quyền GHI nằm ở 2 nhóm route khác nhau:
//   GET    /api/v1/section-templates        — mọi user đã đăng nhập, trả TOÀN BỘ
//                                             (panel kéo thả cạnh editor)
//   GET    /api/v1/admin/section-templates  — admin, có phân trang + used_in
//   GET    /api/v1/admin/section-templates/:id
//   POST   /api/v1/admin/section-templates
//   PUT    /api/v1/admin/section-templates/:id
//   DELETE /api/v1/admin/section-templates/:id
//
// list() nhận { page, limit, type, search }; type bỏ trống hoặc 'all' = không lọc.
// Response list: { success, data: [...], meta: { page, limit, total, total_pages } }
export const sectionsApi = {
  // Dùng cho trang admin: có phân trang, kèm used_in.
  list: (params, config) => api.get('/admin/section-templates', { params, ...config }),
  get: (id) => api.get(`/admin/section-templates/${id}`),
  create: (payload) => api.post('/admin/section-templates', payload),
  update: (id, payload) => api.put(`/admin/section-templates/${id}`, payload),
  remove: (id) => api.delete(`/admin/section-templates/${id}`),

  // Dùng cho editor: toàn bộ thư viện, không phân trang.
  listAll: (params, config) =>
    api.get('/section-templates', { ...config, params }),
}
