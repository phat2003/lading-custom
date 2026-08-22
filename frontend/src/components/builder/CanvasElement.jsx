import { useEffect, useRef, useState } from 'react'
import { CopyIcon, TrashIcon } from '../icons'
import BlockRenderer from './BlockRenderer'
import EditableText from './EditableText'

// 4 tay cầm ở các góc để kéo resize.
const HANDLES = [
  { corner: 'nw', cls: '-left-1 -top-1 cursor-nwse-resize' },
  { corner: 'ne', cls: '-right-1 -top-1 cursor-nesw-resize' },
  { corner: 'sw', cls: '-left-1 -bottom-1 cursor-nesw-resize' },
  { corner: 'se', cls: '-right-1 -bottom-1 cursor-nwse-resize' },
]

const CanvasElement = ({
  element,
  elements,
  selectedId,
  scale = 1, // tỉ lệ thu nhỏ của canvas — quy đổi px hiển thị về px thiết kế
  onSelect,
  onBeginGesture,
  onMove,
  onResize,
  onUpdate,
  onDuplicate,
  onDelete,
  getElementDomId,
}) => {
  const wrapperRef = useRef(null)
  const drag = useRef(null)
  const resize = useRef(null)
  const gestureBegun = useRef(false)
  const [editing, setEditing] = useState(false)

  const selected = element.id === selectedId
  const canEdit = ['heading', 'label', 'paragraph'].includes(element.type)
  const children = element.type === 'section' ? elements.filter((c) => c.parentId === element.id) : []

  useEffect(() => {
    if (!selected) setEditing(false)
  }, [selected])

  const handlePointerDown = (e) => {
    e.stopPropagation()
    if (editing) return
    onSelect(element.id)
    e.currentTarget.setPointerCapture(e.pointerId)
    gestureBegun.current = false
    drag.current = { startX: e.clientX, startY: e.clientY, origX: element.x, origY: element.y }
  }

  const handlePointerMove = (e) => {
    if (!drag.current) return
    if (!gestureBegun.current) {
      onBeginGesture?.()
      gestureBegun.current = true
    }
    const { startX, startY, origX, origY } = drag.current
    onMove(
      element.id,
      Math.max(0, origX + (e.clientX - startX) / scale),
      Math.max(0, origY + (e.clientY - startY) / scale),
    )
  }

  const handlePointerUp = (e) => {
    drag.current = null
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* pointer đã nhả */
    }
  }

  const startResize = (corner) => (e) => {
    e.stopPropagation()
    onSelect(element.id)
    e.currentTarget.setPointerCapture(e.pointerId)
    gestureBegun.current = false
    const rect = wrapperRef.current.getBoundingClientRect()
    // rect là kích thước ĐÃ thu nhỏ -> chia scale để lấy kích thước thiết kế thật.
    resize.current = {
      corner,
      sx: e.clientX,
      sy: e.clientY,
      ox: element.x,
      oy: element.y,
      ow: rect.width / scale,
      oh: rect.height / scale,
    }
  }

  const onResizeMove = (e) => {
    const r = resize.current
    if (!r) return
    if (!gestureBegun.current) {
      onBeginGesture?.()
      gestureBegun.current = true
    }
    const dx = (e.clientX - r.sx) / scale
    const dy = (e.clientY - r.sy) / scale
    let x = r.ox
    let y = r.oy
    let w = r.ow
    let h = r.oh
    if (r.corner.includes('e')) w = r.ow + dx
    if (r.corner.includes('s')) h = r.oh + dy
    if (r.corner.includes('w')) {
      w = r.ow - dx
      x = r.ox + dx
    }
    if (r.corner.includes('n')) {
      h = r.oh - dy
      y = r.oy + dy
    }
    onResize(element.id, {
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: Math.round(Math.max(20, w)),
      height: Math.round(Math.max(16, h)),
    })
  }

  const endResize = (e) => {
    resize.current = null
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* pointer đã nhả */
    }
  }

  if (element.hidden) return null

  const s = element.style
  const wrapperStyle = {
    left: element.x,
    top: element.y,
    width: s.width,
    height: s.height,
    opacity: s.opacity,
    padding: s.padding,
    borderRadius: s.borderRadius,
    boxShadow: s.boxShadow,
    border: s.borderWidth ? `${s.borderWidth}px ${s.borderStyle || 'solid'} ${s.borderColor || '#000000'}` : undefined,
    backgroundImage: s.backgroundImage ? `url(${s.backgroundImage})` : undefined,
    backgroundSize: s.backgroundImage ? 'cover' : undefined,
    backgroundPosition: s.backgroundImage ? 'center' : undefined,
  }

  return (
    <div
      id={getElementDomId?.(element)}
      ref={wrapperRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={() => canEdit && setEditing(true)}
      style={wrapperStyle}
      className={`absolute select-none transition-shadow duration-150 ${editing ? 'cursor-text' : 'cursor-move'} ${
        selected
          ? 'shadow-[0_0_0_2px_#8B5CF6,0_0_18px_-2px_rgba(139,92,246,.7)]'
          : 'hover:shadow-[0_0_0_1.5px_rgba(139,92,246,.45)]'
      }`}
    >
      {editing ? (
        <EditableText
          element={element}
          onCommit={(value) => {
            onUpdate(element.id, { content: value })
            setEditing(false)
          }}
        />
      ) : (
        <BlockRenderer element={element} />
      )}

      {children.map((child) => (
        <CanvasElement
          key={child.id}
          element={child}
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

      {selected && !editing && (
        <>
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className={`absolute right-0 flex animate-pop-in items-center gap-0.5 ${element.y < 40 ? 'top-1' : '-top-9'} rounded-lg bg-[#12121B] p-1 shadow-[0_4px_16px_-4px_rgba(0,0,0,.6)] ring-1 ring-white/10`}
          >
            <button onClick={() => onDuplicate(element.id)} title="Nhân bản" className="rounded-md p-1 text-slate-300 transition-colors hover:bg-violet-500/20 hover:text-violet-200">
              <CopyIcon size={14} />
            </button>
            <button onClick={() => onDelete(element.id)} title="Xóa" className="rounded-md p-1 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300">
              <TrashIcon size={14} />
            </button>
          </div>

          {HANDLES.map((h) => (
            <div
              key={h.corner}
              onPointerDown={startResize(h.corner)}
              onPointerMove={onResizeMove}
              onPointerUp={endResize}
              className={`absolute h-2.5 w-2.5 rounded-full border-2 border-violet-500 bg-white shadow-[0_0_8px_-1px_rgba(139,92,246,.9)] transition-transform duration-150 hover:scale-125 ${h.cls}`}
            />
          ))}
        </>
      )}
    </div>
  )
}

export default CanvasElement
