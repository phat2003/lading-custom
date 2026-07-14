import { primaryNav, secondaryNav } from '../mock'

export default function BuilderRail({ active, onSelect }) {
  return (
    <nav className="flex w-44 shrink-0 flex-col gap-1 overflow-y-auto border-r border-gray-200 bg-white p-2">
      {primaryNav.map(({ value, label, icon: IconComp }) => {
        const isActive = value === active
        return (
          <button
            key={value}
            onClick={() => onSelect?.(value)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive ? 'bg-blue-50 font-medium text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <IconComp size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
            {label}
          </button>
        )
      })}

      <div className="my-2 h-px bg-gray-100" />

      {secondaryNav.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onSelect?.(value)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          {label}
        </button>
      ))}
    </nav>
  )
}
