import { useState } from 'react'
import { ClockIcon, LayersIcon } from '../icons'
import { paletteTypes, paletteBlocks } from './palette'
import { ICON_MAP } from './iconMap'
import BlockRenderer from './BlockRenderer'
import BlockThumb from './BlockThumb'

// "Dựng sẵn" = các mẫu cứng đi kèm builder.
// "Section mẫu" = thư viện do admin tạo, nạp từ API (truyền vào qua prop library).
const builtInBlocks = { ...paletteBlocks, key: 'builtin', label: 'Dựng sẵn' }

const payloadOf = (v) => (v.block ? { block: v.block } : { type: v.type, content: v.content, style: v.style })

// QUAN TRỌNG: giữ ở cấp module để danh tính component không đổi giữa các lần render,
// nếu không HTML5 drag sẽ bị hủy giữa chừng.
const dragProps = (v, onUse) => ({
  draggable: true,
  onDragStart: (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify(payloadOf(v)))
    e.dataTransfer.effectAllowed = 'copy'
  },
  onDragEnd: () => onUse?.(v),
})

const absolutePosition = (element, elementsById) => {
  let x = element.x || 0
  let y = element.y || 0
  let parentId = element.parentId
  const visited = new Set()
  while (parentId && elementsById.has(parentId) && !visited.has(parentId)) {
    visited.add(parentId)
    const parent = elementsById.get(parentId)
    if (!parent.parentId) break
    x += parent.x || 0
    y += parent.y || 0
    parentId = parent.parentId
  }
  return { x, y }
}

// Render read-only đúng graph sẽ được clone khi drop; không gắn interaction Builder.
const BlockGraphPreview = ({ v, width = 210, height = 84 }) => {
  const elements = v.block?.elements || []
  const root = elements.find(
    (element) => element.type === 'section' && !element.parentId,
  )
  if (!root) return <BlockThumb label={v.label} />

  const sourceWidth = root.style?.width || 820
  const sourceHeight = root.style?.height || 360
  const scale = Math.min(width / sourceWidth, height / sourceHeight)
  const elementsById = new Map(elements.map((element) => [element.id, element]))
  const children = elements.filter((element) => element !== root)

  return (
    <div
      className="relative overflow-hidden rounded-md border border-[var(--bd-border)] bg-slate-100"
      style={{ width: '100%', height }}
    >
      <div
        className="absolute"
        style={{
          left: Math.max(0, (width - sourceWidth * scale) / 2),
          top: Math.max(0, (height - sourceHeight * scale) / 2),
          width: sourceWidth,
          height: sourceHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          backgroundColor: root.style?.bgColor || '#ffffff',
          backgroundImage: root.style?.backgroundImage
            ? `url(${root.style.backgroundImage})`
            : undefined,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        {children.map((element) => {
          const position = absolutePosition(element, elementsById)
          const style = element.style || {}
          return (
            <div
              key={element.id}
              className="absolute overflow-hidden"
              style={{
                left: position.x,
                top: position.y,
                width: style.width || 220,
                height: style.height || Math.max(32, (style.fontSize || 16) * 1.5),
              }}
            >
              <BlockRenderer element={{ ...element, style }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

const TemplateVisual = ({ v, large = false }) => {
  const [imageFailed, setImageFailed] = useState(false)
  const height = large ? 190 : 84

  if (v.thumbnailUrl && !imageFailed) {
    return (
      <img
        src={v.thumbnailUrl}
        alt={`Preview ${v.label}`}
        onError={() => setImageFailed(true)}
        className="w-full rounded-md border border-[var(--bd-border)] object-cover"
        style={{ height }}
      />
    )
  }

  return <BlockGraphPreview v={v} width={large ? 330 : 210} height={height} />
}

// Xem trước 1 biến thể (dùng lại BlockRenderer thật để đúng phong cách).
// Nền luôn sáng vì phần tử được thiết kế để hiển thị trên trang trắng.
const VariantPreview = ({ v }) => {
  if (v.block?.elements) return <TemplateVisual v={v} />
  if (v.block) return <BlockThumb label={v.label} />
  return (
    <div className="pointer-events-none flex h-16 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b from-white to-slate-100 p-2 shadow-inner">
      <BlockRenderer element={{ id: 'preview', type: v.type, content: v.content, style: v.style }} />
    </div>
  )
}

const ElementPanel = ({
  recent = [],
  library = [],
  onUse,
  libraryEmptyMessage = 'Chưa có section mẫu nào.',
  libraryStatus = 'ready',
  libraryError = '',
  libraryInvalidCount = 0,
  onRetryLibrary,
  enableLibraryHoverPreview = false,
}) => {
  const types = [
    ...(recent.length ? [{ key: 'recent', label: 'Gần đây', icon: ClockIcon, variants: recent }] : []),
    ...paletteTypes,
    { key: 'library', label: 'Section mẫu', icon: LayersIcon, variants: library },
    builtInBlocks,
  ]
  const [activeKey, setActiveKey] = useState(paletteTypes[0].key)
  const [hoveredLibraryItem, setHoveredLibraryItem] = useState(null)
  const active = types.find((t) => t.key === activeKey) || types[0]
  const libraryUnavailable =
    active.key === 'library' && libraryStatus !== 'ready'

  return (
    <aside className="relative flex w-[364px] shrink-0 animate-slide-in-left border-r border-[var(--bd-border)] bg-[var(--bd-panel)] backdrop-blur-xl">
      {/* Cột trái: danh sách loại phần tử */}
      <div className="w-[132px] shrink-0 overflow-y-auto border-r border-[var(--bd-border)] p-2">
        {types.map((t, i) => {
          const on = t.key === active.key
          return (
            <button
              key={t.key}
              onClick={() => setActiveKey(t.key)}
              style={{ animationDelay: `${i * 25}ms` }}
              className={`group mb-1 flex w-full animate-fade-in-up items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-[13px] transition-all duration-200 ${
                on
                  ? 'bg-gradient-to-r from-violet-500/20 to-cyan-400/10 font-medium text-[var(--bd-accent)] ring-1 ring-inset ring-violet-400/25'
                  : 'text-[var(--bd-dim)] hover:translate-x-0.5 hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]'
              }`}
            >
              <t.icon size={16} className={on ? '' : 'opacity-70 transition-opacity group-hover:opacity-100'} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Cột phải: gallery các biến thể */}
      <div className="flex-1 overflow-y-auto p-3">
        <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--bd-muted)]">
          <span className="h-3 w-0.5 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400" />
          {active.label}
        </p>

        {libraryUnavailable ? (
          <div
            className="rounded-xl border border-dashed border-[var(--bd-border)] px-3 py-6 text-center text-xs leading-relaxed text-[var(--bd-muted)]"
            role={libraryStatus === 'error' ? 'alert' : 'status'}
          >
            <p>
              {libraryStatus === 'loading'
                ? 'Đang tải thư viện Section...'
                : libraryError || 'Không thể tải Section Template.'}
            </p>
            {libraryStatus === 'error' && onRetryLibrary && (
              <button
                type="button"
                onClick={onRetryLibrary}
                className="mt-3 rounded-lg border border-violet-400/35 px-3 py-1.5 font-semibold text-[var(--bd-accent)] transition hover:bg-violet-500/10"
              >
                Thử tải lại
              </button>
            )}
          </div>
        ) : active.variants.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--bd-border)] px-3 py-6 text-center text-xs leading-relaxed text-[var(--bd-muted)]">
            {active.key === 'library' ? libraryEmptyMessage : 'Chưa có mục nào.'}
          </p>
        ) : active.key === 'icon' ? (
          <div className="grid grid-cols-4 gap-2">
            {active.variants.map((v, i) => {
              const IconComp = ICON_MAP[v.content]
              return (
                <button
                  key={v.content}
                  {...dragProps(v, onUse)}
                  title={v.label}
                  style={{ animationDelay: `${i * 18}ms` }}
                  className="flex aspect-square animate-pop-in cursor-grab items-center justify-center rounded-xl border border-[var(--bd-border)] bg-[var(--bd-fill)] text-[var(--bd-dim)] transition-all duration-200 hover:-translate-y-1 hover:border-violet-400/50 hover:bg-violet-500/10 hover:text-[var(--bd-accent)] hover:shadow-[0_6px_20px_-8px_rgba(139,92,246,.9)] active:scale-95"
                >
                  <IconComp size={18} />
                </button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-2.5">
            {active.variants.map((v, i) => (
              <div
                key={v.id || v.label}
                {...dragProps(v, onUse)}
                aria-label={
                  active.key === 'library'
                    ? `Section Template ${v.label}, loại ${v.sectionType}`
                    : undefined
                }
                onMouseEnter={() =>
                  active.key === 'library' && setHoveredLibraryItem(v)
                }
                onMouseLeave={() => setHoveredLibraryItem(null)}
                style={{ animationDelay: `${i * 35}ms` }}
                className="group relative animate-pop-in cursor-grab overflow-hidden rounded-xl border border-[var(--bd-border)] bg-[var(--bd-fill)] p-2.5 transition-all duration-200 hover:-translate-y-1 hover:border-violet-400/40 hover:bg-[var(--bd-fill-hover)] hover:shadow-[0_10px_28px_-12px_rgba(139,92,246,.9)] active:scale-[.97]"
              >
                {/* Lớp sáng nhẹ hiện khi rê chuột */}
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/0 to-cyan-400/0 opacity-0 transition-opacity duration-300 group-hover:from-violet-500/10 group-hover:to-cyan-400/5 group-hover:opacity-100" />
                <VariantPreview v={v} />
                <p className="relative mt-2 text-center text-xs text-[var(--bd-dim)] transition-colors group-hover:text-[var(--bd-text)]">
                  {v.label}
                </p>
                {active.key === 'library' && (
                  <div className="relative mt-1 flex items-center justify-between gap-2 text-[9px] font-semibold uppercase tracking-wider text-[var(--bd-muted)]">
                    <span>{v.sectionType || 'custom'}</span>
                    <span>Kéo vào canvas</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {active.key === 'library' && libraryInvalidCount > 0 && (
          <p className="mt-3 rounded-lg border border-amber-400/20 bg-amber-500/[0.06] px-2.5 py-2 text-[10px] leading-relaxed text-amber-300">
            Đã bỏ qua {libraryInvalidCount} Section Template có dữ liệu không hợp lệ.
          </p>
        )}
      </div>

      {enableLibraryHoverPreview && hoveredLibraryItem && (
        <div className="pointer-events-none absolute left-[calc(100%+12px)] top-4 z-40 w-[360px] animate-fade-in rounded-2xl border border-violet-400/25 bg-[var(--bd-panel-solid)] p-3 shadow-[0_24px_70px_-18px_rgba(15,23,42,.8)]">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="truncate text-sm font-semibold text-[var(--bd-text)]">
              {hoveredLibraryItem.label}
            </p>
            <span className="rounded-md bg-violet-500/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-[var(--bd-accent)]">
              {hoveredLibraryItem.sectionType}
            </span>
          </div>
          <TemplateVisual v={hoveredLibraryItem} large />
          <p className="mt-2 text-[10px] text-[var(--bd-muted)]">
            Preview nội dung mặc định · Kéo để thêm vào Landing Page
          </p>
        </div>
      )}
    </aside>
  )
}

export default ElementPanel
