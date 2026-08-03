import { useEffect, useRef, useState } from 'react'
import {
  MonitorIcon,
  SmartphoneIcon,
  TabletIcon,
  XIcon,
} from '../../../../components/icons'
import { DEVICE_PRESETS, getDevicePreset } from '../preview/devicePresets'
import PreviewFrame, { ReadOnlyPreview } from './PreviewFrame'

const DEVICE_ICONS = {
  desktop: MonitorIcon,
  tablet: TabletIcon,
  mobile: SmartphoneIcon,
}

const STATUS_META = {
  idle: { label: 'Đang chuẩn bị bản xem trước', color: 'text-[#c3c6d7]' },
  dirty: { label: 'Có thay đổi cục bộ', color: 'text-[#ffe083]' },
  updating: { label: 'Đang cập nhật preview…', color: 'text-[#eec200]' },
  ready: { label: 'Preview đã cập nhật', color: 'text-[#00eefc]' },
  error: { label: 'Lỗi preview', color: 'text-[#ffb4ab]' },
}

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function formatLastUpdated(lastUpdatedAt) {
  if (!lastUpdatedAt) return 'Chưa có bản xem trước hợp lệ'

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(lastUpdatedAt))
}

const PreviewDialog = ({
  open,
  landingPageName,
  initialDevice,
  sections,
  status,
  lastUpdatedAt,
  error,
  onRetry,
  onRenderError,
  onClose,
}) => {
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const [deviceId, setDeviceId] = useState(initialDevice || 'desktop')
  const [zoom, setZoom] = useState(100)
  const activePreset = getDevicePreset(deviceId)
  const statusMeta = STATUS_META[status] || STATUS_META.idle

  useEffect(() => {
    if (!open) return
    setDeviceId(initialDevice || 'desktop')
    setZoom(100)
  }, [initialDevice, open])

  useEffect(() => {
    if (!open) return undefined

    const previousFocus = document.activeElement
    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || [],
      ).filter((element) => !element.hasAttribute('disabled'))

      if (focusableElements.length === 0) {
        event.preventDefault()
        closeButtonRef.current?.focus()
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
  }, [onClose, open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-dialog-title"
        className="flex h-[94vh] w-full max-w-[1500px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#131315] text-[#e5e1e4] shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#201f21] px-5 py-4">
          <div className="min-w-0">
            <h2 id="preview-dialog-title" className="truncate text-lg font-semibold text-white">
              Xem trước Landing Page
            </h2>
            <p className="mt-1 truncate text-xs text-[#c3c6d7]">
              {landingPageName} · Bản xem trước cục bộ — chưa lưu lên máy chủ
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#c3c6d7] transition hover:bg-white/5 hover:text-white"
            aria-label="Đóng bản xem trước"
          >
            <XIcon size={22} />
          </button>
        </header>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#1c1b1d] px-5 py-3">
          <div className="flex items-center gap-2" aria-label="Thiết bị xem trước">
            {DEVICE_PRESETS.map((preset) => {
              const DeviceIcon = DEVICE_ICONS[preset.id]
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setDeviceId(preset.id)}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 font-mono text-[10px] transition ${
                    deviceId === preset.id
                      ? 'bg-[#2563eb] text-white'
                      : 'bg-[#2a2a2c] text-[#c3c6d7] hover:text-white'
                  }`}
                  aria-pressed={deviceId === preset.id}
                  title={`${preset.label} — ${preset.width} × ${preset.height}`}
                >
                  <DeviceIcon size={16} />
                  {preset.label}
                </button>
              )
            })}
            <span className="ml-2 font-mono text-[10px] text-[#c3c6d7]">
              {activePreset.width} × {activePreset.height}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`min-w-[180px] font-mono text-[10px] ${statusMeta.color}`}
              aria-live="polite"
              title={error || 'Bản xem trước cục bộ — chưa lưu lên máy chủ'}
            >
              <p>{statusMeta.label}</p>
              <p className="mt-0.5 text-[9px] text-[#8d90a0]">
                Cập nhật lúc: {formatLastUpdated(lastUpdatedAt)}
              </p>
            </div>
            {status === 'error' && (
              <button
                type="button"
                onClick={onRetry}
                className="rounded border border-[#ffb4ab]/30 px-3 py-2 font-mono text-[10px] text-[#ffb4ab] hover:bg-[#ffb4ab]/10"
              >
                Thử lại
              </button>
            )}
            <div className="h-5 w-px bg-white/15" />
            <button
              type="button"
              onClick={() => setZoom((currentZoom) => Math.max(50, currentZoom - 10))}
              className="px-1 text-[#c3c6d7]"
              aria-label="Thu nhỏ preview trong dialog"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => setZoom(100)}
              className="w-12 font-mono text-xs text-white"
              aria-label="Đặt lại zoom dialog về 100%"
            >
              {zoom}%
            </button>
            <button
              type="button"
              onClick={() => setZoom((currentZoom) => Math.min(200, currentZoom + 10))}
              className="px-1 text-[#c3c6d7]"
              aria-label="Phóng to preview trong dialog"
            >
              +
            </button>
          </div>
        </div>

        <div className="editor-canvas-grid flex min-h-0 flex-1 p-5">
          <PreviewFrame preset={activePreset} zoom={zoom}>
            <ReadOnlyPreview
              key={activePreset.id}
              preset={activePreset}
              sections={sections}
              onRenderError={onRenderError}
            />
          </PreviewFrame>
        </div>
      </section>
    </div>
  )
}

export default PreviewDialog
