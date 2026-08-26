import { useEffect, useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from '../../../../components/icons'
import { SECTION_TYPE_OPTIONS } from '../sectionManagement'

const labelCls = 'mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-[var(--bd-muted)]'
const inputCls =
  'w-full rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] px-3 py-2 text-sm text-[var(--bd-text)] transition-all duration-200 focus:border-violet-400/60 focus:bg-violet-500/[0.06] focus:outline-none focus:ring-2 focus:ring-violet-500/20'
const actionCls =
  'flex items-center justify-center gap-2 rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] px-3 py-2 text-xs font-medium text-[var(--bd-dim)] transition-all hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-[var(--bd-accent)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[var(--bd-border)] disabled:hover:bg-[var(--bd-fill)] disabled:hover:text-[var(--bd-dim)]'

const CurrentSectionControls = ({
  section,
  displayName,
  isFirst,
  isLast,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDelete,
}) => {
  const [draftName, setDraftName] = useState(displayName)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const currentType = section.sectionType || 'custom'
  const hasKnownType = SECTION_TYPE_OPTIONS.some(([value]) => value === currentType)

  useEffect(() => {
    setDraftName(displayName)
    setConfirmingDelete(false)
  }, [displayName, section.id])

  const commitName = () => {
    const normalized = draftName.trim()
    const explicitName = section.sectionName?.trim() || ''
    if ((!explicitName && normalized === displayName) || normalized === explicitName) return
    onUpdate(section.id, { sectionName: normalized || undefined })
  }

  return (
    <section className="animate-fade-in-up rounded-xl border border-violet-400/25 bg-gradient-to-br from-violet-500/[0.09] to-cyan-400/[0.04] p-3">
      <h3 className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--bd-accent)]">
        <span className="h-2.5 w-0.5 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400" />
        Thông tin Section
      </h3>

      <div className="space-y-3">
        <div>
          <label className={labelCls} htmlFor={`section-name-${section.id}`}>Tên Section</label>
          <input
            id={`section-name-${section.id}`}
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onBlur={commitName}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur()
              if (event.key === 'Escape') {
                setDraftName(displayName)
                event.currentTarget.blur()
              }
            }}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor={`section-type-${section.id}`}>Loại Section</label>
          <select
            id={`section-type-${section.id}`}
            value={currentType}
            onChange={(event) => onUpdate(section.id, { sectionType: event.target.value })}
            className={inputCls}
          >
            {!hasKnownType && <option value={currentType}>{currentType}</option>}
            {SECTION_TYPE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value} className="bg-[var(--bd-panel-solid)]">{label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" disabled={isFirst} onClick={onMoveUp} className={actionCls}>
            <ChevronUpIcon size={14} /> Di chuyển lên
          </button>
          <button type="button" disabled={isLast} onClick={onMoveDown} className={actionCls}>
            <ChevronDownIcon size={14} /> Di chuyển xuống
          </button>
        </div>

        {confirmingDelete ? (
          <div className="rounded-lg border border-red-400/25 bg-red-500/[0.08] p-2.5">
            <p className="text-xs leading-relaxed text-[var(--bd-danger)]">Xóa Section này cùng toàn bộ phần tử bên trong?</p>
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={onDelete} className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-400">
                Xóa Section
              </button>
              <button type="button" onClick={() => setConfirmingDelete(false)} className="rounded-lg border border-[var(--bd-border)] px-3 py-2 text-xs text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)]">
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-400/25 bg-red-500/[0.06] px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300"
          >
            <TrashIcon size={14} /> Xóa Section
          </button>
        )}
      </div>
    </section>
  )
}

export default CurrentSectionControls
