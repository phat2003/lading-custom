import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'
import { useTheme } from '../../../context/ThemeContext'

// Khung dùng chung cho mọi trang admin: Sidebar cố định + Topbar + nội dung (Outlet).
// data-mode ở đây quyết định toàn bộ màu của khu admin (biến --bd-* trong index.css).
export default function AdminLayout() {
  const { theme } = useTheme()
  const { pathname } = useLocation()

  return (
    <div
      data-mode={theme}
      className="app-theme relative flex h-screen overflow-hidden bg-[var(--bd-app)] text-[var(--bd-text)]"
    >
      {/* Quầng sáng nền cho đỡ phẳng, giống canvas của builder */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[var(--bd-orb-a)] blur-[130px]" />
        <div className="absolute -bottom-40 right-0 h-[460px] w-[460px] rounded-full bg-[var(--bd-orb-b)] blur-[130px]" />
      </div>

      <AdminSidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <AdminTopbar />
        {/* key theo pathname để mỗi lần đổi trang nội dung hiện lên mượt */}
        <main key={pathname} className="flex-1 animate-fade-in-up overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
