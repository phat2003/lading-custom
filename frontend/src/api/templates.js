import api from './client'

// CRUD System Template (admin). Khớp đúng route backend đã có:
//   POST   /api/v1/admin/templates
//   GET    /api/v1/admin/templates
//   GET    /api/v1/admin/templates/:id
//   PUT    /api/v1/admin/templates/:id
//   DELETE /api/v1/admin/templates/:id
//
// list() nhận bộ lọc + phân trang phía server:
//   { page, limit, search, category, status, tier }
// category/status/tier bỏ trống hoặc 'all' = không lọc.
// Response: { success, message, data: [...], meta: { page, limit, total, total_pages } }
export const templatesApi = {
  list: (params, config) => api.get('/admin/templates', { params, ...config }),
  get: (id) => api.get(`/admin/templates/${id}`),
  create: (payload) => api.post('/admin/templates', payload),
  update: (id, payload) => api.put(`/admin/templates/${id}`, payload),
  remove: (id) => api.delete(`/admin/templates/${id}`),
}
