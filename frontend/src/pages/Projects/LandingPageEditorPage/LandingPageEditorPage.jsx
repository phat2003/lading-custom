import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  landingPagesApi,
  mapLandingPageFromApi,
  mapPublishResultFromApi,
  resolveLandingPagePublicUrl,
} from '../../../api/landingPages'
import {
  mapPageSectionRecordFromApi,
  pageSectionsApi,
} from '../../../api/pageSections'
import {
  mapSectionTemplateFromApi,
  sectionsApi,
} from '../../../api/sections'
import { mapTemplateFromApi } from '../../../api/templates'
import { mapMediaAssetFromApi, mediaApi } from '../../../api/media'
import BuilderWorkspace from '../../../components/builder/BuilderWorkspace'
import { ListIcon } from '../../../components/icons'
import {
  cloneLibraryBlock,
  normalizeSectionTemplateLibrary,
} from '../../../components/builder/sectionLibrary'
import { useBuilderController } from '../../../components/builder/useBuilderController'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import StatusNotice from '../components/StatusNotice'
import { useProjects } from '../context/ProjectsContext'
import EditorTopbar from './components/EditorTopbar'
import CtaLinkControls from './components/CtaLinkControls'
import CurrentSectionControls from './components/CurrentSectionControls'
import PublishSuccessModal from './components/PublishSuccessModal'
import SaveAsTemplateModal from './components/SaveAsTemplateModal'
import SectionListPanel from './components/SectionListPanel'
import {
  builderElementsToPageSections,
  pageSectionSignature,
  pageSectionsToBuilderElements,
} from './landingPageBuilderAdapter'
import { getSectionAnchorId } from './ctaLinks'
import {
  getOrderedSectionRoots,
  getSectionDisplayNames,
  insertSectionGraphAt,
  moveSectionByOffset,
  reorderSectionAt,
} from './sectionManagement'
import {
  getUserImageValidationError,
  USER_IMAGE_ACCEPT,
} from './imageUpload'

const PUBLISH_CLICK_GUARD_MS = 750
const INITIAL_TARGET_PAGES_STATE = {
  projectId: null,
  status: 'idle',
  items: [],
  error: '',
}
const BUILDER_SETTINGS = {
  desktopWidth: 896,
  mobileWidth: 390,
  fontFamily: 'Inter',
  bgColor: '#ffffff',
  bgImage: '',
  direction: 'ltr',
}

const apiErrorMessage = (error, fallback) => error?.response?.data?.error || fallback

const localSectionsToRecords = (sections = []) =>
  sections.map((section, index) => ({
    serverId: null,
    landingPageId: null,
    sectionType: section.sectionType || section.type || 'custom',
    content:
      section.content?.elements && Array.isArray(section.content.elements)
        ? section.content
        : Array.isArray(section.elements)
          ? { elements: section.elements }
          : section,
    orderIndex: index,
    isVisible: section.isVisible !== false,
  }))

const EditorLoadingState = ({ children }) => (
  <main
    className="app-theme grid min-h-screen place-items-center bg-[var(--bd-app)] px-4 text-[var(--bd-text)]"
    aria-busy="true"
  >
    <section className="max-w-lg animate-pulse rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel)] p-8 text-center">
      <p className="text-sm text-[var(--bd-dim)]">{children}</p>
    </section>
  </main>
)

const LandingPageEditorPage = () => {
  const { projectId, landingPageId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
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

  const [notice, setNotice] = useState('')
  const [saveStatus, setSaveStatus] = useState('saved')
  const [library, setLibrary] = useState([])
  const [libraryStatus, setLibraryStatus] = useState('loading')
  const [libraryError, setLibraryError] = useState('')
  const [libraryInvalidCount, setLibraryInvalidCount] = useState(0)
  const [libraryRequestVersion, setLibraryRequestVersion] = useState(0)
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
  const [targetPagesRequestVersion, setTargetPagesRequestVersion] = useState(0)
  const [targetPagesState, setTargetPagesState] = useState(
    INITIAL_TARGET_PAGES_STATE,
  )

  const canonicalServerSectionsRef = useRef([])
  const localHydratedIdRef = useRef(null)
  const saveRequestInFlightRef = useRef(false)
  const templateRequestInFlightRef = useRef(false)
  const publishRequestInFlightRef = useRef(false)
  const lastPublishAttemptAtRef = useRef(0)
  const saveAsTemplateAbortRef = useRef(null)

  const markBuilderDirty = useCallback(() => {
    setSaveStatus(localLandingPage ? 'saving' : 'dirty')
  }, [localLandingPage])

  const builder = useBuilderController({
    initialElements: [],
    initialPanel: 'sections',
    settings: BUILDER_SETTINGS,
    onMutate: markBuilderDirty,
  })
  const {
    addBlock,
    replaceElements,
    setSelectedId,
    transformElements,
  } = builder

  const sectionRoots = useMemo(
    () => getOrderedSectionRoots(builder.viewElements),
    [builder.viewElements],
  )
  const sectionDisplayNames = useMemo(
    () => getSectionDisplayNames(sectionRoots),
    [sectionRoots],
  )
  const selectedSectionIndex = builder.selected
    ? sectionRoots.findIndex((section) => section.id === builder.selected.id)
    : -1

  const handleMoveSection = useCallback(
    (sectionId, offset) => {
      transformElements((elements) => moveSectionByOffset(elements, sectionId, offset))
    },
    [transformElements],
  )

  const handleReorderSection = useCallback(
    (sectionId, targetId, placement) => {
      transformElements((elements) =>
        reorderSectionAt(elements, sectionId, targetId, placement),
      )
    },
    [transformElements],
  )

  const handleAddBuilderBlock = useCallback(
    (blockDefinition, x, y) => {
      // Block dựng sẵn giữ interaction shared hiện tại. Section Template API dùng
      // document-order semantics của User để Canvas/List/persistence luôn đồng bộ.
      if (!blockDefinition?.section?.sourceSectionTemplateId) {
        addBlock(blockDefinition, x, y)
        return
      }

      const sectionWidth = blockDefinition.section.style?.width || 820
      const centeredX = Math.max(
        0,
        (BUILDER_SETTINGS.desktopWidth - sectionWidth) / 2,
      )
      const graph = cloneLibraryBlock(blockDefinition, { x: centeredX, y })
      const root = graph.find(
        (element) => element.type === 'section' && !element.parentId,
      )
      if (!root) return

      const inserted = transformElements((elements) =>
        insertSectionGraphAt(elements, graph, y),
      )
      if (inserted) setSelectedId(root.id)
    },
    [addBlock, setSelectedId, transformElements],
  )

  const handleUploadUserImage = useCallback(async (file) => {
    const validationError = getUserImageValidationError(file)
    if (validationError) throw new Error(validationError)

    try {
      const response = await mediaApi.uploadUserImage(file)
      const asset = mapMediaAssetFromApi(response?.data?.data)
      if (!asset) throw new Error('Invalid user media response')
      return asset.fileUrl
    } catch (error) {
      throw new Error(
        apiErrorMessage(error, 'Không thể tải ảnh lên. Vui lòng thử lại.'),
      )
    }
  }, [])

  const getUserElementDomId = useCallback(
    (element) =>
      element.type === 'section' && !element.parentId
        ? getSectionAnchorId(element.id)
        : undefined,
    [],
  )

  const handleNavigateToSection = useCallback((sectionId) => {
    document
      .getElementById(getSectionAnchorId(sectionId))
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleNavigateToLandingPage = useCallback((targetLandingPage) => {
    if (!targetLandingPage.publicUrl) return
    window.open(targetLandingPage.publicUrl, '_blank', 'noopener,noreferrer')
  }, [])

  useEffect(
    () => () => saveAsTemplateAbortRef.current?.abort(),
    [],
  )

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 3500)
    return () => window.clearTimeout(timer)
  }, [notice])

  // Section Template Library dùng route user-authenticated, không dùng Admin CRUD.
  useEffect(() => {
    const controller = new AbortController()
    setLibraryStatus('loading')
    setLibraryError('')
    sectionsApi
      .listAll(undefined, { signal: controller.signal })
      .then((response) => {
        const data = response?.data?.data
        if (!Array.isArray(data)) throw new Error('Invalid section template response')
        const normalized = normalizeSectionTemplateLibrary(
          data.map(mapSectionTemplateFromApi),
        )
        if (controller.signal.aborted) return
        setLibrary(normalized.variants)
        setLibraryInvalidCount(normalized.invalidCount)
        setLibraryStatus('ready')
      })
      .catch((error) => {
        if (controller.signal.aborted || error.name === 'CanceledError') return
        setLibrary([])
        setLibraryInvalidCount(0)
        setLibraryError(
          apiErrorMessage(error, 'Không thể tải Section Template.'),
        )
        setLibraryStatus('error')
      })
    return () => controller.abort()
  }, [libraryRequestVersion])

  useEffect(() => {
    if (isProjectsLoading || projectsError || !project) return undefined

    const controller = new AbortController()
    setTargetPagesState({
      projectId,
      status: 'loading',
      items: [],
      error: '',
    })

    landingPagesApi
      .listByProject(projectId, { signal: controller.signal })
      .then((response) => {
        const data = response?.data?.data
        if (!Array.isArray(data)) throw new Error('Invalid landing pages response')

        const mapped = data.map(mapLandingPageFromApi)
        if (
          mapped.some(
            (landingPage) =>
              !landingPage || landingPage.projectId !== projectId,
          )
        ) {
          throw new Error('Invalid landing pages response')
        }

        if (controller.signal.aborted) return
        setTargetPagesState({
          projectId,
          status: 'ready',
          items: mapped
            .filter((landingPage) => landingPage.id !== landingPageId)
            .map((landingPage) => ({
              ...landingPage,
              publicUrl: resolveLandingPagePublicUrl(landingPage),
            })),
          error: '',
        })
      })
      .catch((error) => {
        if (controller.signal.aborted || error.name === 'CanceledError') return
        setTargetPagesState({
          projectId,
          status: 'error',
          items: [],
          error: apiErrorMessage(
            error,
            'Không tải được danh sách Landing Page trong Project.',
          ),
        })
      })

    return () => controller.abort()
  }, [
    isProjectsLoading,
    landingPageId,
    project,
    projectId,
    projectsError,
    targetPagesRequestVersion,
  ])

  // Tương thích cache prototype cũ; không gọi API hoặc tự mutate dữ liệu server.
  useEffect(() => {
    if (!localLandingPage || localHydratedIdRef.current === landingPageId) return
    localHydratedIdRef.current = landingPageId
    replaceElements(
      pageSectionsToBuilderElements(localSectionsToRecords(localLandingPage.sections || [])),
    )
    setSaveStatus('saved')
  }, [landingPageId, localLandingPage, replaceElements])

  useEffect(() => {
    if (!localLandingPage || saveStatus !== 'saving') return undefined
    const timer = window.setTimeout(() => {
      const records = builderElementsToPageSections(builder.elements, landingPageId)
      updateLandingPageSections(
        projectId,
        landingPageId,
        records.map((record) => ({
          id: record.content.elements[0]?.id,
          type: record.sectionType,
          sectionType: record.sectionType,
          content: record.content,
          isVisible: record.isVisible,
        })),
      )
      setSaveStatus('saved')
    }, 350)
    return () => window.clearTimeout(timer)
  }, [
    builder.elements,
    landingPageId,
    localLandingPage,
    projectId,
    saveStatus,
    updateLandingPageSections,
  ])

  useEffect(() => {
    if (isProjectsLoading || projectsError || !project || localLandingPage) return undefined

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

        const sectionsResponse = await pageSectionsApi.listByLandingPage(landingPageId, {
          signal: controller.signal,
        })
        const sectionData = sectionsResponse?.data?.data
        if (!Array.isArray(sectionData)) throw new Error('Invalid page sections response')

        const records = sectionData.map(mapPageSectionRecordFromApi)
        if (
          records.some(
            (section) => !section || section.landingPageId !== landingPageId,
          )
        ) {
          throw new Error('Invalid page sections response')
        }

        if (controller.signal.aborted) return
        canonicalServerSectionsRef.current = records
        replaceElements(pageSectionsToBuilderElements(records))
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
          error: apiErrorMessage(
            error,
            'Không tải được thông tin Landing Page. Vui lòng thử lại.',
          ),
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
    replaceElements,
    serverPageRequestVersion,
  ])

  const refreshCanonicalServerSections = useCallback(async () => {
    const response = await pageSectionsApi.listByLandingPage(landingPageId)
    const data = response?.data?.data
    if (!Array.isArray(data)) throw new Error('Invalid page sections response')
    const records = data.map(mapPageSectionRecordFromApi)
    if (
      records.some(
        (section) => !section || section.landingPageId !== landingPageId,
      )
    ) {
      throw new Error('Invalid page sections response')
    }
    canonicalServerSectionsRef.current = records
    replaceElements(pageSectionsToBuilderElements(records))
    return records
  }, [landingPageId, replaceElements])

  const saveServerSections = useCallback(async () => {
    if (localLandingPage || saveRequestInFlightRef.current) return false
    if (saveStatus === 'saved') return true

    saveRequestInFlightRef.current = true
    setSaveStatus('saving')
    let serverMutated = false

    try {
      const canonical = canonicalServerSectionsRef.current
      const current = builderElementsToPageSections(builder.elements, landingPageId)
      const persisted = current.filter((section) => section.serverId)
      const persistedIds = new Set(persisted.map((section) => section.serverId))
      const deleted = canonical.filter((section) => !persistedIds.has(section.serverId))

      for (const section of deleted) {
        const response = await pageSectionsApi.remove(section.serverId)
        if (response?.data?.success !== true) throw new Error('Invalid delete section response')
        serverMutated = true
      }

      const canonicalById = new Map(canonical.map((section) => [section.serverId, section]))
      const requiresReorder = persisted.some(
        (section) => canonicalById.get(section.serverId)?.orderIndex !== section.orderIndex,
      )

      if (requiresReorder) {
        // Hai lượt order tránh unique collision; retry sau Project creation không liên quan flow này.
        for (const [index, section] of persisted.entries()) {
          await pageSectionsApi.update(section.serverId, {
            content: section.content,
            order_index: -(index + 1),
            is_visible: section.isVisible,
          })
          serverMutated = true
        }
      } else {
        for (const section of persisted) {
          const canonicalSection = canonicalById.get(section.serverId)
          const changed =
            pageSectionSignature(section) !== pageSectionSignature(canonicalSection)
          if (!changed) continue
          await pageSectionsApi.update(section.serverId, {
            content: section.content,
            is_visible: section.isVisible,
          })
          serverMutated = true
        }
      }

      for (const section of current) {
        if (section.serverId) continue
        const response = await pageSectionsApi.create({
          landing_page_id: landingPageId,
          section_type: section.sectionType,
          content: section.content,
          order_index: section.orderIndex,
        })
        const created = mapPageSectionRecordFromApi(response?.data?.data)
        if (!created || created.landingPageId !== landingPageId) {
          throw new Error('Invalid create section response')
        }
        serverMutated = true
      }

      if (requiresReorder) {
        for (const section of persisted) {
          await pageSectionsApi.update(section.serverId, {
            order_index: section.orderIndex,
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
          // Giữ lỗi mutation gốc; reload trang sẽ lấy lại canonical state.
        }
      }
      setSaveStatus('error')
      setNotice(
        apiErrorMessage(
          error,
          'Không thể lưu nội dung Landing Page. Vui lòng thử lại.',
        ),
      )
      return false
    } finally {
      saveRequestInFlightRef.current = false
    }
  }, [
    builder.elements,
    landingPageId,
    localLandingPage,
    refreshCanonicalServerSections,
    saveStatus,
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
          const saved = await saveServerSections()
          if (!saved) {
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
          apiErrorMessage(
            error,
            'Không thể lưu Landing Page thành Template. Vui lòng thử lại.',
          ),
        )
      } finally {
        saveAsTemplateAbortRef.current = null
        templateRequestInFlightRef.current = false
        setIsSavingTemplate(false)
      }
    },
    [
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
        const saved = await saveServerSections()
        if (!saved) {
          setNotice('Không thể lưu Landing Page trước khi xuất bản. Publish đã dừng.')
          return
        }
      }

      const response = await landingPagesApi.publish(landingPageId)
      const result = mapPublishResultFromApi(response?.data?.data)
      if (!result) throw new Error('Invalid publish response')
      setPublishResult(result)
      setNotice('Landing Page đã được xuất bản thành công.')
    } catch (error) {
      setNotice(
        apiErrorMessage(
          error,
          'Không thể xuất bản Landing Page. Vui lòng thử lại.',
        ),
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

  if (isProjectsLoading) return <EditorLoadingState>Đang tải Project...</EditorLoadingState>

  if (projectsError) {
    return (
      <main
        data-mode={theme}
        className="app-theme grid min-h-screen place-items-center bg-[var(--bd-app)] px-4 text-[var(--bd-text)]"
      >
        <section className="max-w-lg rounded-2xl border border-rose-400/30 bg-[var(--bd-panel)] p-8 text-center" role="alert">
          <h1 className="text-2xl font-semibold">Không tải được Project</h1>
          <p className="mt-3 text-sm text-[var(--bd-dim)]">{projectsError}</p>
          <button
            type="button"
            onClick={() => reloadProjects()}
            className="mt-6 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white"
          >
            Thử lại
          </button>
        </section>
      </main>
    )
  }

  if (!project) {
    return (
      <main
        data-mode={theme}
        className="app-theme grid min-h-screen place-items-center bg-[var(--bd-app)] px-4 text-[var(--bd-text)]"
      >
        <section className="max-w-lg rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel)] p-8 text-center">
          <h1 className="text-3xl font-semibold">Không tìm thấy Project</h1>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="mt-6 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white"
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
        <EditorLoadingState>
          {currentServerPageState.status === 'loading-sections'
            ? 'Đang tải nội dung Section...'
            : 'Đang tải Landing Page...'}
        </EditorLoadingState>
      )
    }

    if (currentServerPageState.status === 'error') {
      return (
        <main
          data-mode={theme}
          className="app-theme grid min-h-screen place-items-center bg-[var(--bd-app)] px-4 text-[var(--bd-text)]"
        >
          <section className="max-w-lg rounded-2xl border border-rose-400/30 bg-[var(--bd-panel)] p-8 text-center" role="alert">
            <h1 className="text-2xl font-semibold">Không tải được Landing Page</h1>
            <p className="mt-3 text-sm text-[var(--bd-dim)]">
              {currentServerPageState.error}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setServerPageRequestVersion((version) => version + 1)}
                className="rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white"
              >
                Thử lại
              </button>
              <button
                type="button"
                onClick={() => navigate(`/projects/${projectId}`)}
                className="rounded-xl border border-[var(--bd-border)] px-5 py-3 text-[var(--bd-dim)]"
              >
                Quay lại Project
              </button>
            </div>
          </section>
        </main>
      )
    }
  }

  const editorLandingPage = localLandingPage || currentServerPageState.record
  const libraryEmptyMessage = 'Chưa có Section Template nào.'

  return (
    <div
      data-mode={theme}
      className="app-theme flex h-screen min-w-[1000px] flex-col overflow-hidden bg-[var(--bd-app)] text-[var(--bd-text)]"
    >
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
        onUndo={builder.undo}
        onRedo={builder.redo}
        canUndo={builder.canUndo}
        canRedo={builder.canRedo}
        onPreview={() => setNotice('Preview sẽ được triển khai ở task tiếp theo.')}
        onPublish={localLandingPage ? null : handlePublish}
        publishing={isPublishing}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <BuilderWorkspace
        controller={builder}
        settings={BUILDER_SETTINGS}
        library={library}
        libraryStatus={libraryStatus}
        libraryError={libraryError}
        libraryInvalidCount={libraryInvalidCount}
        libraryEmptyMessage={libraryEmptyMessage}
        onRetryLibrary={() =>
          setLibraryRequestVersion((version) => version + 1)
        }
        enableLibraryHoverPreview
        onAddBlock={handleAddBuilderBlock}
        additionalRailItems={[{ key: 'sections', icon: ListIcon, label: 'Sections' }]}
        additionalPanels={{
          sections: (
            <SectionListPanel
              elements={builder.viewElements}
              selectedId={builder.selectedId}
              onSelect={builder.setSelectedId}
              onReorder={handleReorderSection}
            />
          ),
        }}
        getElementDomId={getUserElementDomId}
        propertiesPanelProps={{
          onUploadImage: handleUploadUserImage,
          imageUploadAccept: USER_IMAGE_ACCEPT,
          ...(builder.selected?.type === 'section'
            ? {
                title: 'Current Section',
                showDeleteButton: false,
                beforeContent: (
                  <CurrentSectionControls
                    section={builder.selected}
                    displayName={sectionDisplayNames.get(builder.selected.id)}
                    isFirst={selectedSectionIndex === 0}
                    isLast={selectedSectionIndex === sectionRoots.length - 1}
                    onUpdate={builder.updateElement}
                    onMoveUp={() => handleMoveSection(builder.selected.id, -1)}
                    onMoveDown={() => handleMoveSection(builder.selected.id, 1)}
                    onDelete={() => builder.deleteElement(builder.selected.id)}
                  />
                ),
              }
            : builder.selected?.type === 'button'
              ? {
                  title: 'CTA / Button',
                  beforeContent: (
                    <CtaLinkControls
                      button={builder.selected}
                      sections={sectionRoots}
                      sectionDisplayNames={sectionDisplayNames}
                      landingPages={
                        targetPagesState.projectId === projectId
                          ? targetPagesState.items
                          : []
                      }
                      landingPagesStatus={
                        targetPagesState.projectId === projectId
                          ? targetPagesState.status
                          : 'loading'
                      }
                      landingPagesError={targetPagesState.error}
                      onUpdate={builder.updateElement}
                      onNavigateToSection={handleNavigateToSection}
                      onNavigateToLandingPage={handleNavigateToLandingPage}
                      onRetryLandingPages={() =>
                        setTargetPagesRequestVersion((version) => version + 1)
                      }
                    />
                  ),
                }
              : {})
        }}
      />

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
