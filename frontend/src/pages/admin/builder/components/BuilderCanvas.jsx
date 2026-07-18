import { useRef, useState } from 'react'
import { PlusIcon, MinusIcon } from '../../../../components/icons'
import CanvasElement from './CanvasElement'

const BuilderCanvas = ({
  device,
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
}) => {
  const canvasRef = useRef(null)
  const [pageHeight, setPageHeight] = useState(900)

  const handleDrop = (e) => {
    e.preventDefault()
    const raw = e.dataTransfer.getData('application/json')
    if (!raw) return
    let payload
    try {
      payload = JSON.parse(raw)
    } catch {
      return
    }
    const rect = canvasRef.current.getBoundingClientRect()
    const px = Math.max(0, e.clientX - rect.left)
    const py = Math.max(0, e.clientY - rect.top)

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

  return (
    <div className="flex-1 overflow-auto bg-[#2a2a2e] p-8">
      <div className={`mx-auto ${device === 'mobile' ? 'w-[390px]' : 'w-full max-w-4xl'}`}>
        <div
          ref={canvasRef}
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
          }}
          onDrop={handleDrop}
          onPointerDown={() => onSelect(null)}
          style={{ height: pageHeight }}
          className="relative rounded-lg bg-white shadow-lg"
        >
          {elements.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-gray-400">
              <div>
                <p>Kéo phần tử vào đây</p>
                <p className="mt-1 text-sm text-gray-300">
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
              onSelect={onSelect}
              onBeginGesture={onBeginGesture}
              onMove={onMove}
              onResize={onResize}
              onUpdate={onUpdate}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setPageHeight((h) => Math.max(400, h - 400))}
            className="flex items-center gap-2 rounded-lg border border-dashed border-white/20 px-4 py-2 text-sm text-gray-300 hover:border-yellow-400/50 hover:text-yellow-400"
          >
            <MinusIcon size={16} /> Thu ngắn trang
          </button>
          <button
            onClick={() => setPageHeight((h) => h + 400)}
            className="flex items-center gap-2 rounded-lg border border-dashed border-white/20 px-4 py-2 text-sm text-gray-300 hover:border-yellow-400/50 hover:text-yellow-400"
          >
            <PlusIcon size={16} /> Tăng chiều dài trang
          </button>
        </div>
      </div>
    </div>
  )
}

export default BuilderCanvas
