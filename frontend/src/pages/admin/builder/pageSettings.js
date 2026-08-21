// Thiết lập toàn trang của builder (font, khổ trang, SEO, mã chèn thêm...).
//
// LƯU Ý: backend/database chưa có chỗ chứa nhóm dữ liệu này, nên tạm lưu ở
// localStorage theo từng template. Khi API sẵn sàng chỉ cần thay 2 hàm
// loadPageSettings / savePageSettings bên dưới, phần còn lại giữ nguyên.

const STORAGE_PREFIX = 'builderPageSettings'

export const FONT_OPTIONS = [
  'Inter',
  'Open Sans',
  'Roboto',
  'Montserrat',
  'Arial',
  'Georgia',
  'Times New Roman',
  'Courier New',
]

export const DESKTOP_WIDTHS = [960, 1024, 1140, 1200]
export const MOBILE_WIDTHS = [360, 390, 420, 480]

export const LANGUAGES = [
  { value: 'vi', label: 'Vietnamese' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
]

export const DEFAULT_SETTINGS = {
  // --- Thiết lập chung ---
  fontFamily: 'Inter',
  direction: 'ltr', // ltr = trái sang phải | rtl = phải sang trái
  bgColor: '#ffffff',
  bgImage: '',
  desktopWidth: 960,
  mobileWidth: 420,
  language: 'vi',
  mobileOnly: false,
  storyPage: false,
  protectCopy: false, // chặn chuột phải / bôi đen ở trang xem trước

  // --- SEO & Social ---
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  ogImage: '',
  favicon: '',

  // --- Mã chuyển đổi (tracking) ---
  googleAnalyticsId: '',
  facebookPixelId: '',
  googleTagManagerId: '',

  // --- Mã JavaScript / CSS chèn thêm ---
  headCode: '', // chèn trước </head>
  bodyCode: '', // chèn trước </body>

  // --- Tối ưu hoá trang ---
  lazyLoadImages: true,
  minifyOutput: false,
  preloadFonts: false,
}

const keyFor = (templateId) => `${STORAGE_PREFIX}:${templateId || 'new'}`

export const loadPageSettings = (templateId) => {
  try {
    const raw = localStorage.getItem(keyFor(templateId))
    // Trộn với mặc định để bản ghi cũ thiếu field mới vẫn dùng được.
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export const savePageSettings = (templateId, settings) => {
  try {
    localStorage.setItem(keyFor(templateId), JSON.stringify(settings))
  } catch {
    /* hết dung lượng localStorage — bỏ qua, không chặn thao tác dựng trang */
  }
}
