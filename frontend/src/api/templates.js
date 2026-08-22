import api from './client'

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
    thumbnailUrl: template.thumbnail_url || '',
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
