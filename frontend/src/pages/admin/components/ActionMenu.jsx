import { useState, useRef, useEffect } from 'react'
import { MoreVerticalIcon } from '../../../components/icons'

export default function ActionMenu({ items = [] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-md p-1 text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]"
      >
        <MoreVerticalIcon size={18} />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-40 overflow-hidden rounded-lg border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] py-1 shadow-lg">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.onClick?.()
                setOpen(false)
              }}
              className={`block w-full px-3 py-2 text-left text-sm ${
                item.danger
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
