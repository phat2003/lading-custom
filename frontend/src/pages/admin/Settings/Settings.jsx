import { useCallback, useEffect, useRef, useState } from 'react'
import { SaveIcon, ZapIcon, AlertTriangleIcon } from '../../../components/icons'
import Badge from '../../../components/common/Badge'
import Avatar from '../../../components/common/Avatar'
import Toggle from '../../../components/common/Toggle'
import SettingsSection from './components/SettingsSection'
import ChangePasswordModal from './components/ChangePasswordModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { settingsApi } from '../../../api/settings'
import { profileApi } from '../../../api/profile'
import { errMsg } from '../adapters'
// Danh sách lựa chọn (model AI, múi giờ, thời gian phiên) vẫn lấy từ mock:
// đây là hằng số cấu hình của UI, không phải dữ liệu backend quản lý.
import { AI_MODELS, TIMEZONES, SESSION_TIMEOUTS } from '../mock/settings'

const cardCls = 'rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] p-5'
const labelCls = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--bd-muted)]'
const inputCls =
  'w-full rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] px-3 py-2 text-sm text-[var(--bd-text)] focus:border-[var(--bd-border)] focus:outline-none'

const ROLE_LABEL = {
  super_admin: 'Siêu quản trị',
  admin: 'Quản trị viên',
  user: 'Người dùng',
}

// Khung rỗng để render được trước khi API trả về.
const EMPTY_SETTINGS = {
  platform: { name: '', logo_url: null },
  ai_engine: { enabled: false, daily_limit: 0, default_model: '', concurrent_limit: 0 },
  account: { full_name: '', email: '', role: 'admin', phone: '', timezone: '', session_timeout: 'never' },
}

const Settings = () => {
  const [form, setForm] = useState(EMPTY_SETTINGS)
  const [original, setOriginal] = useState(EMPTY_SETTINGS) // bản gốc để so sánh / hoàn tác
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState(null)

  const [passwordOpen, setPasswordOpen] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [archiving, setArchiving] = useState(false)

  const logoInputRef = useRef(null)

  const dirty = JSON.stringify(form) !== JSON.stringify(original)

  const applySettings = (data) => {
    setForm(data)
    setOriginal(data)
  }

  const fetchSettings = useCallback(async (signal) => {
    setLoading(true)
    setError('')
    try {
      // GET /admin/settings không trả số điện thoại (nhóm account chỉ có
      // họ tên/email/role/múi giờ), nên lấy thêm từ hồ sơ cá nhân.
      const [res, profileRes] = await Promise.all([
        settingsApi.get({ signal }),
        profileApi.get({ signal }),
      ])
      const data = res.data.data
      applySettings({
        ...data,
        account: { ...data.account, phone: profileRes.data.data?.phone || '' },
      })
    } catch (err) {
      if (err.name === 'CanceledError') return
      setError(errMsg(err, 'Không tải được cấu hình hệ thống.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchSettings(controller.signal)
    return () => controller.abort()
  }, [fetchSettings])

  const update = (section, key, value) =>
    setForm((f) => ({ ...f, [section]: { ...f[section], [key]: value } }))

  // Lưu đi 2 nơi: platform + ai_engine vào platform_setting,
  // còn múi giờ / thời gian phiên thuộc app_user nên phải qua PUT /profile.
  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      // Chạy TUẦN TỰ, không Promise.all: response của PUT /admin/settings có
      // kèm nhóm account đọc từ app_user, nên phải ghi profile xong trước —
      // chạy song song thì response có thể mang múi giờ cũ và ghi đè lại form.
      await profileApi.update({
        full_name: form.account.full_name.trim(),
        phone: form.account.phone.trim(),
        timezone: form.account.timezone,
        session_timeout: form.account.session_timeout,
      })
      const settingsRes = await settingsApi.update({
        platform: { name: form.platform.name },
        ai_engine: {
          enabled: form.ai_engine.enabled,
          daily_limit: Number(form.ai_engine.daily_limit) || 0,
          default_model: form.ai_engine.default_model,
          concurrent_limit: Number(form.ai_engine.concurrent_limit) || 0,
        },
      })
      // Response settings không kèm phone -> giữ lại giá trị vừa lưu,
      // nếu không ô số điện thoại sẽ bị xoá trắng sau mỗi lần lưu.
      const saved = settingsRes.data.data
      applySettings({
        ...saved,
        account: { ...saved.account, phone: form.account.phone.trim() },
      })
      setSavedAt(new Date())
    } catch (err) {
      setError(errMsg(err, 'Lưu cấu hình thất bại.'))
    } finally {
      setSaving(false)
    }
  }

  const handleLogoPick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // reset để chọn lại đúng file đó vẫn kích hoạt onChange
    if (!file) return

    setSaving(true)
    setError('')
    try {
      const res = await settingsApi.uploadLogo(file)
      // Backend trả về settings đã có logo mới, nhưng không kèm phone -> giữ lại.
      const saved = res.data.data
      applySettings({
        ...saved,
        account: { ...saved.account, phone: form.account.phone },
      })
      setSavedAt(new Date())
    } catch (err) {
      setError(errMsg(err, 'Tải logo thất bại.'))
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (payload) => {
    setChangingPassword(true)
    setPasswordError('')
    try {
      await profileApi.changePassword(payload)
      setPasswordOpen(false)
    } catch (err) {
      // Lỗi hiện trong modal (vd "mật khẩu hiện tại không đúng").
      setPasswordError(errMsg(err, 'Đổi mật khẩu thất bại.'))
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="space-y-8 pb-4">
      <div>
        <h1 className="text-xl font-bold text-[var(--bd-text)]">Cài đặt hệ thống</h1>
        <p className="mt-1 text-sm text-[var(--bd-dim)]">
          Cấu hình các tham số toàn cục của Template Studio, ngưỡng AI và quyền quản trị.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <SettingsSection
        number="01"
        title="Cài đặt nền tảng"
        description="Cấu trúc định danh và thương hiệu cơ bản cho studio."
      >
        <div className={`${cardCls} space-y-5`}>
          <div>
            <label className={labelCls}>Tên nền tảng</label>
            <input
              value={form.platform.name}
              onChange={(e) => update('platform', 'name', e.target.value)}
              disabled={loading}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Tài sản thương hiệu</label>
            <div className="flex items-center justify-between rounded-lg border border-dashed border-[var(--bd-border)] p-4">
              <div className="flex items-center gap-3">
                {form.platform.logo_url ? (
                  <img
                    src={form.platform.logo_url}
                    alt="Logo nền tảng"
                    className="h-11 w-11 rounded-lg object-contain"
                  />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600">
                    <ZapIcon size={20} className="text-[var(--bd-text)]" />
                  </span>
                )}
                <div>
                  <p className="text-sm font-medium text-[var(--bd-text)]">
                    {form.platform.logo_url ? 'Logo hiện tại' : 'Tải lên logo mới'}
                  </p>
                  {/* Backend chỉ nhận JPEG/PNG/WebP — SVG bị loại vì có thể chứa script */}
                  <p className="text-xs text-[var(--bd-muted)]">PNG, JPG hoặc WebP (tối đa 5MB)</p>
                </div>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoPick}
                className="hidden"
              />
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={saving || loading}
                className="rounded-lg border border-[var(--bd-border)] px-3 py-1.5 text-sm text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)] disabled:opacity-50"
              >
                Thay thế
              </button>
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        number="02"
        title="Cài đặt AI Engine"
        badge={<Badge color="purple">Beta</Badge>}
        description="Kiểm soát giới hạn tạo và các mô hình thiết kế tự động."
        headerRight={
          <Toggle
            checked={form.ai_engine.enabled}
            disabled={loading}
            onChange={(v) => update('ai_engine', 'enabled', v)}
          />
        }
      >
        <div className={`${cardCls} space-y-5`}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Giới hạn tạo hàng ngày</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={form.ai_engine.daily_limit}
                  onChange={(e) => update('ai_engine', 'daily_limit', Number(e.target.value))}
                  disabled={loading}
                  className={`${inputCls} pr-20`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--bd-muted)]">
                  lời gọi API
                </span>
              </div>
            </div>
            <div>
              <label className={labelCls}>Mẫu mặc định</label>
              <select
                value={form.ai_engine.default_model}
                onChange={(e) => update('ai_engine', 'default_model', e.target.value)}
                disabled={loading}
                className={inputCls}
              >
                {AI_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Giới hạn luồng đồng thời</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={form.ai_engine.concurrent_limit}
                  onChange={(e) =>
                    update('ai_engine', 'concurrent_limit', Number(e.target.value))
                  }
                  disabled={loading}
                  className={`${inputCls} pr-16`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--bd-muted)]">
                  luồng
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-300/80">
            <AlertTriangleIcon size={16} className="mt-0.5 shrink-0" />
            <p>
              Việc tăng giới hạn tạo có thể ảnh hưởng đến chu kỳ thanh toán của bạn. Các mô hình
              hiệu suất cao hiện đang bị giới hạn ở mức {form.ai_engine.concurrent_limit} luồng
              đồng thời mỗi chỗ ngồi.
            </p>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        number="03"
        title="Quản lý tài khoản"
        description="Hồ sơ quản trị và bảo mật cá nhân."
      >
        <div className={`${cardCls} space-y-5`}>
          <div className="flex items-center justify-between rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] p-4">
            <div className="flex items-center gap-3">
              <Avatar name={form.account.full_name || form.account.email} size="lg" />
              <div>
                <p className="font-semibold text-[var(--bd-text)]">{form.account.full_name}</p>
                <p className="text-xs text-[var(--bd-muted)]">{form.account.email}</p>
                <div className="mt-1.5 flex gap-2">
                  <Badge color="purple">
                    {ROLE_LABEL[form.account.role] || form.account.role}
                  </Badge>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setPasswordError('')
                setPasswordOpen(true)
              }}
              className="rounded-lg border border-[var(--bd-border)] px-3 py-1.5 text-sm text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)]"
            >
              Đổi mật khẩu
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Họ tên</label>
              <input
                value={form.account.full_name}
                onChange={(e) => update('account', 'full_name', e.target.value)}
                disabled={loading}
                placeholder="VD: Nguyễn Văn A"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Số điện thoại</label>
              <input
                value={form.account.phone}
                onChange={(e) => update('account', 'phone', e.target.value)}
                disabled={loading}
                placeholder="0901234567"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Múi giờ</label>
              <select
                value={form.account.timezone}
                onChange={(e) => update('account', 'timezone', e.target.value)}
                disabled={loading}
                className={inputCls}
              >
                {TIMEZONES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Thời gian phiên</label>
              <select
                value={form.account.session_timeout}
                onChange={(e) => update('account', 'session_timeout', e.target.value)}
                disabled={loading}
                className={inputCls}
              >
                {SESSION_TIMEOUTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
          <h3 className="font-semibold text-red-400">Vùng nguy hiểm</h3>
          <p className="mt-0.5 text-sm text-[var(--bd-dim)]">Các hành động không thể hoàn tác.</p>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-red-500/20 p-4">
            <div>
              <p className="text-sm font-medium text-[var(--bd-text)]">Lưu trữ dữ liệu nền tảng</p>
              <p className="text-xs text-[var(--bd-muted)]">
                Xuất tất cả mẫu và người dùng sau đó xóa thực thể hiện tại.
              </p>
            </div>
            {/* Chưa nối: không có endpoint export/huỷ toàn bộ nền tảng */}
            <button
              onClick={() => setArchiving(true)}
              className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10"
            >
              Lưu trữ
            </button>
          </div>
        </div>
      </SettingsSection>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--bd-border)] pt-4">
        <p className="flex items-center gap-2 text-sm text-[var(--bd-muted)]">
          {loading ? (
            <>
              <span className="h-2 w-2 rounded-full bg-slate-600" /> Đang tải cấu hình...
            </>
          ) : dirty ? (
            <>
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Có thay đổi chưa lưu
            </>
          ) : savedAt ? (
            <>
              <span className="h-2 w-2 rounded-full bg-green-500" /> Đã lưu lúc{' '}
              {savedAt.toLocaleTimeString('vi-VN')}
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-green-500" /> Không có thay đổi
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setForm(original)}
            disabled={!dirty || saving}
            className="rounded-lg border border-[var(--bd-border)] px-4 py-2 text-sm text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)] disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading || !dirty}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_-6px_rgba(139,92,246,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_26px_-2px_rgba(139,92,246,1)] disabled:opacity-50"
          >
            <SaveIcon size={16} /> {saving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
          </button>
        </div>
      </div>

      <ChangePasswordModal
        open={passwordOpen}
        submitting={changingPassword}
        error={passwordError}
        onClose={() => setPasswordOpen(false)}
        onSubmit={handleChangePassword}
      />
      <ConfirmDialog
        open={archiving}
        title="Lưu trữ dữ liệu nền tảng"
        message="Chức năng này chưa được triển khai ở backend — chưa có endpoint xuất dữ liệu và xóa thực thể. Hiện tại nút này không làm gì cả."
        confirmText="Đã hiểu"
        danger={false}
        onConfirm={() => setArchiving(false)}
        onCancel={() => setArchiving(false)}
      />
    </div>
  )
}

export default Settings
