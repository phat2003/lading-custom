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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full ${maxWidth} rounded-xl border border-slate-800 bg-[#111725] shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300"
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
