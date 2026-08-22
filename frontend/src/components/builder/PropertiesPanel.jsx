import { fonts } from './palette'
import { ICON_MAP, ICON_NAMES } from './iconMap'
import {
  TrashIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
} from '../icons'

const labelCls = 'mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-[var(--bd-muted)]'
const inputCls =
  'w-full rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] px-3 py-2 text-sm text-[var(--bd-text)] transition-all duration-200 placeholder:text-[var(--bd-muted)] focus:border-violet-400/60 focus:bg-violet-500/[0.06] focus:outline-none focus:ring-2 focus:ring-violet-500/20'
const colorCls =
  'h-9 w-full cursor-pointer rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] transition-colors hover:border-violet-400/40'
const fileCls =
  'block w-full text-xs text-[var(--bd-muted)] file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-violet-500 file:to-cyan-400 file:px-3 file:py-1.5 file:font-medium file:text-[var(--bd-text)] hover:file:opacity-90'

const fmtBtn = (active) =>
  `flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-all duration-200 ${
    active
      ? 'border-violet-400/50 bg-gradient-to-br from-violet-500/25 to-cyan-400/15 text-[var(--bd-accent)] shadow-[0_0_12px_-4px_rgba(139,92,246,.9)]'
      : 'border-[var(--bd-border)] text-[var(--bd-dim)] hover:-translate-y-0.5 hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]'
  }`

// Nhóm thuộc tính có tiêu đề — thay cho 1 cột form dài.
const Group = ({ title, children }) => (
  <section className="animate-fade-in-up rounded-xl border border-[var(--bd-border)] bg-[var(--bd-fill)] p-3">
    <h3 className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--bd-dim)]">
      <span className="h-2.5 w-0.5 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400" />
      {title}
    </h3>
    <div className="space-y-3">{children}</div>
  </section>
)

const ALIGNS = [
  ['left', AlignLeftIcon],
  ['center', AlignCenterIcon],
  ['right', AlignRightIcon],
  ['justify', AlignJustifyIcon],
]

const TEXT_TYPES = ['heading', 'label', 'paragraph']
const FIELD_TYPES = ['input', 'textarea']
const RICH_TEXT = ['list', 'quote', 'card', 'iconbox', 'table', 'menu']
const NUM_CONTENT = ['rating', 'progress', 'gallery']
const AREA_CONTENT = ['list', 'select', 'table', 'menu', 'embed']

const TYPE_NAME = {
  heading: 'Tiêu đề', paragraph: 'Đoạn văn', label: 'Nhãn', button: 'Nút bấm', image: 'Ảnh',
  gallery: 'Gallery', video: 'Video', icon: 'Biểu tượng', input: 'Ô nhập', textarea: 'Ô văn bản',
  checkbox: 'Checkbox', select: 'Dropdown', list: 'Danh sách', quote: 'Trích dẫn', table: 'Bảng',
  menu: 'Menu', rating: 'Đánh giá', progress: 'Tiến trình', embed: 'Nhúng HTML', card: 'Thẻ',
  iconbox: 'Icon-box', countdown: 'Đếm ngược', section: 'Section', box: 'Hình hộp',
  divider: 'Đường kẻ', spacer: 'Khoảng trống',
}

const PropertiesPanel = ({
  element,
  onUpdate,
  onDelete,
  title = 'Thuộc tính',
  beforeContent = null,
  showDeleteButton = true,
}) => {
  if (!element) {
    return (
      <aside className="w-80 shrink-0 border-l border-[var(--bd-border)] bg-[var(--bd-panel)] backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-[var(--bd-border)] px-4 py-3.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--bd-muted)]" />
          <h2 className="text-sm font-semibold text-[var(--bd-text)]">{title}</h2>
        </div>
        <p className="p-5 text-sm leading-relaxed text-[var(--bd-muted)]">
          Chọn một phần tử trên canvas để chỉnh sửa thuộc tính.
        </p>
      </aside>
    )
  }

  const { id, type, content, style } = element
  const setStyle = (patch) => onUpdate(id, { style: patch })

  const isText = TEXT_TYPES.includes(type)
  const isField = FIELD_TYPES.includes(type)
  const isImage = type === 'image'
  const isSection = type === 'section'
  const isIcon = type === 'icon'
  const isDivider = type === 'divider'

  const hasContent = isText || isField || ['button', 'video', 'image', 'list', 'quote', 'checkbox', 'select', 'card', 'iconbox', 'countdown', 'rating', 'progress', 'gallery', 'table', 'menu', 'embed'].includes(type)
  const hasToolbar = isText || type === 'button' || ['list', 'quote'].includes(type)
  const hasFont = isText || isField || type === 'button' || type === 'checkbox' || RICH_TEXT.includes(type)
  const hasSize = hasFont || isIcon || type === 'countdown' || type === 'rating'
  const hasColor = hasFont || isIcon || isDivider || type === 'countdown' || type === 'rating' || type === 'progress'
  const hasBg = type === 'button' || type === 'box' || isField || isSection || type === 'card'
  const hasPadding = isText || type === 'button' || type === 'box' || isSection
  const hasBgImage = type === 'box' || isSection || type === 'card'
  const hasRadius = type !== 'spacer' && !isDivider

  const contentLabel =
    type === 'video' ? 'URL video (YouTube/mp4)'
      : isImage ? 'URL ảnh'
      : isField ? 'Placeholder'
      : type === 'list' ? 'Các mục (mỗi dòng 1)'
      : type === 'select' ? 'Lựa chọn (mỗi dòng 1)'
      : type === 'menu' ? 'Mục menu (mỗi dòng 1)'
      : type === 'table' ? 'Bảng (dòng; cột cách nhau bằng |)'
      : type === 'embed' ? 'Mã HTML'
      : type === 'quote' ? 'Nội dung trích dẫn'
      : type === 'checkbox' ? 'Nhãn'
      : type === 'rating' ? 'Số sao (0-5)'
      : type === 'progress' ? 'Phần trăm (0-100)'
      : type === 'gallery' ? 'Số ảnh'
      : type === 'card' || type === 'iconbox' ? 'Tiêu đề | Mô tả'
      : type === 'countdown' ? 'Ngày kết thúc'
      : 'Nội dung'

  const bold = (style.fontWeight || 400) >= 700
  const italic = style.fontStyle === 'italic'
  const underline = style.textDecoration === 'underline'
  const align = style.textAlign || 'left'

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onUpdate(id, { content: reader.result })
    reader.readAsDataURL(file)
  }

  const handleBgUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setStyle({ backgroundImage: reader.result })
    reader.readAsDataURL(file)
  }

  const showTypography = hasToolbar || hasSize || hasFont || isDivider
  const showFill = hasColor || hasBg || hasBgImage

  return (
    <aside className="w-80 shrink-0 overflow-y-auto border-l border-[var(--bd-border)] bg-[var(--bd-panel)] backdrop-blur-xl">
      {/* Đầu panel: loại phần tử + nút xóa */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--bd-border)] bg-[var(--bd-panel-solid)] px-4 py-3.5 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400" />
          <h2 className="text-sm font-semibold text-[var(--bd-text)]">{title}</h2>
          <span className="rounded-md bg-[var(--bd-fill-hover)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--bd-dim)]">
            {TYPE_NAME[type] || type}
          </span>
        </div>
        {showDeleteButton && (
          <button
            onClick={() => onDelete(id)}
            title="Xóa phần tử"
            className="rounded-lg p-1.5 text-[var(--bd-muted)] transition-all duration-200 hover:bg-red-500/15 hover:text-red-400"
          >
            <TrashIcon size={15} />
          </button>
        )}
      </div>

      <div className="space-y-3 p-3">
        {beforeContent}
        {isIcon && (
          <Group title="Biểu tượng">
            <div className="grid grid-cols-6 gap-1.5">
              {ICON_NAMES.map((name) => {
                const IconComp = ICON_MAP[name]
                const on = content === name
                return (
                  <button
                    key={name}
                    onClick={() => onUpdate(id, { content: name })}
                    title={name}
                    className={`flex items-center justify-center rounded-lg p-1.5 transition-all duration-200 ${
                      on
                        ? 'bg-gradient-to-br from-violet-500/30 to-cyan-400/20 text-[var(--bd-accent)] ring-1 ring-inset ring-violet-400/40'
                        : 'text-[var(--bd-dim)] hover:-translate-y-0.5 hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]'
                    }`}
                  >
                    <IconComp size={16} />
                  </button>
                )
              })}
            </div>
          </Group>
        )}

        {(hasContent || isImage) && (
          <Group title="Nội dung">
            {hasContent && (
              <div>
                <label className={labelCls}>{contentLabel}</label>
                {type === 'countdown' ? (
                  <input type="datetime-local" value={(content || '').slice(0, 16)} onChange={(e) => onUpdate(id, { content: e.target.value })} className={inputCls} />
                ) : NUM_CONTENT.includes(type) ? (
                  <input type="number" value={content} onChange={(e) => onUpdate(id, { content: e.target.value })} className={inputCls} />
                ) : AREA_CONTENT.includes(type) ? (
                  <textarea value={content} onChange={(e) => onUpdate(id, { content: e.target.value })} rows={4} className={`${inputCls} resize-none`} />
                ) : (
                  <input value={content} onChange={(e) => onUpdate(id, { content: e.target.value })} className={inputCls} />
                )}
              </div>
            )}

            {isImage && (
              <div>
                <label className={labelCls}>Tải ảnh lên</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} className={fileCls} />
              </div>
            )}
          </Group>
        )}

        {showTypography && (
          <Group title="Chữ & Định dạng">
            {hasToolbar && (
              <div>
                <label className={labelCls}>Định dạng</label>
                <div className="flex items-center gap-1">
                  <button className={fmtBtn(bold)} onClick={() => setStyle({ fontWeight: bold ? 400 : 700 })} title="Đậm">
                    <span className="font-bold">B</span>
                  </button>
                  <button className={fmtBtn(italic)} onClick={() => setStyle({ fontStyle: italic ? 'normal' : 'italic' })} title="Nghiêng">
                    <span className="italic">I</span>
                  </button>
                  <button className={fmtBtn(underline)} onClick={() => setStyle({ textDecoration: underline ? 'none' : 'underline' })} title="Gạch chân">
                    <span className="underline">U</span>
                  </button>
                  <span className="mx-1 h-6 w-px bg-white/10" />
                  {ALIGNS.map(([value, IconComp]) => (
                    <button key={value} className={fmtBtn(align === value)} onClick={() => setStyle({ textAlign: value })} title={`Căn ${value}`}>
                      <IconComp size={15} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasSize && (
              <div>
                <label className={labelCls}>{isIcon || type === 'rating' ? 'Cỡ (px)' : 'Cỡ chữ (px)'}</label>
                <input type="number" min="8" value={style.fontSize} onChange={(e) => setStyle({ fontSize: Number(e.target.value) })} className={inputCls} />
              </div>
            )}

            {hasFont && (
              <div>
                <label className={labelCls}>Phông chữ</label>
                <select value={style.fontFamily} onChange={(e) => setStyle({ fontFamily: e.target.value })} className={inputCls}>
                  {fonts.map((f) => (
                    <option key={f} value={f} className="bg-[var(--bd-panel-solid)]">{f}</option>
                  ))}
                </select>
              </div>
            )}

            {isDivider && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Kiểu nét</label>
                  <select value={style.borderStyle || 'solid'} onChange={(e) => setStyle({ borderStyle: e.target.value })} className={inputCls}>
                    <option value="solid" className="bg-[var(--bd-panel-solid)]">Nét liền</option>
                    <option value="dashed" className="bg-[var(--bd-panel-solid)]">Nét đứt</option>
                    <option value="dotted" className="bg-[var(--bd-panel-solid)]">Chấm</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Độ dày (px)</label>
                  <input type="number" min="1" value={style.lineWidth || 2} onChange={(e) => setStyle({ lineWidth: Number(e.target.value) })} className={inputCls} />
                </div>
              </div>
            )}
          </Group>
        )}

        {showFill && (
          <Group title="Màu & Nền">
            {hasColor && (
              <div>
                <label className={labelCls}>{isDivider ? 'Màu kẻ' : type === 'progress' || type === 'rating' ? 'Màu' : 'Màu chữ'}</label>
                <input type="color" value={style.color || '#000000'} onChange={(e) => setStyle({ color: e.target.value })} className={colorCls} />
              </div>
            )}

            {hasBg && (
              <div>
                <label className={labelCls}>Màu nền</label>
                <input type="color" value={style.bgColor || '#ffffff'} onChange={(e) => setStyle({ bgColor: e.target.value })} className={colorCls} />
              </div>
            )}

            {hasBgImage && (
              <div>
                <label className={labelCls}>Ảnh nền</label>
                <input value={style.backgroundImage && !style.backgroundImage.startsWith('data:') ? style.backgroundImage : ''} onChange={(e) => setStyle({ backgroundImage: e.target.value || undefined })} placeholder="URL ảnh" className={inputCls} />
                <input type="file" accept="image/*" onChange={handleBgUpload} className={`mt-2 ${fileCls}`} />
                {style.backgroundImage && (
                  <button onClick={() => setStyle({ backgroundImage: undefined })} className="mt-2 text-xs text-red-400 transition-colors hover:text-red-300">
                    Xóa ảnh nền
                  </button>
                )}
              </div>
            )}
          </Group>
        )}

        <Group title="Kích thước & Bố cục">
          {isSection && (
            <div>
              <label className={labelCls}>Số cột</label>
              <input type="number" min="1" max="6" value={style.columns || 1} onChange={(e) => setStyle({ columns: Math.max(1, Number(e.target.value)) })} className={inputCls} />
            </div>
          )}

          <div>
            <label className={labelCls}>Kích thước (px, trống = tự động)</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" min="0" placeholder="Rộng" value={style.width || ''} onChange={(e) => setStyle({ width: e.target.value ? Number(e.target.value) : undefined })} className={inputCls} />
              <input type="number" min="0" placeholder="Cao" value={style.height || ''} onChange={(e) => setStyle({ height: e.target.value ? Number(e.target.value) : undefined })} className={inputCls} />
            </div>
          </div>

          {hasRadius && (
            <div>
              <label className={labelCls}>Bo góc (px)</label>
              <input type="number" min="0" value={style.borderRadius || ''} onChange={(e) => setStyle({ borderRadius: e.target.value ? Number(e.target.value) : undefined })} className={inputCls} />
            </div>
          )}

          {hasPadding && (
            <div>
              <label className={labelCls}>Padding (px)</label>
              <input type="number" min="0" value={style.padding || ''} onChange={(e) => setStyle({ padding: e.target.value ? Number(e.target.value) : undefined })} className={inputCls} />
            </div>
          )}
        </Group>

        <Group title="Viền, Bóng & Độ mờ">
          <div>
            <label className={labelCls}>Độ mờ — {Math.round((style.opacity ?? 1) * 100)}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round((style.opacity ?? 1) * 100)}
              onChange={(e) => setStyle({ opacity: Number(e.target.value) / 100 })}
              className="w-full accent-violet-500"
            />
          </div>

          <div>
            <label className={labelCls}>Viền</label>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" min="0" placeholder="Dày" value={style.borderWidth || ''} onChange={(e) => setStyle({ borderWidth: e.target.value ? Number(e.target.value) : undefined })} className={inputCls} />
              <input type="color" value={style.borderColor || '#000000'} onChange={(e) => setStyle({ borderColor: e.target.value })} className={colorCls} />
              <select value={style.borderStyle || 'solid'} onChange={(e) => setStyle({ borderStyle: e.target.value })} className={inputCls}>
                <option value="solid" className="bg-[var(--bd-panel-solid)]">Liền</option>
                <option value="dashed" className="bg-[var(--bd-panel-solid)]">Đứt</option>
                <option value="dotted" className="bg-[var(--bd-panel-solid)]">Chấm</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Đổ bóng</label>
            <select value={style.boxShadow || ''} onChange={(e) => setStyle({ boxShadow: e.target.value || undefined })} className={inputCls}>
              <option value="" className="bg-[var(--bd-panel-solid)]">Không</option>
              <option value="0 1px 3px rgba(0,0,0,0.12)" className="bg-[var(--bd-panel-solid)]">Nhẹ</option>
              <option value="0 4px 12px rgba(0,0,0,0.15)" className="bg-[var(--bd-panel-solid)]">Vừa</option>
              <option value="0 10px 30px rgba(0,0,0,0.25)" className="bg-[var(--bd-panel-solid)]">Đậm</option>
            </select>
          </div>
        </Group>
      </div>
    </aside>
  )
}

export default PropertiesPanel
