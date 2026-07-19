import { PlusIcon, LayersIcon } from '../../../../components/icons'

const ITEMS = [
  { key: 'add', icon: PlusIcon, label: 'Thêm' },
  { key: 'layers', icon: LayersIcon, label: 'Lớp' },
]

const BuilderRail = ({ activePanel, onToggle }) => (
  <nav className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-white/10 bg-[#161618] py-3">
    {ITEMS.map(({ key, icon: IconComp, label }) => {
      const active = activePanel === key
      return (
        <button
          key={key}
          onClick={() => onToggle(key)}
          className={`relative flex w-full flex-col items-center gap-1 py-2.5 text-[10px] transition-colors ${
            active ? 'text-yellow-400' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {active && <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-yellow-400" />}
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              active ? 'bg-yellow-400/15' : 'hover:bg-white/5'
            }`}
          >
            <IconComp size={18} />
          </span>
          {label}
        </button>
      )
    })}
  </nav>
)

export default BuilderRail
