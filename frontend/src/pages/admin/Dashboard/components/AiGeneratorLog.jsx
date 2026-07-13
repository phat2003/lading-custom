import Badge from '../../../../components/common/Badge'

const STATUS_COLOR = { Done: 'green', Using: 'amber', Failed: 'red' }

// Danh sách log của AI Generator trên Dashboard.
export default function AiGeneratorLog({ logs = [] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#111725]">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <h2 className="text-sm font-semibold text-white">
          <span className="text-slate-500">&gt;_ </span>AI Generator Log
        </h2>
        <button className="text-xs text-slate-400 hover:text-slate-200">Xem thêm</button>
      </div>

      <ul className="divide-y divide-slate-800/60">
        {logs.map((log) => (
          <li key={log.id} className="flex items-start gap-3 px-5 py-3">
            <span className="mt-0.5 text-xs text-slate-600">{log.id}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-xs text-slate-300">
                prompt "{log.prompt}"
              </p>
              <p className="mt-1 text-xs text-slate-500">{log.time}</p>
            </div>
            <Badge color={STATUS_COLOR[log.status] || 'gray'}>{log.status}</Badge>
          </li>
        ))}
      </ul>
    </div>
  )
}
