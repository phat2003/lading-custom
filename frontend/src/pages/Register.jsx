import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthShell from '../components/auth/AuthShell'
import AuthField from '../components/auth/AuthField'

const UserGlyph = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const MailGlyph = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const LockGlyph = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Backend yêu cầu: tối thiểu 6 ký tự, có ít nhất 1 số và 1 ký tự đặc biệt.
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/

// Mỗi mức có nhãn, màu và bề rộng thanh riêng — gom vào một chỗ để khỏi
// rải ba chuỗi điều kiện lặp nhau trong JSX.
const STRENGTH_LEVELS = [
  { label: 'Yếu', bar: 'bg-[var(--bd-danger)]', text: 'text-[var(--bd-danger)]', width: '25%' },
  { label: 'Trung bình', bar: 'bg-[var(--bd-warn)]', text: 'text-[var(--bd-warn)]', width: '50%' },
  { label: 'Mạnh', bar: 'bg-[var(--bd-ok)]', text: 'text-[var(--bd-ok)]', width: '75%' },
  { label: 'Rất mạnh', bar: 'bg-gradient-to-r from-violet-500 to-cyan-400', text: 'text-[var(--bd-accent)]', width: '100%' },
]

// Trả về chỉ số trong STRENGTH_LEVELS, hoặc -1 nếu chưa nhập gì.
const strengthOf = (password) => {
  if (!password) return -1
  let score = 0
  if (password.length >= 6) score += 1
  if (password.length >= 10) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  if (score <= 2) return 0
  if (score <= 4) return 1
  if (score === 5) return 2
  return 3
}

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ full_name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const strengthIndex = strengthOf(form.password)
  const strength = strengthIndex >= 0 ? STRENGTH_LEVELS[strengthIndex] : null

  // Gõ lại thì xoá lỗi của đúng ô đó, không xoá lỗi ô khác.
  const updateField = (name) => (e) => {
    setForm((prev) => ({ ...prev, [name]: e.target.value }))
    setFieldErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev))
  }

  const validateForm = () => {
    const nextErrors = { full_name: '', email: '', password: '' }

    if (!form.full_name.trim()) nextErrors.full_name = 'Họ và tên không được để trống'
    if (!form.email.trim()) nextErrors.email = 'Email không được để trống'
    else if (!EMAIL_REGEX.test(form.email))
      nextErrors.email = 'Email không đúng định dạng. Ví dụ: ten@example.com'
    if (!form.password.trim()) nextErrors.password = 'Mật khẩu không được để trống'
    else if (!PASSWORD_REGEX.test(form.password))
      nextErrors.password = 'Mật khẩu phải từ 6 ký tự, có số và ký tự đặc biệt'

    setFieldErrors(nextErrors)
    return !nextErrors.full_name && !nextErrors.email && !nextErrors.password
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validateForm()) return

    setLoading(true)
    try {
      await register(form)
      // Chuyển tiếp location.state để đích đang chờ (ví dụ template đã chọn)
      // không bị mất sau khi đăng ký xong rồi đăng nhập.
      navigate('/login', { state: location.state })
    } catch (err) {
      const serverError = err.response?.data?.error || ''
      if (/email.*(định dạng|không hợp lệ)/i.test(serverError)) {
        setFieldErrors((prev) => ({
          ...prev,
          email: 'Email không đúng định dạng. Ví dụ: ten@example.com',
        }))
      } else {
        setError(serverError || 'Đăng ký thất bại')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Tạo tài khoản"
      subtitle="Bắt đầu xây dựng trải nghiệm tuyệt vời."
      footer={
        <>
          <p className="text-center text-sm text-[var(--bd-dim)]">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              state={location.state}
              className="font-semibold text-[var(--bd-accent)] transition-colors hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
          <p className="mx-auto mt-6 max-w-xs text-center text-[10px] leading-relaxed text-[var(--bd-muted)]">
            Bằng cách đăng ký, bạn đồng ý với{' '}
            <a href="#terms" className="underline transition-colors hover:text-[var(--bd-text)]">
              Điều khoản dịch vụ
            </a>{' '}
            và{' '}
            <a href="#privacy" className="underline transition-colors hover:text-[var(--bd-text)]">
              Chính sách bảo mật
            </a>{' '}
            của chúng tôi.
          </p>
        </>
      }
    >
      {error && (
        <div className="mb-6 rounded-lg border border-[var(--bd-danger)] bg-red-500/10 p-3.5 text-center text-sm text-[var(--bd-danger)]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthField
          label="Họ và tên"
          icon={<UserGlyph />}
          value={form.full_name}
          onChange={updateField('full_name')}
          error={fieldErrors.full_name}
          placeholder="Nhập họ và tên"
          autoComplete="name"
        />

        <AuthField
          label="Email"
          icon={<MailGlyph />}
          value={form.email}
          onChange={updateField('email')}
          error={fieldErrors.email}
          placeholder="creator@example.com"
          autoComplete="email"
        />

        <div>
          <AuthField
            label="Mật khẩu"
            icon={<LockGlyph />}
            value={form.password}
            onChange={updateField('password')}
            error={fieldErrors.password}
            placeholder="Tối thiểu 6 ký tự, có số và ký tự đặc biệt"
            autoComplete="new-password"
            showToggle
            revealed={showPassword}
            onToggleReveal={() => setShowPassword((v) => !v)}
          />

          {strength && (
            <div className="mt-3">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-[var(--bd-muted)]">Độ mạnh mật khẩu</span>
                <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bd-fill-hover)]">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strength.bar}`}
                  style={{ width: strength.width }}
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-4 text-sm font-bold text-white shadow-[0_0_26px_-6px_rgba(139,92,246,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_34px_-2px_rgba(139,92,246,1)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
        >
          <span>{loading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}</span>
          {!loading && (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          )}
        </button>
      </form>
    </AuthShell>
  )
}

export default Register
