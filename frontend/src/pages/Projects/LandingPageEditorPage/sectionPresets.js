export const ELEMENT_GROUPS = [
  {
    title: 'Bố cục & Sections',
    items: [
      { type: 'section', label: 'Section', icon: '▤' },
      { type: 'columns', label: 'Cột', icon: '▥' },
    ],
  },
  {
    title: 'Cơ bản',
    items: [
      { type: 'heading', label: 'Tiêu đề', icon: 'T' },
      { type: 'text', label: 'Văn bản', icon: '≡' },
      { type: 'image', label: 'Hình ảnh', icon: '▧' },
      { type: 'button', label: 'Nút bấm', icon: '▣' },
    ],
  },
]

const DEFAULTS = {
  section: {
    title: 'Section mới',
    text: 'Nhập nội dung cho section của bạn.',
    buttonText: '',
  },
  columns: {
    title: 'Bố cục hai cột',
    text: 'Nội dung cột trái|Nội dung cột phải',
    buttonText: '',
  },
  heading: {
    title: 'Tiêu đề mới',
    text: '',
    buttonText: '',
  },
  text: {
    title: '',
    text: 'Đây là đoạn văn bản mới. Chọn section để chỉnh sửa nội dung.',
    buttonText: '',
  },
  image: {
    title: 'Hình ảnh',
    text: 'Khu vực hình ảnh',
    buttonText: '',
  },
  button: {
    title: 'Sẵn sàng bắt đầu?',
    text: 'Thêm một lời kêu gọi hành động rõ ràng cho khách truy cập.',
    buttonText: 'Bắt đầu ngay',
  },
}

export function createSection(type) {
  const content = DEFAULTS[type] || DEFAULTS.section

  return {
    id: window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    type,
    ...content,
    backgroundColor: '#f8faff',
    textColor: '#0f172a',
    align: 'center',
  }
}

export function createLegacyStarterSection() {
  return {
    ...createSection('hero'),
    type: 'hero',
    title: 'Mẫu Hero Section',
    text: 'Đây là ví dụ về một khối nội dung bạn có thể tùy chỉnh. Nhấp vào các phần tử để thay đổi thuộc tính bên phải.',
    buttonText: 'Khám phá ngay',
  }
}
