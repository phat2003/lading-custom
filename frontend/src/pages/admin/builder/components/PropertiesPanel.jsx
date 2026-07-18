import { fonts } from '../mock'
import {
  TrashIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
} from '../../../../components/icons'

const labelCls = 'mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500'
const inputCls =
  'w-full rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-gray-200 focus:border-yellow-400/50 focus:outline-none'
const colorCls = 'h-9 w-full rounded-md border border-white/10 bg-white/5'

const fmtBtn = (active) =>
  `flex h-8 w-8 items-center justify-center rounded border text-sm ${
    active ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' : 'border-white/10 text-gray-300 hover:bg-white/10'
  }`

const ALIGNS = [
  ['left', AlignLeftIcon],
  ['center', AlignCenterIcon],
  ['right', AlignRightIcon],
  ['justify', AlignJustifyIcon],
]

const TEXT_TYPES = ['heading', 'label', 'paragraph']
const FIELD_TYPES = ['input', 'textarea']
const RICH_TEXT = ['list', 'quote', 'card', 'iconbox']

const PropertiesPanel = ({ element, onUpdate, onDelete }) => {
  if (!element) {
    return (
      <aside className="w-72 shrink-0 border-l border-white/10 bg-[#1c1c1f] p-4 text-sm text-gray-500">
        Chọn một phần tử trên canvas để chỉnh sửa thuộc tính.
      </aside>
    )
  }

  const { id, type, content, style } = element
  const setStyle = (patch) => onUpdate(id, { style: patch })

  const isText = TEXT_TYPES.includes(type)
  const isField = FIELD_TYPES.includes(type)
  const isImage = type === 'image'
  const isSection = type === 'section'

  const hasContent = isText || isField || ['button', 'video', 'image', 'list', 'quote', 'checkbox', 'select', 'card', 'iconbox', 'countdown'].includes(type)
  const hasToolbar = isText || type === 'button' || ['list', 'quote'].includes(type)
  const hasFont = isText || isField || type === 'button' || type === 'checkbox' || RICH_TEXT.includes(type)
  const hasSize = hasFont || type === 'icon' || type === 'countdown'
  const hasColor = hasFont || type === 'icon' || type === 'divider' || type === 'countdown'
  const hasBg = type === 'button' || type === 'box' || isField || isSection || type === 'card'
  const hasPadding = isText || type === 'button' || type === 'box' || isSection
  const hasBgImage = type === 'box' || isSection || type === 'card'
  const hasRadius = type !== 'spacer' && type !== 'divider'

  const contentLabel =
    type === 'video' ? 'URL video (YouTube/mp4)'
      : isImage ? 'URL ảnh'
      : isField ? 'Placeholder'
      : type === 'list' ? 'Các mục (mỗi dòng 1)'
      : type === 'select' ? 'Lựa chọn (mỗi dòng 1)'
      : type === 'quote' ? 'Nội dung trích dẫn'
      : type === 'checkbox' ? 'Nhãn'
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

  return (
    <aside className="w-72 shrink-0 space-y-4 overflow-y-auto border-l border-white/10 bg-[#1c1c1f] p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Thuộc tính</h2>
        <button onClick={() => onDelete(id)} className="text-red-400 hover:text-red-300" title="Xóa">
          <TrashIcon size={16} />
        </button>
      </div>

      {hasContent && (
        <div>
          <label className={labelCls}>{contentLabel}</label>
          {type === 'countdown' ? (
            <input type="datetime-local" value={(content || '').slice(0, 16)} onChange={(e) => onUpdate(id, { content: e.target.value })} className={inputCls} />
          ) : type === 'list' || type === 'select' ? (
            <textarea value={content} onChange={(e) => onUpdate(id, { content: e.target.value })} rows={4} className={`${inputCls} resize-none`} />
          ) : (
            <input value={content} onChange={(e) => onUpdate(id, { content: e.target.value })} className={inputCls} />
          )}
        </div>
      )}

      {isImage && (
        <div>
          <label className={labelCls}>Tải ảnh lên</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-xs text-gray-400 file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-yellow-400 file:px-3 file:py-1.5 file:text-black hover:file:bg-yellow-300" />
        </div>
      )}

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
                <IconComp size={16} />
              </button>
            ))}
          </div>
        </div>
      )}

      {(hasSize || hasColor) && (
        <div className="grid grid-cols-2 gap-3">
          {hasSize && (
            <div>
              <label className={labelCls}>{type === 'icon' ? 'Cỡ icon (px)' : 'Cỡ chữ (px)'}</label>
              <input type="number" min="8" value={style.fontSize} onChange={(e) => setStyle({ fontSize: Number(e.target.value) })} className={inputCls} />
            </div>
          )}
          {hasColor && (
            <div>
              <label className={labelCls}>{type === 'divider' ? 'Màu kẻ' : 'Màu chữ'}</label>
              <input type="color" value={style.color || '#000000'} onChange={(e) => setStyle({ color: e.target.value })} className={colorCls} />
            </div>
          )}
        </div>
      )}

      {hasFont && (
        <div>
          <label className={labelCls}>Phông chữ</label>
          <select value={style.fontFamily} onChange={(e) => setStyle({ fontFamily: e.target.value })} className={inputCls}>
            {fonts.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      )}

      {isSection && (
        <div>
          <label className={labelCls}>Số cột</label>
          <input type="number" min="1" max="6" value={style.columns || 1} onChange={(e) => setStyle({ columns: Math.max(1, Number(e.target.value)) })} className={inputCls} />
        </div>
      )}

      {hasBg && (
        <div>
          <label className={labelCls}>Màu nền</label>
          <input type="color" value={style.bgColor || '#ffffff'} onChange={(e) => setStyle({ bgColor: e.target.value })} className={colorCls} />
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

      <div>
        <label className={labelCls}>Độ mờ ({Math.round((style.opacity ?? 1) * 100)}%)</label>
        <input type="range" min="0" max="100" value={Math.round((style.opacity ?? 1) * 100)} onChange={(e) => setStyle({ opacity: Number(e.target.value) / 100 })} className="w-full" />
      </div>

      <div>
        <label className={labelCls}>Viền</label>
        <div className="grid grid-cols-3 gap-2">
          <input type="number" min="0" placeholder="Dày" value={style.borderWidth || ''} onChange={(e) => setStyle({ borderWidth: e.target.value ? Number(e.target.value) : undefined })} className={inputCls} />
          <input type="color" value={style.borderColor || '#000000'} onChange={(e) => setStyle({ borderColor: e.target.value })} className={colorCls} />
          <select value={style.borderStyle || 'solid'} onChange={(e) => setStyle({ borderStyle: e.target.value })} className={inputCls}>
            <option value="solid">Nét liền</option>
            <option value="dashed">Nét đứt</option>
            <option value="dotted">Chấm</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Đổ bóng</label>
        <select value={style.boxShadow || ''} onChange={(e) => setStyle({ boxShadow: e.target.value || undefined })} className={inputCls}>
          <option value="">Không</option>
          <option value="0 1px 3px rgba(0,0,0,0.12)">Nhẹ</option>
          <option value="0 4px 12px rgba(0,0,0,0.15)">Vừa</option>
          <option value="0 10px 30px rgba(0,0,0,0.25)">Đậm</option>
        </select>
      </div>

      {hasPadding && (
        <div>
          <label className={labelCls}>Padding (px)</label>
          <input type="number" min="0" value={style.padding || ''} onChange={(e) => setStyle({ padding: e.target.value ? Number(e.target.value) : undefined })} className={inputCls} />
        </div>
      )}

      {hasBgImage && (
        <div>
          <label className={labelCls}>Ảnh nền</label>
          <input value={style.backgroundImage && !style.backgroundImage.startsWith('data:') ? style.backgroundImage : ''} onChange={(e) => setStyle({ backgroundImage: e.target.value || undefined })} placeholder="URL ảnh" className={inputCls} />
          <input type="file" accept="image/*" onChange={handleBgUpload} className="mt-2 block w-full text-xs text-gray-400 file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-yellow-400 file:px-3 file:py-1.5 file:text-black hover:file:bg-yellow-300" />
          {style.backgroundImage && (
            <button onClick={() => setStyle({ backgroundImage: undefined })} className="mt-2 text-xs text-red-400 hover:text-red-300">
              Xóa ảnh nền
            </button>
          )}
        </div>
      )}
    </aside>
  )
}

export default PropertiesPanel
