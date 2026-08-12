import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PlusIcon } from '../../../components/icons'
import {
  landingPagesApi,
  mapLandingPageFromApi,
} from '../../../api/landingPages'
import { useAuth } from '../../../context/AuthContext'
import ProjectMobileHeader from '../components/ProjectMobileHeader'
import ProjectSidebar from '../components/ProjectSidebar'
import StatusNotice from '../components/StatusNotice'
import { useProjects } from '../context/ProjectsContext'
import LandingPageCard from './components/LandingPageCard'

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
  const requestIdRef = useRef(0)
  const requestControllerRef = useRef(null)

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

  const openTemplateGallery = () =>
    navigate(`/projects/${projectId}/templates`)

  const showMessage = (message) => {
    setNotice(message)
    setIsMobileMenuOpen(false)
  }

  if (isProjectsLoading) {
    return (
      <main
        className="grid min-h-screen place-items-center bg-[#131315] px-4 text-[#e5e1e4]"
        aria-busy="true"
      >
        <section className="w-full max-w-lg animate-pulse rounded-2xl border border-white/10 bg-[#1c1b1d] p-8 text-center">
          <p className="text-sm text-[#c3c6d7]">Đang tải Project...</p>
        </section>
      </main>
    )
  }

  if (projectsError) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#131315] px-4 text-[#e5e1e4]">
        <section
          className="w-full max-w-lg rounded-2xl border border-[#ffb4ab]/30 bg-[#1c1b1d] p-8 text-center"
          role="alert"
        >
          <h1 className="text-2xl font-semibold text-white">
            Không tải được Project
          </h1>
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
      <main className="grid min-h-screen place-items-center bg-[#131315] px-4 text-[#e5e1e4]">
        <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1c1b1d] p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#ffb4ab]">
            Project not found
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Không tìm thấy Project
          </h1>
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

  const currentPageState =
    pageState.projectId === projectId ? pageState : INITIAL_PAGE_STATE
  const isLoadingLandingPages =
    currentPageState.status === 'idle' || currentPageState.status === 'loading'

  return (
    <div className="min-h-screen bg-[#131315] text-[#e5e1e4]">
      <ProjectSidebar
        user={user}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onCreateProject={() =>
          navigate('/projects', { state: { openCreateProject: true } })
        }
        onShowMessage={showMessage}
        templatePath={`/projects/${projectId}/templates`}
      />
      <ProjectMobileHeader onOpenMenu={() => setIsMobileMenuOpen(true)} />

      <main className="min-h-screen px-4 pb-16 pt-24 sm:px-8 lg:ml-[280px] lg:px-10 lg:pt-10">
        <header className="mx-auto flex max-w-[1280px] flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8d90a0] transition hover:text-[#d3fbff]"
            >
              ← Quay lại My Project
            </button>
            <h1 className="text-4xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
              {project.name}
            </h1>
            <p className="mt-3 text-base text-[#c3c6d7] sm:text-lg">
              Quản lý và mở lại các Landing Page trong Project này.
            </p>
          </div>

          <button
            type="button"
            onClick={openTemplateGallery}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#eec200] px-6 py-3 font-bold text-[#231b00] shadow-[0_0_25px_rgba(238,194,0,0.22)] transition hover:-translate-y-0.5 hover:bg-[#ffe083]"
          >
            <PlusIcon size={20} />
            New Landing Page
          </button>
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
                  className="h-[330px] animate-pulse rounded-xl border border-white/10 bg-[#1c1b1d]"
                />
              ))}
            </div>
          ) : currentPageState.status === 'error' ? (
            <div
              className="mx-auto mt-12 max-w-lg rounded-2xl border border-[#ffb4ab]/30 bg-[#1c1b1d] p-8 text-center"
              role="alert"
            >
              <h2 className="text-xl font-semibold text-white">
                Không tải được Landing Page
              </h2>
              <p className="mt-3 text-sm text-[#c3c6d7]">
                {currentPageState.error}
              </p>
              <button
                type="button"
                onClick={reloadLandingPages}
                className="mt-6 rounded-lg bg-[#b4c5ff] px-5 py-2.5 font-semibold text-[#002a78]"
              >
                Thử lại
              </button>
            </div>
          ) : currentPageState.items.length === 0 ? (
            <div className="mx-auto flex min-h-[480px] max-w-3xl items-center justify-center">
              <div className="w-full rounded-2xl border border-dashed border-white/15 bg-[#121a27]/70 px-6 py-14 text-center">
                <h2 className="text-3xl font-semibold text-white">
                  Project chưa có Landing Page
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-[#c3c6d7]">
                  Chọn một Template hiện có để bắt đầu tạo Landing Page đầu tiên.
                </p>
                <button
                  type="button"
                  onClick={openTemplateGallery}
                  className="mx-auto mt-7 flex items-center justify-center gap-2 rounded-xl bg-[#eec200] px-6 py-3 font-bold text-[#231b00] transition hover:bg-[#ffe083]"
                >
                  <PlusIcon size={19} />
                  Tạo Landing Page đầu tiên
                </button>
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
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <StatusNotice>{notice}</StatusNotice>
    </div>
  )
}

export default ProjectDetailPage
