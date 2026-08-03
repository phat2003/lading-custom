import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import IconGallery from './pages/icons-list/IconGallery'
import AdminLayout from './pages/admin/layout/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard/Dashboard'
import AdminUsers from './pages/admin/Users/Users'
import AdminTemplates from './pages/admin/Templates/Templates'
import AdminSections from './pages/admin/Sections/Sections'
import AdminProjects from './pages/admin/Projects/Projects'
import AdminPricingPlans from './pages/admin/PricingPlans/PricingPlans'
import AdminAiGenerator from './pages/admin/AiGenerator/AiGenerator'
import AdminSettings from './pages/admin/Settings/Settings'
import TemplateBuilder from './pages/admin/builder/TemplateBuilder'
import ProjectsPage from './pages/Projects/ProjectsPage/ProjectsPage'
import TemplateGalleryPage from './pages/Projects/TemplateGalleryPage/TemplateGalleryPage'
import LandingPageEditorPage from './pages/Projects/LandingPageEditorPage/LandingPageEditorPage'
import { ProjectsProvider } from './pages/Projects/context/ProjectsContext'

// Bọc route cần đăng nhập: chưa login thì đẩy về /login.
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8">Đang tải...</div>
  return user ? children : <Navigate to="/login" replace />
}

// Bọc khu admin: chưa login -> /login; đã login nhưng không phải admin -> trang chủ.
function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8">Đang tải...</div>
  if (!user) return <Navigate to="/login" replace />
  const isAdmin = user.role === 'admin' || user.role === 'super_admin'
  return isAdmin ? children : <Navigate to="/" replace />
}

// Điều hướng /projects/:projectId -> tab templates mặc định.
function ProjectEntryRedirect() {
  const { projectId } = useParams()
  return <Navigate to={`/projects/${projectId}/templates`} replace />
}

export default function App() {
  return (
    <ProjectsProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/icons" element={<IconGallery />} />

        {/* Trang chủ Landing Page công khai */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        {/* Quản lý dự án của người dùng (cần đăng nhập) */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <ProjectEntryRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/templates"
          element={
            <ProtectedRoute>
              <TemplateGalleryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/editor/:landingPageId"
          element={
            <ProtectedRoute>
              <LandingPageEditorPage />
            </ProtectedRoute>
          }
        />

        {/* Builder toàn màn hình — admin dựng template/section mẫu (AdminRoute) */}
        <Route path="/admin/templates/new" element={<AdminRoute><TemplateBuilder /></AdminRoute>} />
        {/* Cùng builder, chế độ Section: admin dựng section mẫu để tái sử dụng */}
        <Route path="/admin/sections/new" element={<AdminRoute><TemplateBuilder mode="section" /></AdminRoute>} />
        <Route path="/admin/sections/:id/edit" element={<AdminRoute><TemplateBuilder mode="section" /></AdminRoute>} />

        {/* Khu vực Admin — chỉ admin/super_admin mới vào được (AdminRoute) */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="templates" element={<AdminTemplates />} />
          <Route path="sections" element={<AdminSections />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="pricing" element={<AdminPricingPlans />} />
          <Route path="ai" element={<AdminAiGenerator />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route
            path="*"
            element={<div className="text-slate-400">Trang đang được phát triển…</div>}
          />
        </Route>
      </Routes>
    </ProjectsProvider>
  )
}
