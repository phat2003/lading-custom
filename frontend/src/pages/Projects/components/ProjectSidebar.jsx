import { useEffect, useRef, useState } from 'react'
import Logo from '../../../components/common/Logo'
import { NavLink, useNavigate } from 'react-router-dom'
import UpgradeRequiredDialog from '../../../components/pricing/UpgradeRequiredDialog'
import {
  ChevronDownIcon,
  FolderIcon,
  GlobeIcon,
  LayoutTemplateIcon,
  LogOutIcon,
  PlusIcon,
  SettingsIcon,
  SparklesIcon,
  SunIcon,
  MoonIcon,
  XIcon,
} from '../../../components/icons'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import { isProPlan } from '../../../utils/planEntitlements'

function NavigationItem({ to, icon, label, disabled = false, onClick }) {
  const IconComponent = icon

  if (disabled) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-mono text-xs tracking-wide text-[var(--bd-dim)] transition hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]"
      >
        <IconComponent size={20} />
        {label}
      </button>
    )
  }

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-r-lg border-l-4 px-4 py-3 font-mono text-xs tracking-wide transition ${
          isActive
            ? 'border-violet-300 bg-violet-500/20 text-[var(--bd-accent)]'
            : 'border-transparent text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]'
        }`
      }
    >
      <IconComponent size={20} />
      {label}
    </NavLink>
  )
}

export default function ProjectSidebar({
  user,
  isOpen,
  onClose,
  onCreateProject,
}) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const displayName = user?.full_name || user?.email || 'Design Pro'
  const pro = isProPlan(user)
  const planLabel = pro ? 'Pro Plan' : 'Free Plan'
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const accountTriggerRef = useRef(null)
  const accountMenuPanelRef = useRef(null)

  useEffect(() => {
    if (!isAccountMenuOpen) return undefined

    const handlePointerDown = (event) => {
      const clickedTrigger = accountTriggerRef.current?.contains(event.target)
      const clickedMenu = accountMenuPanelRef.current?.contains(event.target)
      if (!clickedTrigger && !clickedMenu) {
        setIsAccountMenuOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return
      setIsAccountMenuOpen(false)
      accountTriggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isAccountMenuOpen])

  const openUpgrade = () => {
    setUpgradeOpen(true)
    onClose()
  }

  const openSettings = () => {
    setIsAccountMenuOpen(false)
    onClose()
    navigate('/settings')
  }

  const handleLogout = () => {
    setIsAccountMenuOpen(false)
    onClose()
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-label="Đóng menu"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-[var(--bd-border)] bg-[var(--bd-topbar)] py-6 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)] lg:hidden"
          aria-label="Đóng menu"
        >
          <XIcon size={20} />
        </button>

        <div className="mb-8 flex items-center gap-3 px-6">
          <Logo />
          <div>
            <h1 className="text-lg font-bold leading-none text-[var(--bd-text)]">Myproject</h1>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--bd-dim)]">
              Builder Platform
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4" aria-label="Điều hướng chính">
          <NavigationItem to="/home" icon={GlobeIcon} label="Trang chủ" onClick={onClose} />
          <NavigationItem to="/projects" icon={FolderIcon} label="Dự án" onClick={onClose} />
          <NavigationItem
            to="/templates"
            icon={LayoutTemplateIcon}
            label="Template"
            onClick={onClose}
          />
          <NavigationItem
            to="/settings"
            icon={SettingsIcon}
            label="Cài đặt"
            onClick={onClose}
          />
        </nav>

        <div className="mt-auto space-y-3 px-4">
          <button
            type="button"
            onClick={onCreateProject}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] px-4 py-3 font-mono text-xs text-[var(--bd-text)] transition hover:border-[var(--bd-border)] hover:bg-[var(--bd-fill-hover)]"
          >
            <PlusIcon size={18} />
            Dự án mới
          </button>

          {pro ? (
            /* Đang là Pro: huy hiệu trạng thái, không phải nút bấm.
               Chữ dùng --bd-text nên đọc được trên cả nền sáng lẫn tối. */
            <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-400/40 bg-gradient-to-r from-cyan-400/15 to-violet-500/15 px-4 py-3 font-mono text-xs font-semibold text-[var(--bd-text)]">
              <SparklesIcon size={15} className="text-[var(--bd-info)]" />
              Pro Plan
            </div>
          ) : (
            /* Nút nâng cấp: nền vàng đặc + chữ đậm — vàng nhạt trên nền trắng
               là chìm hẳn, nên không dùng kiểu viền mờ.
               Vàng ở đây chỉ dành riêng cho "premium"; hành động chính trong
               khu này dùng gradient tím→cyan để hai loại không lẫn nhau. */
            <button
              type="button"
              onClick={openUpgrade}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-amber-400 to-yellow-300 px-4 py-3 font-mono text-xs font-bold text-slate-950 shadow-[0_8px_24px_-12px_rgba(250,204,21,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-10px_rgba(250,204,21,1)] active:translate-y-0"
            >
              {/* Vệt sáng quét ngang khi rê chuột, gợi cảm giác "cao cấp" */}
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <SparklesIcon size={15} />
              Nâng cấp Pro
            </button>
          )}

          <div className="relative flex items-center gap-1 border-t border-[var(--bd-border)] px-2 pt-4">
            <button
              ref={accountTriggerRef}
              type="button"
              onClick={() => setIsAccountMenuOpen((open) => !open)}
              className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg p-1.5 text-left transition hover:bg-[var(--bd-fill-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70"
              aria-haspopup="menu"
              aria-expanded={isAccountMenuOpen}
              aria-controls="user-account-menu"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--bd-border)] bg-[var(--bd-fill)] text-xs font-bold text-[var(--bd-accent)]">
                  {displayName.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm text-[var(--bd-text)]">{displayName}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] text-[var(--bd-dim)]">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    {planLabel}
                  </span>
                </span>
              </span>
              <ChevronDownIcon
                size={16}
                className={`shrink-0 text-[var(--bd-dim)] transition-transform duration-200 ${
                  isAccountMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isAccountMenuOpen && (
              <div
                ref={accountMenuPanelRef}
                id="user-account-menu"
                role="menu"
                aria-label="Tài khoản"
                className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] shadow-2xl shadow-black/35"
              >
                <div className="border-b border-[var(--bd-border)] px-4 py-3">
                  <p className="truncate text-sm font-semibold text-[var(--bd-text)]">{displayName}</p>
                  {user?.email && (
                    <p className="mt-1 truncate text-xs text-[var(--bd-dim)]">{user.email}</p>
                  )}
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--bd-accent)]">
                    {planLabel}
                  </p>
                </div>
                <div className="p-1.5">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={openSettings}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[var(--bd-text)] transition hover:bg-[var(--bd-fill-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-400/70"
                  >
                    <SettingsIcon size={17} />
                    Tài khoản &amp; cài đặt
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-400/70"
                  >
                    <LogOutIcon size={17} />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}

            <div className="flex shrink-0 items-center">
              {/* Đổi giao diện sáng/tối — dùng chung ThemeContext với khu Admin */}
              <button
                type="button"
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
            </div>
          </div>
        </div>
      </aside>
      <UpgradeRequiredDialog
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        reason="Gói Free đang hoạt động. Xem quyền lợi Pro và trạng thái nâng cấp hiện tại."
        currentPlan={user}
      />
    </>
  )
}
