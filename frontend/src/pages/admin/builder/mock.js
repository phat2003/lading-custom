import {
  LayoutDashboardIcon,
  ImageIcon,
  LayersIcon,
  LayoutTemplateIcon,
  FolderIcon,
  UserIcon,
  SettingsIcon,
} from '../../../components/icons'

export const primaryNav = [
  { value: 'elements', label: 'Phần tử', icon: LayoutDashboardIcon },
  { value: 'assets', label: 'Assets', icon: ImageIcon },
  { value: 'section', label: 'Section', icon: LayersIcon },
  { value: 'popup', label: 'Popup', icon: LayoutTemplateIcon },
  { value: 'dropbox', label: 'Dropbox', icon: FolderIcon },
  { value: 'product', label: 'Sản phẩm', icon: UserIcon },
  { value: 'blog', label: 'Blog', icon: LayoutTemplateIcon },
]

export const secondaryNav = [
  { value: 'utils', label: 'Tiện ích' },
  { value: 'content', label: 'Quản lý nội dung' },
  { value: 'media', label: 'Quản lý Media' },
  { value: 'docs', label: 'Quản lý tài liệu' },
  { value: 'font', label: 'Quản lý Font' },
]

export const elements = [
  { value: 'text', label: 'Văn bản' },
  { value: 'button', label: 'Nút bấm' },
  { value: 'image', label: 'Ảnh' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'box', label: 'Hình hộp' },
  { value: 'icon', label: 'Biểu tượng' },
  { value: 'divider', label: 'Đường kẻ' },
  { value: 'form', label: 'Form' },
  { value: 'product-sample', label: 'Sản phẩm mẫu' },
  { value: 'video', label: 'Video' },
  { value: 'collection', label: 'Collection List' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'tabs', label: 'Tabs' },
  { value: 'frame', label: 'Frame' },
  { value: 'accordion', label: 'Accordion' },
]

export const textPresets = [
  { label: 'Heading 3', cls: 'text-lg font-bold' },
  { label: 'Heading 2', cls: 'text-xl font-bold' },
  { label: 'Heading 1', cls: 'text-3xl font-bold' },
  { label: 'Thêm tiêu đề 1', cls: 'text-lg font-semibold' },
  { label: 'Thêm tiêu đề 2', cls: 'text-lg font-semibold text-blue-600' },
  { label: 'Thêm tiêu đề 3', cls: 'text-xl font-medium text-orange-400' },
  { label: 'Thêm tiêu đề 4', cls: 'text-base text-red-400' },
  { label: 'Thêm tiêu đề 5', cls: 'text-sm text-gray-400' },
  { label: 'Big Title', cls: 'text-3xl font-extrabold' },
  { label: 'CAPS TITLE', cls: 'text-sm font-bold uppercase tracking-wide text-orange-500' },
]

export const devices = {
  desktop: 'max-w-full',
  tablet: 'max-w-3xl',
  mobile: 'max-w-sm',
}
