import api from './client'

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
  listAll: (params) => api.get('/section-templates', { params }),
}
