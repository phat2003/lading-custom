import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

// Trang quản lý dự án sau khi đăng nhập
export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <header className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold">Landing Page Builder</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">{user?.full_name || user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:underline"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <p className="text-gray-700">
          Chào mừng! Đây là trang chủ quản lý dự án của bạn. Danh sách Project sẽ hiển thị ở đây.
        </p>
        {/* TODO(FE Dev 1): hiển thị danh sách project, nút tạo project mới */}
      </main>
    </div>
  )
}
