import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthShell from '../components/auth/AuthShell'
import AuthField from '../components/auth/AuthField'
import { CheckIcon } from '../components/icons'

const MailIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const LockIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

const ArrowRight = ({ className = 'h-4 w-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
)

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Login = () => {
  const { login, dashboardPath } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Nơi cần quay lại sau khi đăng nhập, do trang trước gửi kèm qua location.state
  // (ví dụ bấm "Sử dụng template" ở trang chủ khi chưa đăng nhập).
  // Chỉ nhận đường dẫn nội bộ để không bị lợi dụng chuyển hướng ra ngoài.
  const rawFrom = location.state?.from
  const redirectTo =
    typeof rawFrom === 'string' && rawFrom.startsWith('/') && !rawFrom.startsWith('//')
      ? rawFrom
      : null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }
    if (!EMAIL_REGEX.test(email)) {
      setError('Email không hợp lệ')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)
    try {
      const u = await login(email, password)
      const isAdmin = u.role === 'admin' || u.role === 'super_admin'
      // Có đích chờ sẵn thì đi thẳng, không chen màn hình chúc mừng vào giữa.
      if (redirectTo) navigate(redirectTo)
      else if (isAdmin) navigate('/admin')
      else setIsSuccess(true)
    } catch {
      setError('Sai email hoặc mật khẩu')
    } finally {
      setLoading(false)
    }
  }

  const handleStartWorkspace = () => {
    navigate(redirectTo || dashboardPath)
  }

  // ===== Màn hình chúc mừng sau khi đăng nhập =====
  if (isSuccess) {
    return (
      <AuthShell title="Thành công!" subtitle="Chào mừng bạn quay trở lại. Không gian làm việc đã sẵn sàng.">
        <div className="flex flex-col items-center gap-8">
          <span className="grid h-20 w-20 animate-pop-in place-items-center rounded-full border border-cyan-400/40 bg-gradient-to-br from-violet-500/20 to-cyan-400/20 text-[var(--bd-ok)] shadow-[0_0_40px_-10px_rgba(139,92,246,.9)]">
            <CheckIcon size={38} strokeWidth={2.5} />
          </span>

          <button
            type="button"
            onClick={handleStartWorkspace}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_26px_-6px_rgba(139,92,246,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_34px_-2px_rgba(139,92,246,1)] active:translate-y-0"
          >
            <span>Bắt đầu tạo dự án ngay</span>
            <ArrowRight />
          </button>
        </div>
      </AuthShell>
    )
  }

  // ===== Màn hình đăng nhập =====
  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Tiếp tục xây dựng trang đích của bạn."
      footer={
        <p className="text-center text-sm text-[var(--bd-dim)]">
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            state={location.state}
            className="font-semibold text-[var(--bd-accent)] transition-colors hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      }
    >
      {error && (
        <div className="mb-6 rounded-lg border border-[var(--bd-danger)] bg-red-500/10 p-3.5 text-center text-sm text-[var(--bd-danger)]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthField
          label="Email"
          icon={<MailIcon />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="creator@example.com"
          autoComplete="email"
        />

        <div>
          <div className="flex items-center justify-between">
            <span className="ad-label">Mật khẩu</span>
            <Link to="#" className="mb-1.5 text-xs font-medium text-[var(--bd-accent)] hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <AuthField
            label=""
            icon={<LockIcon />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            showToggle
            revealed={showPassword}
            onToggleReveal={() => setShowPassword((v) => !v)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-4 text-sm font-bold text-white shadow-[0_0_26px_-6px_rgba(139,92,246,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_34px_-2px_rgba(139,92,246,1)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
        >
          <span>{loading ? 'Đang xử lý...' : 'Đăng nhập'}</span>
          {!loading && <ArrowRight />}
        </button>
      </form>

      {/* Đăng nhập Google — backend chưa có OAuth nên tạm khoá, không để nút chết */}
      <div className="relative flex items-center justify-center py-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--bd-border)]" />
        </div>
        <span className="relative bg-[var(--bd-panel-solid)] px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--bd-muted)]">
          hoặc
        </span>
      </div>

      <button
        type="button"
        disabled
        title="Đăng nhập Google chưa được hỗ trợ"
        className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-xl border border-[var(--bd-border)] bg-[var(--bd-fill)] px-4 py-3.5 text-sm font-medium text-[var(--bd-muted)] opacity-60"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.001 10.462h-7.001v3.077h4.038c-0.173 0.962-0.712 1.769-1.5 2.308v1.923h2.423c1.423-1.308 2.231-3.231 2.231-5.5 0-0.615-0.038-1.231-0.192-1.808z" fill="#4285F4" />
          <path d="M12 19c2.154 0 3.962-0.712 5.269-1.923l-2.423-1.923c-0.673 0.442-1.538 0.731-2.846 0.731-2.154 0-3.962-1.462-4.615-3.423h-2.5v1.923c1.308 2.615 4.038 4.615 7.115 4.615z" fill="#34A853" />
          <path d="M7.385 12.462c-0.173-0.5-0.269-1.038-0.269-1.577s0.096-1.077 0.269-1.577v-1.923h-2.5c-0.577 1.154-0.885 2.423-0.885 3.5s0.308 2.346 0.885 3.5l2.5-1.923z" fill="#FBBC05" />
          <path d="M12 7.231c1.154 0 2.231 0.385 3.038 1.154l2.269-2.269c-1.385-1.308-3.192-2.115-5.308-2.115-3.077 0-5.808 2-7.115 4.615l2.5 1.923c0.653-1.962 2.462-3.423 4.615-3.423z" fill="#EA4335" />
        </svg>
        <span>Continue with Google (sắp có)</span>
      </button>
    </AuthShell>
  )
}

export default Login
