import { useEffect, useRef, useState } from 'react'
import { PlusIcon, MinusIcon, SparklesIcon } from '../icons'
import CanvasElement from './CanvasElement'

// Nút tăng/thu chiều dài trang.
const lengthBtn =
  'flex items-center gap-2 rounded-xl border border-[var(--bd-border)] bg-[var(--bd-fill)] px-4 py-2 text-sm text-[var(--bd-dim)] backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-[var(--bd-accent)] hover:shadow-[0_8px_24px_-12px_rgba(139,92,246,.9)]'

// Chiều rộng thiết kế cố định của trang (px thật, không đổi khi đóng/mở panel).
const PAGE_WIDTH = { desktop: 896, mobile: 390 }

const BuilderCanvas = ({
  device,
  settings,
  elements,
  selectedId,
  onAddElement,
  onAddBlock,
  onSelect,
  onBeginGesture,
  onMove,
  onResize,
  onUpdate,
  onDuplicate,
  onDelete,
  onFitContent,
  getElementDomId,
  pageHeight: controlledPageHeight,
  onPageHeightChange,
}) => {
  const viewportRef = useRef(null)
  const canvasRef = useRef(null)
  const [internalPageHeight, setInternalPageHeight] = useState(900)
  const [isOver, setIsOver] = useState(false) // đang rê phần tử qua canvas
  const [viewportW, setViewportW] = useState(0)
  const pageHeight = controlledPageHeight ?? internalPageHeight

  const changePageHeight = (nextHeight) => {
    if (onPageHeightChange) onPageHeightChange(nextHeight)
    else setInternalPageHeight(nextHeight)
  }

  // Hydrate trang dài từ server phải mở ra đủ chiều cao, không bị cắt ở mốc 900px mặc định.
  useEffect(() => {
    if (controlledPageHeight != null) return
    const roots = elements.filter((element) => !element.parentId)
    if (!roots.length) return
    const bottom = Math.max(
      ...roots.map((element) => (element.y || 0) + (element.style?.height || 0)),
    )
    setInternalPageHeight((height) => Math.max(height, Math.ceil(bottom) + 160))
  }, [controlledPageHeight, elements])

  // Theo dõi bề rộng vùng canvas để tự tính tỉ lệ thu nhỏ.
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setViewportW(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Khổ trang lấy từ "Thiết lập toàn trang"; chưa có thì dùng mặc định.
  const pageWidth =
    (device === 'mobile' ? settings?.mobileWidth : settings?.desktopWidth) ||
    PAGE_WIDTH[device] ||
    PAGE_WIDTH.desktop
  // Chỉ thu nhỏ khi thiếu chỗ, không bao giờ phóng to quá 100%.
  const scale = viewportW ? Math.min(1, viewportW / pageWidth) : 1

  const handleDrop = (e) => {
    e.preventDefault()
    setIsOver(false)
    const raw = e.dataTransfer.getData('application/json')
    if (!raw) return
    let payload
    try {
      payload = JSON.parse(raw)
    } catch {
      return
    }
    const rect = canvasRef.current.getBoundingClientRect()
    // Chia cho scale: đổi từ px hiển thị (đã thu nhỏ) về px thiết kế thật.
    const px = Math.max(0, (e.clientX - rect.left) / scale)
    const py = Math.max(0, (e.clientY - rect.top) / scale)

    // Block mẫu -> sinh Section + con.
    if (payload.block) {
      onAddBlock(payload.block, px, py)
      return
    }

    // Nếu thả một phần tử (không phải Section) vào trong vùng một Section -> thành con của Section đó.
    let parentId = null
    let x = px
    let y = py
    if (payload.type !== 'section') {
      const section = elements.find(
        (s) =>
          s.type === 'section' &&
          !s.parentId &&
          px >= s.x &&
          px <= s.x + (s.style.width || 0) &&
          py >= s.y &&
          py <= s.y + (s.style.height || 0),
      )
      if (section) {
        parentId = section.id
        x = px - section.x
        y = py - section.y
      }
    }
    onAddElement(payload, x, y, parentId)
  }

  const topLevel = elements.filter((el) => !el.parentId)
  const zoomPct = Math.round(scale * 100)

  // Bề rộng thực tế của nội dung — dùng để cảnh báo khi tràn khổ trang
  // (thường gặp khi chuyển từ Desktop sang Mobile).
  const contentWidth = topLevel.reduce(
    (max, el) => Math.max(max, (el.x || 0) + (el.style?.width || 0)),
    0,
  )
  const overflowing = contentWidth > pageWidth + 1

  return (
    <div ref={viewportRef} className="relative flex-1 overflow-auto bg-[var(--bd-app)] p-10">
      {/* Quầng sáng nền + lưới mờ tạo chiều sâu */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-10 h-[420px] w-[420px] animate-float-orb rounded-full bg-[var(--bd-orb-a)] blur-[110px]" />
        <div
          className="absolute -right-24 bottom-0 h-[380px] w-[380px] animate-float-orb rounded-full bg-[var(--bd-orb-b)] blur-[110px]"
          style={{ animationDelay: '3s' }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(var(--bd-grid) 1px, transparent 1px), linear-gradient(90deg, var(--bd-grid) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative">
        {/* Khung giữ chỗ đúng bằng kích thước SAU khi thu nhỏ, để canh giữa và không dư khoảng trống */}
        <div className="mx-auto" style={{ width: pageWidth * scale, height: pageHeight * scale }}>
          <div
            ref={canvasRef}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'copy'
              if (!isOver) setIsOver(true)
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setIsOver(false)
            }}
            onDrop={handleDrop}
            onPointerDown={() => onSelect(null)}
            dir={settings?.direction || 'ltr'}
            style={{
              width: pageWidth,
              height: pageHeight,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              fontFamily: settings?.fontFamily,
              backgroundColor: settings?.bgColor || '#ffffff',
              backgroundImage: settings?.bgImage ? `url(${settings.bgImage})` : undefined,
              backgroundSize: settings?.bgImage ? 'cover' : undefined,
              backgroundPosition: 'center',
            }}
            className={`relative overflow-hidden transition-shadow duration-300 ${
              isOver
                ? 'shadow-[0_0_0_2px_rgba(139,92,246,.9),0_30px_80px_-20px_rgba(139,92,246,.6)]'
                : 'shadow-[var(--bd-page-shadow)]'
            }`}
          >
            {elements.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 text-center">
                <div className="animate-fade-in">
                  <span
                    className={`mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/15 to-cyan-400/10 text-violet-500 ring-1 ring-inset ring-violet-400/20 transition-transform duration-300 ${
                      isOver ? 'scale-110' : ''
                    }`}
                  >
                    <SparklesIcon size={26} />
                  </span>
                  <p className="text-lg font-semibold text-slate-700">
                    {isOver ? 'Thả vào đây!' : 'Kéo phần tử vào đây'}
                  </p>
                  <p className="mt-1.5 text-sm text-[var(--bd-dim)]">
                    Chọn phần tử ở panel trái và thả vào trang. Thả vào một Section để lồng vào trong.
                  </p>
                </div>
              </div>
            )}

            {topLevel.map((el) => (
              <CanvasElement
                key={el.id}
                element={el}
                elements={elements}
                selectedId={selectedId}
                scale={scale}
                onSelect={onSelect}
                onBeginGesture={onBeginGesture}
                onMove={onMove}
                onResize={onResize}
                onUpdate={onUpdate}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                getElementDomId={getElementDomId}
              />
            ))}
          </div>
        </div>

        {overflowing && (
          <div className="mx-auto mt-4 flex max-w-xl animate-fade-in-up flex-wrap items-center justify-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-center text-xs text-amber-300">
            <span>
              Nội dung rộng {Math.round(contentWidth)}px, vượt khổ trang {pageWidth}px nên bị cắt bớt.
            </span>
            <button
              onClick={onFitContent}
              className="rounded-lg border border-amber-400/50 px-3 py-1.5 font-medium text-amber-200 transition-colors hover:bg-amber-500/20"
            >
              Thu gọn cho vừa khổ
            </button>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={() => changePageHeight(Math.max(400, pageHeight - 400))}
            className={lengthBtn}
          >
            <MinusIcon size={16} /> Thu ngắn trang
          </button>
          <span className="rounded-lg bg-[var(--bd-fill)] px-2.5 py-1 text-xs tabular-nums text-[var(--bd-muted)]">
            {pageWidth} × {pageHeight}px
            {zoomPct < 100 && <span className="ml-1.5 text-[var(--bd-accent)]">· {zoomPct}%</span>}
          </span>
          <button onClick={() => changePageHeight(pageHeight + 400)} className={lengthBtn}>
            <PlusIcon size={16} /> Tăng chiều dài trang
          </button>
        </div>
      </div>
    </div>
  )
}

export default BuilderCanvas
