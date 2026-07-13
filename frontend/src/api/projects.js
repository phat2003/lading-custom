import api from './client'

// CRUD project của user hiện tại (khớp route backend /api/v1/projects).
// LƯU Ý: trang admin cần xem project của MỌI user — backend hiện chưa có
// endpoint đó (GET /projects chỉ trả project của người đăng nhập). Team BE cần
// bổ sung, ví dụ GET /admin/projects.
export const projectsApi = {
  list: () => api.get('/projects'),
  get: (id) => api.get(`/projects/${id}`),
  create: (payload) => api.post('/projects', payload),
  update: (id, payload) => api.put(`/projects/${id}`, payload),
  remove: (id) => api.delete(`/projects/${id}`),
}
