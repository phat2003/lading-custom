import { useLocation } from 'react-router-dom'
import { SearchIcon, BellIcon, ChevronDownIcon } from '../../../components/icons'
import Avatar from '../../../components/common/Avatar'

// Nhãn breadcrumb theo path hiện tại.
const TITLES = {
  '/admin': 'Dashboard',
  '/admin/users': 'Users',
  '/admin/templates': 'Templates',
  '/admin/sections': 'Section',
  '/admin/projects': 'Projects',
  '/admin/pricing': 'Pricing Plans',
  '/admin/ai': 'AI Generator',
  '/admin/settings': 'Settings',
}

export default function AdminTopbar() {
  const { pathname } = useLocation()
  const title = TITLES[pathname] || 'Dashboard'

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-[#0b0f17] px-6 py-3">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-500">Admin</span>
        <span className="text-slate-600">›</span>
        <span className="font-medium text-white">{title}</span>
      </div>

      {/* Search */}
      <div className="relative hidden w-full max-w-md md:block">
        <SearchIcon
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="text"
          placeholder="Search sections, styles..."
          className="w-full rounded-lg border border-slate-800 bg-slate-900/60 py-2 pl-9 pr-12 text-sm text-slate-200 placeholder-slate-500 focus:border-slate-600 focus:outline-none"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-700 px-1.5 py-0.5 text-xs text-slate-500">
          ⌘K
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <button className="relative text-slate-400 hover:text-slate-200" title="Thông báo">
          <BellIcon size={20} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-blue-500" />
        </button>
        <div className="flex items-center gap-2">
          <Avatar name="Jane Doe" size="sm" />
          <span className="hidden text-sm font-medium text-white sm:inline">Jane Doe</span>
          <ChevronDownIcon size={16} className="text-slate-500" />
        </div>
      </div>
    </header>
  )
}
