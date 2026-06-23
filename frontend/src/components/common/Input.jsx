// Input dùng chung — hỗ trợ label, error, forward props.
export default function Input({
  label,
  error,
  className = '',
  id,
  ...props
}) {
  const inputId = id || props.name

  return (
    <label className="block mb-3">
      {label && (
        <span className="text-sm text-gray-700">{label}</span>
      )}
      <input
        id={inputId}
        className={`mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="mt-1 block text-sm text-red-600">{error}</span>
      )}
    </label>
  )
}
