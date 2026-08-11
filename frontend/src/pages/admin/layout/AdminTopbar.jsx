import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  SearchIcon,
  BellIcon,
  ChevronDownIcon,
  LogOutIcon,
  SunIcon,
  MoonIcon,
  HomeIcon,
} from '../../../components/icons'
import Avatar from '../../../components/common/Avatar'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'

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
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const isDark = theme === 'dark'
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
    <header className="relative flex shrink-0 items-center justify-between border-b border-[var(--bd-border)] bg-[var(--bd-topbar)] px-6 py-3 backdrop-blur-xl">
      {/* Vệt sáng mảnh ở mép dưới, đồng bộ với topbar của builder */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[var(--bd-muted)]">Admin</span>
        <span className="text-[var(--bd-muted)]">›</span>
        <span className="font-medium text-[var(--bd-text)]">{title}</span>
      </div>

      {/* Search */}
      <div className="relative hidden w-full max-w-md md:block">
        <SearchIcon
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bd-muted)]"
        />
        <input
          type="text"
          placeholder="Search sections, styles..."
          className="ad-input py-2 pl-9 pr-12"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-[var(--bd-border)] px-1.5 py-0.5 text-xs text-[var(--bd-muted)]">
          ⌘K
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Đổi giao diện sáng/tối — dùng chung với Template Builder */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] text-[var(--bd-dim)] transition-all duration-200 hover:border-violet-400/40 hover:text-violet-400"
        >
          <span className={`absolute transition-all duration-300 ${isDark ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'}`}>
            <MoonIcon size={17} />
          </span>
          <span className={`absolute transition-all duration-300 ${isDark ? '-rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}>
            <SunIcon size={17} />
          </span>
        </button>

        {/* Xem trang chủ công khai — mở tab mới để không mất chỗ đang làm trong admin */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title="Xem trang chủ (mở tab mới)"
          className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] text-[var(--bd-dim)] transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-400/40 hover:text-violet-400"
        >
          <HomeIcon size={17} />
        </a>

        <button className="relative rounded-lg p-1.5 text-[var(--bd-dim)] transition-colors hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]" title="Thông báo">
          <BellIcon size={20} />
          <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-[var(--bd-fill-hover)]"
          >
            <Avatar name={displayName} size="sm" />
            <span className="hidden max-w-[140px] truncate text-sm font-medium text-[var(--bd-text)] sm:inline">
              {displayName}
            </span>
            <ChevronDownIcon
              size={16}
              className={`text-[var(--bd-muted)] transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 animate-pop-in overflow-hidden rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] shadow-2xl">
              <div className="border-b border-[var(--bd-border)] px-4 py-3">
                <p className="truncate text-sm font-medium text-[var(--bd-text)]">{displayName}</p>
                <p className="truncate text-xs text-[var(--bd-muted)]">{user?.email || ''}</p>
              </div>
              {/* Xoá token + user; AdminRoute thấy user = null sẽ tự đẩy về /login. */}
              <button
                onClick={logout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-[var(--bd-dim)] transition-colors hover:bg-red-500/10 hover:text-red-400"
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
