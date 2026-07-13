export const AI_MODELS = [
  { value: 'amazing-ui-v2.0', label: 'Amazing-UI-v2.0 (Ổn định)' },
  { value: 'amazing-ui-v3-beta', label: 'Amazing-UI-v3.0 (Beta)' },
  { value: 'legacy-v1', label: 'Legacy-v1.0' },
]

export const TIMEZONES = [
  { value: 'America/Los_Angeles', label: '(GMT-08:00) Giờ Thái Bình Dương (Hoa Kỳ & Canada)' },
  { value: 'Asia/Ho_Chi_Minh', label: '(GMT+07:00) Giờ Đông Dương (Hà Nội, TP.HCM)' },
  { value: 'UTC', label: '(GMT+00:00) UTC' },
]

export const SESSION_TIMEOUTS = [
  { value: 'never', label: 'Không bao giờ' },
  { value: '30m', label: '30 phút' },
  { value: '1h', label: '1 giờ' },
  { value: '1d', label: '1 ngày' },
]

// Shape khớp response API dự kiến (GET /admin/settings) — nhóm theo mục,
// key snake_case để map thẳng sang bảng settings ở backend.
export const settings = {
  platform: {
    name: 'Amazing Tech — Template Studio',
    logo_url: null,
  },
  ai_engine: {
    enabled: true,
    daily_limit: 2500,
    default_model: 'amazing-ui-v2.0',
    concurrent_limit: 100,
  },
  account: {
    full_name: 'Alex Rivera',
    email: 'alex.rivera@amazingtech.io',
    role: 'super_admin',
    timezone: 'America/Los_Angeles',
    session_timeout: 'never',
  },
}
