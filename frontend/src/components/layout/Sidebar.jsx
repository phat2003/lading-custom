import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Trang chủ' },
  // TODO(FE Dev 1): thêm link Projects, Editor, Settings...
]

// Sidebar trái — dùng cho layout dashboard/editor.
export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r bg-gray-50 p-4">
      <nav className="flex flex-col gap-1">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `rounded px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-blue-100 font-medium text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
