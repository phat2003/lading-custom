import Avatar from '../../../../components/common/Avatar'
import Badge from '../../../../components/common/Badge'
import { EyeIcon } from '../../../../components/icons'

const PLAN_COLOR = { Pro: 'blue', Free: 'gray', Subscriber: 'purple' }
const STATUS_COLOR = { Active: 'green', Inactive: 'red' }

// Bảng "Recent Users" trên Dashboard.
export default function RecentUsersTable({ users = [] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#111725]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white">Recent Users</h2>
          <Badge color="blue">5 mới nhất</Badge>
        </div>
        <button className="text-xs text-slate-400 hover:text-slate-200">Xem tất cả</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-medium">Avt</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Plan</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-800/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} size="sm" />
                    <span className="font-medium text-white">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-400">{u.email}</td>
                <td className="px-5 py-3">
                  <Badge color={PLAN_COLOR[u.plan] || 'gray'}>{u.plan}</Badge>
                </td>
                <td className="px-5 py-3">
                  <Badge color={STATUS_COLOR[u.status] || 'gray'}>{u.status}</Badge>
                </td>
                <td className="px-5 py-3">
                  <button className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800">
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
