import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import LandingPageEditorPage from '../Projects/LandingPageEditorPage/LandingPageEditorPage'
import { useProjects } from '../Projects/context/ProjectsContext'
import DashboardState from './components/DashboardState'

const findLatestLandingPage = (projects) => {
  for (const project of projects) {
    const landingPage = project.landingPages?.[0]

    if (landingPage) {
      return { project, landingPage }
    }
  }

  return null
}

const DashboardPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { projects, getProject, getLandingPage } = useProjects()
  const requestedProjectId = searchParams.get('projectId')
  const requestedLandingPageId = searchParams.get('landingPageId')

  const selectedTarget = useMemo(() => {
    if (requestedProjectId || requestedLandingPageId) {
      if (!requestedProjectId || !requestedLandingPageId) return null

      const project = getProject(requestedProjectId)
      const landingPage = getLandingPage(
        requestedProjectId,
        requestedLandingPageId,
      )

      return project && landingPage ? { project, landingPage } : null
    }

    return findLatestLandingPage(projects)
  }, [
    getLandingPage,
    getProject,
    projects,
    requestedLandingPageId,
    requestedProjectId,
  ])

  const hasRequestedTarget = Boolean(
    requestedProjectId || requestedLandingPageId,
  )

  if (!selectedTarget) {
    if (hasRequestedTarget) {
      return (
        <DashboardState
          eyebrow="Dashboard · Realtime Preview"
          title="Không tìm thấy Landing Page"
          description="Landing Page được yêu cầu không còn tồn tại hoặc không thuộc Project hiện tại. Hãy chọn lại từ danh sách Project."
          actionLabel="Mở danh sách Project"
          onAction={() => navigate('/projects')}
          secondaryLabel="Mở Dashboard gần nhất"
          onSecondaryAction={() => navigate('/dashboard')}
        />
      )
    }

    return (
      <DashboardState
        eyebrow="Dashboard · Realtime Preview"
        title="Chưa có Landing Page để xem trước"
        description="Tạo Project và chọn Blank, System Template hoặc User Template. Dashboard sẽ mở Realtime Preview ngay sau khi Landing Page được tạo."
        actionLabel="Bắt đầu từ My Project"
        onAction={() => navigate('/projects')}
      />
    )
  }

  return (
    <LandingPageEditorPage
      key={`${selectedTarget.project.id}-${selectedTarget.landingPage.id}`}
      projectIdOverride={selectedTarget.project.id}
      landingPageIdOverride={selectedTarget.landingPage.id}
    />
  )
}

export default DashboardPage
