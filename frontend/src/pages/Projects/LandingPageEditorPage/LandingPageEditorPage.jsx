import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  landingPagesApi,
  mapLandingPageFromApi,
  mapPublishResultFromApi,
} from '../../../api/landingPages'
import {
  mapEditorSectionToContent,
  mapPageSectionFromApi,
  pageSectionsApi,
} from '../../../api/pageSections'
import { mapTemplateFromApi } from '../../../api/templates'
import { useAuth } from '../../../context/AuthContext'
import StatusNotice from '../components/StatusNotice'
import { useProjects } from '../context/ProjectsContext'
import EditorCanvas from './components/EditorCanvas'
import EditorTopbar from './components/EditorTopbar'
import ElementsPanel from './components/ElementsPanel'
import PropertiesPanel from './components/PropertiesPanel'
import PublishSuccessModal from './components/PublishSuccessModal'
import SaveAsTemplateModal from './components/SaveAsTemplateModal'
import { createLegacyStarterSection, createSection } from './sectionPresets'

const PUBLISH_CLICK_GUARD_MS = 750

function createId() {
  return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
}

function getInitialSections(landingPage) {
  if (!landingPage) return []
  if (Array.isArray(landingPage.sections)) return landingPage.sections
  if (landingPage.sourceType === 'blank') return []
  return [createLegacyStarterSection()]
}

function getSectionContentSignature(section) {
  if (!section) return ''
  return JSON.stringify(mapEditorSectionToContent(section))
}

const LandingPageEditorPage = () => {
  const { projectId, landingPageId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    getProject,
    getLandingPage,
    updateLandingPageSections,
    isProjectsLoading,
    projectsError,
    reloadProjects,
  } = useProjects()
  const project = getProject(projectId)
  const localLandingPage = getLandingPage(projectId, landingPageId)
  const initialSections = useRef(getInitialSections(localLandingPage))
  const [sections, setSections] = useState(initialSections.current)
  const [selectedSectionId, setSelectedSectionId] = useState(
    initialSections.current[0]?.id || null,
  )
  const [viewport, setViewport] = useState('desktop')
  const [zoom, setZoom] = useState(100)
  const [notice, setNotice] = useState('')
  const [saveStatus, setSaveStatus] = useState('saved')
  const [isSaveAsTemplateOpen, setIsSaveAsTemplateOpen] = useState(false)
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState(null)
  const [saveAsTemplateError, setSaveAsTemplateError] = useState('')
  const [serverPageState, setServerPageState] = useState({
    landingPageId: null,
    status: 'idle',
    record: null,
    error: '',
  })
  const [serverPageRequestVersion, setServerPageRequestVersion] = useState(0)
  const canonicalServerSectionsRef = useRef([])
  const saveRequestInFlightRef = useRef(false)
  const templateRequestInFlightRef = useRef(false)
  const publishRequestInFlightRef = useRef(false)
  const lastPublishAttemptAtRef = useRef(0)
  const saveAsTemplateAbortRef = useRef(null)

  useEffect(
    () => () => saveAsTemplateAbortRef.current?.abort(),
    [],
  )

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 3000)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    if (!project || !localLandingPage) return undefined

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

  useEffect(() => {
    if (
      isProjectsLoading ||
      projectsError ||
      !project ||
      localLandingPage
    ) {
      return undefined
    }

    const controller = new AbortController()
    setServerPageState({
      landingPageId,
      status: 'loading-page',
      record: null,
      error: '',
    })

    const fetchServerEditor = async () => {
      try {
        const pageResponse = await landingPagesApi.get(landingPageId, {
          signal: controller.signal,
        })
        const record = mapLandingPageFromApi(pageResponse?.data?.data)

        if (!record || record.projectId !== projectId) {
          throw new Error('Invalid landing page response')
        }

        if (controller.signal.aborted) return
        setServerPageState({
          landingPageId,
          status: 'loading-sections',
          record,
          error: '',
        })

        const sectionsResponse = await pageSectionsApi.listByLandingPage(
          landingPageId,
          { signal: controller.signal },
        )
        const sectionRecords = sectionsResponse?.data?.data
        if (!Array.isArray(sectionRecords)) {
          throw new Error('Invalid page sections response')
        }

        const mappedSections = sectionRecords.map(mapPageSectionFromApi)
        if (
          mappedSections.some(
            (section) =>
              !section || section.landingPageId !== landingPageId,
          )
        ) {
          throw new Error('Invalid page sections response')
        }

        if (controller.signal.aborted) return
        canonicalServerSectionsRef.current = mappedSections
        setSections(mappedSections)
        setSelectedSectionId(mappedSections[0]?.id || null)
        setSaveStatus('saved')
        setServerPageState({
          landingPageId,
          status: 'ready',
          record,
          error: '',
        })
      } catch (error) {
        if (controller.signal.aborted || error.name === 'CanceledError') return

        setServerPageState({
          landingPageId,
          status: 'error',
          record: null,
          error:
            error?.response?.data?.error ||
            'Không tải được thông tin Landing Page. Vui lòng thử lại.',
        })
      }
    }

    fetchServerEditor()
    return () => controller.abort()
  }, [
    isProjectsLoading,
    landingPageId,
    localLandingPage,
    project,
    projectId,
    projectsError,
    serverPageRequestVersion,
  ])

  const selectedSection = useMemo(
    () => sections.find((section) => section.id === selectedSectionId) || null,
    [sections, selectedSectionId],
  )

  const markServerDirty = useCallback(() => {
    if (!localLandingPage) setSaveStatus('dirty')
  }, [localLandingPage])

  const addSection = useCallback(
    (type) => {
      const newSection = {
        ...createSection(type),
        ...(localLandingPage
          ? {}
          : {
              serverId: null,
              landingPageId,
              orderIndex: sections.length,
              isVisible: true,
            }),
      }
      setSections((currentSections) => [...currentSections, newSection])
      setSelectedSectionId(newSection.id)
      markServerDirty()
      setNotice('Đã thêm Section mới vào Landing Page.')
    },
    [landingPageId, localLandingPage, markServerDirty, sections.length],
  )

  const updateSection = useCallback(
    (updatedSection) => {
      setSections((currentSections) =>
        currentSections.map((section) =>
          section.id === updatedSection.id ? updatedSection : section,
        ),
      )
      markServerDirty()
    },
    [markServerDirty],
  )

  const moveSection = useCallback((sectionId, direction) => {
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
    markServerDirty()
  }, [markServerDirty])

  const duplicateSection = useCallback((sectionId) => {
    const currentIndex = sections.findIndex(
      (section) => section.id === sectionId,
    )
    if (currentIndex === -1) return

    const duplicatedSection = {
      ...sections[currentIndex],
      id: createId(),
      ...(localLandingPage
        ? {}
        : {
            serverId: null,
            orderIndex: currentIndex + 1,
          }),
    }
    const nextSections = [...sections]
    nextSections.splice(currentIndex + 1, 0, duplicatedSection)
    setSections(nextSections)
    setSelectedSectionId(duplicatedSection.id)
    markServerDirty()
    setNotice('Đã nhân bản Section.')
  }, [localLandingPage, markServerDirty, sections])

  const deleteSection = useCallback((sectionId) => {
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
    markServerDirty()
    setNotice('Đã xóa Section khỏi Landing Page.')
  }, [markServerDirty, sections])

  const refreshCanonicalServerSections = useCallback(async () => {
    const response = await pageSectionsApi.listByLandingPage(landingPageId)
    const records = response?.data?.data
    if (!Array.isArray(records)) {
      throw new Error('Invalid page sections response')
    }

    const mappedSections = records.map(mapPageSectionFromApi)
    if (
      mappedSections.some(
        (section) => !section || section.landingPageId !== landingPageId,
      )
    ) {
      throw new Error('Invalid page sections response')
    }

    canonicalServerSectionsRef.current = mappedSections
    setSections(mappedSections)
    setSelectedSectionId((currentId) =>
      mappedSections.some((section) => section.id === currentId)
        ? currentId
        : mappedSections[0]?.id || null,
    )
    return mappedSections
  }, [landingPageId])

  const saveServerSections = useCallback(async () => {
    if (localLandingPage || saveRequestInFlightRef.current) return false
    if (saveStatus === 'saved') return true

    saveRequestInFlightRef.current = true
    setSaveStatus('saving')
    let serverMutated = false

    try {
      const canonicalSections = canonicalServerSectionsRef.current
      const currentPersistedSections = sections.filter(
        (section) => section.serverId,
      )
      const currentPersistedIds = new Set(
        currentPersistedSections.map((section) => section.serverId),
      )
      const deletedSections = canonicalSections.filter(
        (section) => !currentPersistedIds.has(section.serverId),
      )

      for (const section of deletedSections) {
        const response = await pageSectionsApi.remove(section.serverId)
        if (response?.data?.success !== true) {
          throw new Error('Invalid delete section response')
        }
        serverMutated = true
      }

      const canonicalById = new Map(
        canonicalSections.map((section) => [section.serverId, section]),
      )
      const requiresReorder = currentPersistedSections.some(
        (section) =>
          canonicalById.get(section.serverId)?.orderIndex !==
          sections.indexOf(section),
      )

      if (requiresReorder) {
        for (const [index, section] of currentPersistedSections.entries()) {
          await pageSectionsApi.update(section.serverId, {
            content: mapEditorSectionToContent(section),
            order_index: -(index + 1),
            is_visible: section.isVisible,
          })
          serverMutated = true
        }
      } else {
        for (const section of currentPersistedSections) {
          const canonicalSection = canonicalById.get(section.serverId)
          const contentChanged =
            getSectionContentSignature(section) !==
            getSectionContentSignature(canonicalSection)
          const visibilityChanged =
            section.isVisible !== canonicalSection?.isVisible

          if (!contentChanged && !visibilityChanged) continue

          await pageSectionsApi.update(section.serverId, {
            content: mapEditorSectionToContent(section),
            is_visible: section.isVisible,
          })
          serverMutated = true
        }
      }

      for (const [index, section] of sections.entries()) {
        if (section.serverId) continue

        const response = await pageSectionsApi.create({
          landing_page_id: landingPageId,
          section_type: section.type,
          content: mapEditorSectionToContent(section),
          order_index: index,
        })
        const createdSection = mapPageSectionFromApi(response?.data?.data)
        if (!createdSection || createdSection.landingPageId !== landingPageId) {
          throw new Error('Invalid create section response')
        }
        serverMutated = true
      }

      if (requiresReorder) {
        for (const section of currentPersistedSections) {
          await pageSectionsApi.update(section.serverId, {
            order_index: sections.indexOf(section),
          })
          serverMutated = true
        }
      }

      await refreshCanonicalServerSections()
      setSaveStatus('saved')
      setNotice('Đã lưu nội dung Landing Page lên server.')
      return true
    } catch (error) {
      if (serverMutated) {
        try {
          await refreshCanonicalServerSections()
        } catch {
          // Giữ thông báo mutation gốc; lần tải lại trang sẽ lấy canonical state.
        }
      }

      setSaveStatus('error')
      setNotice(
        error?.response?.data?.error ||
          'Không thể lưu nội dung Landing Page. Vui lòng thử lại.',
      )
      return false
    } finally {
      saveRequestInFlightRef.current = false
    }
  }, [
    landingPageId,
    localLandingPage,
    refreshCanonicalServerSections,
    saveStatus,
    sections,
  ])

  const openSaveAsTemplate = useCallback(() => {
    if (
      saveRequestInFlightRef.current ||
      templateRequestInFlightRef.current ||
      publishRequestInFlightRef.current
    ) {
      return
    }
    setSaveAsTemplateError('')
    setIsSaveAsTemplateOpen(true)
  }, [])

  const closeSaveAsTemplate = useCallback(() => {
    if (templateRequestInFlightRef.current) return
    setSaveAsTemplateError('')
    setIsSaveAsTemplateOpen(false)
  }, [])

  const handleSaveAsTemplate = useCallback(
    async (name) => {
      if (
        localLandingPage ||
        templateRequestInFlightRef.current ||
        saveRequestInFlightRef.current
      ) {
        return
      }

      templateRequestInFlightRef.current = true
      setIsSavingTemplate(true)
      setSaveAsTemplateError('')

      try {
        if (saveStatus !== 'saved') {
          const pageSaved = await saveServerSections()
          if (!pageSaved) {
            setSaveAsTemplateError(
              'Không thể lưu Landing Page trước khi tạo mẫu. Vui lòng xử lý lỗi lưu rồi thử lại.',
            )
            return
          }
        }

        const controller = new AbortController()
        saveAsTemplateAbortRef.current = controller
        const response = await landingPagesApi.saveAsTemplate(
          { page_id: landingPageId, name },
          { signal: controller.signal },
        )
        const template = mapTemplateFromApi(response?.data?.data)

        if (!template || template.type !== 'user' || template.name !== name) {
          throw new Error('Invalid save-as-template response')
        }

        navigate('/templates/mine')
      } catch (error) {
        if (error.name === 'CanceledError') return

        setSaveAsTemplateError(
          error?.response?.data?.error ||
            'Không thể lưu Landing Page thành Template. Vui lòng thử lại.',
        )
      } finally {
        saveAsTemplateAbortRef.current = null
        templateRequestInFlightRef.current = false
        setIsSavingTemplate(false)
      }
    }, [
      landingPageId,
      localLandingPage,
      navigate,
      saveServerSections,
      saveStatus,
    ],
  )

  const handlePublish = useCallback(async () => {
    const now = Date.now()
    if (
      localLandingPage ||
      publishRequestInFlightRef.current ||
      saveRequestInFlightRef.current ||
      templateRequestInFlightRef.current ||
      now - lastPublishAttemptAtRef.current < PUBLISH_CLICK_GUARD_MS
    ) {
      return
    }

    lastPublishAttemptAtRef.current = now
    publishRequestInFlightRef.current = true
    setIsPublishing(true)
    setPublishResult(null)

    try {
      if (saveStatus !== 'saved') {
        const pageSaved = await saveServerSections()
        if (!pageSaved) {
          setNotice(
            'Không thể lưu Landing Page trước khi xuất bản. Publish đã dừng.',
          )
          return
        }
      }

      const response = await landingPagesApi.publish(landingPageId)
      const result = mapPublishResultFromApi(response?.data?.data)
      if (!result) {
        throw new Error('Invalid publish response')
      }

      setPublishResult(result)
      setNotice('Landing Page đã được xuất bản thành công.')
    } catch (error) {
      setNotice(
        error?.response?.data?.error ||
          'Không thể xuất bản Landing Page. Vui lòng thử lại.',
      )
    } finally {
      publishRequestInFlightRef.current = false
      setIsPublishing(false)
    }
  }, [
    landingPageId,
    localLandingPage,
    saveServerSections,
    saveStatus,
  ])

  if (isProjectsLoading) {
    return (
      <main
        className="grid min-h-screen place-items-center bg-[#0e0e10] px-4 text-white"
        aria-busy="true"
      >
        <section className="max-w-lg animate-pulse rounded-2xl border border-white/10 bg-[#201f21] p-8 text-center">
          <p className="text-sm text-[#c3c6d7]">Đang tải Project...</p>
        </section>
      </main>
    )
  }

  if (projectsError) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0e0e10] px-4 text-white">
        <section className="max-w-lg rounded-2xl border border-[#ffb4ab]/30 bg-[#201f21] p-8 text-center" role="alert">
          <h1 className="text-2xl font-semibold">Không tải được Project</h1>
          <p className="mt-3 text-sm text-[#c3c6d7]">{projectsError}</p>
          <button
            type="button"
            onClick={() => reloadProjects()}
            className="mt-6 rounded-lg bg-[#b4c5ff] px-5 py-3 font-semibold text-[#002a78]"
          >
            Thử lại
          </button>
        </section>
      </main>
    )
  }

  if (!project) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0e0e10] px-4 text-white">
        <section className="max-w-lg rounded-2xl border border-white/10 bg-[#201f21] p-8 text-center">
          <h1 className="text-3xl font-semibold">Không tìm thấy Project</h1>
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

  const currentServerPageState =
    serverPageState.landingPageId === landingPageId
      ? serverPageState
      : { status: 'idle', record: null, error: '' }

  if (!localLandingPage) {

    if (
      currentServerPageState.status === 'idle' ||
      currentServerPageState.status === 'loading-page' ||
      currentServerPageState.status === 'loading-sections'
    ) {
      return (
        <main
          className="grid min-h-screen place-items-center bg-[#0e0e10] px-4 text-white"
          aria-busy="true"
        >
          <section className="max-w-lg animate-pulse rounded-2xl border border-white/10 bg-[#201f21] p-8 text-center">
            <p className="text-sm text-[#c3c6d7]">
              {currentServerPageState.status === 'loading-sections'
                ? 'Đang tải nội dung Section...'
                : 'Đang tải Landing Page...'}
            </p>
          </section>
        </main>
      )
    }

    if (currentServerPageState.status === 'error') {
      return (
        <main className="grid min-h-screen place-items-center bg-[#0e0e10] px-4 text-white">
          <section
            className="max-w-lg rounded-2xl border border-[#ffb4ab]/30 bg-[#201f21] p-8 text-center"
            role="alert"
          >
            <h1 className="text-2xl font-semibold">
              Không tải được Landing Page
            </h1>
            <p className="mt-3 text-sm text-[#c3c6d7]">
              {currentServerPageState.error}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setServerPageRequestVersion((version) => version + 1)
                }
                className="rounded-lg bg-[#b4c5ff] px-5 py-3 font-semibold text-[#002a78]"
              >
                Thử lại
              </button>
              <button
                type="button"
                onClick={() => navigate(`/projects/${projectId}`)}
                className="rounded-lg border border-white/15 px-5 py-3 text-[#c3c6d7]"
              >
                Quay lại Project
              </button>
            </div>
          </section>
        </main>
      )
    }
  }

  const editorLandingPage =
    localLandingPage || currentServerPageState.record

  return (
    <div className="flex h-screen min-w-[1000px] flex-col overflow-hidden bg-[#0e0e10] text-[#e5e1e4]">
      <EditorTopbar
        landingPageName={editorLandingPage.name}
        planType={user?.plan_type}
        saveStatus={saveStatus}
        onBack={() =>
          navigate(
            localLandingPage
              ? `/projects/${projectId}/templates`
              : `/projects/${projectId}`,
          )
        }
        onSave={localLandingPage ? null : saveServerSections}
        onSaveAsTemplate={localLandingPage ? null : openSaveAsTemplate}
        onUndo={() => setNotice('Undo sẽ được triển khai ở task Editor tiếp theo.')}
        onRedo={() => setNotice('Redo sẽ được triển khai ở task Editor tiếp theo.')}
        onPreview={() => setNotice('Preview sẽ được triển khai ở task tiếp theo.')}
        onPublish={localLandingPage ? null : handlePublish}
        publishing={isPublishing}
      />

      <div className="flex min-h-0 flex-1">
        <ElementsPanel onAddSection={addSection} onMessage={setNotice} />
        <EditorCanvas
          sections={sections}
          selectedSectionId={selectedSectionId}
          viewport={viewport}
          zoom={zoom}
          onViewportChange={setViewport}
          onZoomChange={setZoom}
          onSelectSection={setSelectedSectionId}
          onAddSection={addSection}
          onMoveSection={moveSection}
          onDuplicateSection={duplicateSection}
          onDeleteSection={deleteSection}
        />
        <PropertiesPanel section={selectedSection} onChange={updateSection} />
      </div>

      <StatusNotice>{notice}</StatusNotice>
      <PublishSuccessModal
        result={publishResult}
        onClose={() => setPublishResult(null)}
      />
      <SaveAsTemplateModal
        open={isSaveAsTemplateOpen}
        initialName={editorLandingPage.name}
        submitting={isSavingTemplate}
        serverError={saveAsTemplateError}
        onClose={closeSaveAsTemplate}
        onSubmit={handleSaveAsTemplate}
        onErrorClear={() => setSaveAsTemplateError('')}
      />
    </div>
  )
}

export default LandingPageEditorPage
