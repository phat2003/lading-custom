// Cấu hình loại section — dùng chung cho tabs lọc, badge trên card, và form.
// value: khớp với section_type dự kiến ở backend (hero | header | features | ...).
export const SECTION_TYPES = [
  { value: 'hero', tab: 'Hero', badge: 'HERO', color: 'blue' },
  { value: 'header', tab: 'Đầu trang', badge: 'ĐẦU TRANG', color: 'purple' },
  { value: 'features', tab: 'Tính năng', badge: 'TÍNH NĂNG', color: 'teal' },
  { value: 'pricing', tab: 'Bảng giá', badge: 'BẢNG GIÁ', color: 'amber' },
  { value: 'cta', tab: 'CTA', badge: 'CTA', color: 'red' },
  { value: 'footer', tab: 'Chân trang', badge: 'CHÂN TRANG', color: 'gray' },
]

export const getSectionType = (value) =>
  SECTION_TYPES.find((t) => t.value === value) || {
    value,
    tab: value,
    badge: String(value).toUpperCase(),
    color: 'gray',
  }
