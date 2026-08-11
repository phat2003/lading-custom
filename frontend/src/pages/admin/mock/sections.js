// Mock Section Template Library cho trang admin Section.
// Shape gần với entity 10.1.4 (section_template): { id, name (display_name),
// type (section_type), usedIn (số template đang dùng — cần query ở backend) }.
// Backend hiện có model SectionTemplateLibrary nhưng CHƯA có endpoint.
export const sectionsMock = [
  { id: 1, name: 'Hero Chia Đôi Hiện Đại', type: 'hero', usedIn: 14 },
  { id: 2, name: 'Lưới 3 Cột', type: 'features', usedIn: 28 },
  { id: 3, name: 'Bảng Giá Phân Cấp Bento', type: 'pricing', usedIn: 8 },
  { id: 4, name: 'Đầu Trang Hiệu Ứng Thủy Tinh', type: 'header', usedIn: 52 },
  { id: 5, name: 'CTA Hiệu Ứng Phát Sáng', type: 'cta', usedIn: 19 },
  { id: 6, name: 'Chân Trang Danh Mục Tối Giản', type: 'footer', usedIn: 41 },
  { id: 7, name: 'Hero Gradient Tối', type: 'hero', usedIn: 24 },
  { id: 8, name: 'Tính Năng Dạng Thẻ', type: 'features', usedIn: 17 },
  { id: 9, name: 'Bảng Giá 2 Cột', type: 'pricing', usedIn: 11 },
  { id: 10, name: 'Đầu Trang Trong Suốt', type: 'header', usedIn: 68 },
  { id: 11, name: 'CTA Nút Kép', type: 'cta', usedIn: 9 },
  { id: 12, name: 'Chân Trang Nhiều Cột', type: 'footer', usedIn: 33 },
]
