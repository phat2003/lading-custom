import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import StatusNotice from '../components/StatusNotice'
import { useProjects } from '../context/ProjectsContext'
import EditorCanvas from './components/EditorCanvas'
import EditorTopbar from './components/EditorTopbar'
import ElementsPanel from './components/ElementsPanel'
import PreviewDialog from './components/PreviewDialog'
import PropertiesPanel from './components/PropertiesPanel'
import { useRealtimePreview } from './hooks/useRealtimePreview'
import { getDevicePreset } from './preview/devicePresets'
import { createLegacyStarterSection, createSection } from './sectionPresets'

function createId() {
  return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
}

function getInitialSections(landingPage) {
  if (!landingPage) return []
  if (Array.isArray(landingPage.sections)) return landingPage.sections
  if (landingPage.sourceType === 'blank') return []
  return [createLegacyStarterSection()]
}

export default function LandingPageEditorPage({
  projectIdOverride,
  landingPageIdOverride,
}) {
  const routeParams = useParams()
  const projectId = projectIdOverride || routeParams.projectId
  const landingPageId = landingPageIdOverride || routeParams.landingPageId
  const navigate = useNavigate()
  const {
    getProject,
    getLandingPage,
    updateLandingPageSections,
  } = useProjects()
  const project = getProject(projectId)
  const landingPage = getLandingPage(projectId, landingPageId)
  const initialSections = useRef(getInitialSections(landingPage))
  const [sections, setSections] = useState(initialSections.current)
  const [selectedSectionId, setSelectedSectionId] = useState(
    initialSections.current[0]?.id || null,
  )
  const [viewport, setViewport] = useState('desktop')
  const [zoom, setZoom] = useState(100)
  const [notice, setNotice] = useState('')
  const [, setSaveStatus] = useState('saved')
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const isEditable = getDevicePreset(viewport).editable
  const {
    previewSections,
    status: previewStatus,
    lastUpdatedAt,
    error: previewError,
    retry: retryPreview,
    reportRenderError: reportPreviewRenderError,
  } = useRealtimePreview(sections)

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 3000)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    if (!project || !landingPage) return undefined

    setSaveStatus('saving')
    const timer = window.setTimeout(() => {
      updateLandingPageSections(projectId, landingPageId, sections)
      setSaveStatus('saved')
    }, 350)

    return () => window.clearTimeout(timer)
  }, [
    landingPageId,
    projectId,
    sections,
    updateLandingPageSections,
  ])

  const selectedSection = useMemo(
    () => sections.find((section) => section.id === selectedSectionId) || null,
    [sections, selectedSectionId],
  )

  const notifyReadOnly = useCallback(() => {
    setNotice('Chỉnh sửa chỉ khả dụng ở chế độ Desktop.')
  }, [])

  const addSection = useCallback((type) => {
    if (!isEditable) {
      notifyReadOnly()
      return
    }

    const newSection = createSection(type)
    setSections((currentSections) => [...currentSections, newSection])
    setSelectedSectionId(newSection.id)
    setNotice('Đã thêm Section mới vào Landing Page.')
  }, [isEditable, notifyReadOnly])

  const updateSection = useCallback((updatedSection) => {
    if (!isEditable) {
      notifyReadOnly()
      return
    }

    setSections((currentSections) =>
      currentSections.map((section) =>
        section.id === updatedSection.id ? updatedSection : section,
      ),
    )
  }, [isEditable, notifyReadOnly])

  const moveSection = useCallback((sectionId, direction) => {
    if (!isEditable) {
      notifyReadOnly()
      return
    }

    setSections((currentSections) => {
      const currentIndex = currentSections.findIndex(
        (section) => section.id === sectionId,
      )
      const nextIndex = currentIndex + direction

      if (
        currentIndex === -1 ||
        nextIndex < 0 ||
        nextIndex >= currentSections.length
      ) {
        return currentSections
      }

      const reorderedSections = [...currentSections]
      const [movedSection] = reorderedSections.splice(currentIndex, 1)
      reorderedSections.splice(nextIndex, 0, movedSection)
      return reorderedSections
    })
  }, [isEditable, notifyReadOnly])

  const duplicateSection = useCallback((sectionId) => {
    if (!isEditable) {
      notifyReadOnly()
      return
    }

    const currentIndex = sections.findIndex(
      (section) => section.id === sectionId,
    )
    if (currentIndex === -1) return

    const duplicatedSection = {
      ...sections[currentIndex],
      id: createId(),
    }
    const nextSections = [...sections]
    nextSections.splice(currentIndex + 1, 0, duplicatedSection)
    setSections(nextSections)
    setSelectedSectionId(duplicatedSection.id)
    setNotice('Đã nhân bản Section.')
  }, [isEditable, notifyReadOnly, sections])

  const deleteSection = useCallback((sectionId) => {
    if (!isEditable) {
      notifyReadOnly()
      return
    }

    const currentIndex = sections.findIndex(
      (section) => section.id === sectionId,
    )
    if (currentIndex === -1) return

    const nextSections = sections.filter(
      (section) => section.id !== sectionId,
    )
    const nextSelectedSection =
      nextSections[currentIndex] || nextSections[currentIndex - 1] || null
    setSections(nextSections)
    setSelectedSectionId(nextSelectedSection?.id || null)
    setNotice('Đã xóa Section khỏi Landing Page.')
  }, [isEditable, notifyReadOnly, sections])

  const selectSection = useCallback((sectionId) => {
    if (!isEditable) {
      notifyReadOnly()
      return
    }

    setSelectedSectionId(sectionId)
  }, [isEditable, notifyReadOnly])

  const openPreviewDialog = useCallback(() => {
    setIsPreviewDialogOpen(true)
  }, [])

  const closePreviewDialog = useCallback(() => {
    setIsPreviewDialogOpen(false)
  }, [])

  if (!project || !landingPage) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0e0e10] px-4 text-white">
        <section className="max-w-lg rounded-2xl border border-white/10 bg-[#201f21] p-8 text-center">
          <h1 className="text-3xl font-semibold">Không tìm thấy Landing Page</h1>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="mt-6 rounded-lg bg-[#b4c5ff] px-5 py-3 font-semibold text-[#002a78]"
          >
            Quay lại My Project
          </button>
        </section>
      </main>
    )
  }

  return (
    <div className="flex h-screen min-w-[1000px] flex-col overflow-hidden bg-[#0e0e10] text-[#e5e1e4]">
      <EditorTopbar
        landingPageName={landingPage.name}
        previewStatus={previewStatus}
        previewError={previewError}
        onBack={() => navigate(`/projects/${projectId}/templates`)}
        onUndo={() => setNotice('Undo sẽ được triển khai ở task Editor tiếp theo.')}
        onRedo={() => setNotice('Redo sẽ được triển khai ở task Editor tiếp theo.')}
        onPreview={openPreviewDialog}
        onRetryPreview={retryPreview}
        onPublish={() => setNotice('Publish cần tích hợp API ở task riêng.')}
      />

      <div className="flex min-h-0 flex-1">
        <ElementsPanel
          readOnly={!isEditable}
          onAddSection={addSection}
          onMessage={setNotice}
        />
        <EditorCanvas
          sections={sections}
          previewSections={previewSections}
          selectedSectionId={selectedSectionId}
          viewport={viewport}
          zoom={zoom}
          onViewportChange={setViewport}
          onZoomChange={setZoom}
          onSelectSection={selectSection}
          onAddSection={addSection}
          onMoveSection={moveSection}
          onDuplicateSection={duplicateSection}
          onDeleteSection={deleteSection}
          onPreviewRenderError={reportPreviewRenderError}
        />
        <PropertiesPanel
          section={selectedSection}
          readOnly={!isEditable}
          onChange={updateSection}
        />
      </div>

      <StatusNotice>{notice}</StatusNotice>
      <PreviewDialog
        open={isPreviewDialogOpen}
        landingPageName={landingPage.name}
        initialDevice={viewport}
        sections={previewSections}
        status={previewStatus}
        lastUpdatedAt={lastUpdatedAt}
        error={previewError}
        onRetry={retryPreview}
        onRenderError={reportPreviewRenderError}
        onClose={closePreviewDialog}
      />
    </div>
  )
}
