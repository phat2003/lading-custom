import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import UpgradeRequiredDialog from '../../../components/pricing/UpgradeRequiredDialog'
import {
  ChevronDownIcon,
  FolderIcon,
  GlobeIcon,
  LayoutTemplateIcon,
  PlusIcon,
  SettingsIcon,
  XIcon,
} from '../../../components/icons'
import { isProPlan } from '../../../utils/planEntitlements'

function NavigationItem({ to, icon, label, disabled = false, onClick }) {
  const IconComponent = icon

  if (disabled) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-mono text-xs tracking-wide text-[#c3c6d7] transition hover:bg-white/5 hover:text-white"
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
            ? 'border-[#b4c5ff] bg-[#2563eb]/20 text-[#b4c5ff]'
            : 'border-transparent text-[#c3c6d7] hover:bg-white/5 hover:text-white'
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
  onShowMessage,
}) {
  const displayName = user?.full_name || user?.email || 'Design Pro'
  const pro = isProPlan(user)
  const planLabel = pro ? 'Pro Plan' : 'Free Plan'
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const openUpgrade = () => {
    setUpgradeOpen(true)
    onClose()
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
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/5 bg-[#201f21] py-6 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-[#c3c6d7] hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Đóng menu"
        >
          <XIcon size={20} />
        </button>

        <div className="mb-8 flex items-center gap-3 px-6">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#2563eb] shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <span className="grid grid-cols-2 gap-1" aria-hidden="true">
              <span className="h-2 w-2 rounded-[2px] border-2 border-white" />
              <span className="h-2 w-2 rounded-[2px] border-2 border-white" />
              <span className="h-2 w-2 rounded-[2px] border-2 border-white" />
              <span className="h-2 w-2 rounded-[2px] border-2 border-white" />
            </span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none text-white">Myproject</h1>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#c3c6d7]">
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
            icon={SettingsIcon}
            label="Cài đặt"
            disabled
            onClick={() => onShowMessage('Trang Cài đặt chưa nằm trong task hiện tại.')}
          />
        </nav>

        <div className="mt-auto space-y-3 px-4">
          <button
            type="button"
            onClick={onCreateProject}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#353437] px-4 py-3 font-mono text-xs text-white transition hover:border-white/20 hover:bg-[#39393b]"
          >
            <PlusIcon size={18} />
            Dự án mới
          </button>

          {pro ? (
            <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#00eefc]/20 bg-[#00eefc]/5 px-4 py-3 font-mono text-xs text-[#d3fbff]">
              <span aria-hidden="true">✦</span>
              Pro Plan
            </div>
          ) : (
            <button
              type="button"
              onClick={openUpgrade}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#eec200]/25 bg-[#eec200]/5 px-4 py-3 font-mono text-xs text-[#ffe083] transition hover:bg-[#eec200]/10"
            >
              <span aria-hidden="true">✦</span>
              Nâng cấp Pro
            </button>
          )}

          <div className="flex items-center justify-between border-t border-white/10 px-2 pt-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-[#131315] text-xs font-bold text-[#b4c5ff]">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm text-white">{displayName}</p>
                <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] text-[#c3c6d7]">
                  <span className="h-2 w-2 rounded-full bg-[#00eefc]" />
                  {planLabel}
                </p>
              </div>
            </div>
            <ChevronDownIcon size={16} className="text-[#c3c6d7]" />
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
