import { useEffect, useRef, useState } from 'react'
import { XIcon } from '../../../../components/icons'

const STATIC_PREVIEW_STATUS = {
  saving: 'Đang lưu Landing Page...',
  generating: 'Đang tạo bản xem trước tĩnh...',
}

const StaticPreviewDialog = ({
  open,
  status,
  html,
  error,
  onClose,
  onRetry,
}) => {
  const closeButtonRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const [frameReady, setFrameReady] = useState(false)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined

    const previousBodyOverflow = document.body.style.overflow
    const previouslyFocused = document.activeElement
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousBodyOverflow
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [open])

  useEffect(() => {
    setFrameReady(false)
  }, [html])

  if (!open) return null

  const busy = status === 'saving' || status === 'generating'
  const ready = status === 'success' && html

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="static-preview-title"
      aria-describedby="static-preview-description"
      data-testid="static-preview-dialog"
      className="fixed inset-0 z-[110] bg-black/80 p-3 backdrop-blur-md sm:p-4 lg:p-6"
    >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--bd-panel-solid)] shadow-[0_30px_100px_rgba(0,0,0,.7)]">
        <header className="flex min-h-12 shrink-0 items-center justify-between gap-3 border-b border-[var(--bd-border)] px-3 py-2 sm:px-5">
          <div className="min-w-0">
            <h2
              id="static-preview-title"
              className="truncate text-sm font-semibold text-[var(--bd-text)]"
            >
              Bản xem trước tĩnh
            </h2>
            <p
              id="static-preview-description"
              className="hidden text-[10px] text-[var(--bd-dim)] sm:block"
            >
              HTML do server tạo từ dữ liệu Landing Page đã lưu
            </p>
          </div>

          <div className="flex items-center gap-2">
            {ready && (
              <span className="hidden rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-emerald-400 sm:inline">
                Chỉ xem
              </span>
            )}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-[var(--bd-dim)] transition hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)] focus:outline-none focus:ring-2 focus:ring-violet-400/60"
              title="Đóng bản xem trước tĩnh (Esc)"
              aria-label="Đóng bản xem trước tĩnh"
            >
              <span className="hidden sm:inline">Đóng</span>
              <XIcon size={16} />
            </button>
          </div>
        </header>

        <div className="relative min-h-0 flex-1 bg-[var(--bd-app)]">
          {busy && (
            <div
              role="status"
              aria-live="polite"
              className="absolute inset-0 grid place-items-center"
            >
              <div className="rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel)] px-8 py-7 text-center shadow-xl">
                <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-violet-300/30 border-t-violet-400" />
                <p className="mt-4 text-sm font-medium text-[var(--bd-text)]">
                  {STATIC_PREVIEW_STATUS[status]}
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="absolute inset-0 grid place-items-center p-6">
              <div
                role="alert"
                className="max-w-md rounded-2xl border border-rose-400/30 bg-[var(--bd-panel)] p-7 text-center shadow-xl"
              >
                <h3 className="text-base font-semibold text-[var(--bd-text)]">
                  Không thể tạo bản xem trước tĩnh
                </h3>
                <p className="mt-2 text-sm text-rose-300">{error}</p>
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-500"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {ready && (
            <>
              {!frameReady && (
                <div
                  role="status"
                  className="absolute inset-0 z-10 grid place-items-center bg-[var(--bd-app)]"
                >
                  <p className="text-sm text-[var(--bd-dim)]">
                    Đang hiển thị HTML tĩnh...
                  </p>
                </div>
              )}
              <iframe
                title="Bản xem trước tĩnh của Landing Page"
                srcDoc={html}
                sandbox=""
                referrerPolicy="no-referrer"
                onLoad={() => setFrameReady(true)}
                data-testid="static-preview-frame"
                className="h-full w-full border-0 bg-white"
              />
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default StaticPreviewDialog
