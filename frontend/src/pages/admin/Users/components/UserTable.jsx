import Avatar from '../../../../components/common/Avatar'
import Badge from '../../../../components/common/Badge'
import { EyeIcon } from '../../../../components/icons'

const PLAN_COLOR = { Pro: 'blue', Free: 'gray' }
const STATUS_COLOR = { Active: 'green', Inactive: 'red' }

// Bảng danh sách User của trang quản lý User.
export default function UserTable({ users = [], onView, selectedId }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#111725]">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-5 py-3 font-medium">Avt</th>
            <th className="px-5 py-3 font-medium">Name</th>
            <th className="px-5 py-3 font-medium">Email</th>
            <th className="px-5 py-3 font-medium">Plan</th>
            <th className="px-5 py-3 font-medium">Contact</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              className={`border-t border-slate-800/60 hover:bg-slate-800/20 ${
                selectedId === u.id ? 'bg-slate-800/40' : ''
              }`}
            >
              <td className="px-5 py-3">
                <Avatar name={u.name} size="sm" />
              </td>
              <td className="px-5 py-3">
                <div className="font-medium text-white">{u.name}</div>
                <div className="text-xs text-slate-500">Joined {u.joined}</div>
              </td>
              <td className="px-5 py-3 text-slate-400">{u.email}</td>
              <td className="px-5 py-3">
                <Badge color={PLAN_COLOR[u.plan] || 'gray'}>{u.plan}</Badge>
              </td>
              <td className="px-5 py-3 font-mono text-slate-400">{u.phone}</td>
              <td className="px-5 py-3">
                <Badge color={STATUS_COLOR[u.status] || 'gray'}>{u.status}</Badge>
              </td>
              <td className="px-5 py-3">
                <button
                  onClick={() => onView?.(u)}
                  className="inline-flex items-center gap-1 rounded-md border border-blue-500/40 px-2.5 py-1 text-xs text-blue-400 hover:bg-blue-500/10"
                >
                  <EyeIcon size={14} /> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <p className="px-5 py-6 text-center text-sm text-slate-500">
          Không tìm thấy user nào.
        </p>
      )}
    </div>
  )
}
