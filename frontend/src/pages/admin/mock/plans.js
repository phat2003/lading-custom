export const plans = [
  {
    id: 'free',
    name: 'Miễn phí',
    label: 'Cơ bản',
    price: '0',
    unit: '/tháng',
    features: [
      { label: '3 Dự án hoạt động', included: true },
      { label: 'Thành phần tiêu chuẩn', included: true },
      { label: 'Hỗ trợ cộng đồng', included: true },
      { label: 'Tùy chỉnh Số mẫu', included: false },
      { label: 'Quyền truy cập AI Generator', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    label: 'Doanh nghiệp',
    price: '299.000 VNĐ',
    unit: '/tháng',
    highlighted: true,
    badge: 'Phổ biến nhất',
    features: [
      { label: 'Không giới hạn số lượng Project', included: true },
      { label: 'Gắn Pixel', included: true },
      { label: 'Seo và Social', included: true },
      { label: 'Mở khóa Premium Template', included: true },
      { label: 'Xuất bản tĩnh (Static export - HTML/CSS/JS)', included: true },
      { label: 'Thương hiệu riêng (Custom Branding)', included: true },
      { label: 'Xóa hoàn toàn Watermark hệ thống', included: true },
    ],
  },
]

// Giá trị chuỗi ('Vô hạn', 'Tùy chỉnh', số...) hoặc boolean (✓/✕).
export const comparison = {
  columns: ['Miễn phí', 'Pro', 'Doanh nghiệp'],
  rows: [
    { feature: 'Dự án hoạt động', note: 'Số dự án có thể tạo và duy trì cùng lúc', values: ['3', 'Vô hạn', 'Vô hạn'] },
    { feature: 'Lượt tạo AI', note: 'Hạn mức tạo bằng năng lượng AI hàng tháng', values: ['0', '1,000', 'Tùy chỉnh'] },
    { feature: 'Tùy chỉnh CSS/JS', note: 'Chèn mã nguồn cá nhân vào trang', values: [false, true, true] },
    { feature: 'Thành viên nhóm', note: 'Số lượng người được mời cùng làm việc', values: ['1', '5', 'Vô hạn'] },
    { feature: 'Xóa thương hiệu hệ thống', note: 'Gỡ nhãn "Built with Amazing Tech"', values: [false, false, true] },
  ],
}
