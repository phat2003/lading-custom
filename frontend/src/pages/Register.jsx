import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.full_name || !form.email || !form.password) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

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
    <div className="flex items-center justify-center min-h-screen bg-[#030712] relative overflow-hidden font-sans px-4">
      {/* Background glow decorator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-md p-10 border border-slate-900/60 bg-[#070c1e]/60 backdrop-blur-md rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.08)] flex flex-col items-center">
        
        {/* Logo container */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#131b2e] border border-slate-800 shadow-[0_0_15px_rgba(37,99,235,0.2)] mb-6">
          <svg className="h-6 w-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </div>

        {/* Card Header */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-wide">Myproject</h1>
          <p className="text-slate-400 text-sm">Bắt đầu xây dựng trải nghiệm tuyệt vời.</p>
        </div>

        {/* Error display */}
        {error && (
          <div className="w-full p-3.5 mb-6 text-sm text-red-400 border border-red-950 bg-red-950/20 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          
          {/* Full name field */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              Họ và tên
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Nhập họ và tên"
                required
                className="w-full bg-[#13192b] text-white placeholder-slate-500 pl-11 pr-4 py-3.5 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium text-sm"
              />
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@company.com"
                required
                className="w-full bg-[#13192b] text-white placeholder-slate-500 pl-11 pr-4 py-3.5 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium text-sm"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              Mật khẩu
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Tạo mật khẩu"
                required
                minLength={6}
                className="w-full bg-[#13192b] text-white placeholder-slate-500 pl-11 pr-4 py-3.5 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium text-sm"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-blue-600/30 transition-all duration-200 disabled:opacity-50 cursor-pointer text-sm"
          >
            <span>{loading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}</span>
            {!loading && (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </form>

        {/* Login redirect link */}
        <p className="mt-6 text-sm text-center text-slate-500 font-medium">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-500 hover:text-blue-400 transition-colors font-semibold hover:underline">
            Đăng nhập
          </Link>
        </p>

        {/* Disclaimer footer */}
        <p className="mt-8 text-[10px] text-center text-slate-500 leading-relaxed max-w-xs">
          Bằng cách đăng ký, bạn đồng ý với{' '}
          <a href="#terms" className="text-slate-400 underline hover:text-white transition-colors">
            Điều khoản dịch vụ
          </a>{' '}
          và{' '}
          <a href="#privacy" className="text-slate-400 underline hover:text-white transition-colors">
            Chính sách bảo mật
          </a>{' '}
          của chúng tôi.
        </p>

      </div>
    </div>
  )
}
