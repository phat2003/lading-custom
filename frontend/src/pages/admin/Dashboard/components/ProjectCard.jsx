import Badge from '../../../../components/common/Badge'
import { EyeIcon, PencilIcon, TrashIcon, MenuIcon } from '../../../../components/icons'

const STATUS_COLOR = { Published: 'green', Draft: 'amber' }

// Thẻ project trong "Workspace Management".
export default function ProjectCard({ project }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#111725]">
      {/* Thumbnail placeholder */}
      <div className="relative flex h-32 items-center justify-center border-b border-slate-800 bg-slate-900/50">
        <MenuIcon size={28} className="text-slate-700" />
        <span className="absolute right-3 top-3">
          <Badge color={STATUS_COLOR[project.status] || 'gray'}>{project.status}</Badge>
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="font-semibold text-white">{project.name}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500">{project.domain}</p>
        <p className="mt-1 text-xs text-slate-600">{project.updated}</p>

        <div className="mt-3 flex items-center gap-2">
          <button className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800">
            <EyeIcon size={14} /> View
          </button>
          <button className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800">
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
