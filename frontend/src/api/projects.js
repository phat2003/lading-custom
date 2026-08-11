import api from './client'

// CRUD project của user hiện tại (khớp route backend /api/v1/projects).
export const projectsApi = {
  list: () => api.get('/projects'),
  get: (id) => api.get(`/projects/${id}`),
  create: (payload) => api.post('/projects', payload),
  update: (id, payload) => api.put(`/projects/${id}`, payload),
  remove: (id) => api.delete(`/projects/${id}`),
}

// Project của MỌI user — chỉ admin.
//   GET    /api/v1/admin/projects?page&limit&search&status
//   DELETE /api/v1/admin/projects/:id
//
// Mỗi dòng đã được backend JOIN sẵn: owner {user_id, full_name, email},
// template_name, status (published nếu có ít nhất 1 trang đã publish),
// page_count và published_url.
//
// LƯU Ý: remove() là XOÁ CỨNG — kéo theo landing page, section và snapshot;
// trang đang publish sẽ chết link ngay.
export const adminProjectsApi = {
  list: (params, config) => api.get('/admin/projects', { params, ...config }),
  remove: (id) => api.delete(`/admin/projects/${id}`),
}
