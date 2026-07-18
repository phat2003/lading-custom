import {
  TypeIcon,
  TextIcon,
  TagIcon,
  ImageIcon,
  SparklesIcon,
  MousePointerIcon,
  SquareIcon,
  MinusIcon,
  MoveVerticalIcon,
  VideoIcon,
  InputIcon,
  LayoutTemplateIcon,
  ListIcon,
  QuoteIcon,
  GlobeIcon,
  CheckSquareIcon,
  ChevronsUpDownIcon,
  ClockIcon,
} from '../../../components/icons'

// Nhóm phần tử; mỗi nhóm là một mục dropdown trong panel "Thêm".
// item thường: { type, content, style }. item block mẫu: { block: {section, children} }.
export const paletteGroups = [
  {
    title: 'Phần tử',
    icon: TypeIcon,
    items: [
      { type: 'heading', label: 'Tiêu đề', icon: TypeIcon, content: 'Tiêu đề mới', style: { fontSize: 28, fontFamily: 'Inter', fontWeight: 700, color: '#111827' } },
      { type: 'paragraph', label: 'Đoạn văn', icon: TextIcon, content: 'Nhập đoạn văn của bạn ở đây...', style: { fontSize: 16, fontFamily: 'Inter', fontWeight: 400, color: '#374151' } },
      { type: 'label', label: 'Nhãn (Label)', icon: TagIcon, content: 'Văn bản mẫu', style: { fontSize: 16, fontFamily: 'Inter', fontWeight: 400, color: '#374151' } },
      { type: 'button', label: 'Nút bấm', icon: MousePointerIcon, content: 'Nút bấm', style: { fontSize: 14, fontFamily: 'Inter', fontWeight: 600, color: '#ffffff', bgColor: '#2563eb', borderRadius: 6 } },
      { type: 'list', label: 'Danh sách', icon: ListIcon, content: 'Mục thứ nhất\nMục thứ hai\nMục thứ ba', style: { width: 240, fontSize: 16, fontFamily: 'Inter', color: '#374151' } },
      { type: 'quote', label: 'Trích dẫn', icon: QuoteIcon, content: 'Một câu trích dẫn ấn tượng của bạn.', style: { width: 340, fontSize: 18, fontFamily: 'Georgia', fontStyle: 'italic', color: '#374151' } },
    ],
  },
  {
    title: 'Media',
    icon: ImageIcon,
    items: [
      { type: 'image', label: 'Ảnh', icon: ImageIcon, content: '', style: { width: 220, height: 140, borderRadius: 8 } },
      { type: 'video', label: 'Video', icon: VideoIcon, content: '', style: { width: 320, height: 180, borderRadius: 8 } },
      { type: 'icon', label: 'Icon', icon: SparklesIcon, content: '', style: { fontSize: 48, color: '#2563eb' } },
      { type: 'social', label: 'Social icons', icon: GlobeIcon, content: '', style: { fontSize: 20 } },
    ],
  },
  {
    title: 'Biểu mẫu',
    icon: InputIcon,
    items: [
      { type: 'input', label: 'Ô nhập', icon: InputIcon, content: 'Nhập nội dung...', style: { width: 240, height: 40, fontSize: 14, fontFamily: 'Inter', color: '#111827', bgColor: '#ffffff', borderRadius: 6 } },
      { type: 'textarea', label: 'Ô văn bản', icon: InputIcon, content: 'Nhập nội dung...', style: { width: 260, height: 100, fontSize: 14, fontFamily: 'Inter', color: '#111827', bgColor: '#ffffff', borderRadius: 6 } },
      { type: 'checkbox', label: 'Checkbox', icon: CheckSquareIcon, content: 'Tôi đồng ý với điều khoản', style: { fontSize: 14, fontFamily: 'Inter', color: '#374151' } },
      { type: 'select', label: 'Dropdown', icon: ChevronsUpDownIcon, content: 'Lựa chọn 1\nLựa chọn 2\nLựa chọn 3', style: { width: 220, height: 40, fontSize: 14, color: '#111827', bgColor: '#ffffff', borderRadius: 6 } },
    ],
  },
  {
    title: 'Bố cục',
    icon: LayoutTemplateIcon,
    items: [
      { type: 'section', label: 'Section (khối chứa)', icon: LayoutTemplateIcon, content: '', style: { width: 820, height: 300, bgColor: '#f3f4f6', borderRadius: 8, columns: 1 } },
      { type: 'box', label: 'Hình hộp', icon: SquareIcon, content: '', style: { width: 160, height: 100, bgColor: '#dbeafe', borderRadius: 8 } },
      { type: 'card', label: 'Thẻ (Card)', icon: SquareIcon, content: 'Tiêu đề thẻ|Mô tả ngắn gọn cho thẻ này.', style: { width: 240, height: 150, bgColor: '#ffffff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: 16, fontFamily: 'Inter', color: '#111827' } },
      { type: 'iconbox', label: 'Icon-box', icon: SparklesIcon, content: 'Tính năng|Mô tả tính năng ngắn gọn.', style: { width: 200, fontSize: 16, fontFamily: 'Inter', color: '#111827', textAlign: 'center' } },
      { type: 'divider', label: 'Đường kẻ', icon: MinusIcon, content: '', style: { width: 240, height: 12, color: '#d1d5db' } },
      { type: 'spacer', label: 'Khoảng trống', icon: MoveVerticalIcon, content: '', style: { width: 200, height: 40 } },
    ],
  },
  {
    title: 'Nâng cao',
    icon: ClockIcon,
    items: [
      { type: 'countdown', label: 'Đếm ngược', icon: ClockIcon, content: '2026-12-31T23:59', style: { fontSize: 28, fontFamily: 'Inter', fontWeight: 700, color: '#111827' } },
    ],
  },
]

// Block mẫu: kéo vào sẽ sinh 1 Section + nhiều phần tử con (toạ độ tương đối trong section).
export const paletteBlocks = {
  title: 'Block mẫu',
  icon: LayoutTemplateIcon,
  items: [
    {
      label: 'Hero',
      icon: LayoutTemplateIcon,
      block: {
        section: { style: { width: 820, height: 360, bgColor: '#f8fafc', borderRadius: 0 } },
        children: [
          { type: 'heading', content: 'Tiêu đề nổi bật của bạn', x: 210, y: 90, style: { width: 400, fontSize: 40, fontFamily: 'Inter', fontWeight: 800, color: '#0f172a', textAlign: 'center' } },
          { type: 'paragraph', content: 'Mô tả ngắn thu hút khách hàng ngay từ cái nhìn đầu tiên.', x: 210, y: 170, style: { width: 400, fontSize: 16, fontFamily: 'Inter', color: '#475569', textAlign: 'center' } },
          { type: 'button', content: 'Bắt đầu ngay', x: 350, y: 240, style: { width: 140, height: 44, fontSize: 15, fontFamily: 'Inter', fontWeight: 600, color: '#ffffff', bgColor: '#2563eb', borderRadius: 8 } },
        ],
      },
    },
    {
      label: 'CTA',
      icon: MousePointerIcon,
      block: {
        section: { style: { width: 820, height: 200, bgColor: '#2563eb', borderRadius: 12 } },
        children: [
          { type: 'heading', content: 'Sẵn sàng bắt đầu?', x: 260, y: 55, style: { width: 300, fontSize: 28, fontFamily: 'Inter', fontWeight: 700, color: '#ffffff', textAlign: 'center' } },
          { type: 'button', content: 'Đăng ký miễn phí', x: 320, y: 115, style: { width: 180, height: 44, fontSize: 15, fontFamily: 'Inter', fontWeight: 600, color: '#2563eb', bgColor: '#ffffff', borderRadius: 8 } },
        ],
      },
    },
    {
      label: 'Tính năng',
      icon: SparklesIcon,
      block: {
        section: { style: { width: 820, height: 320, bgColor: '#ffffff' } },
        children: [
          { type: 'heading', content: 'Tính năng nổi bật', x: 300, y: 30, style: { width: 220, fontSize: 26, fontFamily: 'Inter', fontWeight: 700, color: '#0f172a', textAlign: 'center' } },
          { type: 'iconbox', content: 'Nhanh chóng|Tốc độ xử lý vượt trội.', x: 60, y: 110, style: { width: 200, fontSize: 16, fontFamily: 'Inter', color: '#111827', textAlign: 'center' } },
          { type: 'iconbox', content: 'An toàn|Bảo mật dữ liệu tối đa.', x: 310, y: 110, style: { width: 200, fontSize: 16, fontFamily: 'Inter', color: '#111827', textAlign: 'center' } },
          { type: 'iconbox', content: 'Dễ dùng|Giao diện trực quan.', x: 560, y: 110, style: { width: 200, fontSize: 16, fontFamily: 'Inter', color: '#111827', textAlign: 'center' } },
        ],
      },
    },
    {
      label: 'Footer',
      icon: MinusIcon,
      block: {
        section: { style: { width: 820, height: 160, bgColor: '#0f172a' } },
        children: [
          { type: 'label', content: 'Giới thiệu    ·    Điều khoản    ·    Liên hệ', x: 270, y: 50, style: { width: 280, fontSize: 14, fontFamily: 'Inter', color: '#e2e8f0', textAlign: 'center' } },
          { type: 'label', content: '© 2026 Amazing Tech. All rights reserved.', x: 260, y: 100, style: { width: 300, fontSize: 13, fontFamily: 'Inter', color: '#94a3b8', textAlign: 'center' } },
        ],
      },
    },
  ],
}

export const fonts = ['Inter', 'Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Roboto']
