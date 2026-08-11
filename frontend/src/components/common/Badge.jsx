
const COLORS = {
  green: 'bg-green-500/15 text-green-400',
  blue: 'bg-blue-500/15 text-blue-400',
  purple: 'bg-purple-500/15 text-purple-400',
  amber: 'bg-amber-500/15 text-amber-400',
  red: 'bg-red-500/15 text-red-400',
  teal: 'bg-teal-500/15 text-teal-400',
  // Theo theme để đọc được ở cả chế độ sáng lẫn tối
  gray: 'bg-[var(--bd-fill-hover)] text-[var(--bd-dim)]',
  violet: 'bg-violet-500/15 text-violet-400',
}

export default function Badge({ color = 'gray', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
        COLORS[color] || COLORS.gray
      } ${className}`}
    >
      {children}
    </span>
  )
}
