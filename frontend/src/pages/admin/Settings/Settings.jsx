import { useState } from 'react'
import { SaveIcon, ZapIcon, AlertTriangleIcon } from '../../../components/icons'
import Badge from '../../../components/common/Badge'
import Avatar from '../../../components/common/Avatar'
import Toggle from '../../../components/common/Toggle'
import SettingsSection from './components/SettingsSection'
import ConfirmDialog from '../components/ConfirmDialog'
import { settings as initialSettings, AI_MODELS, TIMEZONES, SESSION_TIMEOUTS } from '../mock/settings'

const cardCls = 'rounded-xl border border-slate-800 bg-[#111725] p-5'
const labelCls = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500'
const inputCls =
  'w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 focus:border-slate-600 focus:outline-none'

export default function Settings() {
  const [form, setForm] = useState(initialSettings)
  const [archiving, setArchiving] = useState(false)

  const update = (section, key, value) =>
    setForm((f) => ({ ...f, [section]: { ...f[section], [key]: value } }))

  const handleSave = () => {
    // TODO(API): await settingsApi.update(form)
  }

  return (
    <div className="space-y-8 pb-4">
      <div>
        <h1 className="text-xl font-bold text-white">Cài đặt hệ thống</h1>
        <p className="mt-1 text-sm text-slate-400">
          Cấu hình các tham số toàn cục của Template Studio, ngưỡng AI và quyền quản trị.
        </p>
      </div>

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
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Tài sản thương hiệu</label>
            <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-700 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600">
                  <ZapIcon size={20} className="text-white" />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">Tải lên logo mới</p>
                  <p className="text-xs text-slate-500">SVG, PNG hoặc JPG (Tối đa 800×400px)</p>
                </div>
              </div>
              <button className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800">
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
                  value={form.ai_engine.daily_limit}
                  onChange={(e) => update('ai_engine', 'daily_limit', Number(e.target.value))}
                  className={`${inputCls} pr-20`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                  lời gọi API
                </span>
              </div>
            </div>
            <div>
              <label className={labelCls}>Mẫu mặc định</label>
              <select
                value={form.ai_engine.default_model}
                onChange={(e) => update('ai_engine', 'default_model', e.target.value)}
                className={inputCls}
              >
                {AI_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
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
          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-center gap-3">
              <Avatar name={form.account.full_name} size="lg" />
              <div>
                <p className="font-semibold text-white">{form.account.full_name}</p>
                <p className="text-xs text-slate-500">{form.account.email}</p>
                <div className="mt-1.5 flex gap-2">
                  <Badge color="purple">Siêu quản trị</Badge>
                  <Badge color="teal">Liên hệ thanh toán</Badge>
                </div>
              </div>
            </div>
            <button className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800">
              Đổi mật khẩu
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Múi giờ</label>
              <select
                value={form.account.timezone}
                onChange={(e) => update('account', 'timezone', e.target.value)}
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
          <p className="mt-0.5 text-sm text-slate-400">Các hành động không thể hoàn tác.</p>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-red-500/20 p-4">
            <div>
              <p className="text-sm font-medium text-white">Lưu trữ dữ liệu nền tảng</p>
              <p className="text-xs text-slate-500">
                Xuất tất cả mẫu và người dùng sau đó xóa thực thể hiện tại.
              </p>
            </div>
            <button
              onClick={() => setArchiving(true)}
              className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10"
            >
              Lưu trữ
            </button>
          </div>
        </div>
      </SettingsSection>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <span className="h-2 w-2 rounded-full bg-green-500" /> Đã lưu 4 phút trước
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setForm(initialSettings)}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            <SaveIcon size={16} /> Lưu tất cả thay đổi
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={archiving}
        title="Lưu trữ dữ liệu nền tảng"
        message="Hành động này sẽ xuất toàn bộ dữ liệu rồi xóa thực thể hiện tại và không thể hoàn tác. Bạn có chắc chắn?"
        confirmText="Lưu trữ"
        onConfirm={() => setArchiving(false)}
        onCancel={() => setArchiving(false)}
      />
    </div>
  )
}
