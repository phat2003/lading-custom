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
    <aside className="w-80 shrink-0 self-start rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--bd-border)] px-5 py-4">
        <h2 className="text-sm font-semibold text-[var(--bd-text)]">User Detail</h2>
        <button
          onClick={onClose}
          className="text-[var(--bd-muted)] hover:text-[var(--bd-dim)]"
          title="Đóng"
        >
          <XIcon size={18} />
        </button>
      </div>

      {/* Avatar + badges */}
      <div className="px-5 py-5">
        <div className="flex flex-col items-center text-center">
          <Avatar name={user.name} size="xl" />
          <p className="mt-3 text-lg font-semibold text-[var(--bd-text)]">{user.name}</p>
          <p className="text-xs text-[var(--bd-muted)]">{user.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge color={STATUS_COLOR[user.status] || 'gray'}>{user.status}</Badge>
            <Badge color={PLAN_COLOR[user.plan] || 'gray'}>{user.plan}</Badge>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex items-center gap-3 text-[var(--bd-dim)]">
            <MailIcon size={16} className="text-[var(--bd-muted)]" />
            {user.email}
          </div>
          <div className="flex items-center gap-3 text-[var(--bd-dim)]">
            <PhoneIcon size={16} className="text-[var(--bd-muted)]" />
            {user.phone}
          </div>
          <div className="flex items-center gap-3 text-[var(--bd-dim)]">
            <CalendarIcon size={16} className="text-[var(--bd-muted)]" />
            Joined {user.joined}
          </div>
        </div>

        {/* Số dự án — chỉ có ở API chi tiết nên chờ nạp xong mới hiện */}
        <div className="mt-4 flex items-center justify-between rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] px-3 py-2 text-sm">
          <span className="text-[var(--bd-muted)]">Số dự án</span>
          <span className="font-semibold text-[var(--bd-text)]">
            {loading ? '...' : (detail?.project_count ?? 0)}
          </span>
        </div>
      </div>

      {/* Subscription */}
      <div className="border-t border-[var(--bd-border)] px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--bd-muted)]">
          Subscription Plan
        </p>
        <p className="mt-1 font-semibold text-[var(--bd-text)]">{user.plan} Plan</p>
        {subscription && (
          <p className="mt-0.5 text-xs text-[var(--bd-muted)]">
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
            className="flex-1 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-3 py-2 text-sm font-medium text-white shadow-[0_0_20px_-6px_rgba(139,92,246,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_26px_-2px_rgba(139,92,246,1)] disabled:opacity-40"
          >
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Thao tác tài khoản */}
      <div className="space-y-2 border-t border-[var(--bd-border)] px-5 py-4">
        <button
          onClick={onToggleActive}
          disabled={pending}
          className="w-full rounded-lg border border-[var(--bd-border)] px-3 py-2 text-sm text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)] disabled:opacity-40"
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
        <p className="text-xs text-[var(--bd-muted)]">
          Khoá tài khoản chỉ chặn đăng nhập, dữ liệu vẫn giữ nguyên. Xoá là vĩnh viễn.
        </p>
      </div>
    </aside>
  )
}

export default UserDetailPanel
