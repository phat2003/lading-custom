import { MenuIcon } from '../../../components/icons'

export default function ProjectMobileHeader({ onOpenMenu }) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#201f21]/95 px-4 backdrop-blur lg:hidden">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded bg-[#2563eb] text-xl font-bold text-white">
          M
        </div>
        <div>
          <p className="font-semibold leading-none">Myproject</p>
          <p className="mt-1 font-mono text-[9px] tracking-[0.16em] text-[#c3c6d7]">
            Builder Platform
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenMenu}
        className="rounded-lg border border-white/10 p-2 text-[#c3c6d7] transition hover:bg-white/5 hover:text-white"
        aria-label="Mở menu"
      >
        <MenuIcon size={22} />
      </button>
    </header>
  )
}
