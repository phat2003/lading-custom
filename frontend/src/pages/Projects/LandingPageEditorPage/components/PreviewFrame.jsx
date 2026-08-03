import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import LandingPageSectionContent from '../../components/LandingPageSectionContent'

const FRAME_INSET = 16
const MIN_USER_ZOOM = 50
const MAX_USER_ZOOM = 200
const PREVIEW_DOCUMENT = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <base href="/" />
  </head>
  <body><div id="preview-root"></div></body>
</html>`

const PreviewFrame = ({ preset, zoom, children }) => {
  const hostRef = useRef(null)
  const [hostSize, setHostSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined

    const measure = () => {
      const { width, height } = host.getBoundingClientRect()
      setHostSize((currentSize) =>
        currentSize.width === width && currentSize.height === height
          ? currentSize
          : { width, height },
      )
    }

    measure()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure)
      return () => window.removeEventListener('resize', measure)
    }

    const observer = new ResizeObserver(measure)
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  const availableWidth = Math.max(hostSize.width - FRAME_INSET * 2, 0)
  const availableHeight = Math.max(hostSize.height - FRAME_INSET * 2, 0)
  const hasAvailableSpace = availableWidth > 0 && availableHeight > 0
  const safeZoom = Number.isFinite(zoom)
    ? Math.min(MAX_USER_ZOOM, Math.max(MIN_USER_ZOOM, zoom))
    : 100
  const fitScale = hasAvailableSpace
    ? Math.min(
        1,
        availableWidth / preset.width,
        ...(preset.editable ? [] : [availableHeight / preset.height]),
      )
    : 1
  const finalScale = fitScale * (safeZoom / 100)
  const renderedWidth = preset.width * finalScale
  const renderedHeight = preset.height * finalScale
  const stageWidth = Math.max(hostSize.width, renderedWidth + FRAME_INSET * 2)
  const stageHeight = Math.max(hostSize.height, renderedHeight + FRAME_INSET * 2)

  return (
    <div ref={hostRef} className="relative min-h-0 flex-1 overflow-auto">
      <div
        className="flex items-start justify-center p-4"
        style={{ width: stageWidth, height: stageHeight }}
      >
        <div
          className="relative shrink-0 transition-[width,height] duration-200"
          style={{
            width: renderedWidth,
            height: renderedHeight,
            visibility: hasAvailableSpace ? 'visible' : 'hidden',
          }}
        >
          <div
            className="absolute left-0 top-0 overflow-hidden bg-white shadow-2xl"
            style={{
              width: preset.width,
              height: preset.height,
              transform: `scale(${finalScale})`,
              transformOrigin: 'top left',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export const ReadOnlyPreview = ({ preset, sections }) => {
  const [portalRoot, setPortalRoot] = useState(null)

  const mountPreview = useCallback((event) => {
    const previewDocument = event.currentTarget.contentDocument
    const previewRoot = previewDocument?.getElementById('preview-root')
    if (!previewDocument || !previewRoot) return

    document
      .querySelectorAll('style, link[rel="stylesheet"]')
      .forEach((styleNode) => {
        previewDocument.head.appendChild(styleNode.cloneNode(true))
      })

    const previewStyles = previewDocument.createElement('style')
    previewStyles.textContent = `
      html, body { min-height: 100%; margin: 0; overflow-x: hidden; overflow-y: auto; }
      body { background: #ffffff; -webkit-overflow-scrolling: touch; }
      #preview-root { min-height: 100%; }
      *, *::before, *::after { box-sizing: border-box; }
    `
    previewDocument.head.appendChild(previewStyles)
    setPortalRoot(previewRoot)
  }, [])

  return (
    <>
      <iframe
        srcDoc={PREVIEW_DOCUMENT}
        title={`${preset.label} preview — chỉ đọc`}
        aria-label={`${preset.label} preview ${preset.width} × ${preset.height}, chỉ đọc`}
        sandbox="allow-same-origin"
        tabIndex={0}
        onLoad={mountPreview}
        className="block h-full w-full border-0 bg-white"
      />
      {portalRoot &&
        createPortal(
          <div className="min-h-full space-y-8 bg-white p-4 text-[#0e0e10] sm:p-12">
            {sections.map((section) => (
              <section
                key={section.id}
                className="rounded px-4 py-8 sm:px-8 sm:py-12"
                style={{
                  backgroundColor: section.backgroundColor,
                  color: section.textColor,
                  textAlign: section.align,
                }}
              >
                <LandingPageSectionContent section={section} />
              </section>
            ))}

            {sections.length === 0 && (
              <div className="grid min-h-[260px] place-items-center rounded-lg border-2 border-dashed border-[#c7cad2] text-[#8d90a0]">
                <div className="text-center">
                  <p className="text-2xl font-bold">Landing Page chưa có Section</p>
                  <p className="mt-2 text-sm">Quay lại Desktop để bắt đầu thiết kế.</p>
                </div>
              </div>
            )}
          </div>,
          portalRoot,
        )}
    </>
  )
}

export default PreviewFrame
