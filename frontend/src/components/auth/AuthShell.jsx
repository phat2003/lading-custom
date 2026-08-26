import { Link } from 'react-router-dom'
import Logo from '../common/Logo'
import { MoonIcon, SunIcon, ArrowLeftIcon } from '../icons'
import { useTheme } from '../../context/ThemeContext'

// Khung dùng chung cho Đăng nhập / Đăng ký.
// Trước đây mỗi trang tự giữ state darkMode riêng nên đổi giao diện ở đây xong
// vào app lại lệch. Giờ dùng chung ThemeContext với Admin / Builder / My Project.
const AuthShell = ({ title, subtitle, children, footer, wide = false }) => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div
      data-mode={theme}
      className="app-theme relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bd-app)] px-4 py-10 font-sans text-[var(--bd-text)]"
    >
      {/* Quầng sáng nền — cùng ngôn ngữ với trang chủ và khu admin */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] animate-float-orb rounded-full bg-[var(--bd-orb-a)] blur-[130px]" />
        <div
          className="absolute -bottom-40 -right-32 h-[460px] w-[460px] animate-float-orb rounded-full bg-[var(--bd-orb-b)] blur-[130px]"
          style={{ animationDelay: '3s' }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(var(--bd-grid) 1px, transparent 1px), linear-gradient(90deg, var(--bd-grid) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Thanh tiện ích trên cùng: quay về trang chủ + đổi sáng/tối */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] px-3 py-2 text-sm text-[var(--bd-dim)] transition-all duration-200 hover:border-violet-400/40 hover:text-[var(--bd-text)]"
        >
          <ArrowLeftIcon size={16} />
          <span className="hidden sm:inline">Về trang chủ</span>
        </Link>

        <button
          type="button"
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
      </div>

      <div
        className={`relative z-10 w-full animate-fade-in-up rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] p-8 shadow-[var(--bd-page-shadow)] sm:p-10 ${
          wide ? 'max-w-lg' : 'max-w-md'
        }`}
      >
        <div className="flex flex-col items-center text-center">
          <Logo size="lg" />
          <h1 className="mt-5 font-serif text-3xl font-normal text-[var(--bd-text)]">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-[var(--bd-dim)]">{subtitle}</p>}
        </div>

        <div className="mt-8">{children}</div>

        {footer && <div className="mt-8">{footer}</div>}
      </div>
    </div>
  )
}

export default AuthShell
