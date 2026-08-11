import { useState } from 'react'
import { ClockIcon, LayersIcon } from '../../../../components/icons'
import { paletteTypes, paletteBlocks } from '../mock'
import { ICON_MAP } from '../iconMap'
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

// Xem trước 1 biến thể (dùng lại BlockRenderer thật để đúng phong cách).
// Nền luôn sáng vì phần tử được thiết kế để hiển thị trên trang trắng.
const VariantPreview = ({ v }) => {
  // Section mẫu từ API có ảnh bìa riêng thì ưu tiên dùng.
  if (v.thumbnailUrl) {
    return (
      <img
        src={v.thumbnailUrl}
        alt=""
        className="h-12 w-full rounded-md border border-[var(--bd-border)] object-cover"
      />
    )
  }
  if (v.block) return <BlockThumb label={v.label} />
  return (
    <div className="pointer-events-none flex h-16 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b from-white to-slate-100 p-2 shadow-inner">
      <BlockRenderer element={{ id: 'preview', type: v.type, content: v.content, style: v.style }} />
    </div>
  )
}

const ElementPanel = ({ recent = [], library = [], onUse }) => {
  const types = [
    ...(recent.length ? [{ key: 'recent', label: 'Gần đây', icon: ClockIcon, variants: recent }] : []),
    ...paletteTypes,
    { key: 'library', label: 'Section mẫu', icon: LayersIcon, variants: library },
    builtInBlocks,
  ]
  const [activeKey, setActiveKey] = useState(paletteTypes[0].key)
  const active = types.find((t) => t.key === activeKey) || types[0]

  return (
    <aside className="flex w-[364px] shrink-0 animate-slide-in-left border-r border-[var(--bd-border)] bg-[var(--bd-panel)] backdrop-blur-xl">
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

        {active.variants.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--bd-border)] px-3 py-6 text-center text-xs leading-relaxed text-[var(--bd-muted)]">
            {active.key === 'library'
              ? 'Chưa có section mẫu nào. Admin tạo ở trang Section, lưu xong sẽ hiện tại đây.'
              : 'Chưa có mục nào.'}
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
                key={v.label}
                {...dragProps(v, onUse)}
                style={{ animationDelay: `${i * 35}ms` }}
                className="group relative animate-pop-in cursor-grab overflow-hidden rounded-xl border border-[var(--bd-border)] bg-[var(--bd-fill)] p-2.5 transition-all duration-200 hover:-translate-y-1 hover:border-violet-400/40 hover:bg-[var(--bd-fill-hover)] hover:shadow-[0_10px_28px_-12px_rgba(139,92,246,.9)] active:scale-[.97]"
              >
                {/* Lớp sáng nhẹ hiện khi rê chuột */}
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/0 to-cyan-400/0 opacity-0 transition-opacity duration-300 group-hover:from-violet-500/10 group-hover:to-cyan-400/5 group-hover:opacity-100" />
                <VariantPreview v={v} />
                <p className="relative mt-2 text-center text-xs text-[var(--bd-dim)] transition-colors group-hover:text-[var(--bd-text)]">
                  {v.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

export default ElementPanel
