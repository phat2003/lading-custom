import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  AlertTriangleIcon,
  CheckIcon,
  CopyIcon,
  GlobeIcon,
  XIcon,
} from '../../../../components/icons'
import { normalizePublicUrl } from '../hooks/usePublishFlow'

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const copyWithFallback = (value) => {
  const textArea = document.createElement('textarea')
  textArea.value = value
  textArea.setAttribute('readonly', '')
  textArea.style.position = 'fixed'
  textArea.style.opacity = '0'
  document.body.appendChild(textArea)
  textArea.select()

  try {
    return document.execCommand('copy')
  } finally {
    textArea.remove()
  }
}

const PublishModal = ({ landingPageName, flow }) => {
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const primaryActionRef = useRef(null)
  const copyTimerRef = useRef(null)
  const copySessionIdRef = useRef(0)
  const mountedRef = useRef(true)
  const canCloseRef = useRef(true)
  const [copyStatus, setCopyStatus] = useState('idle')
  const canClose = !flow.isBusy
  canCloseRef.current = canClose

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      copySessionIdRef.current += 1
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current)
        copyTimerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!flow.isOpen) return undefined

    const previousFocus = document.activeElement
    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.requestAnimationFrame(() => {
      ;(primaryActionRef.current || closeButtonRef.current)?.focus()
    })

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && canCloseRef.current) {
        event.preventDefault()
        flow.close()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || [],
      ).filter((element) => !element.hasAttribute('disabled'))

      if (focusableElements.length === 0) {
        event.preventDefault()
        dialogRef.current?.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousBodyOverflow
      window.requestAnimationFrame(() => previousFocus?.focus?.())
    }
  }, [flow.close, flow.isOpen])

  useLayoutEffect(() => {
    copySessionIdRef.current += 1
    setCopyStatus('idle')
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current)
      copyTimerRef.current = null
    }
  }, [flow.isOpen, flow.state])

  if (!flow.isOpen) return null

  const handleCopy = async () => {
    const copySessionId = copySessionIdRef.current
    const publicUrl = normalizePublicUrl(flow.publicUrl)
    if (!publicUrl) {
      flow.reportLinkError()
      return
    }

    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current)
      copyTimerRef.current = null
    }

    try {
      if (
        !mountedRef.current ||
        copySessionId !== copySessionIdRef.current
      ) {
        return
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(publicUrl)
      } else if (!copyWithFallback(publicUrl)) {
        throw new Error('Copy unavailable')
      }

      if (
        !mountedRef.current ||
        copySessionId !== copySessionIdRef.current
      ) {
        return
      }

      setCopyStatus('copied')
      copyTimerRef.current = window.setTimeout(() => {
        copyTimerRef.current = null
        if (
          !mountedRef.current ||
          copySessionId !== copySessionIdRef.current
        ) {
          return
        }
        setCopyStatus('idle')
      }, 1800)
    } catch {
      if (
        !mountedRef.current ||
        copySessionId !== copySessionIdRef.current
      ) {
        return
      }

      setCopyStatus('error')
      copyTimerRef.current = window.setTimeout(() => {
        copyTimerRef.current = null
        if (
          !mountedRef.current ||
          copySessionId !== copySessionIdRef.current
        ) {
          return
        }
        setCopyStatus('idle')
      }, 2400)
    }
  }

  const handleOpen = () => {
    const publicUrl = normalizePublicUrl(flow.publicUrl)
    if (!publicUrl) {
      flow.reportLinkError()
      return
    }

    window.open(publicUrl, '_blank', 'noopener,noreferrer')
  }

  const renderStateContent = () => {
    switch (flow.state) {
      case 'confirm':
        return (
          <>
            <div className="px-7 py-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#eec200]">
                {flow.isRepublish ? 'Phiên bản public mới' : 'Xuất bản lần đầu'}
              </p>
              <h2 id="publish-modal-title" className="mt-2 text-2xl font-semibold text-white">
                {flow.isRepublish
                  ? 'Xuất bản lại Landing Page?'
                  : 'Xuất bản Landing Page?'}
              </h2>
              <p className="mt-2 text-sm text-[#c3c6d7]">
                <span className="font-medium text-white">{landingPageName}</span>
              </p>

              {flow.isRepublish ? (
                <p className="mt-5 text-sm leading-6 text-[#c3c6d7]">
                  Trang live sẽ được cập nhật bằng nội dung hiện tại và tạo một snapshot mới.
                  Đường dẫn public hiện có sẽ không thay đổi.
                </p>
              ) : (
                <p className="mt-5 text-sm leading-6 text-[#c3c6d7]">
                  Một phiên bản public sẽ được tạo từ nội dung hiện tại. Những thay đổi tiếp
                  theo trong Editor sẽ không xuất hiện trên trang live cho đến khi bạn xuất
                  bản lại.
                </p>
              )}
            </div>
            <ModalActions>
              <SecondaryButton onClick={flow.close}>Hủy bỏ</SecondaryButton>
              <PublishButton ref={primaryActionRef} onClick={flow.confirmPublish}>
                {flow.isRepublish ? 'Xuất bản lại' : 'Xuất bản'}
              </PublishButton>
            </ModalActions>
          </>
        )

      case 'publishing':
        return (
          <OperationState
            title="Đang xuất bản Landing Page…"
            message="Đang chờ dịch vụ Publish tạo snapshot và xác nhận đường dẫn public."
          />
        )

      case 'unavailable': {
        const isUnpublish = flow.lastOperation === 'unpublish'
        return (
          <>
            <StateMessage
              icon={<AlertTriangleIcon size={26} />}
              iconClassName="bg-[#eec200]/10 text-[#ffe083]"
              title={isUnpublish ? 'Chưa thể ngừng xuất bản' : 'Chưa thể xuất bản'}
            >
              {isUnpublish
                ? 'Frontend chưa được kết nối với dịch vụ Publish. Trang public hiện tại và nội dung trong Editor vẫn được giữ nguyên.'
                : 'Frontend chưa được kết nối với dịch vụ Publish. Nội dung của bạn vẫn được giữ nguyên và chưa có thay đổi nào được đưa lên trang public.'}
            </StateMessage>
            <ModalActions>
              <SecondaryButton ref={primaryActionRef} onClick={flow.goBack}>
                Quay lại
              </SecondaryButton>
              <SecondaryButton onClick={flow.close}>Đóng</SecondaryButton>
            </ModalActions>
          </>
        )
      }

      case 'success':
        return (
          <>
            <StateMessage
              icon={<CheckIcon size={28} />}
              iconClassName="bg-[#00eefc]/10 text-[#00eefc]"
              title={
                flow.successOrigin === 'operation'
                  ? 'Xuất bản thành công'
                  : 'Landing Page đang được xuất bản'
              }
            >
              Mỗi lần xuất bản tạo một snapshot mới. Draft tiếp theo sẽ không tự thay đổi
              trang live cho đến khi bạn xuất bản lại.
            </StateMessage>

            {flow.hasPublicUrl ? (
              <div className="mx-7 mb-6 rounded-xl border border-white/10 bg-[#0e0e10] p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#8d90a0]">
                  Đường dẫn public
                </p>
                <p className="mt-2 break-all font-mono text-xs text-[#b4c5ff]">
                  {flow.publicUrl}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white transition hover:border-[#b4c5ff]/50"
                  >
                    <CopyIcon size={15} />
                    {copyStatus === 'copied'
                      ? 'Đã sao chép'
                      : copyStatus === 'error'
                        ? 'Không thể sao chép'
                        : 'Sao chép link'}
                  </button>
                  <button
                    type="button"
                    onClick={handleOpen}
                    className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white transition hover:border-[#b4c5ff]/50"
                  >
                    <GlobeIcon size={15} />
                    Mở trang live
                  </button>
                </div>
              </div>
            ) : (
              <p className="mx-7 mb-6 rounded-xl border border-[#eec200]/20 bg-[#eec200]/5 p-4 text-sm leading-6 text-[#ffe083]">
                Máy chủ đã xác nhận trang đang được xuất bản, nhưng chưa cung cấp đường dẫn public đầy đủ để sao chép hoặc mở.
              </p>
            )}

            <ModalActions>
              <button
                type="button"
                onClick={flow.showUnpublishConfirm}
                className="rounded-lg px-5 py-3 text-sm text-[#ffb4ab] transition hover:bg-[#ffb4ab]/10"
              >
                Ngừng xuất bản
              </button>
              <SecondaryButton onClick={flow.showPublishConfirm}>Xuất bản lại</SecondaryButton>
              <PublishButton ref={primaryActionRef} onClick={flow.close}>
                Hoàn tất
              </PublishButton>
            </ModalActions>
          </>
        )

      case 'error':
        return (
          <>
            <StateMessage
              icon={<AlertTriangleIcon size={26} />}
              iconClassName="bg-[#ffb4ab]/10 text-[#ffb4ab]"
              title="Không thể hoàn tất thao tác"
            >
              {flow.error}
              {flow.publicUrl && flow.lastOperation === 'publish' && (
                <span className="mt-3 block text-[#8d90a0]">
                  Đường dẫn public trước đó vẫn được giữ nguyên.
                </span>
              )}
            </StateMessage>
            <ModalActions>
              <SecondaryButton onClick={flow.goBack}>Quay lại</SecondaryButton>
              <SecondaryButton onClick={flow.close}>Đóng</SecondaryButton>
              {flow.lastOperation && (
                <PublishButton ref={primaryActionRef} onClick={flow.retry}>
                  Thử lại
                </PublishButton>
              )}
            </ModalActions>
          </>
        )

      case 'unpublish-confirm':
        return (
          <>
            <StateMessage
              icon={<AlertTriangleIcon size={26} />}
              iconClassName="bg-[#ffb4ab]/10 text-[#ffb4ab]"
              title="Ngừng xuất bản Landing Page?"
            >
              Trang public sẽ không còn truy cập được và Landing Page trở lại draft. Đường
              dẫn cùng lịch sử snapshot vẫn được giữ lại để bạn có thể xuất bản lại sau.
            </StateMessage>
            <ModalActions>
              <SecondaryButton onClick={flow.showPublishConfirm}>Hủy bỏ</SecondaryButton>
              <button
                ref={primaryActionRef}
                type="button"
                onClick={flow.confirmUnpublish}
                className="rounded-lg bg-[#b3261e] px-6 py-3 font-semibold text-white transition hover:bg-[#d33b32]"
              >
                Ngừng xuất bản
              </button>
            </ModalActions>
          </>
        )

      case 'unpublishing':
        return (
          <OperationState
            title="Đang ngừng xuất bản…"
            message="Đang chờ máy chủ xác nhận trang public đã được đưa về trạng thái draft."
          />
        )

      case 'unpublish-success':
        return (
          <>
            <StateMessage
              icon={<CheckIcon size={28} />}
              iconClassName="bg-[#00eefc]/10 text-[#00eefc]"
              title="Đã ngừng xuất bản"
            >
              Trang public không còn truy cập được. Đường dẫn và lịch sử snapshot vẫn được
              giữ lại cho lần xuất bản tiếp theo.
            </StateMessage>
            <ModalActions>
              <PublishButton ref={primaryActionRef} onClick={flow.close}>
                Hoàn tất
              </PublishButton>
            </ModalActions>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && canClose) flow.close()
      }}
      role="presentation"
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-modal-title"
        aria-busy={flow.isBusy}
        tabIndex={-1}
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#1c1b1d] text-[#e5e1e4] shadow-[0_30px_100px_rgba(0,0,0,0.65)]"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={flow.close}
          disabled={!canClose}
          className="absolute right-5 top-5 z-10 rounded-lg p-1.5 text-[#c3c6d7] transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Đóng hộp thoại xuất bản"
        >
          <XIcon size={22} />
        </button>
        {renderStateContent()}
      </section>
    </div>
  )
}

const ModalActions = ({ children }) => (
  <div className="flex flex-col-reverse gap-3 border-t border-white/10 bg-[#0e0e10]/40 px-7 py-5 sm:flex-row sm:justify-end">
    {children}
  </div>
)

const SecondaryButton = forwardRef(({ children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className="rounded-lg border border-white/10 px-5 py-3 text-sm text-[#c3c6d7] transition hover:border-white/20 hover:bg-white/5 hover:text-white"
    {...props}
  >
    {children}
  </button>
))

const PublishButton = forwardRef(({ children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className="rounded-lg bg-[#eec200] px-6 py-3 font-semibold text-[#231b00] shadow-[0_0_20px_rgba(238,194,0,0.2)] transition hover:bg-[#ffe083] disabled:cursor-not-allowed disabled:opacity-50"
    {...props}
  >
    {children}
  </button>
))

SecondaryButton.displayName = 'SecondaryButton'
PublishButton.displayName = 'PublishButton'

const StateMessage = ({ icon, iconClassName, title, children }) => (
  <div className="px-7 py-8">
    <div className={`grid h-12 w-12 place-items-center rounded-full ${iconClassName}`}>
      {icon}
    </div>
    <h2 id="publish-modal-title" className="mt-5 pr-10 text-2xl font-semibold text-white">
      {title}
    </h2>
    <div className="mt-3 text-sm leading-6 text-[#c3c6d7]">{children}</div>
  </div>
)

const OperationState = ({ title, message }) => (
  <div className="px-7 py-12 text-center" role="status" aria-live="polite">
    <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-[#eec200]" />
    <h2 id="publish-modal-title" className="mt-5 text-xl font-semibold text-white">
      {title}
    </h2>
    <p className="mt-3 text-sm text-[#c3c6d7]">{message}</p>
  </div>
)

export default PublishModal
