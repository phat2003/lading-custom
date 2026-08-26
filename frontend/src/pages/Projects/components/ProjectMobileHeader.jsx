import { MenuIcon } from '../../../components/icons'
import Logo from '../../../components/common/Logo'

export default function ProjectMobileHeader({ onOpenMenu }) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--bd-border)] bg-[var(--bd-topbar)] px-4 backdrop-blur lg:hidden">
      <div className="flex items-center gap-3">
        <Logo size="sm" />
        <div>
          <p className="font-semibold leading-none">Myproject</p>
          <p className="mt-1 font-mono text-[9px] tracking-[0.16em] text-[var(--bd-dim)]">
            Builder Platform
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenMenu}
        className="rounded-lg border border-[var(--bd-border)] p-2 text-[var(--bd-dim)] transition hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]"
        aria-label="Mở menu"
      >
        <MenuIcon size={22} />
      </button>
    </header>
  )
}
