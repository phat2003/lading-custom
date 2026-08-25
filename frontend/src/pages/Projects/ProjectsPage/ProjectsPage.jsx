import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import UpgradeRequiredDialog from '../../../components/pricing/UpgradeRequiredDialog'
import { useProjects } from '../context/ProjectsContext'
import CreateProjectModal from './components/CreateProjectModal'
import DeleteProjectModal from './components/DeleteProjectModal'
import EmptyProjectState from './components/EmptyProjectState'
import ProjectCard from './components/ProjectCard'
import ProjectHeader from './components/ProjectHeader'
import RenameProjectModal from './components/RenameProjectModal'
import ProjectMobileHeader from '../components/ProjectMobileHeader'
import ProjectSidebar from '../components/ProjectSidebar'
import StatusNotice from '../components/StatusNotice'

export default function ProjectsPage() {
  const { user } = useAuth()
  const {
    projects,
    projectsError,
    isProjectsLoading,
    reloadProjects,
    createProject,
    renameProject,
    deleteProject,
  } = useProjects()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [upgradeReason, setUpgradeReason] = useState('')
  const [createError, setCreateError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [projectToRename, setProjectToRename] = useState(null)
  const [renameError, setRenameError] = useState('')
  const [isRenaming, setIsRenaming] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const createRequestInFlightRef = useRef(false)
  const renameRequestInFlightRef = useRef(false)
  const deleteRequestInFlightRef = useRef(false)

  const openCreateModal = useCallback(() => {
    setCreateError('')
    setIsCreateModalOpen(true)
  }, [])
  const closeCreateModal = useCallback(() => {
    if (createRequestInFlightRef.current) return
    setCreateError('')
    setIsCreateModalOpen(false)
  }, [])
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), [])

  const openRenameModal = useCallback((project) => {
    setRenameError('')
    setProjectToRename(project)
  }, [])

  const closeRenameModal = useCallback(() => {
    if (renameRequestInFlightRef.current) return
    setRenameError('')
    setProjectToRename(null)
  }, [])

  const openDeleteModal = useCallback((project) => {
    setDeleteError('')
    setProjectToDelete(project)
  }, [])

  const closeDeleteModal = useCallback(() => {
    if (deleteRequestInFlightRef.current) return
    setDeleteError('')
    setProjectToDelete(null)
  }, [])

  const filteredProjects = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    if (!keyword) return projects

    return projects.filter((project) =>
      project.name.toLowerCase().includes(keyword),
    )
  }, [projects, searchTerm])

  useEffect(() => {
    if (!notice) return undefined

    const timer = window.setTimeout(() => setNotice(''), 3000)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    if (!location.state?.openCreateProject) return

    openCreateModal()
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate, openCreateModal])

  const handleCreateProject = async (name) => {
    if (createRequestInFlightRef.current) return

    createRequestInFlightRef.current = true
    setIsCreating(true)
    setCreateError('')

    try {
      const project = await createProject(name)
      setSearchTerm('')
      setIsCreateModalOpen(false)
      setNotice(`Đã tạo Project “${project.name}” thành công.`)
    } catch (error) {
      setCreateError(
        error?.response?.data?.error ||
          'Không thể tạo Project. Vui lòng thử lại.',
      )
    } finally {
      createRequestInFlightRef.current = false
      setIsCreating(false)
    }
  }

  const handleRenameProject = async (name) => {
    if (!projectToRename || renameRequestInFlightRef.current) return

    renameRequestInFlightRef.current = true
    setIsRenaming(true)
    setRenameError('')

    try {
      const updatedProject = await renameProject(projectToRename.id, name)
      setProjectToRename(null)
      setNotice(`Đã đổi tên Project thành “${updatedProject.name}”.`)
    } catch (error) {
      setRenameError(
        error?.response?.data?.error ||
          'Không thể đổi tên Project. Vui lòng thử lại.',
      )
    } finally {
      renameRequestInFlightRef.current = false
      setIsRenaming(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete || deleteRequestInFlightRef.current) return

    const deletedProjectName = projectToDelete.name
    deleteRequestInFlightRef.current = true
    setIsDeleting(true)
    setDeleteError('')

    try {
      await deleteProject(projectToDelete.id)
      setProjectToDelete(null)
      setNotice(`Đã xóa Project “${deletedProjectName}”.`)
    } catch (error) {
      setDeleteError(
        error?.response?.data?.error ||
          'Không thể xóa Project. Vui lòng thử lại.',
      )
    } finally {
      deleteRequestInFlightRef.current = false
      setIsDeleting(false)
    }
  }

  const showComingSoon = (message) => {
    setNotice(message)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#131315] text-[#e5e1e4]">
      <ProjectSidebar
        user={user}
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        onCreateProject={() => {
          openCreateModal()
          setIsMobileMenuOpen(false)
        }}
        onShowMessage={showComingSoon}
      />

      <ProjectMobileHeader onOpenMenu={() => setIsMobileMenuOpen(true)} />

      <main className="min-h-screen pt-16 lg:ml-[280px] lg:pt-0">
        <ProjectHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onCreateProject={openCreateModal}
        />

        <div className="relative min-h-[calc(100vh-150px)] overflow-hidden px-4 py-8 sm:px-8 lg:px-10">
          <div className="pointer-events-none absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-blue-600/5 blur-[100px]" />
          <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-cyan-400/5 blur-[120px]" />

          {isProjectsLoading ? (
            <section
              className="relative grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
              aria-label="Đang tải danh sách Project"
              aria-busy="true"
            >
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-[292px] animate-pulse rounded-xl border border-white/10 bg-[#1c1b1d]"
                />
              ))}
            </section>
          ) : projectsError ? (
            <section
              className="relative mx-auto mt-20 max-w-lg rounded-2xl border border-[#ffb4ab]/30 bg-[#1c1b1d] p-8 text-center"
              role="alert"
            >
              <h2 className="text-xl font-semibold text-white">
                Không tải được danh sách Project
              </h2>
              <p className="mt-2 text-sm text-[#c3c6d7]">{projectsError}</p>
              <button
                type="button"
                onClick={() => reloadProjects()}
                className="mt-5 rounded-lg bg-[#b4c5ff] px-4 py-2 text-sm font-semibold text-[#002a78] transition hover:bg-[#d3fbff]"
              >
                Thử lại
              </button>
            </section>
          ) : projects.length === 0 ? (
            <EmptyProjectState onCreateProject={openCreateModal} />
          ) : filteredProjects.length > 0 ? (
            <section
              className="relative grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
              aria-label="Danh sách Project"
            >
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={() => navigate(`/projects/${project.id}`)}
                  onRename={() => openRenameModal(project)}
                  onDelete={() => openDeleteModal(project)}
                />
              ))}
            </section>
          ) : (
            <section className="relative mx-auto mt-20 max-w-lg rounded-2xl border border-white/10 bg-[#1c1b1d] p-8 text-center">
              <h2 className="text-xl font-semibold">Không tìm thấy Project</h2>
              <p className="mt-2 text-sm text-[#c3c6d7]">
                Không có Project nào khớp với “{searchTerm}”.
              </p>
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-5 rounded-lg border border-white/15 px-4 py-2 text-sm transition hover:bg-white/5"
              >
                Xóa tìm kiếm
              </button>
            </section>
          )}
        </div>
      </main>

      <StatusNotice>{notice}</StatusNotice>

      <CreateProjectModal
        open={isCreateModalOpen}
        onClose={closeCreateModal}
        onCreate={handleCreateProject}
        submitting={isCreating}
        serverError={createError}
        onErrorClear={() => setCreateError('')}
        onUpgrade={() => setUpgradeReason('Tính năng Team yêu cầu gói Pro.')}
      />

      <RenameProjectModal
        project={projectToRename}
        submitting={isRenaming}
        serverError={renameError}
        onClose={closeRenameModal}
        onSubmit={handleRenameProject}
        onErrorClear={() => setRenameError('')}
      />

      <DeleteProjectModal
        project={projectToDelete}
        submitting={isDeleting}
        error={deleteError}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteProject}
      />
      <UpgradeRequiredDialog
        open={Boolean(upgradeReason)}
        onClose={() => setUpgradeReason('')}
        reason={upgradeReason}
        currentPlan={user}
      />
    </div>
  )
}
