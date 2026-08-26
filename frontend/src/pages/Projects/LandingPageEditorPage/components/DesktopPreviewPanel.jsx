import { useEffect, useMemo, useRef, useState } from 'react'
import BlockRenderer from '../../../../components/builder/BlockRenderer'
import {
  MonitorIcon,
  SmartphoneIcon,
  TabletIcon,
  XIcon,
} from '../../../../components/icons'
import { getOrderedSectionRoots } from '../sectionManagement'
import {
  projectElementsForPreview,
  RESPONSIVE_PREVIEW_VIEWPORTS,
} from '../previewProjection'

export const PREVIEW_VIEWPORTS = RESPONSIVE_PREVIEW_VIEWPORTS

const MIN_DISPLAY_SCALE = 0.1

const previewSectionDomId = (sectionId) =>
  `lp-preview-section-${String(sectionId).replace(/[^a-zA-Z0-9_-]/g, '-')}`

const PreviewElement = ({ element, elements, onActivateButton, device }) => {
  if (element.hidden) return null

  const style = element.style || {}
  const rendererStyle = element.type === 'section' ? { ...style, columns: 1 } : style
  const children = elements.filter((child) => child.parentId === element.id)
  const isButton = element.type === 'button'

  return (
    <div
      id={
        element.type === 'section' && !element.parentId
          ? previewSectionDomId(element.id)
          : undefined
      }
      data-preview-element-id={element.id}
      data-preview-element-type={element.type}
      data-preview-column-index={element.previewColumnIndex ?? undefined}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (isButton) onActivateButton?.(element)
      }}
      style={{
        left: element.x,
        top: element.y,
        width: style.width,
        height: style.height,
        opacity: style.opacity,
        padding: style.padding,
        borderRadius: style.borderRadius,
        boxShadow: style.boxShadow,
        border: style.borderWidth
          ? `${style.borderWidth}px ${style.borderStyle || 'solid'} ${style.borderColor || '#000000'}`
          : undefined,
        backgroundImage: style.backgroundImage
          ? `url(${style.backgroundImage})`
          : undefined,
        backgroundSize: style.backgroundImage ? 'cover' : undefined,
        backgroundPosition: style.backgroundImage ? 'center' : undefined,
        cursor: isButton && element.link?.type ? 'pointer' : 'default',
      }}
      className={`absolute select-none ${
        device === 'mobile'
          ? '[&_nav]:flex-col [&_nav]:items-stretch [&_nav]:gap-2 [&_nav]:text-center'
          : ''
      }`}
    >
      <BlockRenderer element={{ ...element, style: rendererStyle }} />
      {children.map((child) => (
        <PreviewElement
          key={child.id}
          element={child}
          elements={elements}
          onActivateButton={onActivateButton}
          device={device}
        />
      ))}
    </div>
  )
}

const DesktopPreviewPanel = ({
  elements = [],
  settings,
  landingPages = [],
  onNavigateToLandingPage,
  onClose,
}) => {
  const [previewDevice, setPreviewDevice] = useState('desktop')
  const viewport = PREVIEW_VIEWPORTS[previewDevice] || PREVIEW_VIEWPORTS.desktop
  const displayAreaRef = useRef(null)
  const logicalViewportRef = useRef(null)
  const closeButtonRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const [availableSize, setAvailableSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    const displayArea = displayAreaRef.current
    if (!displayArea) return undefined

    const observer = new ResizeObserver(([entry]) => {
      setAvailableSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })
    observer.observe(displayArea)
    return () => observer.disconnect()
  }, [])

  const projection = useMemo(
    () => projectElementsForPreview(elements, previewDevice, settings),
    [elements, previewDevice, settings],
  )
  const roots = useMemo(
    () => getOrderedSectionRoots(projection.elements),
    [projection.elements],
  )
  const designWidth = projection.contentWidth
  const designContentHeight = projection.contentHeight
  const logicalScale = projection.renderScale
  const displayScale =
    availableSize.width && availableSize.height
      ? Math.max(
          MIN_DISPLAY_SCALE,
          Math.min(
            1,
            (availableSize.width - 32) / viewport.width,
            (availableSize.height - 32) / viewport.height,
          ),
        )
      : MIN_DISPLAY_SCALE

  const handleActivateButton = (button) => {
    const link = button.link
    if (link?.type === 'section' && link.targetSectionId) {
      const target = document.getElementById(
        previewSectionDomId(link.targetSectionId),
      )
      if (target && logicalViewportRef.current) {
        logicalViewportRef.current.scrollTo({
          top: target.offsetTop * logicalScale,
          behavior: 'smooth',
        })
      }
      return
    }

    if (link?.type === 'landingPage' && link.targetLandingPageId) {
      const target = landingPages.find(
        (landingPage) => landingPage.id === link.targetLandingPageId,
      )
      if (target?.publicUrl) onNavigateToLandingPage?.(target)
    }
  }

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="responsive-preview-title"
      aria-readonly="true"
      data-testid="desktop-preview-panel"
      data-preview-device={previewDevice}
      className="fixed inset-0 z-[100] bg-black/80 p-3 backdrop-blur-md sm:p-4 lg:p-6"
    >
      <div
        data-testid="desktop-preview-shell"
        className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] shadow-[0_30px_100px_rgba(0,0,0,.7)]"
      >
        <header className="flex min-h-12 shrink-0 items-center justify-between gap-3 border-b border-[var(--bd-border)] px-3 py-2 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <MonitorIcon size={17} className="shrink-0 text-[var(--bd-accent)]" />
            <h2
              id="responsive-preview-title"
              className="hidden truncate text-sm font-semibold text-[var(--bd-text)] lg:block"
            >
              Responsive Preview
            </h2>
          </div>

          <div
            role="group"
            aria-label="Thiết bị Preview"
            className="flex shrink-0 items-center gap-1 rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] p-1"
          >
            {[
              ['desktop', MonitorIcon],
              ['tablet', TabletIcon],
              ['mobile', SmartphoneIcon],
            ].map(([deviceKey, DeviceIcon]) => {
              const option = PREVIEW_VIEWPORTS[deviceKey]
              const active = previewDevice === deviceKey
              return (
                <button
                  key={deviceKey}
                  type="button"
                  onClick={() => setPreviewDevice(deviceKey)}
                  aria-pressed={active}
                  className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-violet-400/60 ${
                    active
                      ? 'bg-violet-500 text-white shadow-sm'
                      : 'text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]'
                  }`}
                  title={`${option.label} ${option.width} × ${option.height}`}
                >
                  <DeviceIcon size={14} />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              )
            })}
          </div>

          <div className="flex min-w-0 items-center gap-2.5">
            <span className="shrink-0 rounded-md border border-[var(--bd-border)] bg-[var(--bd-fill)] px-2 py-1 font-mono text-[10px] text-[var(--bd-dim)]">
              {viewport.width} × {viewport.height}
            </span>
            <span className="hidden shrink-0 rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-emerald-400 sm:inline">
              Chỉ xem
            </span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-8 shrink-0 items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-[var(--bd-dim)] transition hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)] focus:outline-none focus:ring-2 focus:ring-violet-400/60"
            title="Đóng Preview (Esc)"
            aria-label="Đóng Preview"
          >
            <span className="hidden sm:inline">Đóng Preview</span>
            <XIcon size={16} />
          </button>
        </header>

        <div
          ref={displayAreaRef}
          className="relative min-h-0 flex-1 overflow-hidden bg-[var(--bd-app)]"
        >
          <div className="absolute inset-0 grid place-items-center p-3 sm:p-4">
            <div
              style={{
                width: viewport.width * displayScale,
                height: viewport.height * displayScale,
              }}
            >
              <div
                ref={logicalViewportRef}
                data-testid="desktop-preview-viewport"
                data-preview-device={previewDevice}
                data-logical-width={viewport.width}
                data-logical-height={viewport.height}
                className="overflow-y-auto overflow-x-hidden bg-white shadow-[0_18px_60px_-20px_rgba(0,0,0,.75)] ring-1 ring-black/10"
                style={{
                  width: viewport.width,
                  height: viewport.height,
                  transform: `scale(${displayScale})`,
                  transformOrigin: 'top left',
                }}
              >
                <div
                  dir={settings?.direction || 'ltr'}
                  className="relative overflow-hidden"
                  style={{
                    width: designWidth,
                    height: designContentHeight,
                    transform: `scale(${logicalScale})`,
                    transformOrigin: 'top left',
                    fontFamily: settings?.fontFamily,
                    backgroundColor: settings?.bgColor || '#ffffff',
                    backgroundImage: settings?.bgImage
                      ? `url(${settings.bgImage})`
                      : undefined,
                    backgroundSize: settings?.bgImage ? 'cover' : undefined,
                    backgroundPosition: 'center',
                  }}
                >
                  {roots.length === 0 ? (
                    <div className="absolute inset-0 grid place-items-center text-center text-sm text-slate-400">
                      Landing Page chưa có Section.
                    </div>
                  ) : (
                    roots.map((root) => (
                      <PreviewElement
                        key={root.id}
                        element={root}
                        elements={projection.elements}
                        onActivateButton={handleActivateButton}
                        device={previewDevice}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DesktopPreviewPanel
