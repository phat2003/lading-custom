import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'myproject.frontend.projects.v1'
const ProjectsContext = createContext(null)

function createId() {
  return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
}

function loadProjects() {
  try {
    const savedProjects = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!Array.isArray(savedProjects)) return []

    return savedProjects.map((project) => ({
      ...project,
      landingPages: Array.isArray(project.landingPages)
        ? project.landingPages
        : [],
    }))
  } catch {
    return []
  }
}

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState(loadProjects)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    } catch {
      // Mock storage có thể bị chặn trong chế độ trình duyệt riêng tư.
    }
  }, [projects])

  const value = useMemo(
    () => ({
      projects,
      createProject(name) {
        const newProject = {
          id: createId(),
          name,
          status: 'draft',
          updatedAt: 'Vừa tạo',
          previewType: projects.length % 3,
          landingPages: [],
        }

        setProjects((currentProjects) => [newProject, ...currentProjects])
        return newProject
      },
      getProject(projectId) {
        return projects.find((project) => project.id === projectId)
      },
      createLandingPage(projectId, payload) {
        const newLandingPage = {
          id: createId(),
          name: payload.name,
          sourceId: payload.source.id,
          sourceType: payload.source.type,
          sourceName: payload.source.name,
          status: 'draft',
          updatedAt: 'Vừa tạo',
        }

        setProjects((currentProjects) =>
          currentProjects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  updatedAt: 'Vừa cập nhật',
                  landingPages: [newLandingPage, ...project.landingPages],
                }
              : project,
          ),
        )

        return newLandingPage
      },
      getLandingPage(projectId, landingPageId) {
        const project = projects.find((item) => item.id === projectId)
        return project?.landingPages.find((page) => page.id === landingPageId)
      },
    }),
    [projects],
  )

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectsContext)

  if (!context) {
    throw new Error('useProjects phải được dùng bên trong ProjectsProvider')
  }

  return context
}
