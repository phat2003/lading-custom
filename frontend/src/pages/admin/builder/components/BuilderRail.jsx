import { PlusIcon, LayersIcon } from '../../../../components/icons'

const ITEMS = [
  { key: 'add', icon: PlusIcon, label: 'Thêm' },
  { key: 'layers', icon: LayersIcon, label: 'Lớp' },
]

const BuilderRail = ({ activePanel, onToggle }) => (
  <nav className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-white/10 bg-[#161618] py-3">
    {ITEMS.map(({ key, icon: IconComp, label }) => (
      <button
        key={key}
        onClick={() => onToggle(key)}
        className={`flex w-full flex-col items-center gap-1 py-2 text-[10px] ${
          activePanel === key ? 'text-yellow-400' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <IconComp size={18} />
        {label}
      </button>
    ))}
  </nav>
)

export default BuilderRail
