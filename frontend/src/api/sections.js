import api from './client'

// Section Template Library (admin).
// LƯU Ý: backend HIỆN CHƯA có các route này — team BE cần bổ sung
// (gợi ý nhóm route: /api/v1/admin/section-library). Định nghĩa sẵn ở đây để
// khi API xong chỉ cần thay các handler mock trong Sections.jsx.
export const sectionsApi = {
  list: () => api.get('/admin/section-library'),
  get: (id) => api.get(`/admin/section-library/${id}`),
  create: (payload) => api.post('/admin/section-library', payload),
  update: (id, payload) => api.put(`/admin/section-library/${id}`, payload),
  remove: (id) => api.delete(`/admin/section-library/${id}`),
}
