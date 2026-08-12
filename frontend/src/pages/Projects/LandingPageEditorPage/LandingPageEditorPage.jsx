import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  landingPagesApi,
  mapLandingPageFromApi,
} from '../../../api/landingPages'
import StatusNotice from '../components/StatusNotice'
import { useProjects } from '../context/ProjectsContext'
import EditorCanvas from './components/EditorCanvas'
import EditorTopbar from './components/EditorTopbar'
import ElementsPanel from './components/ElementsPanel'
import PropertiesPanel from './components/PropertiesPanel'
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

export default function LandingPageEditorPage() {
  const { projectId, landingPageId } = useParams()
  const navigate = useNavigate()
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
  const [serverPageState, setServerPageState] = useState({
    landingPageId: null,
    status: 'idle',
    record: null,
    error: '',
  })
  const [serverPageRequestVersion, setServerPageRequestVersion] = useState(0)

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
      status: 'loading',
      record: null,
      error: '',
    })

    const fetchServerLandingPage = async () => {
      try {
        const response = await landingPagesApi.get(landingPageId, {
          signal: controller.signal,
        })
        const record = mapLandingPageFromApi(response?.data?.data)

        if (!record || record.projectId !== projectId) {
          throw new Error('Invalid landing page response')
        }

        if (controller.signal.aborted) return
        setServerPageState({
          landingPageId,
          status: 'success',
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

    fetchServerLandingPage()
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

  const addSection = useCallback((type) => {
    const newSection = createSection(type)
    setSections((currentSections) => [...currentSections, newSection])
    setSelectedSectionId(newSection.id)
    setNotice('Đã thêm Section mới vào Landing Page.')
  }, [])

  const updateSection = useCallback((updatedSection) => {
    setSections((currentSections) =>
      currentSections.map((section) =>
        section.id === updatedSection.id ? updatedSection : section,
      ),
    )
  }, [])

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
  }, [])

  const duplicateSection = useCallback((sectionId) => {
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
  }, [sections])

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
    setNotice('Đã xóa Section khỏi Landing Page.')
  }, [sections])

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

  if (!localLandingPage) {
    const currentServerPageState =
      serverPageState.landingPageId === landingPageId
        ? serverPageState
        : { status: 'idle', record: null, error: '' }

    if (
      currentServerPageState.status === 'idle' ||
      currentServerPageState.status === 'loading'
    ) {
      return (
        <main
          className="grid min-h-screen place-items-center bg-[#0e0e10] px-4 text-white"
          aria-busy="true"
        >
          <section className="max-w-lg animate-pulse rounded-2xl border border-white/10 bg-[#201f21] p-8 text-center">
            <p className="text-sm text-[#c3c6d7]">
              Đang tải Landing Page...
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

    return (
      <main className="grid min-h-screen place-items-center bg-[#0e0e10] px-4 text-white">
        <section className="max-w-xl rounded-2xl border border-[#b4c5ff]/30 bg-[#201f21] p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#b4c5ff]">
            Landing Page trên server
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            {currentServerPageState.record.name}
          </h1>
          <p className="mt-4 leading-7 text-[#c3c6d7]">
            Landing Page này đã tồn tại trên Backend. Phần nội dung và Section
            của Editor chưa được tích hợp API trong PJ-FE-2A, nên chưa thể mở
            để chỉnh sửa an toàn.
          </p>
          <button
            type="button"
            onClick={() => navigate(`/projects/${projectId}`)}
            className="mt-7 rounded-lg bg-[#b4c5ff] px-5 py-3 font-semibold text-[#002a78]"
          >
            Quay lại Project
          </button>
        </section>
      </main>
    )
  }

  return (
    <div className="flex h-screen min-w-[1000px] flex-col overflow-hidden bg-[#0e0e10] text-[#e5e1e4]">
      <EditorTopbar
        landingPageName={localLandingPage.name}
        saveStatus={saveStatus}
        onBack={() => navigate(`/projects/${projectId}/templates`)}
        onUndo={() => setNotice('Undo sẽ được triển khai ở task Editor tiếp theo.')}
        onRedo={() => setNotice('Redo sẽ được triển khai ở task Editor tiếp theo.')}
        onPreview={() => setNotice('Preview sẽ được triển khai ở task tiếp theo.')}
        onPublish={() => setNotice('Publish cần tích hợp API ở task riêng.')}
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
    </div>
  )
}
