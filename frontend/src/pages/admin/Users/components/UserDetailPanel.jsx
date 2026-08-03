import Avatar from '../../../../components/common/Avatar'
import Badge from '../../../../components/common/Badge'
import { XIcon, MailIcon, PhoneIcon, CalendarIcon } from '../../../../components/icons'

const PLAN_COLOR = { Pro: 'blue', Free: 'gray' }
const STATUS_COLOR = { Active: 'green', Inactive: 'red' }

const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('vi-VN')
}

// Panel chi tiết user hiển thị bên phải khi bấm "View".
//   user   — dữ liệu đã có sẵn từ bảng, hiện ngay không phải chờ
//   detail — dữ liệu từ GET /admin/users/:id (project_count, subscription), về sau
//   pending — đang có request cập nhật chạy -> khoá nút để tránh bấm 2 lần
const UserDetailPanel = ({
  user,
  detail,
  loading,
  pending,
  onClose,
  onChangePlan,
  onToggleActive,
  onDelete,
}) => {
  if (!user) return null

  const isPro = user.planType === 'pro'
  const subscription = detail?.subscription

  return (
    <aside className="w-80 shrink-0 self-start rounded-xl border border-slate-800 bg-[#111725]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <h2 className="text-sm font-semibold text-white">User Detail</h2>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300"
          title="Đóng"
        >
          <XIcon size={18} />
        </button>
      </div>

      {/* Avatar + badges */}
      <div className="px-5 py-5">
        <div className="flex flex-col items-center text-center">
          <Avatar name={user.name} size="xl" />
          <p className="mt-3 text-lg font-semibold text-white">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge color={STATUS_COLOR[user.status] || 'gray'}>{user.status}</Badge>
            <Badge color={PLAN_COLOR[user.plan] || 'gray'}>{user.plan}</Badge>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex items-center gap-3 text-slate-400">
            <MailIcon size={16} className="text-slate-500" />
            {user.email}
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <PhoneIcon size={16} className="text-slate-500" />
            {user.phone}
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <CalendarIcon size={16} className="text-slate-500" />
            Joined {user.joined}
          </div>
        </div>

        {/* Số dự án — chỉ có ở API chi tiết nên chờ nạp xong mới hiện */}
        <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/30 px-3 py-2 text-sm">
          <span className="text-slate-500">Số dự án</span>
          <span className="font-semibold text-white">
            {loading ? '...' : (detail?.project_count ?? 0)}
          </span>
        </div>
      </div>

      {/* Subscription */}
      <div className="border-t border-slate-800 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Subscription Plan
        </p>
        <p className="mt-1 font-semibold text-white">{user.plan} Plan</p>
        {subscription && (
          <p className="mt-0.5 text-xs text-slate-500">
            {subscription.status}
            {subscription.expired_at && ` · hết hạn ${formatDate(subscription.expired_at)}`}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => onChangePlan?.('free')}
            disabled={pending || !isPro}
            className="flex-1 rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-40"
          >
            Cancel Plan
          </button>
          <button
            onClick={() => onChangePlan?.('pro')}
            disabled={pending || isPro}
            className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-40"
          >
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Thao tác tài khoản */}
      <div className="space-y-2 border-t border-slate-800 px-5 py-4">
        <button
          onClick={onToggleActive}
          disabled={pending}
          className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-40"
        >
          {user.isActive ? 'Khoá tài khoản' : 'Mở khoá tài khoản'}
        </button>
        <button
          onClick={onDelete}
          disabled={pending}
          className="w-full rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-40"
        >
          Xoá tài khoản
        </button>
        <p className="text-xs text-slate-600">
          Khoá tài khoản chỉ chặn đăng nhập, dữ liệu vẫn giữ nguyên. Xoá là vĩnh viễn.
        </p>
      </div>
    </aside>
  )
}

export default UserDetailPanel
