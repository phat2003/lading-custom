import Badge from '../../../../components/common/Badge'
import {
  FilterIcon,
  DownloadIcon,
  SparklesIcon,
  RefreshCwIcon,
  AlertTriangleIcon,
} from '../../../../components/icons'

const STATUS = {
  done: { label: 'Hoàn thành', color: 'green', Icon: SparklesIcon },
  generating: { label: 'Đang tạo', color: 'amber', Icon: RefreshCwIcon },
  failed: { label: 'Thất bại', color: 'red', Icon: AlertTriangleIcon },
}

function HistoryItem({ item }) {
  const status = STATUS[item.status] || STATUS.done
  const meta = [item.time, item.tokens && `${item.tokens} Tokens`, item.note]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="flex items-center gap-4 rounded-lg border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-[var(--bd-dim)]">
        <status.Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-[var(--bd-text)]">"{item.prompt}"</p>
        <p className="mt-1 text-xs text-[var(--bd-muted)]">{meta}</p>
      </div>
      <Badge color={status.color}>{status.label}</Badge>
    </div>
  )
}

export default function GenerationHistory({ history = [] }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--bd-text)]">Lịch sử khởi tạo</h2>
        <div className="flex items-center gap-1 text-[var(--bd-dim)]">
          <button className="rounded-md p-1.5 hover:bg-[var(--bd-fill-hover)]">
            <FilterIcon size={16} />
          </button>
          <button className="rounded-md p-1.5 hover:bg-[var(--bd-fill-hover)]">
            <DownloadIcon size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {history.map((group) => (
          <div key={group.day}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--bd-muted)]">
              {group.day}
            </p>
            <div className="space-y-2">
              {group.items.map((item) => (
                <HistoryItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
