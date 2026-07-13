import { NavLink } from 'react-router-dom'
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
  ZapIcon,
} from '../../../components/icons'
import Avatar from '../../../components/common/Avatar'

// Menu chính của khu vực admin. Chỉ /admin (Dashboard) đã có trang,
// các mục còn lại sẽ được dựng dần.
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
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-[#0b0f17]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
          <ZapIcon size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Amazing Tech</p>
          <p className="text-xs text-slate-500">Template Studio</p>
        </div>
      </div>

      {/* Menu */}
      <div className="px-3 pb-2 pt-2">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-slate-600">
          Main Menu
        </p>
        <nav className="flex flex-col gap-1">
          {menu.map(({ to, label, icon: IconComp, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-slate-800 font-medium text-white'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <IconComp
                    size={18}
                    className={isActive ? 'text-blue-400' : 'text-slate-500'}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom: help + user */}
      <div className="mt-auto border-t border-slate-800 px-3 py-4">
        <button className="mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800/50 hover:text-slate-200">
          <HelpCircleIcon size={18} className="text-slate-500" />
          Help &amp; Docs
        </button>
        <div className="flex items-center gap-3 px-2">
          <Avatar name="Jane Doe" size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">Jane Doe</p>
            <p className="truncate text-xs text-slate-500">jane@amazingtech.io</p>
          </div>
          <button className="text-slate-500 hover:text-slate-300" title="Đăng xuất">
            <LogOutIcon size={18} />
          </button>
        </div>
      </div>
    </aside>
  )
}
