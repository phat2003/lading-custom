import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BuilderTopbar from './components/BuilderTopbar'
import BuilderRail from './components/BuilderRail'
import ElementPanel from './components/ElementPanel'
import LayersPanel from './components/LayersPanel'
import BuilderCanvas from './components/BuilderCanvas'
import PropertiesPanel from './components/PropertiesPanel'
import SectionSaveDialog from './components/SectionSaveDialog'
import { sectionsApi } from '../../../api/sections'

const newId = () =>
  crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())

// Khung Section rỗng seed sẵn khi bắt đầu dựng một section mẫu mới.
const blankSection = () => [
  {
    id: newId(),
    type: 'section',
    content: '',
    x: 0,
    y: 0,
    parentId: null,
    style: { width: 860, height: 400, bgColor: '#ffffff', borderRadius: 0, columns: 1 },
  },
]

// mode: 'template' (dựng cả trang) | 'section' (dựng 1 section mẫu để tái sử dụng).
const TemplateBuilder = ({ mode = 'template' }) => {
  const isSection = mode === 'section'
  const navigate = useNavigate()
  const { id } = useParams()

  const [device, setDevice] = useState('desktop')
  // Chế độ Section: seed sẵn 1 khung Section rỗng để admin dựng nội dung bên trong.
  const [elements, setElements] = useState(() => (isSection ? blankSection() : []))
  const [sectionMeta, setSectionMeta] = useState(null) // { id, name, type } khi đang sửa
  const [saveOpen, setSaveOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [past, setPast] = useState([])
  const [future, setFuture] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [activePanel, setActivePanel] = useState('add') // 'add' | 'layers' | null
  const [recent, setRecent] = useState([]) // palette item vừa dùng (tối đa 6)
  // Giao diện builder: 'dark' | 'light' (nhớ lựa chọn giữa các lần mở).
  const [theme, setTheme] = useState(() => localStorage.getItem('builderTheme') || 'dark')

  const toggleTheme = () =>
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      localStorage.setItem('builderTheme', next)
      return next
    })

  const useRecent = (item) =>
    setRecent((list) => [item, ...list.filter((x) => x.label !== item.label)].slice(0, 6))

  // Nạp lại section mẫu đang sửa từ API (/admin/sections/:id/edit).
  useEffect(() => {
    if (!isSection || !id) return
    let cancelled = false
    sectionsApi
      .get(id)
      .then((res) => {
        if (cancelled) return
        const s = res.data.data
        setSectionMeta({ id: s.section_template_id, name: s.display_name, type: s.section_type })
        // default_content lưu dạng { elements: [...] } do chính builder sinh ra.
        const saved = s.default_content?.elements
        if (Array.isArray(saved) && saved.length) setElements(saved)
      })
      .catch(() => {
        if (!cancelled) setSaveError('Không tải được section này.')
      })
    return () => {
      cancelled = true
    }
  }, [isSection, id])

  // Lưu Section mẫu vào thư viện (API thật) rồi quay lại danh sách.
  const handleSaveSection = async ({ name, type }) => {
    setSaving(true)
    setSaveError('')
    const payload = {
      display_name: name,
      section_type: type,
      default_content: { elements },
    }
    try {
      if (sectionMeta?.id) await sectionsApi.update(sectionMeta.id, payload)
      else await sectionsApi.create(payload)
      navigate('/admin/sections')
    } catch (err) {
      setSaveError(err?.response?.data?.error || 'Lưu section thất bại.')
    } finally {
      setSaving(false)
    }
  }

  // --- Lịch sử (undo/redo) ---
  const pushHistory = () => {
    setPast((p) => [...p, elements])
    setFuture([])
  }

  const undo = () => {
    if (past.length === 0) return
    const prev = past[past.length - 1]
    setFuture((f) => [elements, ...f])
    setPast((p) => p.slice(0, -1))
    setElements(prev)
    setSelectedId(null)
  }

  const redo = () => {
    if (future.length === 0) return
    const next = future[0]
    setPast((p) => [...p, elements])
    setFuture((f) => f.slice(1))
    setElements(next)
    setSelectedId(null)
  }

  // --- Thao tác phần tử ---
  const addElement = (payload, x, y, parentId = null) => {
    pushHistory()
    const el = { id: newId(), type: payload.type, content: payload.content, x, y, parentId, style: { ...payload.style } }
    setElements((list) => [...list, el])
    setSelectedId(el.id)
  }

  // Kéo 1 "Block mẫu" -> sinh Section + nhiều phần tử con.
  const addBlock = (blockDef, x, y) => {
    pushHistory()
    const sid = newId()
    const section = { id: sid, type: 'section', content: '', x, y, parentId: null, style: { ...blockDef.section.style } }
    const children = blockDef.children.map((c) => ({
      id: newId(),
      type: c.type,
      content: c.content,
      x: c.x,
      y: c.y,
      parentId: sid,
      style: { ...c.style },
    }))
    setElements((list) => [...list, section, ...children])
    setSelectedId(sid)
  }

  // Gọi 1 lần khi bắt đầu kéo/resize để lưu 1 mốc history (không lưu mỗi frame).
  const beginGesture = () => pushHistory()

  const moveElement = (id, x, y) =>
    setElements((list) => list.map((el) => (el.id === id ? { ...el, x, y } : el)))

  const resizeElement = (id, next) =>
    setElements((list) =>
      list.map((el) =>
        el.id === id
          ? { ...el, x: next.x, y: next.y, style: { ...el.style, width: next.width, height: next.height } }
          : el,
      ),
    )

  const updateElement = (id, patch) => {
    pushHistory()
    setElements((list) =>
      list.map((el) =>
        el.id === id
          ? { ...el, ...patch, style: patch.style ? { ...el.style, ...patch.style } : el.style }
          : el,
      ),
    )
  }

  const duplicateElement = (id) => {
    const el = elements.find((x) => x.id === id)
    if (!el) return
    pushHistory()
    const copyId = newId()
    const copy = { ...el, id: copyId, x: el.x + 16, y: el.y + 16, style: { ...el.style } }
    const childCopies = elements
      .filter((c) => c.parentId === id)
      .map((c) => ({ ...c, id: newId(), parentId: copyId, style: { ...c.style } }))
    setElements((list) => [...list, copy, ...childCopies])
    setSelectedId(copyId)
  }

  const deleteElement = (id) => {
    pushHistory()
    setElements((list) => list.filter((el) => el.id !== id && el.parentId !== id))
    setSelectedId((s) => (s === id ? null : s))
  }

  const toggleHidden = (id) => {
    pushHistory()
    setElements((list) => list.map((el) => (el.id === id ? { ...el, hidden: !el.hidden } : el)))
  }

  // Đổi thứ tự lớp (z-index) trong cùng cha. dir: 'forward' | 'backward'.
  const moveLayer = (id, dir) => {
    pushHistory()
    setElements((list) => {
      const el = list.find((e) => e.id === id)
      if (!el) return list
      const siblings = list.filter((e) => e.parentId === el.parentId)
      const i = siblings.indexOf(el)
      const swap = dir === 'forward' ? siblings[i + 1] : siblings[i - 1]
      if (!swap) return list
      const arr = [...list]
      const a = arr.indexOf(el)
      const b = arr.indexOf(swap)
      ;[arr[a], arr[b]] = [arr[b], arr[a]]
      return arr
    })
  }

  const nudge = (dx, dy) => {
    if (!selectedId) return
    pushHistory()
    setElements((list) =>
      list.map((el) =>
        el.id === selectedId ? { ...el, x: Math.max(0, el.x + dx), y: Math.max(0, el.y + dy) } : el,
      ),
    )
  }

  // --- Phím tắt ---
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)
      const ctrl = e.ctrlKey || e.metaKey

      if (ctrl && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        e.shiftKey ? redo() : undo()
        return
      }
      if (ctrl && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
        return
      }
      if (typing) return
      if (ctrl && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        if (selectedId) duplicateElement(selectedId)
        return
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        deleteElement(selectedId)
        return
      }
      if (selectedId && e.key.startsWith('Arrow')) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        if (e.key === 'ArrowUp') nudge(0, -step)
        else if (e.key === 'ArrowDown') nudge(0, step)
        else if (e.key === 'ArrowLeft') nudge(-step, 0)
        else if (e.key === 'ArrowRight') nudge(step, 0)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, elements, past, future])

  const togglePanel = (panel) => setActivePanel((cur) => (cur === panel ? null : panel))
  const selected = elements.find((el) => el.id === selectedId) || null

  return (
    <div
      data-mode={theme}
      className="builder-theme flex h-screen flex-col bg-[var(--bd-app)] text-[var(--bd-text)]"
    >
      <BuilderTopbar
        device={device}
        onDeviceChange={setDevice}
        onUndo={undo}
        onRedo={redo}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
        mode={mode}
        onSave={() => setSaveOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <div className="flex flex-1 overflow-hidden">
        <BuilderRail activePanel={activePanel} onToggle={togglePanel} />
        {activePanel === 'add' && <ElementPanel recent={recent} onUse={useRecent} />}
        {activePanel === 'layers' && (
          <LayersPanel
            elements={elements}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onToggleHidden={toggleHidden}
            onDelete={deleteElement}
            onMoveLayer={moveLayer}
          />
        )}
        <BuilderCanvas
          device={device}
          elements={elements}
          selectedId={selectedId}
          onAddElement={addElement}
          onAddBlock={addBlock}
          onSelect={setSelectedId}
          onBeginGesture={beginGesture}
          onMove={moveElement}
          onResize={resizeElement}
          onUpdate={updateElement}
          onDuplicate={duplicateElement}
          onDelete={deleteElement}
        />
        {/* Cột thuộc tính cố định: luôn hiển thị để bố cục không bị nhảy khi chọn/bỏ chọn */}
        <PropertiesPanel element={selected} onUpdate={updateElement} onDelete={deleteElement} />
      </div>

      {isSection && (
        <SectionSaveDialog
          open={saveOpen}
          initial={sectionMeta}
          saving={saving}
          error={saveError}
          onCancel={() => setSaveOpen(false)}
          onConfirm={handleSaveSection}
        />
      )}
    </div>
  )
}

export default TemplateBuilder
