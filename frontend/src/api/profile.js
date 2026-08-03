import api from './client'

// Hồ sơ của chính người đang đăng nhập (mọi user, không riêng admin).
//   GET  /api/v1/profile
//   PUT  /api/v1/profile            — full_name, phone, timezone, session_timeout
//   PUT  /api/v1/profile/password   — { current_password, new_password }
//
// update() nhận payload từng phần: field nào không gửi thì giữ nguyên.
export const profileApi = {
  get: () => api.get('/profile'),
  update: (payload) => api.put('/profile', payload),
  changePassword: (payload) => api.put('/profile/password', payload),
}
