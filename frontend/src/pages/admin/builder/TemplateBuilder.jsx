import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BuilderTopbar from './components/BuilderTopbar'
import BuilderRail from './components/BuilderRail'
import ElementPanel from './components/ElementPanel'
import LayersPanel from './components/LayersPanel'
import BuilderCanvas from './components/BuilderCanvas'
import PropertiesPanel from './components/PropertiesPanel'
import SectionSaveDialog from './components/SectionSaveDialog'
import TemplateSaveDialog from './components/TemplateSaveDialog'
import { sectionsApi } from '../../../api/sections'
import { templatesApi } from '../../../api/templates'
import { toLibraryVariants } from './sectionLibrary'
import { useTheme } from '../../../context/ThemeContext'
import { elementsToSections, sectionsToElements } from './templateContent'
import { PREVIEW_KEY } from './PreviewPage'

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
  // Chế độ Template: metadata của template đang sửa + ý định lưu (nháp hay xuất bản).
  const [templateMeta, setTemplateMeta] = useState(null)
  const [publishIntent, setPublishIntent] = useState(false)
  const [past, setPast] = useState([])
  const [future, setFuture] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [activePanel, setActivePanel] = useState('add') // 'add' | 'layers' | null
  const [recent, setRecent] = useState([]) // palette item vừa dùng (tối đa 6)
  const [library, setLibrary] = useState([]) // section mẫu admin đã lưu, lấy từ API
  // Giao diện dùng chung với khu admin (ThemeContext), không giữ state riêng.
  const { theme, toggleTheme } = useTheme()

  const useRecent = (item) =>
    setRecent((list) => [item, ...list.filter((x) => x.label !== item.label)].slice(0, 6))

  // Nạp thư viện Section mẫu (do admin tạo) để kéo lại vào trang.
  // Lỗi ở đây chỉ làm thiếu mục "Section mẫu", không chặn việc dựng trang.
  useEffect(() => {
    let cancelled = false
    sectionsApi
      .listAll()
      .then((res) => {
        if (!cancelled) setLibrary(toLibraryVariants(res.data.data || []))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // Nạp template đang sửa từ API (/admin/templates/:id/edit).
  useEffect(() => {
    if (isSection || !id) return
    let cancelled = false
    templatesApi
      .get(id)
      .then((res) => {
        if (cancelled) return
        const t = res.data.data
        setTemplateMeta({ id: t.template_id, name: t.name, category: t.category, tier: t.tier })
        const loaded = sectionsToElements(t.sections || [])
        if (loaded.length) setElements(loaded)
      })
      .catch(() => {
        if (!cancelled) setSaveError('Không tải được template này.')
      })
    return () => {
      cancelled = true
    }
  }, [isSection, id])

  // Lưu template: tạo mới (nếu chưa có) rồi ghi đè toàn bộ nội dung.
  const handleSaveTemplate = async ({ name, category, tier }) => {
    const sections = elementsToSections(elements)
    if (sections.length === 0) {
      setSaveError('Trang đang trống — hãy thêm ít nhất một phần tử trước khi lưu.')
      return
    }

    setSaving(true)
    setSaveError('')
    const meta = {
      name,
      category,
      tier,
      status: publishIntent ? 'published' : 'draft',
    }
    try {
      // Chưa có template thì tạo metadata trước để lấy id, sau đó mới ghi nội dung.
      let templateId = templateMeta?.id
      if (templateId) await templatesApi.update(templateId, meta)
      else templateId = (await templatesApi.create(meta)).data.data.template_id

      await templatesApi.replaceSections(templateId, sections)
      navigate('/admin/templates')
    } catch (err) {
      setSaveError(err?.response?.data?.error || 'Lưu template thất bại.')
    } finally {
      setSaving(false)
    }
  }

  // Xem trước: đẩy nội dung đang dựng (kể cả chưa lưu) sang cửa sổ mới.
  // Không gọi API — preview luôn phản ánh đúng những gì đang có trên canvas.
  const openPreview = () => {
    if (elements.length === 0) {
      setSaveError('Trang đang trống — hãy thêm phần tử trước khi xem trước.')
      return
    }
    localStorage.setItem(PREVIEW_KEY, JSON.stringify({ elements, device }))
    window.open('/admin/templates/preview', '_blank', 'noopener')
  }

  const openTemplateSave = (publish) => {
    setPublishIntent(publish)
    setSaveError('')
    setSaveOpen(true)
  }

  // Nạp lại section mẫu đang sửa từ API (/admin/sections/:id/edit).
  useEffect(() => {
    if (!isSection || !id) return
    let cancelled = false
    sectionsApi
      .get(id)
      .then((res) => {
        if (cancelled) return
        const s = res.data.data
        setSectionMeta({
          id: s.section_template_id,
          name: s.display_name,
          type: s.section_type,
          thumbnailUrl: s.thumbnail_url || '',
        })
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
  const handleSaveSection = async ({ name, type, thumbnailUrl }) => {
    setSaving(true)
    setSaveError('')
    const payload = {
      display_name: name,
      section_type: type,
      default_content: { elements },
      thumbnail_url: thumbnailUrl || '',
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
    // Giữ sectionType + nguồn gốc để khi lưu template còn biết section này loại gì.
    const section = {
      id: sid,
      type: 'section',
      content: '',
      x,
      y,
      parentId: null,
      sectionType: blockDef.section.sectionType || 'custom',
      sourceSectionTemplateId: blockDef.section.sourceSectionTemplateId || null,
      style: { ...blockDef.section.style },
    }
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
      className="app-theme flex h-screen flex-col bg-[var(--bd-app)] text-[var(--bd-text)]"
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
        onPreview={openPreview}
        onSaveDraft={() => openTemplateSave(false)}
        onPublish={() => openTemplateSave(true)}
        saving={saving}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <div className="flex flex-1 overflow-hidden">
        <BuilderRail activePanel={activePanel} onToggle={togglePanel} />
        {activePanel === 'add' && (
          <ElementPanel recent={recent} library={library} onUse={useRecent} />
        )}
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

      {!isSection && (
        <TemplateSaveDialog
          open={saveOpen}
          initial={templateMeta}
          publish={publishIntent}
          saving={saving}
          error={saveError}
          onCancel={() => setSaveOpen(false)}
          onConfirm={handleSaveTemplate}
        />
      )}

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
