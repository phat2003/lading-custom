import api from './client'

// Bảng giá (chỉ admin).
//   GET    /api/v1/admin/plans?include_inactive=true
//   GET    /api/v1/admin/plans/:id
//   POST   /api/v1/admin/plans
//   PUT    /api/v1/admin/plans/:id
//   DELETE /api/v1/admin/plans/:id
//
// Mỗi gói trả kèm mảng features đã sắp theo sort_order.
// Khi PUT: gửi features = mảng -> THAY THẾ toàn bộ danh sách tính năng;
// không gửi features -> giữ nguyên; gửi [] -> xoá sạch tính năng.
//
// LƯU Ý: remove() chỉ xoá dòng trong bảng giá, KHÔNG đụng tới gói hiện tại của
// user (app_user.plan_type là ENUM riêng). Muốn ngừng bán mà giữ dữ liệu thì
// update(id, { is_active: false }).
export const plansApi = {
  list: (params, config) => api.get('/admin/plans', { params, ...config }),
  get: (id) => api.get(`/admin/plans/${id}`),
  create: (payload) => api.post('/admin/plans', payload),
  update: (id, payload) => api.put(`/admin/plans/${id}`, payload),
  remove: (id) => api.delete(`/admin/plans/${id}`),
}
