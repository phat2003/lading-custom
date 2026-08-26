import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  landingPagesApi,
  mapLandingPageFromApi,
} from '../../../api/landingPages'
import { useAuth } from '../../../context/AuthContext'
import ProjectMobileHeader from '../components/ProjectMobileHeader'
import ProjectSidebar from '../components/ProjectSidebar'
import StatusNotice from '../components/StatusNotice'
import { useProjects } from '../context/ProjectsContext'
import DeleteLandingPageModal from './components/DeleteLandingPageModal'
import LandingPageCard from './components/LandingPageCard'
import RenameLandingPageModal from './components/RenameLandingPageModal'

const INITIAL_PAGE_STATE = {
  projectId: null,
  status: 'idle',
  items: [],
  error: '',
}

const ProjectDetailPage = () => {
  const { user } = useAuth()
  const { projectId } = useParams()
  const navigate = useNavigate()
  const {
    getProject,
    isProjectsLoading,
    projectsError,
    reloadProjects,
  } = useProjects()
  const project = getProject(projectId)
  const [pageState, setPageState] = useState(INITIAL_PAGE_STATE)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [renameLandingPage, setRenameLandingPage] = useState(null)
  const [deleteLandingPage, setDeleteLandingPage] = useState(null)
  const [renameError, setRenameError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [isRenaming, setIsRenaming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const requestIdRef = useRef(0)
  const requestControllerRef = useRef(null)
  const renameRequestInFlightRef = useRef(false)
  const deleteRequestInFlightRef = useRef(false)

  const fetchLandingPages = useCallback(
    async (signal) => {
      const requestId = requestIdRef.current + 1
      requestIdRef.current = requestId
      setPageState({
        projectId,
        status: 'loading',
        items: [],
        error: '',
      })

      try {
        const response = await landingPagesApi.listByProject(projectId, {
          signal,
        })
        const records = response?.data?.data
        if (!Array.isArray(records)) {
          throw new Error('Invalid landing pages response')
        }

        const items = records.map(mapLandingPageFromApi)
        if (
          items.some(
            (landingPage) =>
              !landingPage || landingPage.projectId !== projectId,
          )
        ) {
          throw new Error('Invalid landing pages response')
        }

        if (requestId !== requestIdRef.current || signal?.aborted) return
        setPageState({ projectId, status: 'success', items, error: '' })
      } catch (error) {
        if (
          requestId !== requestIdRef.current ||
          signal?.aborted ||
          error.name === 'CanceledError'
        ) {
          return
        }

        setPageState({
          projectId,
          status: 'error',
          items: [],
          error:
            error?.response?.data?.error ||
            'Không tải được danh sách Landing Page. Vui lòng thử lại.',
        })
      }
    },
    [projectId],
  )

  const reloadLandingPages = useCallback(() => {
    requestControllerRef.current?.abort()
    const controller = new AbortController()
    requestControllerRef.current = controller
    fetchLandingPages(controller.signal)
  }, [fetchLandingPages])

  useEffect(() => {
    if (isProjectsLoading || projectsError || !project) {
      requestControllerRef.current?.abort()
      requestIdRef.current += 1
      return undefined
    }

    reloadLandingPages()
    return () => {
      requestControllerRef.current?.abort()
      requestIdRef.current += 1
    }
  }, [isProjectsLoading, project, projectsError, reloadLandingPages])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 3000)
    return () => window.clearTimeout(timer)
  }, [notice])

  const showMessage = (message) => {
    setNotice(message)
    setIsMobileMenuOpen(false)
  }

  const openRenameModal = (landingPage) => {
    setRenameError('')
    setRenameLandingPage(landingPage)
  }

  const closeRenameModal = () => {
    if (renameRequestInFlightRef.current) return
    setRenameError('')
    setRenameLandingPage(null)
  }

  const handleRenameLandingPage = async (name) => {
    if (renameRequestInFlightRef.current || !renameLandingPage) return

    renameRequestInFlightRef.current = true
    setIsRenaming(true)
    setRenameError('')

    try {
      const response = await landingPagesApi.update(renameLandingPage.id, {
        name,
      })
      const updatedLandingPage = mapLandingPageFromApi(response?.data?.data)

      if (
        !updatedLandingPage ||
        updatedLandingPage.id !== renameLandingPage.id ||
        updatedLandingPage.projectId !== projectId
      ) {
        throw new Error('Invalid landing page response')
      }

      setPageState((currentState) => ({
        ...currentState,
        items: currentState.items.map((landingPage) =>
          landingPage.id === updatedLandingPage.id
            ? updatedLandingPage
            : landingPage,
        ),
      }))
      setRenameLandingPage(null)
      setNotice(`Đã đổi tên Landing Page thành “${updatedLandingPage.name}”.`)
    } catch (error) {
      setRenameError(
        error?.response?.data?.error ||
          'Không thể đổi tên Landing Page. Vui lòng thử lại.',
      )
    } finally {
      renameRequestInFlightRef.current = false
      setIsRenaming(false)
    }
  }

  const openDeleteModal = (landingPage) => {
    setDeleteError('')
    setDeleteLandingPage(landingPage)
  }

  const closeDeleteModal = () => {
    if (deleteRequestInFlightRef.current) return
    setDeleteError('')
    setDeleteLandingPage(null)
  }

  const handleDeleteLandingPage = async () => {
    if (deleteRequestInFlightRef.current || !deleteLandingPage) return

    const landingPageToDelete = deleteLandingPage
    deleteRequestInFlightRef.current = true
    setIsDeleting(true)
    setDeleteError('')

    try {
      const response = await landingPagesApi.remove(landingPageToDelete.id)
      if (response?.data?.success !== true) {
        throw new Error('Invalid delete landing page response')
      }

      setPageState((currentState) => ({
        ...currentState,
        items: currentState.items.filter(
          (landingPage) => landingPage.id !== landingPageToDelete.id,
        ),
      }))
      setDeleteLandingPage(null)
      setNotice(`Đã xóa Landing Page “${landingPageToDelete.name}”.`)
    } catch (error) {
      setDeleteError(
        error?.response?.data?.error ||
          'Không thể xóa Landing Page. Vui lòng thử lại.',
      )
    } finally {
      deleteRequestInFlightRef.current = false
      setIsDeleting(false)
    }
  }

  if (isProjectsLoading) {
    return (
      <main
        className="grid min-h-screen place-items-center bg-[var(--bd-fill)] px-4 text-[var(--bd-text)]"
        aria-busy="true"
      >
        <section className="w-full max-w-lg animate-pulse rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] p-8 text-center">
          <p className="text-sm text-[var(--bd-dim)]">Đang tải Project...</p>
        </section>
      </main>
    )
  }

  if (projectsError) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--bd-fill)] px-4 text-[var(--bd-text)]">
        <section
          className="w-full max-w-lg rounded-2xl border border-red-400/30 bg-[var(--bd-panel-solid)] p-8 text-center"
          role="alert"
        >
          <h1 className="text-2xl font-semibold text-[var(--bd-text)]">
            Không tải được Project
          </h1>
          <p className="mt-3 text-sm text-[var(--bd-dim)]">{projectsError}</p>
          <button
            type="button"
            onClick={() => reloadProjects()}
            className="mt-6 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 font-semibold text-white"
          >
            Thử lại
          </button>
        </section>
      </main>
    )
  }

  if (!project) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--bd-fill)] px-4 text-[var(--bd-text)]">
        <section className="w-full max-w-lg rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--bd-danger)]">
            Project not found
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--bd-text)]">
            Không tìm thấy Project
          </h1>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="mt-6 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 font-semibold text-white"
          >
            Quay lại My Project
          </button>
        </section>
      </main>
    )
  }

  const currentPageState =
    pageState.projectId === projectId ? pageState : INITIAL_PAGE_STATE
  const isLoadingLandingPages =
    currentPageState.status === 'idle' || currentPageState.status === 'loading'

  return (
    <div className="min-h-screen bg-[var(--bd-fill)] text-[var(--bd-text)]">
      <ProjectSidebar
        user={user}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onCreateProject={() =>
          navigate('/projects', { state: { openCreateProject: true } })
        }
      />
      <ProjectMobileHeader onOpenMenu={() => setIsMobileMenuOpen(true)} />

      <main className="min-h-screen px-4 pb-16 pt-24 sm:px-8 lg:ml-[280px] lg:px-10 lg:pt-10">
        <header className="mx-auto max-w-[1280px]">
          <div>
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--bd-muted)] transition hover:text-[var(--bd-info)]"
            >
              ← Quay lại My Project
            </button>
            <h1 className="text-4xl font-semibold tracking-[-0.02em] text-[var(--bd-text)] sm:text-5xl">
              {project.name}
            </h1>
            <p className="mt-3 text-base text-[var(--bd-dim)] sm:text-lg">
              Quản lý và mở lại các Landing Page trong Project này.
            </p>
          </div>
        </header>

        <section className="mx-auto mt-10 max-w-[1280px]">
          {isLoadingLandingPages ? (
            <div
              className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
              aria-label="Đang tải danh sách Landing Page"
              aria-busy="true"
            >
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-[330px] animate-pulse rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)]"
                />
              ))}
            </div>
          ) : currentPageState.status === 'error' ? (
            <div
              className="mx-auto mt-12 max-w-lg rounded-2xl border border-red-400/30 bg-[var(--bd-panel-solid)] p-8 text-center"
              role="alert"
            >
              <h2 className="text-xl font-semibold text-[var(--bd-text)]">
                Không tải được Landing Page
              </h2>
              <p className="mt-3 text-sm text-[var(--bd-dim)]">
                {currentPageState.error}
              </p>
              <button
                type="button"
                onClick={reloadLandingPages}
                className="mt-6 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2.5 font-semibold text-white"
              >
                Thử lại
              </button>
            </div>
          ) : currentPageState.items.length === 0 ? (
            <div className="mx-auto flex min-h-[480px] max-w-3xl items-center justify-center">
              <div className="w-full rounded-2xl border border-dashed border-[var(--bd-border)] bg-[var(--bd-panel-solid)] px-6 py-14 text-center">
                <h2 className="text-3xl font-semibold text-[var(--bd-text)]">
                  Project chưa có Landing Page
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-[var(--bd-dim)]">
                  Project này chưa có Landing Page. Bạn có thể bắt đầu từ Thư
                  viện Template toàn cục.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {currentPageState.items.map((landingPage) => (
                <LandingPageCard
                  key={landingPage.id}
                  landingPage={landingPage}
                  onOpen={() =>
                    navigate(
                      `/projects/${projectId}/editor/${landingPage.id}`,
                    )
                  }
                  onRename={() => openRenameModal(landingPage)}
                  onDelete={() => openDeleteModal(landingPage)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <StatusNotice>{notice}</StatusNotice>
      <RenameLandingPageModal
        landingPage={renameLandingPage}
        submitting={isRenaming}
        serverError={renameError}
        onClose={closeRenameModal}
        onSubmit={handleRenameLandingPage}
        onErrorClear={() => setRenameError('')}
      />
      <DeleteLandingPageModal
        landingPage={deleteLandingPage}
        submitting={isDeleting}
        error={deleteError}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteLandingPage}
      />
    </div>
  )
}

export default ProjectDetailPage
