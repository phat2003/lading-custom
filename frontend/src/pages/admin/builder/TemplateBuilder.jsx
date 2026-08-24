import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { sectionsApi } from '../../../api/sections'
import { templatesApi } from '../../../api/templates'
import BuilderWorkspace from '../../../components/builder/BuilderWorkspace'
import { buildMobileLayout, viewAll } from '../../../components/builder/deviceLayout'
import { toLibraryVariants } from '../../../components/builder/sectionLibrary'
import {
  contentHeight,
  elementsToSections,
  sectionsToElements,
} from '../../../components/builder/templateContent'
import { useBuilderController } from '../../../components/builder/useBuilderController'
import { useTheme } from '../../../context/ThemeContext'
import BuilderTopbar from './components/BuilderTopbar'
import PageSettingsModal from './components/PageSettingsModal'
import PageSettingsPanel from './components/PageSettingsPanel'
import SectionSaveDialog from './components/SectionSaveDialog'
import TemplateSaveDialog from './components/TemplateSaveDialog'
import { loadPageSettings, savePageSettings } from './pageSettings'
import { PREVIEW_KEY } from './PreviewPage'

const newId = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`

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

// Admin chỉ orchestration metadata/persistence; interaction/rendering nằm trong Builder Core dùng chung.
const TemplateBuilder = ({ mode = 'template' }) => {
  const isSection = mode === 'section'
  const navigate = useNavigate()
  const { id } = useParams()
  const { theme, toggleTheme } = useTheme()

  const [sectionMeta, setSectionMeta] = useState(null)
  const [saveOpen, setSaveOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [templateMeta, setTemplateMeta] = useState(null)
  const [publishIntent, setPublishIntent] = useState(false)
  const [library, setLibrary] = useState([])
  const [settings, setSettings] = useState(() => loadPageSettings(id))
  const [pageHeight, setPageHeight] = useState(900)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsDialog, setSettingsDialog] = useState(null)

  const builder = useBuilderController({
    initialElements: isSection ? blankSection() : [],
    settings,
    pageHeight,
  })
  const { replaceElements } = builder

  const updateSettings = (next) => {
    setSettings(next)
    savePageSettings(id, next)
  }

  const handleDeviceChange = (nextDevice) => {
    let projectedElements = viewAll(builder.elements, nextDevice)
    if (nextDevice === 'mobile' && builder.elements.some((element) => !element.mobile)) {
      const withMobileLayout = buildMobileLayout(
        builder.elements,
        (settings.mobileWidth || 420) / (settings.desktopWidth || 896),
      )
      projectedElements = viewAll(withMobileLayout, nextDevice)
    }
    setPageHeight(contentHeight(projectedElements))
    builder.changeDevice(nextDevice)
  }

  useEffect(() => {
    let cancelled = false
    sectionsApi
      .listAll()
      .then((response) => {
        if (!cancelled) setLibrary(toLibraryVariants(response.data.data || []))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (isSection || !id) return
    let cancelled = false
    templatesApi
      .get(id)
      .then((response) => {
        if (cancelled) return
        const template = response.data.data
        setTemplateMeta({
          id: template.template_id,
          name: template.name,
          category: template.category,
          tier: template.tier,
        })
        const loaded = sectionsToElements(template.sections || [])
        replaceElements(loaded)
        setPageHeight(contentHeight(loaded))
      })
      .catch(() => {
        if (!cancelled) setSaveError('Không tải được template này.')
      })
    return () => {
      cancelled = true
    }
  }, [id, isSection, replaceElements])

  useEffect(() => {
    if (!isSection || !id) return
    let cancelled = false
    sectionsApi
      .get(id)
      .then((response) => {
        if (cancelled) return
        const section = response.data.data
        setSectionMeta({
          id: section.section_template_id,
          name: section.display_name,
          type: section.section_type,
          thumbnailUrl: section.thumbnail_url || '',
        })
        const saved = section.default_content?.elements
        const loaded = Array.isArray(saved) && saved.length ? saved : blankSection()
        replaceElements(loaded)
        setPageHeight(contentHeight(loaded))
      })
      .catch(() => {
        if (!cancelled) setSaveError('Không tải được section này.')
      })
    return () => {
      cancelled = true
    }
  }, [id, isSection, replaceElements])

  const handleSaveTemplate = async ({ name, category, tier }) => {
    const sections = elementsToSections(builder.elements)
    if (!sections.length) {
      setSaveError('Trang đang trống — hãy thêm ít nhất một phần tử trước khi lưu.')
      return
    }

    setSaving(true)
    setSaveError('')
    const metadata = {
      name,
      category,
      tier,
      status: publishIntent ? 'published' : 'draft',
    }
    try {
      let templateId = templateMeta?.id
      if (templateId) await templatesApi.update(templateId, metadata)
      else templateId = (await templatesApi.create(metadata)).data.data.template_id
      await templatesApi.replaceSections(templateId, sections)
      navigate('/admin/templates')
    } catch (error) {
      setSaveError(error?.response?.data?.error || 'Lưu template thất bại.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSection = async ({ name, type, thumbnailUrl }) => {
    setSaving(true)
    setSaveError('')
    const payload = {
      display_name: name,
      section_type: type,
      default_content: { elements: builder.elements },
      thumbnail_url: thumbnailUrl || '',
    }
    try {
      if (sectionMeta?.id) await sectionsApi.update(sectionMeta.id, payload)
      else await sectionsApi.create(payload)
      navigate('/admin/sections')
    } catch (error) {
      setSaveError(error?.response?.data?.error || 'Lưu section thất bại.')
    } finally {
      setSaving(false)
    }
  }

  const openPreview = () => {
    if (!builder.elements.length) {
      setSaveError('Trang đang trống — hãy thêm phần tử trước khi xem trước.')
      return
    }
    localStorage.setItem(
      PREVIEW_KEY,
      JSON.stringify({ elements: builder.elements, device: builder.device, settings }),
    )
    window.open('/admin/templates/preview', '_blank', 'noopener')
  }

  const openTemplateSave = (publish) => {
    setPublishIntent(publish)
    setSaveError('')
    setSaveOpen(true)
  }

  return (
    <div
      data-mode={theme}
      className="app-theme flex h-screen flex-col bg-[var(--bd-app)] text-[var(--bd-text)]"
    >
      <BuilderTopbar
        device={builder.device}
        onDeviceChange={handleDeviceChange}
        onUndo={builder.undo}
        onRedo={builder.redo}
        canUndo={builder.canUndo}
        canRedo={builder.canRedo}
        mode={mode}
        onSave={() => setSaveOpen(true)}
        onPreview={openPreview}
        onOpenSettings={() => setSettingsOpen(true)}
        onSaveDraft={() => openTemplateSave(false)}
        onPublish={() => openTemplateSave(true)}
        saving={saving}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <BuilderWorkspace
        controller={builder}
        settings={settings}
        library={library}
        libraryEmptyMessage="Chưa có section mẫu nào. Tạo và lưu Section để sử dụng tại đây."
        canvasProps={{ pageHeight, onPageHeightChange: setPageHeight }}
      />

      <PageSettingsPanel
        open={settingsOpen}
        settings={settings}
        onChange={updateSettings}
        onOpenDialog={(tab) => setSettingsDialog(tab)}
        onClose={() => setSettingsOpen(false)}
      />
      <PageSettingsModal
        open={Boolean(settingsDialog) && settingsDialog !== 'dynamic'}
        tab={settingsDialog}
        settings={settings}
        onChangeTab={setSettingsDialog}
        onChange={updateSettings}
        onClose={() => setSettingsDialog(null)}
      />

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
