// Mock System Templates cho trang admin Templates.
// Shape cố tình đặt gần với response API dự kiến (GET /admin/templates) để
// sau này thay bằng backend chỉ cần đổi nguồn dữ liệu, không phải sửa UI.
//
// Ghi chú cho team BE: các field category / status / tier / sections / updatedAt
// là dữ liệu UI cần bổ sung vào model Template khi dựng schema PostgreSQL thật
// (hiện Template entity mới có: template_id, name, type, owner_id, template_source).
export const templatesMock = [
  { id: 1, name: 'SaaS Landing Pro', category: 'SaaS', status: 'Published', tier: 'Premium', sections: 6, updatedAt: '2 giờ trước' },
  { id: 2, name: 'Portfolio Grid', category: 'Portfolio', status: 'Published', tier: 'Free', sections: 4, updatedAt: '1 ngày trước' },
  { id: 3, name: 'Freebook Launch', category: 'Startup', status: 'Draft', tier: 'Free', sections: 5, updatedAt: '2 ngày trước' },
  { id: 4, name: 'Agency Showcase', category: 'Agency', status: 'Published', tier: 'Premium', sections: 7, updatedAt: '3 ngày trước' },
  { id: 5, name: 'Webinar Pro', category: 'Webinar', status: 'Draft', tier: 'Free', sections: 5, updatedAt: '4 ngày trước' },
  { id: 6, name: 'Startup Kit', category: 'SaaS', status: 'Published', tier: 'Premium', sections: 6, updatedAt: '5 ngày trước' },
  { id: 7, name: 'Creative Grid', category: 'Portfolio', status: 'Published', tier: 'Free', sections: 4, updatedAt: '6 ngày trước' },
  { id: 8, name: 'Business Landing Plus', category: 'Agency', status: 'Published', tier: 'Premium', sections: 8, updatedAt: '1 tuần trước' },
  { id: 9, name: 'Blog Standard', category: 'Startup', status: 'Draft', tier: 'Free', sections: 3, updatedAt: '1 tuần trước' },
]
