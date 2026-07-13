import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'

// Khung dùng chung cho mọi trang admin: Sidebar cố định + Topbar + nội dung (Outlet).
export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0f17] text-slate-200">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
