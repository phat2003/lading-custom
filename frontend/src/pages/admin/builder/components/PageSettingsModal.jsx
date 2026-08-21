import { useState } from 'react'
import { XIcon } from '../../../../components/icons'

const TABS = [
  { key: 'seo', label: 'SEO & Social' },
  { key: 'tracking', label: 'Mã chuyển đổi' },
  { key: 'code', label: 'Mã JavaScript/CSS' },
  { key: 'optimize', label: 'Tối ưu hoá trang' },
]

const inputCls =
  'w-full rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] px-3 py-2 text-sm text-[var(--bd-text)] transition-all duration-200 placeholder:text-[var(--bd-muted)] focus:border-violet-400/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20'
const labelCls = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[var(--bd-muted)]'
const hintCls = 'mt-1 text-[11px] text-[var(--bd-muted)]'

// Ô soạn mã có đánh số dòng bên trái cho dễ nhìn.
const CodeArea = ({ value, onChange, placeholder }) => {
  const lines = Math.max(6, (value || '').split('\n').length)
  return (
    <div className="flex overflow-hidden rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] focus-within:border-violet-400/60 focus-within:ring-2 focus-within:ring-violet-500/20">
      <div className="select-none border-r border-[var(--bd-border)] bg-[var(--bd-fill-hover)] px-2 py-2 text-right font-mono text-xs leading-5 text-[var(--bd-muted)]">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder={placeholder}
        rows={lines}
        className="flex-1 resize-y bg-transparent px-3 py-2 font-mono text-xs leading-5 text-[var(--bd-text)] placeholder:text-[var(--bd-muted)] focus:outline-none"
      />
    </div>
  )
}

const Toggle = ({ checked, onChange, label, hint }) => (
  <div className="flex items-start justify-between gap-4 py-2.5">
    <div>
      <p className="text-sm text-[var(--bd-text)]">{label}</p>
      {hint && <p className={hintCls}>{hint}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all duration-300 ${
        checked
          ? 'bg-gradient-to-r from-violet-500 to-cyan-400 shadow-[0_0_14px_-3px_rgba(139,92,246,.9)]'
          : 'bg-[var(--bd-fill-hover)]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
)

// Hộp thoại thiết lập chi tiết, mở từ panel "Thiết lập toàn trang".
const PageSettingsModal = ({ open, tab, settings, onChangeTab, onChange, onClose }) => {
  const [active, setActive] = useState(tab || 'seo')

  if (!open) return null

  const current = tab || active
  const setTab = (k) => {
    setActive(k)
    onChangeTab?.(k)
  }
  const set = (key) => (value) => onChange({ ...settings, [key]: value })

  return (
    <div
      className="fixed inset-0 z-[60] flex animate-fade-in items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onPointerDown={onClose}
    >
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-3xl animate-pop-in flex-col overflow-hidden rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] shadow-[0_30px_80px_-20px_rgba(139,92,246,.4)]"
      >
        {/* Đầu hộp thoại */}
        <div className="flex items-center justify-between border-b border-[var(--bd-border)] px-6 py-4">
          <h2 className="text-base font-semibold text-[var(--bd-text)]">Thiết lập trang</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--bd-muted)] transition-colors hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[var(--bd-border)] px-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative px-3 py-3 text-sm transition-colors ${
                current === t.key
                  ? 'font-medium text-[var(--bd-accent)]'
                  : 'text-[var(--bd-dim)] hover:text-[var(--bd-text)]'
              }`}
            >
              {t.label}
              {current === t.key && (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-t bg-gradient-to-r from-violet-400 to-cyan-400" />
              )}
            </button>
          ))}
        </div>

        {/* Nội dung tab */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {current === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Tiêu đề trang (title)</label>
                <input
                  value={settings.seoTitle}
                  onChange={(e) => set('seoTitle')(e.target.value)}
                  placeholder="VD: Landing Page bán khoá học online"
                  className={inputCls}
                />
                <p className={hintCls}>Nên dưới 60 ký tự — hiện tại {settings.seoTitle.length}.</p>
              </div>
              <div>
                <label className={labelCls}>Mô tả (description)</label>
                <textarea
                  value={settings.seoDescription}
                  onChange={(e) => set('seoDescription')(e.target.value)}
                  rows={3}
                  placeholder="Mô tả ngắn hiển thị trên kết quả tìm kiếm"
                  className={`${inputCls} resize-none`}
                />
                <p className={hintCls}>
                  Nên dưới 160 ký tự — hiện tại {settings.seoDescription.length}.
                </p>
              </div>
              <div>
                <label className={labelCls}>Từ khoá</label>
                <input
                  value={settings.seoKeywords}
                  onChange={(e) => set('seoKeywords')(e.target.value)}
                  placeholder="khoá học, online, marketing"
                  className={inputCls}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Ảnh chia sẻ (OG image)</label>
                  <input
                    value={settings.ogImage}
                    onChange={(e) => set('ogImage')(e.target.value)}
                    placeholder="/uploads/og.png"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Favicon</label>
                  <input
                    value={settings.favicon}
                    onChange={(e) => set('favicon')(e.target.value)}
                    placeholder="/uploads/favicon.png"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          )}

          {current === 'tracking' && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Google Analytics (GA4)</label>
                <input
                  value={settings.googleAnalyticsId}
                  onChange={(e) => set('googleAnalyticsId')(e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Facebook Pixel</label>
                <input
                  value={settings.facebookPixelId}
                  onChange={(e) => set('facebookPixelId')(e.target.value)}
                  placeholder="123456789012345"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Google Tag Manager</label>
                <input
                  value={settings.googleTagManagerId}
                  onChange={(e) => set('googleTagManagerId')(e.target.value)}
                  placeholder="GTM-XXXXXXX"
                  className={inputCls}
                />
              </div>
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-300/80">
                Mã theo dõi chỉ được chèn vào trang đã xuất bản, không chạy trong trình dựng.
              </p>
            </div>
          )}

          {current === 'code' && (
            <div className="space-y-5">
              <div>
                <label className={labelCls}>{'Trước thẻ </head>'}</label>
                <CodeArea
                  value={settings.headCode}
                  onChange={set('headCode')}
                  placeholder="Nhập mã muốn thêm vào đây"
                />
                <p className={hintCls}>Thường dùng cho thẻ meta, font, hoặc CSS tuỳ chỉnh.</p>
              </div>
              <div>
                <label className={labelCls}>{'Trước thẻ </body>'}</label>
                <CodeArea
                  value={settings.bodyCode}
                  onChange={set('bodyCode')}
                  placeholder="Nhập mã muốn thêm vào đây"
                />
                <p className={hintCls}>Thường dùng cho script chạy sau khi trang đã tải xong.</p>
              </div>
            </div>
          )}

          {current === 'optimize' && (
            <div className="divide-y divide-[var(--bd-border)]">
              <Toggle
                checked={settings.lazyLoadImages}
                onChange={set('lazyLoadImages')}
                label="Tải ảnh trễ (lazy load)"
                hint="Ảnh chỉ tải khi cuộn tới — trang mở nhanh hơn."
              />
              <Toggle
                checked={settings.preloadFonts}
                onChange={set('preloadFonts')}
                label="Tải trước phông chữ"
                hint="Giảm hiện tượng chữ nhấp nháy khi trang vừa mở."
              />
              <Toggle
                checked={settings.minifyOutput}
                onChange={set('minifyOutput')}
                label="Nén mã khi xuất bản"
                hint="Rút gọn HTML/CSS/JS để giảm dung lượng tải về."
              />
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-[var(--bd-border)] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-[var(--bd-border)] px-5 py-2 text-sm text-[var(--bd-dim)] transition-colors hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export default PageSettingsModal
