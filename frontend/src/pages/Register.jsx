import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ full_name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(true)

  // NEW STATES
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState('')
  const [passwordScore, setPasswordScore] = useState(0)

  // Strength evaluation
  const evaluateStrength = (password) => {
    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 10) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    setPasswordScore(score)

    if (score <= 2) return 'Yếu'
    if (score <= 4) return 'Trung bình'
    if (score === 5) return 'Mạnh'
    return 'Rất mạnh'
  }

  const validateForm = () => {
    const nextErrors = { full_name: '', email: '', password: '' }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const passwordRegex = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/

    if (!form.full_name.trim()) nextErrors.full_name = 'Họ và tên không được để trống'
    if (!form.email.trim()) nextErrors.email = 'Email không được để trống'
    else if (!emailRegex.test(form.email)) nextErrors.email = 'Email không hợp lệ'
    if (!form.password.trim()) nextErrors.password = 'Mật khẩu không được để trống'
    else if (!passwordRegex.test(form.password)) nextErrors.password = 'Mật khẩu phải từ 6 ký tự, có số và ký tự đặc biệt'

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
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`flex items-center justify-center min-h-screen relative overflow-hidden font-sans px-4 
      ${darkMode ? 'bg-[#030712] text-white' : 'bg-gray-100 text-black'}`}>

      {/* Toggle dark/light */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute px-3 py-1 text-sm border rounded-md top-4 right-4"
      >
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className={`relative z-10 w-full max-w-md p-10 rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.08)] flex flex-col items-center 
        ${darkMode ? 'border border-slate-900/60 bg-[#070c1e]/60 backdrop-blur-md' : 'border border-gray-300 bg-white'}`}>

        <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-6 
          ${darkMode ? 'bg-[#131b2e] border border-slate-800 shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'bg-gray-200 border border-gray-300 shadow'}`}>
          <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </div>

        <div className="mb-8 space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-wide">Myproject</h1>
          <p className={`${darkMode ? 'text-slate-400' : 'text-gray-600'} text-sm`}>
            Bắt đầu xây dựng trải nghiệm tuyệt vời.
          </p>
        </div>

        {error && (
          <div className="w-full p-3.5 mb-6 text-sm text-red-400 border border-red-950 bg-red-950/20 rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="w-full space-y-5">

          {/* Full name */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest block">Họ và tên</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>

              <input
                type="text"
                value={form.full_name}
                onChange={(e) => {
                  setForm({ ...form, full_name: e.target.value })
                  if (fieldErrors.full_name) setFieldErrors((prev) => ({ ...prev, full_name: '' }))
                }}
                placeholder="Nhập họ và tên"
                className={`w-full pl-11 pr-4 py-3.5 rounded-lg border transition-all font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 
                  ${darkMode ? 'bg-[#13192b] text-white placeholder-slate-500 border-slate-800' : 'bg-white text-black placeholder-gray-400 border-gray-300'}`}
              />

              {fieldErrors.full_name && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.full_name}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest block">Email</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>

              <input
                type="email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value })
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }))
                }}
                placeholder="name@company.com"
                className={`w-full pl-11 pr-4 py-3.5 rounded-lg border transition-all font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 
                  ${darkMode ? 'bg-[#13192b] text-white placeholder-slate-500 border-slate-800' : 'bg-white text-black placeholder-gray-400 border-gray-300'}`}
              />

              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest block">Mật khẩu</label>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>

              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => {
                  const value = e.target.value
                  setForm({ ...form, password: value })
                  setPasswordStrength(evaluateStrength(value))
                }}
                placeholder="Tạo mật khẩu"
                className={`w-full pl-11 pr-12 py-3.5 rounded-lg border transition-all font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 
                  ${darkMode ? 'bg-[#13192b] text-white placeholder-slate-500 border-slate-800' : 'bg-white text-black placeholder-gray-400 border-gray-300'}`}
              />

              {/* Eye toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute -translate-y-1/2 right-4 top-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? (
                  // Closed eye
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"
                    className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M3 3l18 18M10.584 10.587A3 3 0 0113.413 13.41M6.343 6.343C4.493 7.76 3 10 3 12c0 0 3.75 6 9.75 6 1.63 0 3.15-.33 4.5-.92M17.657 17.657C19.507 16.24 21 14 21 12c0 0-3.75-6-9.75-6-1.63 0-3.15.33-4.5.92" />
                  </svg>
                ) : (
                  // Open eye
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"
                    className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.25 12c0 0 3.75-6 9.75-6s9.75 6 9.75 6-3.75 6-9.75 6-9.75-6-9.75-6z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {/* Strength meter bar */}
            {form.password && (
              <div className="mt-2">

                <p className="mt-1 text-xs font-medium">
                  Độ mạnh mật khẩu:{" "}
                  <span
                    className={
                      passwordStrength === 'Yếu' ? 'text-red-400' :
                      passwordStrength === 'Trung bình' ? 'text-yellow-400' :
                      passwordStrength === 'Mạnh' ? 'text-green-400' :
                      'text-blue-400'
                    }
                  >
                    {passwordStrength}
                  </span>
                </p>
                <div className="w-full h-2 overflow-hidden rounded-full bg-slate-700/40">
                  <div
                    className={`h-full transition-all duration-300 ${
                      passwordScore <= 2 ? 'bg-red-500' :
                      passwordScore <= 4 ? 'bg-yellow-400' :
                      passwordScore === 5 ? 'bg-green-500' :
                      'bg-blue-500'
                    }`}
                    style={{
                      width:
                        passwordScore <= 2 ? '25%' :
                        passwordScore <= 4 ? '50%' :
                        passwordScore === 5 ? '75%' :
                        '100%'
                    }}
                  />
                </div>
              </div>
            )}

            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-blue-600/30 transition-all duration-200 disabled:opacity-50 cursor-pointer text-sm"
          >
            <span>{loading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}</span>
            {!loading && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-sm font-medium text-center text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-blue-500 transition-colors hover:text-blue-400 hover:underline">
            Đăng nhập
          </Link>
        </p>

        <p className="mt-8 text-[10px] text-center text-slate-500 leading-relaxed max-w-xs">
          Bằng cách đăng ký, bạn đồng ý với{' '}
          <a href="#terms" className="underline transition-colors text-slate-400 hover:text-white">
            Điều khoản dịch vụ
          </a>{' '}
          và{' '}
          <a href="#privacy" className="underline transition-colors text-slate-400 hover:text-white">
            Chính sách bảo mật
          </a>{' '}
          của chúng tôi.
        </p>
      </div>
    </div>
  )
}
