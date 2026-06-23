// Nút dùng chung — FE Dev 1 mở rộng variant/size sau.
export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
  ...props
}) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
    ghost: 'bg-transparent text-blue-600 hover:underline disabled:opacity-50',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={`px-4 py-2 rounded transition-colors ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
