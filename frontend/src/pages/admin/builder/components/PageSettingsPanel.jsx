import { useRef, useState } from 'react'
import {
  XIcon,
  GlobeIcon,
  CodeIcon,
  ActivityIcon,
  ZapIcon,
  SparklesIcon,
  ImageIcon,
} from '../../../../components/icons'
import { mediaApi } from '../../../../api/media'
import {
  FONT_OPTIONS,
  DESKTOP_WIDTHS,
  MOBILE_WIDTHS,
  LANGUAGES,
  DEFAULT_SETTINGS,
} from '../pageSettings'

// Các mục mở hộp thoại chi tiết.
const MENU = [
  { key: 'seo', label: 'SEO & Social', icon: GlobeIcon },
  { key: 'tracking', label: 'Mã chuyển đổi', icon: ActivityIcon },
  { key: 'code', label: 'Mã JavaScript/CSS', icon: CodeIcon },
  { key: 'optimize', label: 'Tối ưu hoá trang', icon: ZapIcon },
  { key: 'dynamic', label: 'Dynamic Content', icon: SparklesIcon },
]

const selectCls =
  'rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] px-2.5 py-1.5 text-sm text-[var(--bd-text)] transition-colors focus:border-violet-400/60 focus:outline-none'
const smallBtn =
  'rounded-lg border border-[var(--bd-border)] px-3 py-1.5 text-xs text-[var(--bd-dim)] transition-colors hover:border-violet-400/40 hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]'

// Một dòng "nhãn bên trái — điều khiển bên phải".
const Row = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 py-2">
    <span className="shrink-0 text-sm text-[var(--bd-dim)]">{label}</span>
    {children}
  </div>
)

const Switch = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-all duration-300 ${
      checked
        ? 'bg-gradient-to-r from-violet-500 to-cyan-400 shadow-[0_0_12px_-3px_rgba(139,92,246,.9)]'
        : 'bg-[var(--bd-fill-hover)]'
    }`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-300 ${
        checked ? 'translate-x-5' : 'translate-x-1'
      }`}
    />
  </button>
)

// Panel "Thiết lập toàn trang" — trượt ra từ mép phải của builder.
const PageSettingsPanel = ({ open, settings, onChange, onOpenDialog, onClose }) => {
  const [bgOpen, setBgOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  if (!open) return null

  const set = (key) => (value) => onChange({ ...settings, [key]: value })

  // Trả riêng nhóm font về mặc định, giữ nguyên các thiết lập khác.
  const resetFont = () =>
    onChange({ ...settings, fontFamily: DEFAULT_SETTINGS.fontFamily, preloadFonts: DEFAULT_SETTINGS.preloadFonts })

  const resetForm = () =>
    onChange({ ...settings, direction: DEFAULT_SETTINGS.direction, language: DEFAULT_SETTINGS.language })

  const pickBgImage = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const res = await mediaApi.uploadImage(file)
      set('bgImage')(res.data.data.file_url)
    } catch {
      /* lỗi upload đã hiện ở nơi khác; ở đây bỏ qua để không chặn thao tác */
    } finally {
      setUploading(false)
    }
  }

  return (
    <aside className="absolute right-0 top-0 z-40 flex h-full w-[300px] animate-slide-in-left flex-col border-l border-[var(--bd-border)] bg-[var(--bd-panel-solid)] shadow-[0_0_60px_-15px_rgba(139,92,246,.5)]">
      {/* Đầu panel */}
      <div className="flex items-center justify-between border-b border-[var(--bd-border)] px-4 py-3.5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--bd-text)]">
          <span className="h-4 w-1 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400" />
          Thiết lập toàn trang
        </h2>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-[var(--bd-muted)] transition-colors hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]"
        >
          <XIcon size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Nhóm mục mở hộp thoại riêng */}
        <div className="border-b border-[var(--bd-border)] py-1">
          {MENU.map(({ key, label, icon: IconComp }) => (
            <button
              key={key}
              onClick={() => onOpenDialog(key)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[var(--bd-dim)] transition-all duration-200 hover:translate-x-0.5 hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]"
            >
              <IconComp size={16} className="text-violet-400" />
              {label}
            </button>
          ))}
        </div>

        {/* Thiết lập chung */}
        <div className="px-4 py-3">
          <p className="mb-1 text-sm font-semibold text-[var(--bd-text)]">Thiết lập chung</p>

          <Row label="Font chữ">
            <select value={settings.fontFamily} onChange={(e) => set('fontFamily')(e.target.value)} className={selectCls}>
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f} className="bg-[var(--bd-panel-solid)]">{f}</option>
              ))}
            </select>
          </Row>

          <Row label="Hướng văn bản">
            <select value={settings.direction} onChange={(e) => set('direction')(e.target.value)} className={selectCls}>
              <option value="ltr" className="bg-[var(--bd-panel-solid)]">Trái sang phải</option>
              <option value="rtl" className="bg-[var(--bd-panel-solid)]">Phải sang trái</option>
            </select>
          </Row>

          <Row label="Thiết lập lại Font">
            <button onClick={resetFont} className={smallBtn}>Trở về mặc định</button>
          </Row>

          <Row label="Thiết lập lại Cấu hình Form">
            <button onClick={resetForm} className={smallBtn}>Trở về mặc định</button>
          </Row>

          <Row label="Màu & Hình nền">
            <button onClick={() => setBgOpen((v) => !v)} className={smallBtn}>
              {bgOpen ? 'Thu gọn' : 'Thiết lập'}
            </button>
          </Row>

          {bgOpen && (
            <div className="mb-2 space-y-3 rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-[var(--bd-dim)]">Màu nền</span>
                <input
                  type="color"
                  value={settings.bgColor}
                  onChange={(e) => set('bgColor')(e.target.value)}
                  className="h-8 w-16 cursor-pointer rounded border border-[var(--bd-border)] bg-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                {settings.bgImage ? (
                  <img src={settings.bgImage} alt="" className="h-10 w-14 rounded border border-[var(--bd-border)] object-cover" />
                ) : (
                  <span className="grid h-10 w-14 place-items-center rounded border border-[var(--bd-border)] text-[var(--bd-muted)]">
                    <ImageIcon size={16} />
                  </span>
                )}
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={pickBgImage} className="hidden" />
                <button onClick={() => fileRef.current?.click()} disabled={uploading} className={`${smallBtn} flex-1`}>
                  {uploading ? 'Đang tải...' : settings.bgImage ? 'Đổi ảnh nền' : 'Chọn ảnh nền'}
                </button>
                {settings.bgImage && (
                  <button onClick={() => set('bgImage')('')} className={smallBtn} title="Bỏ ảnh nền">
                    Xóa
                  </button>
                )}
              </div>
            </div>
          )}

          <Row label="K/thước Desktop">
            <select
              value={settings.desktopWidth}
              onChange={(e) => set('desktopWidth')(Number(e.target.value))}
              className={selectCls}
            >
              {DESKTOP_WIDTHS.map((w) => (
                <option key={w} value={w} className="bg-[var(--bd-panel-solid)]">{w}px</option>
              ))}
            </select>
          </Row>

          <Row label="K/thước Mobile">
            <select
              value={settings.mobileWidth}
              onChange={(e) => set('mobileWidth')(Number(e.target.value))}
              className={selectCls}
            >
              {MOBILE_WIDTHS.map((w) => (
                <option key={w} value={w} className="bg-[var(--bd-panel-solid)]">{w}px</option>
              ))}
            </select>
          </Row>

          <Row label="Ngôn ngữ">
            <select value={settings.language} onChange={(e) => set('language')(e.target.value)} className={selectCls}>
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value} className="bg-[var(--bd-panel-solid)]">{l.label}</option>
              ))}
            </select>
          </Row>

          <Row label="Mobile only">
            <Switch checked={settings.mobileOnly} onChange={set('mobileOnly')} />
          </Row>

          <Row label="Story Page">
            <Switch checked={settings.storyPage} onChange={set('storyPage')} />
          </Row>

          <Row label="Bảo vệ trang (chống copy)">
            <Switch checked={settings.protectCopy} onChange={set('protectCopy')} />
          </Row>
        </div>
      </div>

      <p className="border-t border-[var(--bd-border)] px-4 py-2.5 text-[11px] leading-relaxed text-[var(--bd-muted)]">
        Thiết lập được lưu trên trình duyệt. Khi backend có API lưu cấu hình trang, dữ liệu này
        sẽ được đồng bộ lên máy chủ.
      </p>
    </aside>
  )
}

export default PageSettingsPanel
