import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { FilterIcon, SearchIcon } from '../../../components/icons'
import { useProjects } from '../context/ProjectsContext'
import {
  TEMPLATE_CATEGORIES,
  templates,
} from './mock/templates'
import CreateLandingPageModal from './components/CreateLandingPageModal'
import TemplateCard from './components/TemplateCard'
import ProjectMobileHeader from '../components/ProjectMobileHeader'
import ProjectSidebar from '../components/ProjectSidebar'
import StatusNotice from '../components/StatusNotice'

export default function TemplateGalleryPage() {
  const { user } = useAuth()
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { getProject, createLandingPage } = useProjects()
  const project = getProject(projectId)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('Tất cả')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')

  const closeCreateModal = useCallback(() => setSelectedTemplate(null), [])
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), [])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 3000)
    return () => window.clearTimeout(timer)
  }, [notice])

  const filteredTemplates = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()

    return templates.filter((template) => {
      const matchesCategory =
        activeCategory === 'Tất cả' || template.category === activeCategory
      const matchesSearch =
        !keyword ||
        template.name.toLowerCase().includes(keyword) ||
        template.description.toLowerCase().includes(keyword)

      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchTerm])

  const handleCreateLandingPage = (name) => {
    const landingPage = createLandingPage(projectId, {
      name,
      source: selectedTemplate,
    })

    const dashboardParams = new URLSearchParams({
      projectId,
      landingPageId: landingPage.id,
    })

    navigate(`/dashboard?${dashboardParams.toString()}`)
  }

  const showMessage = (message) => {
    setNotice(message)
    setIsMobileMenuOpen(false)
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
        templatePath={`/projects/${projectId}/templates`}
      />
      <ProjectMobileHeader onOpenMenu={() => setIsMobileMenuOpen(true)} />

      <main className="min-h-screen px-4 pb-16 pt-24 sm:px-8 lg:ml-[280px] lg:px-10 lg:pt-10">
        <header className="mx-auto flex max-w-[1280px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8d90a0] transition hover:text-[#d3fbff]"
            >
              ← {project.name}
            </button>
            <h1 className="text-4xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
              Chọn mẫu giao diện
            </h1>
            <p className="mt-3 text-base text-[#c3c6d7] sm:text-lg">
              Bắt đầu nhanh chóng với các mẫu được thiết kế chuyên nghiệp.
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
                placeholder="Tìm kiếm mẫu..."
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

        <section className="mx-auto mt-12 max-w-[1280px]">
          <div className="flex flex-wrap gap-3" aria-label="Danh mục Template">
            {TEMPLATE_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 font-mono text-[11px] transition ${
                  activeCategory === category
                    ? 'border-[#b4c5ff]/30 bg-[#2563eb]/20 text-[#b4c5ff]'
                    : 'border-[#434655]/25 bg-[#2a2a2c] text-[#c3c6d7] hover:bg-[#353437]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredTemplates.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={setSelectedTemplate}
                  onLocked={() =>
                    showMessage(`“${template.name}” yêu cầu gói Pro.`)
                  }
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-white/10 bg-[#1c1b1d] p-10 text-center">
              <h2 className="text-xl font-semibold text-white">Không tìm thấy mẫu</h2>
              <p className="mt-2 text-sm text-[#c3c6d7]">
                Thử thay đổi từ khóa hoặc chọn danh mục khác.
              </p>
            </div>
          )}
        </section>
      </main>

      <StatusNotice>{notice}</StatusNotice>
      <CreateLandingPageModal
        open={Boolean(selectedTemplate)}
        template={selectedTemplate}
        onClose={closeCreateModal}
        onCreate={handleCreateLandingPage}
      />
    </div>
  )
}
