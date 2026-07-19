import { useState } from 'react'
import { ClockIcon } from '../../../../components/icons'
import { paletteTypes, paletteBlocks } from '../mock'
import { ICON_MAP } from '../iconMap'
import BlockRenderer from './BlockRenderer'
import BlockThumb from './BlockThumb'

const baseTypes = [...paletteTypes, paletteBlocks]

const payloadOf = (v) => (v.block ? { block: v.block } : { type: v.type, content: v.content, style: v.style })

const dragProps = (v, onUse) => ({
  draggable: true,
  onDragStart: (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify(payloadOf(v)))
    e.dataTransfer.effectAllowed = 'copy'
  },
  onDragEnd: () => onUse?.(v),
})

// Xem trước 1 biến thể (dùng lại BlockRenderer thật để đúng phong cách).
const VariantPreview = ({ v }) => {
  if (v.block) return <BlockThumb label={v.label} />
  return (
    <div className="pointer-events-none flex h-14 items-center justify-center overflow-hidden rounded border border-black/5 bg-white p-1">
      <BlockRenderer element={{ id: 'preview', type: v.type, content: v.content, style: v.style }} />
    </div>
  )
}

const ElementPanel = ({ recent = [], onUse }) => {
  const types = recent.length
    ? [{ key: 'recent', label: 'Gần đây', icon: ClockIcon, variants: recent }, ...baseTypes]
    : baseTypes
  const [activeKey, setActiveKey] = useState(baseTypes[0].key)
  const active = types.find((t) => t.key === activeKey) || types[0]

  return (
    <aside className="flex w-[336px] shrink-0 animate-slide-in-left border-r border-white/10 bg-[#1c1c1f]">
      {/* Danh sách loại phần tử */}
      <div className="w-32 shrink-0 overflow-y-auto border-r border-white/10 py-1">
        {types.map((t) => {
          const on = t.key === active.key
          return (
            <button
              key={t.key}
              onClick={() => setActiveKey(t.key)}
              className={`relative flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                on ? 'bg-white/5 text-yellow-400' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              {on && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-yellow-400" />}
              <t.icon size={16} className={on ? 'text-yellow-400' : 'text-gray-400'} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Gallery các biến thể */}
      <div className="flex-1 overflow-y-auto p-2.5">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">{active.label}</p>

        {active.key === 'icon' ? (
          <div className="grid grid-cols-4 gap-1.5">
            {active.variants.map((v, i) => {
              const IconComp = ICON_MAP[v.content]
              return (
                <button
                  key={v.content}
                  {...dragProps(v, onUse)}
                  title={v.label}
                  style={{ animationDelay: `${i * 20}ms` }}
                  className="flex aspect-square animate-fade-in-up cursor-grab items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition-all hover:-translate-y-0.5 hover:border-yellow-400/50 hover:bg-yellow-400/10 hover:text-yellow-400"
                >
                  <IconComp size={18} />
                </button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {active.variants.map((v, i) => (
              <div
                key={v.label}
                {...dragProps(v, onUse)}
                style={{ animationDelay: `${i * 40}ms` }}
                className="group animate-fade-in-up cursor-grab rounded-lg border border-white/10 bg-white/5 p-2 transition-all duration-150 hover:-translate-y-0.5 hover:border-yellow-400/50 hover:bg-white/10 hover:shadow-lg active:scale-95"
              >
                <VariantPreview v={v} />
                <p className="mt-1.5 text-center text-xs text-gray-300 group-hover:text-white">{v.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

export default ElementPanel
