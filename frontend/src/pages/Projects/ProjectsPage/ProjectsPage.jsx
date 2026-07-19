import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useProjects } from '../context/ProjectsContext'
import CreateProjectModal from './components/CreateProjectModal'
import EmptyProjectState from './components/EmptyProjectState'
import ProjectCard from './components/ProjectCard'
import ProjectHeader from './components/ProjectHeader'
import ProjectMobileHeader from '../components/ProjectMobileHeader'
import ProjectSidebar from '../components/ProjectSidebar'
import StatusNotice from '../components/StatusNotice'

export default function ProjectsPage() {
  const { user } = useAuth()
  const { projects, createProject } = useProjects()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')

  const closeCreateModal = useCallback(() => setIsCreateModalOpen(false), [])
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), [])

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

    setIsCreateModalOpen(true)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  const handleCreateProject = (name) => {
    createProject(name)
    setSearchTerm('')
    setIsCreateModalOpen(false)
    setNotice(`Đã tạo Project “${name}” trên giao diện thử nghiệm.`)
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
          setIsCreateModalOpen(true)
          setIsMobileMenuOpen(false)
        }}
        onShowMessage={showComingSoon}
      />

      <ProjectMobileHeader onOpenMenu={() => setIsMobileMenuOpen(true)} />

      <main className="min-h-screen pt-16 lg:ml-[280px] lg:pt-0">
        <ProjectHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onCreateProject={() => setIsCreateModalOpen(true)}
        />

        <div className="relative min-h-[calc(100vh-150px)] overflow-hidden px-4 py-8 sm:px-8 lg:px-10">
          <div className="pointer-events-none absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-blue-600/5 blur-[100px]" />
          <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-cyan-400/5 blur-[120px]" />

          {projects.length === 0 ? (
            <EmptyProjectState onCreateProject={() => setIsCreateModalOpen(true)} />
          ) : filteredProjects.length > 0 ? (
            <section
              className="relative grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
              aria-label="Danh sách Project"
            >
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={() => navigate(`/projects/${project.id}/templates`)}
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
        onUpgrade={() =>
          showComingSoon('Luồng nâng cấp Pro chưa nằm trong task frontend hiện tại.')
        }
      />
    </div>
  )
}
