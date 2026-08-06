import Badge from '../../../../components/common/Badge'

// Khớp ENUM ai_generation_status của backend.
const STATUS = {
  done: { label: 'Done', color: 'green' },
  generating: { label: 'Đang tạo', color: 'amber' },
  failed: { label: 'Failed', color: 'red' },
}

// Danh sách log của AI Generator trên Dashboard.
export default function AiGeneratorLog({ logs = [] }) {
  return (
    <div className="rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)]">
      <div className="flex items-center justify-between border-b border-[var(--bd-border)] px-5 py-4">
        <h2 className="text-sm font-semibold text-[var(--bd-text)]">
          <span className="text-[var(--bd-muted)]">&gt;_ </span>AI Generator Log
        </h2>
        <button className="text-xs text-[var(--bd-dim)] hover:text-[var(--bd-text)]">Xem thêm</button>
      </div>

      {logs.length === 0 ? (
        <p className="px-5 py-6 text-center text-sm text-[var(--bd-muted)]">Chưa có lượt tạo nào.</p>
      ) : (
        <ul className="divide-y divide-slate-800/60">
          {logs.map((log, i) => {
            const status = STATUS[log.status] || { label: log.status, color: 'gray' }
            return (
              <li key={log.id} className="flex items-start gap-3 px-5 py-3">
                {/* Số thứ tự trong danh sách — id thật là UUID, quá dài để hiện */}
                <span className="mt-0.5 text-xs text-[var(--bd-muted)]">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-xs text-[var(--bd-dim)]">
                    prompt "{log.prompt}"
                  </p>
                  <p className="mt-1 text-xs text-[var(--bd-muted)]">
                    {log.user} · {log.time}
                  </p>
                </div>
                <Badge color={status.color}>{status.label}</Badge>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
