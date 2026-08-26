import { useEffect } from 'react'
import { XIcon } from '../../../../components/icons'

const PublishSuccessModal = ({ result, onClose }) => {
  useEffect(() => {
    if (!result) return undefined

    document.body.style.overflow = 'hidden'
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose, result])

  if (!result) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <section
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-cyan-400/25 bg-[var(--bd-panel-solid)] shadow-[0_30px_100px_rgba(0,0,0,0.65)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-success-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-[var(--bd-dim)] transition hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]"
          aria-label="Đóng kết quả xuất bản"
        >
          <XIcon size={22} />
        </button>

        <div className="border-b border-[var(--bd-border)] px-7 pb-5 pt-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--bd-info)]">
            Published
          </p>
          <h2
            id="publish-success-title"
            className="mt-2 pr-10 text-2xl font-semibold text-[var(--bd-text)]"
          >
            Xuất bản thành công
          </h2>
          <p className="mt-2 text-sm text-[var(--bd-dim)]">
            Landing Page đang được phục vụ tại public link dưới đây.
          </p>
        </div>

        <div className="px-7 py-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--bd-muted)]">
            Public link
          </p>
          <a
            href={result.publicLink}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block break-all rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] px-4 py-3 text-sm text-[var(--bd-info)] transition hover:border-cyan-400/50 hover:text-[var(--bd-text)]"
          >
            {result.publicLink}
          </a>
        </div>

        <div className="flex justify-end gap-3 border-t border-[var(--bd-border)] bg-black/50 px-7 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--bd-border)] px-5 py-2.5 text-[var(--bd-text)] transition hover:bg-[var(--bd-fill-hover)]"
          >
            Đóng
          </button>
          <a
            href={result.publicLink}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-500"
          >
            Mở public link ↗
          </a>
        </div>
      </section>
    </div>
  )
}

export default PublishSuccessModal
