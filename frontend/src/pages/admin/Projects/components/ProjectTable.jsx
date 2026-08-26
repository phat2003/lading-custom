import Avatar from '../../../../components/common/Avatar'
import Badge from '../../../../components/common/Badge'
import { EyeIcon, TrashIcon } from '../../../../components/icons'

const STATUS = {
  published: { label: 'Đã xuất bản', color: 'green' },
  draft: { label: 'Bản nháp', color: 'amber' },
}

export default function ProjectTable({ projects = [], onView, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-[var(--bd-muted)]">
            <th className="px-5 py-3 font-medium">Tên dự án</th>
            <th className="px-5 py-3 font-medium">Người sở hữu</th>
            <th className="px-5 py-3 font-medium">Template sử dụng</th>
            <th className="px-5 py-3 font-medium">Email liên hệ</th>
            <th className="px-5 py-3 font-medium">Trạng thái</th>
            <th className="px-5 py-3 font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => {
            const status = STATUS[p.status] || { label: p.status, color: 'gray' }
            return (
              <tr key={p.id} className="border-t border-[var(--bd-border)] hover:bg-[var(--bd-fill-hover)]">
                <td className="px-5 py-3">
                  <div className="font-medium text-[var(--bd-text)]">{p.name}</div>
                  <div className="font-mono text-xs text-[var(--bd-muted)]">ID: {p.id}</div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={p.owner} size="sm" />
                    <span className="text-[var(--bd-dim)]">{p.owner}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <Badge color="gray">{p.template}</Badge>
                </td>
                <td className="px-5 py-3 text-[var(--bd-dim)]">{p.email}</td>
                <td className="px-5 py-3">
                  <Badge color={status.color}>{status.label}</Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onView?.(p)}
                      className="inline-flex items-center gap-1 rounded-md border border-violet-400/40 px-2.5 py-1 text-xs text-[var(--bd-accent)] transition-colors hover:bg-violet-500/10"
                    >
                      <EyeIcon size={14} /> Chi tiết
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete?.(p)}
                      title="Xóa dự án"
                      className="rounded-md border border-red-500/40 p-1.5 text-[var(--bd-danger)] transition-colors hover:bg-red-500/10"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {projects.length === 0 && (
        <p className="px-5 py-6 text-center text-sm text-[var(--bd-muted)]">Không có dự án nào.</p>
      )}
    </div>
  )
}
