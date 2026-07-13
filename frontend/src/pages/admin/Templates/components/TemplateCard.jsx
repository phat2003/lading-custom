import Badge from '../../../../components/common/Badge'
import { PencilIcon, TrashIcon, LayersIcon } from '../../../../components/icons'

const CATEGORY_COLOR = {
  SaaS: 'blue',
  Agency: 'green',
  Startup: 'amber',
  Webinar: 'red',
  Portfolio: 'purple',
}
const STATUS_COLOR = { Published: 'green', Draft: 'amber' }
const TIER_COLOR = { Premium: 'purple', Free: 'gray' }

// Thẻ template trong thư viện admin.
export default function TemplateCard({ template, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#111725]">
      {/* Thumbnail (placeholder) */}
      <div className="relative flex h-40 items-center justify-center border-b border-slate-800 bg-slate-900/40">
        <div className="absolute left-3 top-3">
          <Badge color={CATEGORY_COLOR[template.category] || 'gray'}>
            {template.category}
          </Badge>
        </div>
        <div className="w-2/3 space-y-2 opacity-40">
          <div className="h-2 rounded bg-slate-600" />
          <div className="h-2 w-4/5 rounded bg-slate-700" />
          <div className="h-2 w-3/5 rounded bg-slate-700" />
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-slate-500">
          <LayersIcon size={12} /> {template.sections} sections
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white">{template.name}</h3>
          <Badge color={STATUS_COLOR[template.status] || 'gray'}>{template.status}</Badge>
        </div>
        <div className="mt-2">
          <Badge color={TIER_COLOR[template.tier] || 'gray'}>{template.tier}</Badge>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => onEdit?.(template)}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
          >
            <PencilIcon size={14} /> Edit
          </button>
          <button
            onClick={() => onDelete?.(template)}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-red-500/40 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
          >
            <TrashIcon size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}
