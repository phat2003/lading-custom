import api from './client'

// Ảnh thumbnail đến từ hai nơi khác nhau:
//   /uploads/...  -> file admin upload, do BACKEND phục vụ (xem router: r.GET("/uploads/*filepath"))
//   /templates/... -> ảnh mẫu nằm trong frontend/public, do chính FE phục vụ
// Nên chỉ ghép origin của API cho nhóm đầu; giữ nguyên phần còn lại.
export function resolveThumbnailUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return ''
  const raw = value.trim()

  if (/^https?:\/\//i.test(raw)) return raw
  if (!raw.startsWith('/uploads/')) return raw

  try {
    const apiOrigin = new URL(
      api.defaults.baseURL,
      globalThis.location?.origin || 'http://localhost',
    ).origin
    return new URL(raw, `${apiOrigin}/`).toString()
  } catch {
    return raw
  }
}

export function mapTemplateFromApi(template) {
  if (!template || !template.template_id || !template.name) return null
  if (template.type !== 'system' && template.type !== 'user') return null

  return {
    id: template.template_id,
    name: template.name,
    type: template.type,
    ownerId: template.owner_id || null,
    templateSource: template.template_source || null,
    category: template.category || '',
    status: template.status || null,
    tier: template.tier || null,
    thumbnailUrl: resolveThumbnailUrl(template.thumbnail_url),
    sectionCount:
      typeof template.section_count === 'number' ? template.section_count : null,
    createdAt: template.created_at || null,
    updatedAt: template.updated_at || null,
  }
}

// CRUD System Template (admin). Khớp đúng route backend đã có:
//   POST   /api/v1/admin/templates
//   GET    /api/v1/admin/templates
//   GET    /api/v1/admin/templates/:id
//   PUT    /api/v1/admin/templates/:id
//   DELETE /api/v1/admin/templates/:id
//
// list() nhận bộ lọc + phân trang phía server:
//   { page, limit, search, category, status, tier }
// category/status/tier bỏ trống hoặc 'all' = không lọc.
// Response: { success, message, data: [...], meta: { page, limit, total, total_pages } }
export const templatesApi = {
  list: (params, config) => api.get('/admin/templates', { params, ...config }),
  get: (id, config) => api.get(`/admin/templates/${id}`, config),
  create: (payload) => api.post('/admin/templates', payload),
  update: (id, payload) => api.put(`/admin/templates/${id}`, payload),
  remove: (id) => api.delete(`/admin/templates/${id}`),

  // Ghi đè TOÀN BỘ nội dung template — builder gửi khi bấm "Lưu bản nháp"/"Xuất bản".
  //   PUT /api/v1/admin/templates/:id/sections
  //   { sections: [{ section_type, section_content, source_section_template_id }] }
  // Backend tự gán order_index theo thứ tự phần tử trong mảng.
  // Bắt buộc tối thiểu 1 section: mảng rỗng sẽ bị trả 400 (tránh xoá trắng template).
  replaceSections: (id, sections) => api.put(`/admin/templates/${id}/sections`, { sections }),
}

// Template cho user thường (trang "chọn mẫu") — chỉ đọc, backend tự lọc
// mẫu hệ thống đã publish + mẫu của chính user đang đăng nhập.
//   GET /api/v1/templates?page&limit&search&category&tier
export const userTemplatesApi = {
  list: (params, config) => api.get('/templates', { params, ...config }),
}

// Template cho TRANG CHỦ CÔNG KHAI — không cần đăng nhập, backend chỉ trả mẫu
// hệ thống đã publish.
//   GET /api/v1/p/templates?page&limit&category&tier
export const publicTemplatesApi = {
  list: (params, config) => api.get('/p/templates', { params, ...config }),
}
