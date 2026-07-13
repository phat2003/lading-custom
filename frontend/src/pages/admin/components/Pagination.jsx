// Phân trang dùng chung. Hiện là UI tĩnh (mock) — onChange đổi trang active.
export default function Pagination({ page = 1, totalPages = 1, onChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  const arrowClass =
    'flex h-8 w-8 items-center justify-center rounded-md border border-slate-800 text-slate-400 hover:bg-slate-800 disabled:opacity-40'

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className={arrowClass}
        disabled={page <= 1}
        onClick={() => onChange?.(Math.max(1, page - 1))}
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange?.(p)}
          className={`h-8 w-8 rounded-md text-sm ${
            p === page
              ? 'bg-blue-600 text-white'
              : 'border border-slate-800 text-slate-400 hover:bg-slate-800'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        className={arrowClass}
        disabled={page >= totalPages}
        onClick={() => onChange?.(Math.min(totalPages, page + 1))}
      >
        ›
      </button>
    </div>
  )
}
