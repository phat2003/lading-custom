import { useEffect, useRef, useState } from 'react'
import {
  ChevronDownIcon,
  CodeIcon,
  DownloadIcon,
} from '../../../../components/icons'

const ExportMenu = ({
  onExportPdf,
  onExportHtml,
  htmlExportAllowed,
  exportingFormat,
  disabled,
}) => {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const exporting = Boolean(exportingFormat)

  useEffect(() => {
    if (!open) return undefined
    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const choose = (action) => {
    setOpen(false)
    action?.()
  }

  return (
    <div ref={menuRef} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        disabled={disabled || exporting}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl border border-[var(--bd-border)] px-2.5 py-2 text-xs text-[var(--bd-text)] transition hover:border-violet-400/50 hover:text-[var(--bd-accent)] disabled:cursor-wait disabled:opacity-45 xl:px-3.5"
        title="Xuất Landing Page"
      >
        <DownloadIcon size={15} />
        <span>{exporting ? 'Đang xuất...' : 'Export'}</span>
        {!exporting && <ChevronDownIcon size={13} />}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Định dạng Export"
          className="absolute right-0 top-[calc(100%+8px)] z-[90] w-64 overflow-hidden rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel)] p-1.5 shadow-2xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => choose(onExportPdf)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-[var(--bd-text)] transition hover:bg-[var(--bd-fill-hover)]"
          >
            <DownloadIcon size={16} />
            <span className="flex-1">
              <span className="block font-semibold">PDF</span>
              <span className="mt-0.5 block text-[10px] text-[var(--bd-dim)]">
                Khả dụng cho Free và Pro
              </span>
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => choose(onExportHtml)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-[var(--bd-text)] transition hover:bg-[var(--bd-fill-hover)]"
          >
            <CodeIcon size={16} />
            <span className="flex-1">
              <span className="flex items-center gap-2 font-semibold">
                HTML/CSS/JS
                {!htmlExportAllowed && (
                  <span className="rounded bg-amber-400/15 px-1.5 py-0.5 font-mono text-[9px] text-amber-300">
                    PRO
                  </span>
                )}
              </span>
              <span className="mt-0.5 block text-[10px] text-[var(--bd-dim)]">
                Package ZIP self-contained
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

export default ExportMenu
