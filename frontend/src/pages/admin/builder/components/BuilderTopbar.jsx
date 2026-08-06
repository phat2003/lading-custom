import { useNavigate } from 'react-router-dom'
import {
  MonitorIcon,
  SmartphoneIcon,
  ZapIcon,
  UndoIcon,
  RedoIcon,
  SunIcon,
  MoonIcon,
} from '../../../../components/icons'

// Nút icon dùng chung cho undo/redo.
const iconBtn =
  'rounded-xl p-2 text-[var(--bd-dim)] transition-all duration-200 hover:bg-[var(--bd-fill-hover)] hover:text-violet-400 disabled:pointer-events-none disabled:opacity-25'

// Nút hành động chính (gradient tím→cyan + glow).
const primaryBtn =
  'rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2 font-semibold text-white shadow-[0_0_22px_-6px_rgba(139,92,246,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_28px_-2px_rgba(139,92,246,1)] active:translate-y-0'

const ghostBtn =
  'rounded-xl px-3.5 py-2 text-[var(--bd-dim)] transition-colors duration-200 hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]'

const BuilderTopbar = ({
  device,
  onDeviceChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  mode = 'template',
  onSave,
  onSaveDraft,
  onPublish,
  saving = false,
  theme = 'dark',
  onToggleTheme,
}) => {
  const navigate = useNavigate()
  const isSection = mode === 'section'
  const isDark = theme === 'dark'

  const deviceBtn = (on) =>
    `relative z-10 flex items-center justify-center rounded-lg px-3.5 py-1.5 transition-colors duration-300 ${
      on ? 'text-white' : 'text-[var(--bd-muted)] hover:text-[var(--bd-text)]'
    }`

  return (
    <header className="relative flex h-16 shrink-0 items-center justify-between border-b border-[var(--bd-border)] bg-[var(--bd-topbar)] px-4 backdrop-blur-xl">
      {/* Vệt sáng mảnh chạy dọc mép dưới topbar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      {/* Trái: logo + tên dự án */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(isSection ? '/admin/sections' : '/admin/templates')}
          title={isSection ? 'Về thư viện thành phần' : 'Về danh sách template'}
          className="group flex items-center gap-2.5 text-sm font-semibold transition-transform duration-200 hover:-translate-x-0.5"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-[0_0_20px_-4px_rgba(139,92,246,.8)] transition-shadow duration-300 group-hover:shadow-[0_0_26px_0px_rgba(139,92,246,.95)]">
            <ZapIcon size={17} />
          </span>
          <span className="text-[var(--bd-text)]">
            {isSection ? 'Section Editor' : 'Template Editor'}
          </span>
          <span className="rounded-md bg-gradient-to-r from-violet-500/20 to-cyan-400/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-400 ring-1 ring-inset ring-violet-400/30">
            Pro
          </span>
        </button>

        <span className="ml-1 hidden items-center gap-1.5 text-sm text-[var(--bd-muted)] md:flex">
          <span className="h-1 w-1 rounded-full bg-violet-400/70" />
          {isSection ? 'Thành phần mới' : 'Template mới'}
        </span>
      </div>

      {/* Giữa: chọn thiết bị + hoàn tác/làm lại */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center rounded-xl border border-[var(--bd-border)] bg-[var(--bd-fill)] p-1">
          {/* Khối trượt chạy theo thiết bị đang chọn */}
          <span
            className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500/70 shadow-[0_0_16px_-4px_rgba(139,92,246,.9)] transition-transform duration-300 ease-out"
            style={{ transform: device === 'mobile' ? 'translateX(100%)' : 'translateX(0)' }}
          />
          <button onClick={() => onDeviceChange('desktop')} className={deviceBtn(device === 'desktop')} title="Máy tính">
            <MonitorIcon size={17} />
          </button>
          <button onClick={() => onDeviceChange('mobile')} className={deviceBtn(device === 'mobile')} title="Điện thoại">
            <SmartphoneIcon size={17} />
          </button>
        </div>

        <div className="flex items-center gap-0.5 rounded-xl border border-[var(--bd-border)] bg-[var(--bd-fill)] p-1">
          <button onClick={onUndo} disabled={!canUndo} title="Hoàn tác (Ctrl+Z)" className={iconBtn}>
            <UndoIcon size={17} />
          </button>
          <button onClick={onRedo} disabled={!canRedo} title="Làm lại (Ctrl+Shift+Z)" className={iconBtn}>
            <RedoIcon size={17} />
          </button>
        </div>
      </div>

      {/* Phải: đổi giao diện + hành động */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={onToggleTheme}
          title={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          className="group relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl border border-[var(--bd-border)] bg-[var(--bd-fill)] text-[var(--bd-dim)] transition-all duration-200 hover:border-violet-400/40 hover:text-violet-400"
        >
          {/* Hai icon xoay đổi chỗ khi chuyển chế độ */}
          <span
            className={`absolute transition-all duration-300 ${
              isDark ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'
            }`}
          >
            <MoonIcon size={17} />
          </span>
          <span
            className={`absolute transition-all duration-300 ${
              isDark ? '-rotate-90 opacity-0' : 'rotate-0 opacity-100'
            }`}
          >
            <SunIcon size={17} />
          </span>
        </button>

        <span className="mx-1 h-6 w-px bg-[var(--bd-border)]" />

        {isSection ? (
          <button onClick={onSave} className={primaryBtn}>
            Lưu Section
          </button>
        ) : (
          <>
            {/* Xem trước cần API render HTML — chưa nối, tạm ẩn để không có nút chết. */}
            <button onClick={onSaveDraft} disabled={saving} className={`${ghostBtn} disabled:opacity-40`}>
              Lưu bản nháp
            </button>
            <button onClick={onPublish} disabled={saving} className={`${primaryBtn} disabled:pointer-events-none disabled:opacity-60`}>
              {saving ? 'Đang lưu…' : 'Xuất bản'}
            </button>
          </>
        )}
      </div>
    </header>
  )
}

export default BuilderTopbar
