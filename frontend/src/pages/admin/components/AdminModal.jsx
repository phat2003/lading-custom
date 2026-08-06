import { useEffect } from 'react'
import { XIcon } from '../../../components/icons'

// Modal shell dark theme dùng chung cho khu admin (form, confirm...).
// Đóng bằng ✕, click nền, hoặc phím Escape.
export default function AdminModal({ open, onClose, title, children, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full ${maxWidth} animate-pop-in rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] shadow-[0_30px_80px_-20px_rgba(139,92,246,.4)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--bd-border)] px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--bd-text)]">
            <span className="h-4 w-1 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400" />
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--bd-muted)] transition-colors hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]"
            aria-label="Đóng"
          >
            <XIcon size={18} />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  )
}
