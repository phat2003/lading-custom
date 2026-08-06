import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { SearchIcon, BellIcon, ChevronDownIcon, LogOutIcon } from '../../../components/icons'
import Avatar from '../../../components/common/Avatar'
import { useAuth } from '../../../context/AuthContext'

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
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const title = TITLES[pathname] || 'Dashboard'
  // Tên hiển thị lấy từ tài khoản đang đăng nhập, không hardcode.
  const displayName = user?.full_name || user?.email || 'Admin'

  // Bấm ra ngoài hoặc nhấn Escape thì đóng menu.
  useEffect(() => {
    if (!menuOpen) return undefined
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

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

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-slate-800/60"
          >
            <Avatar name={displayName} size="sm" />
            <span className="hidden max-w-[140px] truncate text-sm font-medium text-white sm:inline">
              {displayName}
            </span>
            <ChevronDownIcon
              size={16}
              className={`text-slate-500 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-800 bg-[#111725] shadow-xl">
              <div className="border-b border-slate-800 px-4 py-3">
                <p className="truncate text-sm font-medium text-white">{displayName}</p>
                <p className="truncate text-xs text-slate-500">{user?.email || ''}</p>
              </div>
              {/* Xoá token + user; AdminRoute thấy user = null sẽ tự đẩy về /login. */}
              <button
                onClick={logout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-300 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOutIcon size={16} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
