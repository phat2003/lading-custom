import { SearchIcon } from '../../../components/icons'

// Ô tìm kiếm dùng chung cho các trang list admin.
export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}) {
  return (
    <div className={`relative ${className}`}>
      <SearchIcon
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bd-muted)]"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] py-2 pl-9 pr-3 text-sm text-[var(--bd-text)] placeholder:text-[var(--bd-muted)] focus:border-[var(--bd-border)] focus:outline-none"
      />
    </div>
  )
}
