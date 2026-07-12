import api from './client'

// Cài đặt hệ thống toàn cục. BE hiện chưa có endpoint — gợi ý /admin/settings.
// Shape payload = object trong mock/settings.js (platform / ai_engine / account).
export const settingsApi = {
  get: () => api.get('/admin/settings'),
  update: (payload) => api.put('/admin/settings', payload),
}
