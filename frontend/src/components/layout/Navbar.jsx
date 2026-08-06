import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  // dashboardPath: admin -> /admin, user thường -> /projects
  const { user, logout, dashboardPath } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Cuộn mượt đến các phần trên trang chủ
  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white tracking-wide">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </div>
          <span>LP Builder</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors cursor-pointer">
            Tính năng
          </button>
          <button onClick={() => scrollToSection('templates')} className="hover:text-white transition-colors cursor-pointer">
            Template
          </button>
          <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors cursor-pointer">
            Bảng giá
          </button>
          <button onClick={() => scrollToSection('reviews')} className="hover:text-white transition-colors cursor-pointer">
            Review
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden sm:inline text-sm text-slate-300">
                Hi, <strong className="text-white">{user.full_name || user.email}</strong>
              </span>
              <Link
                to={dashboardPath}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                Vào Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                Thử miễn phí
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
