// Spinner loading — dùng inline hoặc full-screen.
export default function Spinner({ size = 'md', fullScreen = false, className = '' }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  }

  const spinner = (
    <div
      className={`animate-spin rounded-full border-blue-600 border-t-transparent ${sizes[size] || sizes.md} ${className}`}
      role="status"
      aria-label="Đang tải"
    />
  )

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}
