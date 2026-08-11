import api from './client'

// Cấu hình hệ thống toàn cục (chỉ admin).
//   GET  /api/v1/admin/settings
//   PUT  /api/v1/admin/settings
//   POST /api/v1/admin/settings/logo   (multipart/form-data, field "file")
//
// Response gồm 3 nhóm: platform / ai_engine / account.
// LƯU Ý: update() CHỈ ghi được platform + ai_engine. Nhóm account thuộc bảng
// app_user của admin đang đăng nhập -> sửa qua profileApi.update().
export const settingsApi = {
  get: (config) => api.get('/admin/settings', config),
  update: (payload) => api.put('/admin/settings', payload),
  uploadLogo: (file) => {
    const data = new FormData()
    data.append('file', file)
    // Ghi đè Content-Type để axios tự sinh boundary cho multipart.
    return api.post('/admin/settings/logo', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
