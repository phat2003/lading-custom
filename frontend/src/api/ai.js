import api from './client'

// AI Generator.
//   POST /api/v1/ai/generate    — { prompt, template_type, style }
//   GET  /api/v1/ai/history     — lịch sử của CHÍNH mình, có meta phân trang
//   GET  /api/v1/ai/credits     — { used, total, reset_at }
//   GET  /api/v1/admin/ai/logs  — log toàn hệ thống (chỉ admin, cho Dashboard)
//
// ⚠️ CHƯA TÍCH HỢP MÔ HÌNH AI: generate() ghi lịch sử thật nhưng KHÔNG sinh ra
// thiết kế nào. Mọi lượt tạo trả về status 'failed' kèm error_message giải
// thích, và KHÔNG bị trừ hạn mức (chỉ lượt 'done' mới tính phí).
// Xem internal/service/ai_service.go, khối "CHỖ CẮM MÔ HÌNH AI".
//
// Mã lỗi generate(): 403 = AI đang tắt hoặc hết hạn mức cá nhân,
// 429 = hệ thống đã đạt trần tạo trong ngày (ai_daily_limit ở trang Settings).
export const aiApi = {
  generate: (payload) => api.post('/ai/generate', payload),
  history: (params, config) => api.get('/ai/history', { params, ...config }),
  credits: (config) => api.get('/ai/credits', config),
}

export const adminAiApi = {
  logs: (params, config) => api.get('/admin/ai/logs', { params, ...config }),
}
