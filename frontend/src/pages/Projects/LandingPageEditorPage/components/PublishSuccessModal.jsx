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
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#00eefc]/25 bg-[#1c1b1d] shadow-[0_30px_100px_rgba(0,0,0,0.65)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-success-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-[#c3c6d7] transition hover:bg-white/5 hover:text-white"
          aria-label="Đóng kết quả xuất bản"
        >
          <XIcon size={22} />
        </button>

        <div className="border-b border-white/10 px-7 pb-5 pt-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#00eefc]">
            Published
          </p>
          <h2
            id="publish-success-title"
            className="mt-2 pr-10 text-2xl font-semibold text-white"
          >
            Xuất bản thành công
          </h2>
          <p className="mt-2 text-sm text-[#c3c6d7]">
            Landing Page đang được phục vụ tại public link dưới đây.
          </p>
        </div>

        <div className="px-7 py-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8d90a0]">
            Public link
          </p>
          <a
            href={result.publicLink}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block break-all rounded-lg border border-white/10 bg-[#131315] px-4 py-3 text-sm text-[#d3fbff] transition hover:border-[#00eefc]/50 hover:text-white"
          >
            {result.publicLink}
          </a>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 bg-[#0e0e10]/40 px-7 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 px-5 py-2.5 text-white transition hover:bg-white/5"
          >
            Đóng
          </button>
          <a
            href={result.publicLink}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-[#2563eb] px-5 py-2.5 font-semibold text-white transition hover:bg-blue-500"
          >
            Mở public link ↗
          </a>
        </div>
      </section>
    </div>
  )
}

export default PublishSuccessModal
