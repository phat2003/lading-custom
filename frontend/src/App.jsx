import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home/Home'
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

// Bọc route cần đăng nhập: chưa login thì đẩy về /login.
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8">Đang tải...</div>
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/icons" element={<IconGallery />} />

      {/* Builder toàn màn hình — tách khỏi AdminLayout (có toolbar riêng, không sidebar admin) */}
      <Route path="/admin/templates/new" element={<TemplateBuilder />} />
      {/* Cùng builder, chế độ Section: admin dựng section mẫu để tái sử dụng */}
      <Route path="/admin/sections/new" element={<TemplateBuilder mode="section" />} />
      <Route path="/admin/sections/:id/edit" element={<TemplateBuilder mode="section" />} />

      {/* Khu admin — TODO(team): bọc AdminRoute (chỉ admin/super_admin) trước khi lên production */}
      <Route path="/admin" element={<AdminLayout />}>
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
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      {/* TODO(team): thêm route cho editor, project, pricing... */}
    </Routes>
  )
}
