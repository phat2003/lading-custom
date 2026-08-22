import { useMemo, useState } from 'react'
import { GripVerticalIcon, LayoutTemplateIcon } from '../../../../components/icons'
import {
  getOrderedSectionRoots,
  getSectionDisplayNames,
  getSectionTypeName,
} from '../sectionManagement'

const SectionListPanel = ({ elements, selectedId, onSelect, onReorder }) => {
  const sections = useMemo(() => getOrderedSectionRoots(elements), [elements])
  const displayNames = useMemo(() => getSectionDisplayNames(sections), [sections])
  const [draggedId, setDraggedId] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)

  return (
    <aside className="w-72 shrink-0 overflow-y-auto border-r border-[var(--bd-border)] bg-[var(--bd-panel)] backdrop-blur-xl">
      <div className="sticky top-0 z-10 border-b border-[var(--bd-border)] bg-[var(--bd-panel-solid)] px-4 py-3.5 backdrop-blur-xl">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--bd-dim)]">
          <span className="h-3 w-0.5 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400" />
          Danh sách Section
        </p>
        <p className="mt-1 text-[11px] text-[var(--bd-muted)]">Kéo để sắp xếp thứ tự trang.</p>
      </div>

      <div className="space-y-1.5 p-2.5">
        {sections.length === 0 ? (
          <p className="px-2 py-4 text-xs leading-relaxed text-[var(--bd-muted)]">
            Chưa có Section. Mở panel Thêm để kéo Section vào canvas.
          </p>
        ) : (
          sections.map((section, index) => {
            const active = section.id === selectedId
            const target = dropTarget?.id === section.id ? dropTarget.placement : null
            return (
              <button
                key={section.id}
                type="button"
                draggable
                aria-current={active ? 'true' : undefined}
                onClick={() => onSelect(section.id)}
                onDragStart={(event) => {
                  setDraggedId(section.id)
                  event.dataTransfer.effectAllowed = 'move'
                  event.dataTransfer.setData('text/plain', section.id)
                }}
                onDragOver={(event) => {
                  event.preventDefault()
                  event.dataTransfer.dropEffect = 'move'
                  const rect = event.currentTarget.getBoundingClientRect()
                  const placement = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
                  setDropTarget({ id: section.id, placement })
                }}
                onDragLeave={() => {
                  if (dropTarget?.id === section.id) setDropTarget(null)
                }}
                onDrop={(event) => {
                  event.preventDefault()
                  const sourceId = draggedId || event.dataTransfer.getData('text/plain')
                  const rect = event.currentTarget.getBoundingClientRect()
                  const placement = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
                  setDraggedId(null)
                  setDropTarget(null)
                  if (sourceId) onReorder(sourceId, section.id, placement)
                }}
                onDragEnd={() => {
                  setDraggedId(null)
                  setDropTarget(null)
                }}
                className={`group relative flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2.5 text-left transition-all duration-200 ${
                  active
                    ? 'border-violet-400/40 bg-gradient-to-r from-violet-500/20 to-cyan-400/10 shadow-[0_10px_28px_-20px_rgba(139,92,246,.9)]'
                    : 'border-transparent bg-[var(--bd-fill)] hover:border-violet-400/20 hover:bg-[var(--bd-fill-hover)]'
                } ${draggedId === section.id ? 'opacity-45' : ''}`}
              >
                {target && (
                  <span
                    className={`absolute inset-x-2 h-0.5 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400 ${
                      target === 'before' ? '-top-1' : '-bottom-1'
                    }`}
                  />
                )}
                <GripVerticalIcon size={15} className="shrink-0 text-[var(--bd-muted)] group-hover:text-[var(--bd-accent)]" />
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-400">
                  <LayoutTemplateIcon size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-[var(--bd-text)]">
                    {displayNames.get(section.id)}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] font-semibold uppercase tracking-wider text-[var(--bd-muted)]">
                    {index + 1}. {getSectionTypeName(section.sectionType)} · {section.sectionType || 'custom'}
                  </span>
                </span>
              </button>
            )
          })
        )}
      </div>
    </aside>
  )
}

export default SectionListPanel
