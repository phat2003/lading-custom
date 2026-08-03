import { PlusIcon, LayersIcon } from '../../../../components/icons'

const ITEMS = [
  { key: 'add', icon: PlusIcon, label: 'Thêm' },
  { key: 'layers', icon: LayersIcon, label: 'Lớp' },
]

const BuilderRail = ({ activePanel, onToggle }) => (
  <nav className="flex w-[72px] shrink-0 flex-col items-center gap-2 border-r border-[var(--bd-border)] bg-[var(--bd-topbar)] py-4 backdrop-blur-xl">
    {ITEMS.map(({ key, icon: IconComp, label }, i) => {
      const active = activePanel === key
      return (
        <button
          key={key}
          onClick={() => onToggle(key)}
          style={{ animationDelay: `${i * 60}ms` }}
          className={`group relative flex w-full animate-fade-in-up flex-col items-center gap-1.5 py-1 text-[10px] font-medium transition-colors duration-200 ${
            active ? 'text-[var(--bd-accent)]' : 'text-[var(--bd-muted)] hover:text-[var(--bd-text)]'
          }`}
        >
          {/* Thanh chỉ báo gradient ở mép trái khi đang mở */}
          <span
            className={`absolute left-0 top-1/2 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-violet-400 to-cyan-400 transition-all duration-300 ${
              active ? 'h-8 opacity-100' : 'h-0 opacity-0'
            }`}
          />
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 ${
              active
                ? 'bg-gradient-to-br from-violet-500/25 to-cyan-400/15 shadow-[0_0_20px_-6px_rgba(139,92,246,.9)] ring-1 ring-inset ring-violet-400/30'
                : 'bg-[var(--bd-fill)] group-hover:-translate-y-0.5 group-hover:bg-[var(--bd-fill-hover)] group-hover:shadow-lg'
            }`}
          >
            <IconComp size={19} />
          </span>
          {label}
        </button>
      )
    })}
  </nav>
)

export default BuilderRail
