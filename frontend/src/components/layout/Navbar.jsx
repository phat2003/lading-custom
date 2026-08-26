import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { MoonIcon, SunIcon } from '../icons'
import Logo from '../common/Logo'

const NAV_LINKS = [
  { id: 'features', label: 'Tính năng' },
  { id: 'templates', label: 'Template' },
  { id: 'pricing', label: 'Bảng giá' },
  { id: 'reviews', label: 'Review' },
]

const Navbar = () => {
  // dashboardPath: admin -> /admin, user thường -> /projects
  const { user, logout, dashboardPath } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const isDark = theme === 'dark'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Cuộn mượt đến các phần trên trang chủ
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    // bg dùng --bd-topbar (token rgba sẵn có) chứ không phải bg-[var(--bd-app)]/80:
    // Tailwind không sinh được rule khi thêm alpha vào biến CSS.
    <nav className="sticky top-0 z-50 border-b border-[var(--bd-border)] bg-[var(--bd-topbar)] px-6 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="group flex items-center gap-2 text-xl font-bold tracking-wide text-[var(--bd-text)]"
        >
          <Logo className="transition-transform duration-300 group-hover:scale-105" />
          <span>LP Builder</span>
        </Link>

        {/* Điều hướng trong trang */}
        <div className="hidden items-center gap-8 text-sm font-medium text-[var(--bd-dim)] md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="relative cursor-pointer py-1 transition-colors hover:text-[var(--bd-text)] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-gradient-to-r after:from-violet-400 after:to-cyan-400 after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Hành động */}
        <div className="flex items-center gap-3">
          {/* Đổi giao diện sáng/tối — dùng chung ThemeContext với khu Admin */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] text-[var(--bd-dim)] transition-all duration-200 hover:border-violet-400/40 hover:text-violet-400"
          >
            <span className={`absolute transition-all duration-300 ${isDark ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'}`}>
              <MoonIcon size={17} />
            </span>
            <span className={`absolute transition-all duration-300 ${isDark ? '-rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}>
              <SunIcon size={17} />
            </span>
          </button>

          {user ? (
            <>
              <span className="hidden text-sm text-[var(--bd-dim)] sm:inline">
                Hi, <strong className="text-[var(--bd-text)]">{user.full_name || user.email}</strong>
              </span>
              <Link to={dashboardPath} className="ad-btn-primary">
                Vào Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="cursor-pointer text-sm font-medium text-[var(--bd-muted)] transition-colors hover:text-red-400"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-[var(--bd-dim)] transition-colors hover:text-[var(--bd-text)]"
              >
                Đăng nhập
              </Link>
              <Link to="/register" className="ad-btn-primary">
                Thử miễn phí
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
