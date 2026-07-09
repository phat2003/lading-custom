import api from './client'

// CRUD System Template (admin). Khớp đúng route backend đã có:
//   POST   /api/v1/admin/templates
//   GET    /api/v1/admin/templates
//   GET    /api/v1/admin/templates/:id
//   PUT    /api/v1/admin/templates/:id
//   DELETE /api/v1/admin/templates/:id
//
// Trang Templates hiện chạy mock; khi backend sẵn sàng, thay các handler
// trong Templates.jsx bằng các hàm dưới đây (giống cách authApi đang dùng).
export const templatesApi = {
  list: () => api.get('/admin/templates'),
  get: (id) => api.get(`/admin/templates/${id}`),
  create: (payload) => api.post('/admin/templates', payload),
  update: (id, payload) => api.put(`/admin/templates/${id}`, payload),
  remove: (id) => api.delete(`/admin/templates/${id}`),
}
