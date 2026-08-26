import { NavLink } from 'react-router-dom'
import Logo from '../../../components/common/Logo'
import {
  LayoutDashboardIcon,
  UserIcon,
  LayoutTemplateIcon,
  LayersIcon,
  FolderIcon,
  CreditCardIcon,
  SparklesIcon,
  SettingsIcon,
  HelpCircleIcon,
  LogOutIcon,
} from '../../../components/icons'
import Avatar from '../../../components/common/Avatar'
import { useAuth } from '../../../context/AuthContext'

const menu = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboardIcon, end: true },
  { to: '/admin/users', label: 'User', icon: UserIcon },
  { to: '/admin/templates', label: 'Templates', icon: LayoutTemplateIcon },
  { to: '/admin/sections', label: 'Section', icon: LayersIcon },
  { to: '/admin/projects', label: 'Projects', icon: FolderIcon },
  { to: '/admin/pricing', label: 'Pricing Plans', icon: CreditCardIcon },
  { to: '/admin/ai', label: 'AI Generator', icon: SparklesIcon },
  { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
]

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  // Tên hiển thị lấy từ tài khoản đang đăng nhập, không hardcode.
  const displayName = user?.full_name || user?.email || 'Admin'

  return (
    <aside className="relative z-10 flex h-screen w-64 shrink-0 flex-col border-r border-[var(--bd-border)] bg-[var(--bd-topbar)] backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <Logo />
        <div>
          <p className="text-sm font-bold text-[var(--bd-text)]">Amazing Tech</p>
          <p className="text-xs text-[var(--bd-muted)]">Template Studio</p>
        </div>
      </div>

      {/* Menu */}
      <div className="px-3 pb-2 pt-2">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--bd-muted)]">
          Main Menu
        </p>
        <nav className="flex flex-col gap-1">
          {menu.map(({ to, label, icon: IconComp, end }, i) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={{ animationDelay: `${i * 30}ms` }}
              className={({ isActive }) =>
                `group relative flex animate-fade-in-up items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-500/20 to-cyan-400/10 font-medium text-[var(--bd-accent)] ring-1 ring-inset ring-violet-400/25'
                    : 'text-[var(--bd-dim)] hover:translate-x-0.5 hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Thanh chỉ báo gradient ở mép trái khi đang ở trang này */}
                  <span
                    className={`absolute -left-3 top-1/2 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-violet-400 to-cyan-400 transition-all duration-300 ${
                      isActive ? 'h-6 opacity-100' : 'h-0 opacity-0'
                    }`}
                  />
                  <IconComp size={18} className={isActive ? '' : 'opacity-70'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Đáy: trợ giúp + tài khoản */}
      <div className="mt-auto border-t border-[var(--bd-border)] px-3 py-4">
        <button className="mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--bd-dim)] transition-all duration-200 hover:translate-x-0.5 hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]">
          <HelpCircleIcon size={18} className="opacity-70" />
          Help &amp; Docs
        </button>
        <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
          <Avatar name={displayName} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--bd-text)]">{displayName}</p>
            <p className="truncate text-xs text-[var(--bd-muted)]">{user?.email || ''}</p>
          </div>
          {/* Xoá token + user; AdminRoute thấy user = null sẽ tự đẩy về /login. */}
          <button
            onClick={logout}
            className="rounded-lg p-1.5 text-[var(--bd-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
            title="Đăng xuất"
          >
            <LogOutIcon size={18} />
          </button>
        </div>
      </div>
    </aside>
  )
}
