import api from './client'

// Số liệu tổng quan cho Admin Dashboard.
//   GET /api/v1/admin/stats
//
// Response data gồm 4 khối cùng shape { value, delta, delta_period }:
//   total_users, total_projects, total_sections, ai_generated
// delta = null nghĩa là chỉ số đó không tính tăng/giảm theo kỳ.
//
// LƯU Ý: ai_generated luôn trả 0 cho tới khi bảng ai_generation (hạng mục A5)
// được làm — backend chưa có gì để đếm.
export const statsApi = {
  get: (config) => api.get('/admin/stats', config),
}
