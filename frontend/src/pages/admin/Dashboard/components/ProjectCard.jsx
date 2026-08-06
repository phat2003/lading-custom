import Badge from '../../../../components/common/Badge'
import { EyeIcon, PencilIcon, TrashIcon, MenuIcon } from '../../../../components/icons'

const STATUS_COLOR = { Published: 'green', Draft: 'amber' }

// Thẻ project trong "Workspace Management".
export default function ProjectCard({ project }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--bd-border)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/5 bg-[var(--bd-panel-solid)]">
      {/* Thumbnail placeholder */}
      <div className="relative flex h-32 items-center justify-center border-b border-[var(--bd-border)] bg-[var(--bd-fill)]">
        <MenuIcon size={28} className="text-[var(--bd-muted)]" />
        <span className="absolute right-3 top-3">
          <Badge color={STATUS_COLOR[project.status] || 'gray'}>{project.status}</Badge>
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="font-semibold text-[var(--bd-text)]">{project.name}</p>
        <p className="mt-0.5 truncate text-xs text-[var(--bd-muted)]">{project.domain}</p>
        <p className="mt-1 text-xs text-[var(--bd-muted)]">{project.updated}</p>

        <div className="mt-3 flex items-center gap-2">
          <button className="inline-flex items-center gap-1 rounded-md border border-[var(--bd-border)] px-2.5 py-1 text-xs text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)]">
            <EyeIcon size={14} /> View
          </button>
          <button className="inline-flex items-center gap-1 rounded-md border border-[var(--bd-border)] px-2.5 py-1 text-xs text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)]">
            <PencilIcon size={14} /> Edit
          </button>
          <button className="inline-flex items-center gap-1 rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10">
            <TrashIcon size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
