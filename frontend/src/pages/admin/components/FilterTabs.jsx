// Tabs lọc dùng chung cho các trang list admin (Users, Projects, Templates...).
// tabs: [{ label, value }] hoặc mảng string.
export default function FilterTabs({ tabs = [], active, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] p-1">
      {tabs.map((t) => {
        const value = typeof t === 'string' ? t : t.value
        const label = typeof t === 'string' ? t : t.label
        const isActive = value === active
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange?.(value)}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              isActive ? 'bg-blue-600 text-[var(--bd-text)]' : 'text-[var(--bd-dim)] hover:text-[var(--bd-text)]'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
