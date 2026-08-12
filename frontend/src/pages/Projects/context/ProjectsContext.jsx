import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useLocation } from 'react-router-dom'
import { projectsApi } from '../../../api/projects'
import { useAuth } from '../../../context/AuthContext'

const LEGACY_PROJECTS_STORAGE_KEY = 'myproject.frontend.projects.v1'
const LANDING_PAGES_STORAGE_KEY = 'myproject.frontend.landing-pages.v1'
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

function getPreviewType(projectId) {
  // Chỉ là trang trí UI ổn định theo ID server, không phải dữ liệu nghiệp vụ.
  return Array.from(String(projectId)).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  ) % 3
}

export function mapProjectFromApi(project) {
  if (!project?.project_id) return null

  return {
    id: project.project_id,
    name: typeof project.name === 'string' ? project.name : '',
    ownerId: project.owner_id || null,
    createdAt: project.created_at || null,
    updatedAt: project.updated_at || null,
    previewType: getPreviewType(project.project_id),
  }
}

function normalizeLandingPageCache(cache) {
  if (!cache || typeof cache !== 'object' || Array.isArray(cache)) return {}

  return Object.fromEntries(
    Object.entries(cache).filter(([, pages]) => Array.isArray(pages)),
  )
}

function loadLandingPages() {
  try {
    const savedCache = JSON.parse(
      localStorage.getItem(LANDING_PAGES_STORAGE_KEY),
    )
    const normalizedCache = normalizeLandingPageCache(savedCache)
    if (Object.keys(normalizedCache).length > 0) return normalizedCache

    // Lớp tương thích tạm thời: chỉ lấy Landing Page local từ cấu trúc cũ.
    // Project entity không được khôi phục hoặc trộn vào danh sách từ server.
    const legacyProjects = JSON.parse(
      localStorage.getItem(LEGACY_PROJECTS_STORAGE_KEY),
    )
    if (!Array.isArray(legacyProjects)) return {}

    return Object.fromEntries(
      legacyProjects
        .filter(
          (project) => project?.id && Array.isArray(project.landingPages),
        )
        .map((project) => [project.id, project.landingPages]),
    )
  } catch {
    return {}
  }
}

export function ProjectsProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const isProjectRoute = location.pathname.startsWith('/projects')
  const [projects, setProjects] = useState([])
  const [projectsStatus, setProjectsStatus] = useState('idle')
  const [projectsError, setProjectsError] = useState('')
  const [landingPagesByProject, setLandingPagesByProject] = useState(
    loadLandingPages,
  )
  const requestIdRef = useRef(0)
  const createdProjectsRef = useRef(new Map())

  useEffect(() => {
    try {
      localStorage.setItem(
        LANDING_PAGES_STORAGE_KEY,
        JSON.stringify(landingPagesByProject),
      )
    } catch {
      // Cache prototype có thể bị chặn trong chế độ trình duyệt riêng tư.
    }
  }, [landingPagesByProject])

  const reloadProjects = useCallback(async (signal) => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setProjectsStatus('loading')
    setProjectsError('')

    try {
      const response = await projectsApi.list({ signal })
      const projectRecords = response?.data?.data
      if (!Array.isArray(projectRecords)) {
        throw new Error('Invalid projects response')
      }

      const nextProjects = projectRecords
        .map(mapProjectFromApi)
        .filter(Boolean)
      const serverProjectIds = new Set(
        nextProjects.map((project) => project.id),
      )

      // Giữ kết quả POST đã được server xác nhận nếu một GET cũ trả về muộn.
      createdProjectsRef.current.forEach((project, projectId) => {
        if (serverProjectIds.has(projectId)) {
          createdProjectsRef.current.delete(projectId)
        } else {
          nextProjects.unshift(project)
        }
      })

      if (requestId !== requestIdRef.current || signal?.aborted) return
      setProjects(nextProjects)
      setProjectsStatus('success')
    } catch (error) {
      if (
        requestId !== requestIdRef.current ||
        signal?.aborted ||
        error.name === 'CanceledError'
      ) {
        return
      }

      setProjects([])
      setProjectsError(
        error?.response?.data?.error ||
          'Không tải được danh sách Project. Vui lòng thử lại.',
      )
      setProjectsStatus('error')
    }
  }, [])

  useEffect(() => {
    if (authLoading || !isProjectRoute) return undefined

    if (!user) {
      requestIdRef.current += 1
      createdProjectsRef.current.clear()
      setProjects([])
      setProjectsError('')
      setProjectsStatus('idle')
      return undefined
    }

    const controller = new AbortController()
    reloadProjects(controller.signal)
    return () => controller.abort()
  }, [authLoading, isProjectRoute, reloadProjects, user])

  const createProject = useCallback(async (name) => {
    const response = await projectsApi.create({ name: name.trim() })
    const newProject = mapProjectFromApi(response?.data?.data)

    if (!newProject) {
      throw new Error('Invalid project response')
    }

    createdProjectsRef.current.set(newProject.id, newProject)
    setProjects((currentProjects) => [
      newProject,
      ...currentProjects.filter((project) => project.id !== newProject.id),
    ])
    setProjectsError('')
    setProjectsStatus('success')
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

    // Compatibility layer local cho prototype Landing Page; PJ-FE-1 không gọi API Page.
    setLandingPagesByProject((currentCache) => ({
      ...currentCache,
      [projectId]: [newLandingPage, ...(currentCache[projectId] || [])],
    }))

    return newLandingPage
  }, [])

  const getLandingPage = useCallback(
    (projectId, landingPageId) =>
      landingPagesByProject[projectId]?.find(
        (page) => page.id === landingPageId,
      ),
    [landingPagesByProject],
  )

  const updateLandingPageSections = useCallback(
    (projectId, landingPageId, sections) => {
      setLandingPagesByProject((currentCache) => ({
        ...currentCache,
        [projectId]: (currentCache[projectId] || []).map((page) =>
          page.id === landingPageId
            ? {
                ...page,
                sections,
                updatedAt: 'Vừa cập nhật',
              }
            : page,
        ),
      }))
    },
    [],
  )

  const isProjectsLoading =
    authLoading ||
    (isProjectRoute &&
      Boolean(user) &&
      (projectsStatus === 'idle' || projectsStatus === 'loading'))

  const value = useMemo(
    () => ({
      projects,
      projectsError,
      isProjectsLoading,
      reloadProjects,
      createProject,
      getProject,
      createLandingPage,
      getLandingPage,
      updateLandingPageSections,
    }),
    [
      projects,
      projectsError,
      isProjectsLoading,
      reloadProjects,
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
