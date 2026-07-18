import { useEffect, useRef, useState } from 'react'
import { CopyIcon, TrashIcon } from '../../../../components/icons'
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
  onSelect,
  onBeginGesture,
  onMove,
  onResize,
  onUpdate,
  onDuplicate,
  onDelete,
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
    onMove(element.id, Math.max(0, origX + e.clientX - startX), Math.max(0, origY + e.clientY - startY))
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
    resize.current = { corner, sx: e.clientX, sy: e.clientY, ox: element.x, oy: element.y, ow: rect.width, oh: rect.height }
  }

  const onResizeMove = (e) => {
    const r = resize.current
    if (!r) return
    if (!gestureBegun.current) {
      onBeginGesture?.()
      gestureBegun.current = true
    }
    const dx = e.clientX - r.sx
    const dy = e.clientY - r.sy
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
      ref={wrapperRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={() => canEdit && setEditing(true)}
      style={wrapperStyle}
      className={`absolute select-none ${editing ? 'cursor-text' : 'cursor-move'} ${
        selected ? 'ring-2 ring-yellow-400' : 'hover:ring-1 hover:ring-yellow-300/60'
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
          onSelect={onSelect}
          onBeginGesture={onBeginGesture}
          onMove={onMove}
          onResize={onResize}
          onUpdate={onUpdate}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      ))}

      {selected && !editing && (
        <>
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute -top-7 right-0 flex items-center gap-0.5"
          >
            <button onClick={() => onDuplicate(element.id)} title="Nhân bản" className="rounded p-1 text-gray-600 hover:bg-black/5 hover:text-gray-900">
              <CopyIcon size={14} />
            </button>
            <button onClick={() => onDelete(element.id)} title="Xóa" className="rounded p-1 text-red-500 hover:bg-red-500/10">
              <TrashIcon size={14} />
            </button>
          </div>

          {HANDLES.map((h) => (
            <div
              key={h.corner}
              onPointerDown={startResize(h.corner)}
              onPointerMove={onResizeMove}
              onPointerUp={endResize}
              className={`absolute h-2.5 w-2.5 rounded-sm border border-yellow-500 bg-white ${h.cls}`}
            />
          ))}
        </>
      )}
    </div>
  )
}

export default CanvasElement
