import Badge from '../../../../components/common/Badge'
import { SparklesIcon } from '../../../../components/icons'

export default function QuickStyles({ styles = [] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#111725] p-4">
      <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        <SparklesIcon size={14} /> Phong cách nhanh
      </p>
      <div className="space-y-2">
        {styles.map((s) => (
          <button
            key={s.name}
            className="flex w-full items-center justify-between rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-300 hover:border-slate-700 hover:bg-slate-800/40"
          >
            {s.name}
            {s.badge && <Badge color="blue">{s.badge}</Badge>}
          </button>
        ))}
      </div>
    </div>
  )
}
