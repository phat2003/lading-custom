import api from './client'

// Quản trị người dùng (chỉ admin). Khớp route backend:
//   GET    /api/v1/admin/users
//   GET    /api/v1/admin/users/:id
//   POST   /api/v1/admin/users
//   PUT    /api/v1/admin/users/:id
//   DELETE /api/v1/admin/users/:id
//
// list() nhận bộ lọc + phân trang phía server:
//   { page, limit, search, plan, status }
// plan/status bỏ trống hoặc 'all' = không lọc.
// Response list: { success, data: [...], meta: { page, limit, total, total_pages } }
// Response get():  data kèm project_count và subscription (null nếu không có gói active).
//
// LƯU Ý: remove() là XOÁ CỨNG — kéo theo toàn bộ project / landing page của user.
// Muốn tạm khoá thì dùng update(id, { is_active: false }).
export const usersApi = {
  list: (params, config) => api.get('/admin/users', { params, ...config }),
  get: (id) => api.get(`/admin/users/${id}`),
  create: (payload) => api.post('/admin/users', payload),
  update: (id, payload) => api.put(`/admin/users/${id}`, payload),
  remove: (id) => api.delete(`/admin/users/${id}`),
}
