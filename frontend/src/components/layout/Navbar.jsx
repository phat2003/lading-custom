import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Button from '../common/Button'

// Thanh điều hướng trên cùng — FE Dev 1 phát triển menu/links.
export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="border-b bg-white px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="text-xl font-semibold text-gray-900">
          Landing Page Builder
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600">
                {user.full_name || user.email}
              </span>
              <Button variant="ghost" onClick={logout}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-blue-600 hover:underline">
                Đăng nhập
              </Link>
              <Link to="/register">
                <Button>Đăng ký</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
