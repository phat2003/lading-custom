import Avatar from '../../../../components/common/Avatar'
import Badge from '../../../../components/common/Badge'
import { EyeIcon } from '../../../../components/icons'

const PLAN_COLOR = { Pro: 'blue', Free: 'gray' }
const STATUS_COLOR = { Active: 'green', Inactive: 'red' }

// Bảng "Recent Users" trên Dashboard.
export default function RecentUsersTable({ users = [] }) {
  return (
    <div className="rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--bd-border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[var(--bd-text)]">Recent Users</h2>
          <Badge color="blue">5 mới nhất</Badge>
        </div>
        <button className="text-xs text-[var(--bd-dim)] hover:text-[var(--bd-text)]">Xem tất cả</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-[var(--bd-muted)]">
              <th className="px-5 py-3 font-medium">Avt</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Plan</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-[var(--bd-border)]">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} size="sm" />
                    <span className="font-medium text-[var(--bd-text)]">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-[var(--bd-dim)]">{u.email}</td>
                <td className="px-5 py-3">
                  <Badge color={PLAN_COLOR[u.plan] || 'gray'}>{u.plan}</Badge>
                </td>
                <td className="px-5 py-3">
                  <Badge color={STATUS_COLOR[u.status] || 'gray'}>{u.status}</Badge>
                </td>
                <td className="px-5 py-3">
                  <button className="inline-flex items-center gap-1 rounded-md border border-[var(--bd-border)] px-2.5 py-1 text-xs text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)]">
                    <EyeIcon size={14} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
