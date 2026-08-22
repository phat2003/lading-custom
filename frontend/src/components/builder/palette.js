import {
  TypeIcon,
  ImageIcon,
  GridIcon,
  SparklesIcon,
  MousePointerIcon,
  SquareIcon,
  MinusIcon,
  VideoIcon,
  InputIcon,
  LayoutTemplateIcon,
  ClockIcon,
} from '../icons'
import { ICON_NAMES } from './iconMap'

// Palette 2 tầng: mỗi "type" mở ra một gallery các "variant" (mẫu biến thể) để kéo.
// variant thường: { label, type, content, style } | variant block: { label, block }.
export const paletteTypes = [
  {
    key: 'text',
    label: 'Văn bản',
    icon: TypeIcon,
    variants: [
      { label: 'Tiêu đề lớn', type: 'heading', content: 'Tiêu đề lớn', style: { fontSize: 32, fontFamily: 'Inter', fontWeight: 800, color: '#111827' } },
      { label: 'Tiêu đề vừa', type: 'heading', content: 'Tiêu đề vừa', style: { fontSize: 24, fontFamily: 'Inter', fontWeight: 700, color: '#111827' } },
      { label: 'Đoạn văn', type: 'paragraph', content: 'Nhập đoạn văn của bạn ở đây...', style: { fontSize: 16, fontFamily: 'Inter', color: '#374151' } },
      { label: 'Nhãn', type: 'label', content: 'Văn bản mẫu', style: { fontSize: 16, fontFamily: 'Inter', color: '#374151' } },
      { label: 'Danh sách', type: 'list', content: 'Mục thứ nhất\nMục thứ hai\nMục thứ ba', style: { width: 240, fontSize: 16, fontFamily: 'Inter', color: '#374151' } },
      { label: 'Trích dẫn', type: 'quote', content: 'Một câu trích dẫn ấn tượng của bạn.', style: { width: 340, fontSize: 18, fontFamily: 'Georgia', fontStyle: 'italic', color: '#374151' } },
    ],
  },
  {
    key: 'button',
    label: 'Nút bấm',
    icon: MousePointerIcon,
    variants: [
      { label: 'Nút xanh', type: 'button', content: 'Nút bấm', style: { width: 140, height: 44, fontSize: 14, fontFamily: 'Inter', fontWeight: 600, color: '#ffffff', bgColor: '#2563eb', borderRadius: 8 } },
      { label: 'Nút tối', type: 'button', content: 'Nút bấm', style: { width: 140, height: 44, fontSize: 14, fontFamily: 'Inter', fontWeight: 600, color: '#ffffff', bgColor: '#111827', borderRadius: 8 } },
      { label: 'Nút viền', type: 'button', content: 'Nút bấm', style: { width: 140, height: 44, fontSize: 14, fontFamily: 'Inter', fontWeight: 600, color: '#2563eb', bgColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#2563eb' } },
      { label: 'Nút bo tròn', type: 'button', content: 'Nút bấm', style: { width: 150, height: 46, fontSize: 14, fontFamily: 'Inter', fontWeight: 600, color: '#ffffff', bgColor: '#2563eb', borderRadius: 999 } },
    ],
  },
  {
    key: 'image',
    label: 'Ảnh',
    icon: ImageIcon,
    variants: [
      { label: 'Ảnh', type: 'image', content: '', style: { width: 220, height: 140, borderRadius: 8 } },
      { label: 'Ảnh tròn', type: 'image', content: '', style: { width: 120, height: 120, borderRadius: 999 } },
    ],
  },
  {
    key: 'gallery',
    label: 'Gallery',
    icon: GridIcon,
    variants: [
      { label: 'Lưới 3 ảnh', type: 'gallery', content: '3', style: { width: 360, height: 120, borderRadius: 8 } },
      { label: 'Lưới 6 ảnh', type: 'gallery', content: '6', style: { width: 360, height: 240, borderRadius: 8 } },
    ],
  },
  {
    key: 'icon',
    label: 'Biểu tượng',
    icon: SparklesIcon,
    variants: ICON_NAMES.map((name) => ({ label: name, type: 'icon', content: name, style: { fontSize: 40, color: '#2563eb' } })),
  },
  {
    key: 'divider',
    label: 'Đường kẻ',
    icon: MinusIcon,
    variants: [
      { label: 'Nét liền', type: 'divider', content: '', style: { width: 240, height: 12, color: '#9ca3af', borderStyle: 'solid', lineWidth: 2 } },
      { label: 'Nét đứt', type: 'divider', content: '', style: { width: 240, height: 12, color: '#9ca3af', borderStyle: 'dashed', lineWidth: 2 } },
      { label: 'Chấm', type: 'divider', content: '', style: { width: 240, height: 12, color: '#9ca3af', borderStyle: 'dotted', lineWidth: 3 } },
      { label: 'Đậm', type: 'divider', content: '', style: { width: 240, height: 14, color: '#111827', borderStyle: 'solid', lineWidth: 4 } },
    ],
  },
  {
    key: 'shape',
    label: 'Hình hộp',
    icon: SquareIcon,
    variants: [
      { label: 'Chữ nhật', type: 'box', content: '', style: { width: 160, height: 100, bgColor: '#dbeafe' } },
      { label: 'Bo góc', type: 'box', content: '', style: { width: 160, height: 100, bgColor: '#dbeafe', borderRadius: 16 } },
      { label: 'Hình tròn', type: 'box', content: '', style: { width: 120, height: 120, bgColor: '#dbeafe', borderRadius: 999 } },
      { label: 'Khối viền', type: 'box', content: '', style: { width: 160, height: 100, bgColor: '#ffffff', borderRadius: 8, borderWidth: 2, borderColor: '#2563eb' } },
    ],
  },
  {
    key: 'form',
    label: 'Biểu mẫu',
    icon: InputIcon,
    variants: [
      { label: 'Ô nhập', type: 'input', content: 'Nhập nội dung...', style: { width: 240, height: 40, fontSize: 14, fontFamily: 'Inter', color: '#111827', bgColor: '#ffffff', borderRadius: 6 } },
      { label: 'Ô văn bản', type: 'textarea', content: 'Nhập nội dung...', style: { width: 260, height: 100, fontSize: 14, fontFamily: 'Inter', color: '#111827', bgColor: '#ffffff', borderRadius: 6 } },
      { label: 'Checkbox', type: 'checkbox', content: 'Tôi đồng ý với điều khoản', style: { fontSize: 14, fontFamily: 'Inter', color: '#374151' } },
      { label: 'Dropdown', type: 'select', content: 'Lựa chọn 1\nLựa chọn 2\nLựa chọn 3', style: { width: 220, height: 40, fontSize: 14, color: '#111827', bgColor: '#ffffff', borderRadius: 6 } },
    ],
  },
  {
    key: 'video',
    label: 'Video',
    icon: VideoIcon,
    variants: [{ label: 'Video', type: 'video', content: '', style: { width: 320, height: 180, borderRadius: 8 } }],
  },
  {
    key: 'section',
    label: 'Section',
    icon: LayoutTemplateIcon,
    variants: [
      { label: '1 cột', type: 'section', content: '', style: { width: 820, height: 300, bgColor: '#f3f4f6', borderRadius: 8, columns: 1 } },
      { label: '2 cột', type: 'section', content: '', style: { width: 820, height: 300, bgColor: '#f3f4f6', borderRadius: 8, columns: 2 } },
      { label: '3 cột', type: 'section', content: '', style: { width: 820, height: 300, bgColor: '#f3f4f6', borderRadius: 8, columns: 3 } },
    ],
  },
  {
    key: 'advanced',
    label: 'Nâng cao',
    icon: ClockIcon,
    variants: [
      { label: 'Đếm ngược', type: 'countdown', content: '2026-12-31T23:59', style: { fontSize: 28, fontFamily: 'Inter', fontWeight: 700, color: '#111827' } },
      { label: 'Đánh giá sao', type: 'rating', content: '4', style: { fontSize: 28, color: '#f59e0b' } },
      { label: 'Thanh tiến trình', type: 'progress', content: '70', style: { width: 260, height: 14, color: '#2563eb' } },
      { label: 'Bảng', type: 'table', content: 'Tên|Vai trò\nAn|Quản lý\nBình|Nhân viên', style: { width: 320, fontSize: 14, fontFamily: 'Inter', color: '#374151' } },
      { label: 'Menu điều hướng', type: 'menu', content: 'Trang chủ\nGiới thiệu\nDịch vụ\nLiên hệ', style: { width: 420, fontSize: 15, fontFamily: 'Inter', color: '#111827' } },
      { label: 'Nhúng HTML', type: 'embed', content: '<div style="padding:12px;background:#eef2ff;border-radius:8px;text-align:center">Mã HTML của bạn</div>', style: { width: 280, height: 80 } },
      { label: 'Thẻ (Card)', type: 'card', content: 'Tiêu đề thẻ|Mô tả ngắn gọn cho thẻ này.', style: { width: 240, height: 150, bgColor: '#ffffff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: 16, fontFamily: 'Inter', color: '#111827' } },
      { label: 'Icon-box', type: 'iconbox', content: 'Tính năng|Mô tả tính năng ngắn gọn.', style: { width: 200, fontSize: 16, fontFamily: 'Inter', color: '#111827', textAlign: 'center' } },
    ],
  },
]

// Section mẫu do admin tạo, user kéo dùng lại (sau này lấy từ Section Template Library qua API).
export const paletteBlocks = {
  key: 'block',
  label: 'Section mẫu',
  icon: LayoutTemplateIcon,
  variants: [
    {
      label: 'Hero',
      block: {
        section: { sectionType: 'hero', style: { width: 820, height: 360, bgColor: '#f8fafc', borderRadius: 0 } },
        children: [
          { type: 'heading', content: 'Tiêu đề nổi bật của bạn', x: 210, y: 90, style: { width: 400, fontSize: 40, fontFamily: 'Inter', fontWeight: 800, color: '#0f172a', textAlign: 'center' } },
          { type: 'paragraph', content: 'Mô tả ngắn thu hút khách hàng ngay từ cái nhìn đầu tiên.', x: 210, y: 170, style: { width: 400, fontSize: 16, fontFamily: 'Inter', color: '#475569', textAlign: 'center' } },
          { type: 'button', content: 'Bắt đầu ngay', x: 350, y: 240, style: { width: 140, height: 44, fontSize: 15, fontFamily: 'Inter', fontWeight: 600, color: '#ffffff', bgColor: '#2563eb', borderRadius: 8 } },
        ],
      },
    },
    {
      label: 'Đầu trang',
      block: {
        section: { sectionType: 'header', style: { width: 820, height: 72, bgColor: '#ffffff' } },
        children: [
          { type: 'label', content: 'LOGO', x: 40, y: 24, style: { width: 90, fontSize: 20, fontFamily: 'Inter', fontWeight: 800, color: '#111827' } },
          { type: 'menu', content: 'Trang chủ\nGiới thiệu\nDịch vụ\nLiên hệ', x: 320, y: 26, style: { width: 360, fontSize: 14, fontFamily: 'Inter', color: '#374151' } },
          { type: 'button', content: 'Đăng nhập', x: 700, y: 16, style: { width: 100, height: 40, fontSize: 13, fontFamily: 'Inter', fontWeight: 600, color: '#ffffff', bgColor: '#2563eb', borderRadius: 8 } },
        ],
      },
    },
    {
      label: 'Giới thiệu',
      block: {
        section: { sectionType: 'about', style: { width: 820, height: 300, bgColor: '#ffffff' } },
        children: [
          { type: 'image', content: '', x: 60, y: 60, style: { width: 300, height: 180, borderRadius: 12 } },
          { type: 'heading', content: 'Về chúng tôi', x: 420, y: 70, style: { width: 340, fontSize: 26, fontFamily: 'Inter', fontWeight: 700, color: '#0f172a' } },
          { type: 'paragraph', content: 'Chúng tôi cung cấp giải pháp giúp bạn xây dựng landing page nhanh chóng, chuyên nghiệp mà không cần biết lập trình.', x: 420, y: 120, style: { width: 340, fontSize: 16, fontFamily: 'Inter', color: '#475569' } },
        ],
      },
    },
    {
      label: 'Tính năng',
      block: {
        section: { sectionType: 'features', style: { width: 820, height: 320, bgColor: '#ffffff' } },
        children: [
          { type: 'heading', content: 'Tính năng nổi bật', x: 300, y: 30, style: { width: 220, fontSize: 26, fontFamily: 'Inter', fontWeight: 700, color: '#0f172a', textAlign: 'center' } },
          { type: 'iconbox', content: 'Nhanh chóng|Tốc độ xử lý vượt trội.', x: 60, y: 110, style: { width: 200, fontSize: 16, fontFamily: 'Inter', color: '#111827', textAlign: 'center' } },
          { type: 'iconbox', content: 'An toàn|Bảo mật dữ liệu tối đa.', x: 310, y: 110, style: { width: 200, fontSize: 16, fontFamily: 'Inter', color: '#111827', textAlign: 'center' } },
          { type: 'iconbox', content: 'Dễ dùng|Giao diện trực quan.', x: 560, y: 110, style: { width: 200, fontSize: 16, fontFamily: 'Inter', color: '#111827', textAlign: 'center' } },
        ],
      },
    },
    {
      label: 'Bảng giá',
      block: {
        section: { sectionType: 'pricing', style: { width: 820, height: 380, bgColor: '#f8fafc' } },
        children: [
          { type: 'heading', content: 'Bảng giá', x: 350, y: 28, style: { width: 120, fontSize: 28, fontFamily: 'Inter', fontWeight: 700, color: '#0f172a', textAlign: 'center' } },
          { type: 'card', content: 'Cơ bản|0đ / tháng', x: 60, y: 100, style: { width: 220, height: 230, bgColor: '#ffffff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 18, fontFamily: 'Inter', color: '#111827', textAlign: 'center' } },
          { type: 'card', content: 'Pro|299.000đ / tháng', x: 300, y: 90, style: { width: 220, height: 250, bgColor: '#2563eb', borderRadius: 12, boxShadow: '0 6px 16px rgba(37,99,235,0.3)', fontSize: 18, fontFamily: 'Inter', color: '#ffffff', textAlign: 'center' } },
          { type: 'card', content: 'Doanh nghiệp|Liên hệ', x: 540, y: 100, style: { width: 220, height: 230, bgColor: '#ffffff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 18, fontFamily: 'Inter', color: '#111827', textAlign: 'center' } },
        ],
      },
    },
    {
      label: 'Đánh giá',
      block: {
        section: { sectionType: 'testimonial', style: { width: 820, height: 280, bgColor: '#ffffff' } },
        children: [
          { type: 'heading', content: 'Khách hàng nói gì', x: 290, y: 28, style: { width: 240, fontSize: 26, fontFamily: 'Inter', fontWeight: 700, color: '#0f172a', textAlign: 'center' } },
          { type: 'card', content: '"Sản phẩm rất tuyệt vời!"|— Nguyễn Văn A', x: 80, y: 100, style: { width: 300, height: 140, bgColor: '#f8fafc', borderRadius: 12, fontSize: 16, fontFamily: 'Inter', color: '#111827' } },
          { type: 'card', content: '"Dịch vụ rất hài lòng."|— Trần Thị B', x: 440, y: 100, style: { width: 300, height: 140, bgColor: '#f8fafc', borderRadius: 12, fontSize: 16, fontFamily: 'Inter', color: '#111827' } },
        ],
      },
    },
    {
      label: 'FAQ',
      block: {
        section: { sectionType: 'faq', style: { width: 820, height: 300, bgColor: '#f8fafc' } },
        children: [
          { type: 'heading', content: 'Câu hỏi thường gặp', x: 280, y: 28, style: { width: 260, fontSize: 26, fontFamily: 'Inter', fontWeight: 700, color: '#0f172a', textAlign: 'center' } },
          { type: 'list', content: 'Làm sao để đăng ký tài khoản?\nChính sách hoàn tiền như thế nào?\nHỗ trợ kỹ thuật ra sao?\nCó dùng thử miễn phí không?', x: 120, y: 100, style: { width: 580, fontSize: 16, fontFamily: 'Inter', color: '#374151' } },
        ],
      },
    },
    {
      label: 'Đội ngũ',
      block: {
        section: { sectionType: 'team', style: { width: 820, height: 300, bgColor: '#ffffff' } },
        children: [
          { type: 'heading', content: 'Đội ngũ của chúng tôi', x: 280, y: 28, style: { width: 260, fontSize: 26, fontFamily: 'Inter', fontWeight: 700, color: '#0f172a', textAlign: 'center' } },
          { type: 'card', content: 'Nguyễn A|CEO', x: 100, y: 100, style: { width: 180, height: 150, bgColor: '#f8fafc', borderRadius: 12, fontSize: 16, fontFamily: 'Inter', color: '#111827', textAlign: 'center' } },
          { type: 'card', content: 'Trần B|CTO', x: 320, y: 100, style: { width: 180, height: 150, bgColor: '#f8fafc', borderRadius: 12, fontSize: 16, fontFamily: 'Inter', color: '#111827', textAlign: 'center' } },
          { type: 'card', content: 'Lê C|Designer', x: 540, y: 100, style: { width: 180, height: 150, bgColor: '#f8fafc', borderRadius: 12, fontSize: 16, fontFamily: 'Inter', color: '#111827', textAlign: 'center' } },
        ],
      },
    },
    {
      label: 'Thống kê',
      block: {
        section: { sectionType: 'stats', style: { width: 820, height: 180, bgColor: '#0f172a' } },
        children: [
          { type: 'heading', content: '1,200+', x: 120, y: 50, style: { width: 160, fontSize: 34, fontFamily: 'Inter', fontWeight: 800, color: '#ffffff', textAlign: 'center' } },
          { type: 'label', content: 'Khách hàng', x: 120, y: 112, style: { width: 160, fontSize: 14, fontFamily: 'Inter', color: '#94a3b8', textAlign: 'center' } },
          { type: 'heading', content: '98%', x: 330, y: 50, style: { width: 160, fontSize: 34, fontFamily: 'Inter', fontWeight: 800, color: '#ffffff', textAlign: 'center' } },
          { type: 'label', content: 'Hài lòng', x: 330, y: 112, style: { width: 160, fontSize: 14, fontFamily: 'Inter', color: '#94a3b8', textAlign: 'center' } },
          { type: 'heading', content: '50+', x: 540, y: 50, style: { width: 160, fontSize: 34, fontFamily: 'Inter', fontWeight: 800, color: '#ffffff', textAlign: 'center' } },
          { type: 'label', content: 'Đối tác', x: 540, y: 112, style: { width: 160, fontSize: 14, fontFamily: 'Inter', color: '#94a3b8', textAlign: 'center' } },
        ],
      },
    },
    {
      label: 'CTA',
      block: {
        section: { sectionType: 'cta', style: { width: 820, height: 200, bgColor: '#2563eb', borderRadius: 12 } },
        children: [
          { type: 'heading', content: 'Sẵn sàng bắt đầu?', x: 260, y: 55, style: { width: 300, fontSize: 28, fontFamily: 'Inter', fontWeight: 700, color: '#ffffff', textAlign: 'center' } },
          { type: 'button', content: 'Đăng ký miễn phí', x: 320, y: 115, style: { width: 180, height: 44, fontSize: 15, fontFamily: 'Inter', fontWeight: 600, color: '#2563eb', bgColor: '#ffffff', borderRadius: 8 } },
        ],
      },
    },
    {
      label: 'Chân trang',
      block: {
        section: { sectionType: 'footer', style: { width: 820, height: 160, bgColor: '#0f172a' } },
        children: [
          { type: 'label', content: 'Giới thiệu    ·    Điều khoản    ·    Liên hệ', x: 270, y: 50, style: { width: 280, fontSize: 14, fontFamily: 'Inter', color: '#e2e8f0', textAlign: 'center' } },
          { type: 'label', content: '© 2026 Amazing Tech. All rights reserved.', x: 260, y: 100, style: { width: 300, fontSize: 13, fontFamily: 'Inter', color: '#94a3b8', textAlign: 'center' } },
        ],
      },
    },
  ],
}

export const fonts = ['Inter', 'Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Roboto']

