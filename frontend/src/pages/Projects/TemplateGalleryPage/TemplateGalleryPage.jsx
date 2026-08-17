import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { FilterIcon, SearchIcon } from '../../../components/icons'
import {
  landingPagesApi,
  mapLandingPageFromApi,
} from '../../../api/landingPages'
import {
  mapTemplateFromApi,
  userTemplatesApi,
} from '../../../api/templates'
import { useProjects } from '../context/ProjectsContext'
import CreateProjectModal from '../ProjectsPage/components/CreateProjectModal'
import CloneTemplateModal from './components/CloneTemplateModal'
import CreateLandingPageModal from './components/CreateLandingPageModal'
import DeleteTemplateModal from './components/DeleteTemplateModal'
import RenameTemplateModal from './components/RenameTemplateModal'
import SelectDestinationModal from './components/SelectDestinationModal'
import TemplateCard from './components/TemplateCard'
import TemplateDetailModal from './components/TemplateDetailModal'
import ProjectMobileHeader from '../components/ProjectMobileHeader'
import ProjectSidebar from '../components/ProjectSidebar'
import StatusNotice from '../components/StatusNotice'

const BLANK_OPTION = {
  id: 'blank',
  name: 'Bắt đầu từ trang trắng',
  description: 'Blank / Canvas',
  type: 'blank',
  tier: 'free',
}

const TEMPLATE_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'system', label: 'Mẫu hệ thống' },
  { id: 'user', label: 'Mẫu của tôi' },
]

const INITIAL_TEMPLATE_STATE = {
  status: 'loading',
  items: [],
  error: '',
}

const TemplateGalleryPage = ({ mode = 'system' }) => {
  const { user } = useAuth()
  const { projectId } = useParams()
  const isGlobalGallery = !projectId
  const isMyTemplates = isGlobalGallery && mode === 'mine'
  const isCreationGallery = isGlobalGallery && !isMyTemplates
  const navigate = useNavigate()
  const {
    projects,
    getProject,
    isProjectsLoading,
    projectsError,
    reloadProjects,
    createProject,
  } = useProjects()
  const project = projectId ? getProject(projectId) : null
  const canLoadTemplates =
    isGlobalGallery ||
    Boolean(projectId && !isProjectsLoading && !projectsError && project)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [templateState, setTemplateState] = useState(INITIAL_TEMPLATE_STATE)
  const [templateReloadKey, setTemplateReloadKey] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [cloneSource, setCloneSource] = useState(null)
  const [detailTemplate, setDetailTemplate] = useState(null)
  const [renameTemplate, setRenameTemplate] = useState(null)
  const [deleteTemplate, setDeleteTemplate] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [createdProject, setCreatedProject] = useState(null)
  const [creationStep, setCreationStep] = useState('idle')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [projectCreateError, setProjectCreateError] = useState('')
  const [createError, setCreateError] = useState('')
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const projectRequestInFlightRef = useRef(false)
  const createRequestInFlightRef = useRef(false)
  const templateRequestIdRef = useRef(0)

  const resetCreationFlow = useCallback(() => {
    if (
      projectRequestInFlightRef.current ||
      createRequestInFlightRef.current
    ) {
      return
    }
    setProjectCreateError('')
    setCreateError('')
    setSelectedTemplate(null)
    setSelectedProject(null)
    setCreatedProject(null)
    setCreationStep('idle')
  }, [])
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), [])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 3000)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    if (!canLoadTemplates) return undefined

    const controller = new AbortController()
    const requestId = templateRequestIdRef.current + 1
    templateRequestIdRef.current = requestId

    setTemplateState(INITIAL_TEMPLATE_STATE)

    userTemplatesApi
      .list(
        { page: 1, limit: 100 },
        { signal: controller.signal },
      )
      .then((response) => {
        if (controller.signal.aborted || requestId !== templateRequestIdRef.current) {
          return
        }

        const source = response?.data?.data
        if (!Array.isArray(source)) {
          throw new Error('Invalid template list response')
        }

        const mappedItems = source.map(mapTemplateFromApi)
        if (mappedItems.some((template) => !template)) {
          throw new Error('Invalid template item response')
        }

        const items = isMyTemplates
          ? mappedItems.filter((template) => template.type === 'user')
          : isGlobalGallery
            ? mappedItems.filter(
              (template) =>
                template.type === 'system' && template.status === 'published',
            )
            : mappedItems

        setTemplateState({ status: 'success', items, error: '' })
      })
      .catch((error) => {
        if (controller.signal.aborted || requestId !== templateRequestIdRef.current) {
          return
        }

        setTemplateState({
          status: 'error',
          items: [],
          error:
            error?.response?.data?.error ||
            'Không thể tải Template. Vui lòng thử lại.',
        })
      })

    return () => controller.abort()
  }, [
    canLoadTemplates,
    isGlobalGallery,
    isMyTemplates,
    templateReloadKey,
  ])

  const filteredTemplates = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()

    return templateState.items.filter((template) => {
      const matchesType =
        isGlobalGallery ||
        activeFilter === 'all' ||
        template.type === activeFilter
      const matchesSearch =
        !keyword || template.name.toLowerCase().includes(keyword)

      return matchesType && matchesSearch
    })
  }, [activeFilter, isGlobalGallery, searchTerm, templateState.items])

  const retryTemplates = useCallback(() => {
    setTemplateReloadKey((currentKey) => currentKey + 1)
  }, [])

  const handleSelectTemplate = (nextTemplate) => {
    if (isMyTemplates) return

    setProjectCreateError('')
    setCreateError('')
    setSelectedTemplate(nextTemplate)
    setSelectedProject(null)
    setCreatedProject(null)
    setCreationStep(isCreationGallery ? 'destination' : 'naming')
  }

  const openCloneTemplate = useCallback((template) => {
    setCloneSource(template)
  }, [])

  const closeCloneTemplate = useCallback(() => {
    setCloneSource(null)
  }, [])

  const openTemplateDetail = useCallback((template) => {
    setDetailTemplate(template)
  }, [])

  const closeTemplateDetail = useCallback(() => {
    setDetailTemplate(null)
  }, [])

  const openRenameTemplate = useCallback((template) => {
    setRenameTemplate(template)
  }, [])

  const closeRenameTemplate = useCallback(() => {
    setRenameTemplate(null)
  }, [])

  const openDeleteTemplate = useCallback((template) => {
    setDeleteTemplate(template)
  }, [])

  const closeDeleteTemplate = useCallback(() => {
    setDeleteTemplate(null)
  }, [])

  const showNewProjectForm = () => {
    setProjectCreateError('')
    setSelectedProject(null)
    setCreatedProject(null)
    setCreationStep('new-project')
  }

  const showExistingProjects = () => {
    setSelectedProject(null)
    setCreatedProject(null)
    setCreationStep('existing-project')
  }

  const selectDestinationProject = (nextProject) => {
    setSelectedProject(nextProject)
    setCreatedProject(null)
    setCreationStep('naming')
  }

  const backToDestinationChoice = () => {
    setProjectCreateError('')
    setSelectedProject(null)
    setCreatedProject(null)
    setCreationStep('destination')
  }

  const backToProjectSelection = () => {
    if (createRequestInFlightRef.current) return
    setCreateError('')
    setSelectedProject(null)
    setCreationStep('existing-project')
  }

  const handleCreateDestinationProject = async (name) => {
    if (
      projectRequestInFlightRef.current ||
      !isCreationGallery ||
      !selectedTemplate
    ) {
      return
    }

    projectRequestInFlightRef.current = true
    setIsCreatingProject(true)
    setProjectCreateError('')

    try {
      const nextProject = await createProject(name)
      setCreatedProject(nextProject)
      setSelectedProject(nextProject)
      setCreationStep('naming')
    } catch (error) {
      setProjectCreateError(
        error?.response?.data?.error ||
          'Không thể tạo Project. Vui lòng thử lại.',
      )
    } finally {
      projectRequestInFlightRef.current = false
      setIsCreatingProject(false)
    }
  }

  const closeLandingPageStep = useCallback(() => {
    if (createRequestInFlightRef.current) return

    const createdProjectName = createdProject?.name
    resetCreationFlow()

    if (createdProjectName) {
      setNotice(
        `Project “${createdProjectName}” đã được tạo và vẫn được giữ lại.`,
      )
    }
  }, [createdProject, resetCreationFlow])

  const handleCreateLandingPage = async (name) => {
    const destinationProjectId = isGlobalGallery
      ? selectedProject?.id
      : projectId

    if (
      !destinationProjectId ||
      createRequestInFlightRef.current ||
      isMyTemplates ||
      !selectedTemplate
    ) {
      return
    }

    const templateToCreate = selectedTemplate
    createRequestInFlightRef.current = true
    setIsCreating(true)
    setCreateError('')

    try {
      const normalizedName = name.trim()
      const response =
        templateToCreate.type === 'blank'
          ? await landingPagesApi.create({
              project_id: destinationProjectId,
              name: normalizedName,
            })
          : await landingPagesApi.createFromTemplate({
              project_id: destinationProjectId,
              template_id: templateToCreate.id,
              name: normalizedName,
            })
      const landingPage = mapLandingPageFromApi(response?.data?.data)

      if (!landingPage || landingPage.projectId !== destinationProjectId) {
        throw new Error('Invalid landing page response')
      }
      if (
        templateToCreate.type !== 'blank' &&
        landingPage.sourceTemplateId &&
        landingPage.sourceTemplateId !== templateToCreate.id
      ) {
        throw new Error('Invalid source template response')
      }

      navigate(
        `/projects/${destinationProjectId}/editor/${landingPage.id}`,
      )
    } catch (error) {
      const pageError =
        error?.response?.data?.error ||
        (templateToCreate.type === 'blank'
          ? 'Không thể tạo Landing Page. Vui lòng thử lại.'
          : 'Không thể tạo Landing Page từ Template. Vui lòng thử lại.')

      setCreateError(
        createdProject
          ? `Project “${createdProject.name}” đã được tạo. ${pageError}`
          : pageError,
      )
    } finally {
      createRequestInFlightRef.current = false
      setIsCreating(false)
    }
  }

  const showMessage = (message) => {
    setNotice(message)
    setIsMobileMenuOpen(false)
  }

  if (!isGlobalGallery && isProjectsLoading) {
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

  if (!isGlobalGallery && projectsError) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#131315] px-4 text-[#e5e1e4]">
        <section className="w-full max-w-lg rounded-2xl border border-[#ffb4ab]/30 bg-[#1c1b1d] p-8 text-center" role="alert">
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

  if (!isGlobalGallery && !project) {
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

  return (
    <div className="min-h-screen bg-[#131315] text-[#e5e1e4]">
      <ProjectSidebar
        user={user}
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        onCreateProject={() =>
          navigate('/projects', { state: { openCreateProject: true } })
        }
        onShowMessage={showMessage}
      />
      <ProjectMobileHeader onOpenMenu={() => setIsMobileMenuOpen(true)} />

      <main className="min-h-screen px-4 pb-16 pt-24 sm:px-8 lg:ml-[280px] lg:px-10 lg:pt-10">
        <header className="mx-auto flex max-w-[1280px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                navigate(isGlobalGallery ? '/projects' : `/projects/${projectId}`)
              }
              className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8d90a0] transition hover:text-[#d3fbff]"
            >
              ← {isGlobalGallery ? 'My Project' : project.name}
            </button>
            <h1 className="text-4xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
              {isMyTemplates
                ? 'Mẫu của tôi'
                : isGlobalGallery
                  ? 'Thư viện Template'
                  : 'Chọn mẫu giao diện'}
            </h1>
            <p className="mt-3 text-base text-[#c3c6d7] sm:text-lg">
              {isMyTemplates
                ? 'Xem các Template cá nhân đã lưu từ Landing Page.'
                : isGlobalGallery
                  ? 'Chọn Blank hoặc System Template đã xuất bản để bắt đầu.'
                  : 'Bắt đầu nhanh chóng với các mẫu được thiết kế chuyên nghiệp.'}
            </p>
          </div>

          <div className="flex w-full gap-3 md:w-auto">
            <label className="relative flex-1 md:w-72">
              <span className="sr-only">Tìm kiếm mẫu</span>
              <SearchIcon
                size={20}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#c3c6d7]"
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={
                  isMyTemplates
                    ? 'Tìm kiếm mẫu của tôi...'
                    : 'Tìm kiếm mẫu...'
                }
                className="h-12 w-full rounded-lg border border-[#434655]/30 bg-[#2a2a2c] pl-11 pr-4 text-white outline-none transition placeholder:text-[#8d90a0] focus:border-[#b4c5ff] focus:ring-1 focus:ring-[#b4c5ff]"
              />
            </label>
            <button
              type="button"
              onClick={() => showMessage('Bộ lọc nâng cao sẽ được bổ sung sau.')}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-[#434655]/30 bg-[#2a2a2c] text-white transition hover:bg-[#353437]"
              aria-label="Mở bộ lọc"
            >
              <FilterIcon size={20} />
            </button>
          </div>
        </header>

        {isGlobalGallery && (
          <nav
            className="mx-auto mt-8 flex max-w-[1280px] gap-2 border-b border-white/10"
            aria-label="Khu vực Template"
          >
            <NavLink
              end
              to="/templates"
              className={({ isActive }) =>
                `border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'border-[#b4c5ff] text-[#dbe1ff]'
                    : 'border-transparent text-[#8d90a0] hover:text-white'
                }`
              }
            >
              Thư viện
            </NavLink>
            <NavLink
              to="/templates/mine"
              className={({ isActive }) =>
                `border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'border-[#b4c5ff] text-[#dbe1ff]'
                    : 'border-transparent text-[#8d90a0] hover:text-white'
                }`
              }
            >
              Mẫu của tôi
            </NavLink>
          </nav>
        )}

        <section className="mx-auto mt-6 max-w-[1280px]">
          {!isGlobalGallery && (
            <div className="flex flex-wrap gap-3" aria-label="Loại Template">
              {TEMPLATE_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`rounded-full border px-4 py-2 font-mono text-[11px] transition ${
                    activeFilter === filter.id
                      ? 'border-[#b4c5ff]/30 bg-[#2563eb]/20 text-[#b4c5ff]'
                      : 'border-[#434655]/25 bg-[#2a2a2c] text-[#c3c6d7] hover:bg-[#353437]'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}

          <div
            className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
            aria-label="Template Gallery"
            aria-busy={templateState.status === 'loading'}
          >
            {!isMyTemplates && (
              <TemplateCard
                template={BLANK_OPTION}
                locked={false}
                onSelect={handleSelectTemplate}
                onLocked={() => {}}
              />
            )}

            {templateState.status === 'loading' ? (
              [0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-[320px] animate-pulse rounded-xl border border-white/10 bg-[#1c1b1d]"
                />
              ))
            ) : templateState.status === 'error' ? (
              <div
                className="rounded-xl border border-[#ffb4ab]/30 bg-[#1c1b1d] p-10 text-center sm:col-span-2 xl:col-span-2"
                role="alert"
              >
                <h2 className="text-xl font-semibold text-white">
                  Không tải được Template
                </h2>
                <p className="mt-2 text-sm text-[#c3c6d7]">
                  {templateState.error}
                </p>
                <button
                  type="button"
                  onClick={retryTemplates}
                  className="mt-6 rounded-lg bg-[#b4c5ff] px-5 py-2.5 font-semibold text-[#002a78]"
                >
                  Thử lại
                </button>
              </div>
            ) : filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  locked={
                    template.type === 'system' &&
                    template.tier === 'premium' &&
                    user?.plan_type !== 'pro'
                  }
                  onSelect={handleSelectTemplate}
                  onClone={isGlobalGallery ? openCloneTemplate : null}
                  onView={isMyTemplates ? openTemplateDetail : null}
                  onRename={isMyTemplates ? openRenameTemplate : null}
                  onDelete={isMyTemplates ? openDeleteTemplate : null}
                  interactive={!isMyTemplates}
                  onLocked={() =>
                    showMessage(`“${template.name}” yêu cầu gói Pro.`)
                  }
                />
              ))
            ) : (
              <div className="rounded-xl border border-white/10 bg-[#1c1b1d] p-10 text-center sm:col-span-2 xl:col-span-2">
                <h2 className="text-xl font-semibold text-white">
                  {isMyTemplates && !searchTerm.trim()
                    ? 'Bạn chưa có mẫu cá nhân nào'
                    : isGlobalGallery && !searchTerm.trim()
                      ? 'Chưa có System Template khả dụng'
                    : activeFilter === 'user' && !searchTerm.trim()
                      ? 'Bạn chưa có Template cá nhân'
                      : activeFilter === 'system' && !searchTerm.trim()
                        ? 'Chưa có System Template khả dụng'
                        : 'Không tìm thấy mẫu'}
                </h2>
                <p className="mt-2 text-sm text-[#c3c6d7]">
                  {searchTerm.trim()
                    ? isGlobalGallery
                      ? 'Thử thay đổi từ khóa tìm kiếm.'
                      : 'Thử thay đổi từ khóa hoặc chọn loại Template khác.'
                    : isMyTemplates
                      ? 'Những Landing Page được lưu thành Template sẽ xuất hiện tại đây.'
                      : isGlobalGallery
                        ? 'Bạn vẫn có thể bắt đầu từ trang trắng.'
                      : 'Chọn loại Template khác hoặc bắt đầu từ trang trắng.'}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <StatusNotice>{notice}</StatusNotice>
      <CloneTemplateModal
        template={cloneSource}
        onClose={closeCloneTemplate}
      />
      <TemplateDetailModal
        template={detailTemplate}
        onClose={closeTemplateDetail}
      />
      <RenameTemplateModal
        template={renameTemplate}
        onClose={closeRenameTemplate}
      />
      <DeleteTemplateModal
        template={deleteTemplate}
        onClose={closeDeleteTemplate}
      />
      <SelectDestinationModal
        open={
          isCreationGallery &&
          (creationStep === 'destination' ||
            creationStep === 'existing-project')
        }
        source={selectedTemplate}
        step={creationStep}
        projects={projects}
        isLoading={isProjectsLoading}
        error={projectsError}
        onClose={resetCreationFlow}
        onChooseNew={showNewProjectForm}
        onChooseExisting={showExistingProjects}
        onSelectProject={selectDestinationProject}
        onBack={backToDestinationChoice}
        onRetry={() => reloadProjects()}
      />
      <CreateProjectModal
        open={
          isCreationGallery &&
          creationStep === 'new-project' &&
          Boolean(selectedTemplate)
        }
        source={selectedTemplate}
        onClose={resetCreationFlow}
        onBack={backToDestinationChoice}
        onCreate={handleCreateDestinationProject}
        onUpgrade={() =>
          showMessage('Luồng nâng cấp Pro chưa nằm trong task hiện tại.')
        }
        submitting={isCreatingProject}
        serverError={projectCreateError}
        onErrorClear={() => setProjectCreateError('')}
      />
      <CreateLandingPageModal
        open={
          !isMyTemplates &&
          creationStep === 'naming' &&
          Boolean(selectedTemplate)
        }
        template={selectedTemplate}
        project={isGlobalGallery ? selectedProject : project}
        onClose={closeLandingPageStep}
        onBack={
          isGlobalGallery && !createdProject
            ? backToProjectSelection
            : undefined
        }
        onCreate={handleCreateLandingPage}
        submitting={isCreating}
        serverError={createError}
        onErrorClear={() => setCreateError('')}
      />
    </div>
  )
}

export default TemplateGalleryPage
