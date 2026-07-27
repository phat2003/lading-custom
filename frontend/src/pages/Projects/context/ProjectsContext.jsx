import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const STORAGE_KEY = 'myproject.frontend.projects.v1'
const ProjectsContext = createContext(null)

function createId() {
  return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
}

function createStarterSections(sourceType) {
  if (sourceType === 'blank') return []

  return [
    {
      id: createId(),
      type: 'hero',
      title: 'Mẫu Hero Section',
      text: 'Đây là ví dụ về một khối nội dung bạn có thể tùy chỉnh. Nhấp vào các phần tử để thay đổi thuộc tính bên phải.',
      buttonText: 'Khám phá ngay',
      backgroundColor: '#f8faff',
      textColor: '#0f172a',
      align: 'center',
    },
  ]
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

  const createProject = useCallback((name) => {
    const newProject = {
      id: createId(),
      name,
      status: 'draft',
      updatedAt: 'Vừa tạo',
      previewType: Date.now() % 3,
      landingPages: [],
    }

    setProjects((currentProjects) => [newProject, ...currentProjects])
    return newProject
  }, [])

  const getProject = useCallback(
    (projectId) => projects.find((project) => project.id === projectId),
    [projects],
  )

  const createLandingPage = useCallback((projectId, payload) => {
    const newLandingPage = {
      id: createId(),
      name: payload.name,
      sourceId: payload.source.id,
      sourceType: payload.source.type,
      sourceName: payload.source.name,
      status: 'draft',
      updatedAt: 'Vừa tạo',
      sections: createStarterSections(payload.source.type),
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
  }, [])

  const getLandingPage = useCallback(
    (projectId, landingPageId) => {
      const project = projects.find((item) => item.id === projectId)
      return project?.landingPages.find((page) => page.id === landingPageId)
    },
    [projects],
  )

  const updateLandingPageSections = useCallback(
    (projectId, landingPageId, sections) => {
      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                updatedAt: 'Vừa cập nhật',
                landingPages: project.landingPages.map((page) =>
                  page.id === landingPageId
                    ? {
                        ...page,
                        sections,
                        updatedAt: 'Vừa cập nhật',
                      }
                    : page,
                ),
              }
            : project,
        ),
      )
    },
    [],
  )

  const value = useMemo(
    () => ({
      projects,
      createProject,
      getProject,
      createLandingPage,
      getLandingPage,
      updateLandingPageSections,
    }),
    [
      projects,
      createProject,
      getProject,
      createLandingPage,
      getLandingPage,
      updateLandingPageSections,
    ],
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
