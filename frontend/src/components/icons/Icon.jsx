// Base SVG wrapper cho toàn bộ icon trong dự án.
// - size: kích thước px (mặc định 24)
// - dùng currentColor -> đổi màu bằng class text-* của Tailwind
// - các icon con chỉ cần truyền path/shape vào children.
export default function Icon({
  size = 24,
  strokeWidth = 2,
  className = '',
  children,
  ...props
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}
