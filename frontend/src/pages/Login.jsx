import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      setIsSuccess(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleStartWorkspace = () => {
    navigate('/projects')
  }

  // Màn hình thành công sau khi đăng nhập (Ảnh 3)
  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#030712] relative overflow-hidden font-sans">
        {/* Plexus background decoration (SVG) */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full text-blue-500" viewBox="0 0 800 600" fill="none">
            <path d="M100 150L250 100M250 100L450 180M450 180L600 80M600 80L700 250M250 100L300 350M450 180L300 350M300 350L150 480M300 350L500 480M500 480L700 250M600 80L500 480" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="100" cy="150" r="3" fill="currentColor" />
            <circle cx="250" cy="100" r="4" fill="currentColor" className="animate-ping" />
            <circle cx="250" cy="100" r="2.5" fill="currentColor" />
            <circle cx="450" cy="180" r="3" fill="currentColor" />
            <circle cx="600" cy="80" r="3.5" fill="currentColor" />
            <circle cx="700" cy="250" r="3" fill="currentColor" />
            <circle cx="300" cy="350" r="4" fill="currentColor" />
            <circle cx="150" cy="480" r="3" fill="currentColor" />
            <circle cx="500" cy="480" r="3" fill="currentColor" />
          </svg>
        </div>

        {/* Success Card */}
        <div className="relative z-10 w-full max-w-md p-10 mx-4 border border-slate-900 bg-slate-950/70 backdrop-blur-md rounded-3xl shadow-2xl text-center space-y-8 flex flex-col items-center">
          
          {/* Glowing Checkmark Circle */}
          <div className="relative flex items-center justify-center h-20 w-20 rounded-full border border-blue-500/40 bg-blue-950/30 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)] animate-pulse">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-white tracking-wide">Thành công!</h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
              Chào mừng bạn quay trở lại. Không gian làm việc của bạn đã sẵn sàng.
            </p>
          </div>

          <button
            onClick={handleStartWorkspace}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-xs font-bold tracking-widest text-white uppercase shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
          >
            <span>Bắt đầu tạo dự án ngay</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // Giao diện Đăng nhập chính (Ảnh 1)
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#030712] relative overflow-hidden font-sans px-4">
      {/* Background glow decorator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-10 border border-slate-900/60 bg-[#070c1e]/60 backdrop-blur-md rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.08)] flex flex-col items-center">
        
        {/* Logo container */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#131b2e] border border-slate-800 shadow-[0_0_15px_rgba(37,99,235,0.2)] mb-6">
          <svg className="h-6 w-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </div>

        {/* Card Header */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-wide">Welcome Back</h1>
          <p className="text-slate-400 text-sm">Log in to your command center.</p>
        </div>

        {/* Error display */}
        {error && (
          <div className="w-full p-3.5 mb-6 text-sm text-red-400 border border-red-950 bg-red-950/20 rounded-lg text-center animate-shake">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          
          {/* Email field */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@example.com"
                required
                className="w-full bg-white text-slate-900 placeholder-slate-400 pl-11 pr-4 py-3.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium text-sm"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Password
              </label>
              <Link to="#" className="text-xs text-blue-500 hover:text-blue-400 font-medium">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-white text-slate-900 placeholder-slate-400 pl-11 pr-4 py-3.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium text-sm"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#080d21] border border-blue-900/60 shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:border-blue-700/80 hover:bg-slate-950 text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 cursor-pointer text-sm"
          >
            <span>{loading ? 'Đang xử lý...' : 'Đăng nhập'}</span>
            {!loading && (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative w-full flex items-center justify-center py-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative bg-[#080c1f] px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            OR
          </span>
        </div>

        {/* Google sign in button */}
        <button
          type="button"
          className="w-full bg-[#181d2f]/80 hover:bg-[#1f253d] border border-slate-800 text-white font-medium py-3.5 px-4 rounded-lg flex items-center justify-center gap-2.5 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-sm"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.001 10.462h-7.001v3.077h4.038c-0.173 0.962-0.712 1.769-1.5 2.308v1.923h2.423c1.423-1.308 2.231-3.231 2.231-5.5 0-0.615-0.038-1.231-0.192-1.808z" fill="#4285F4" />
            <path d="M12 19c2.154 0 3.962-0.712 5.269-1.923l-2.423-1.923c-0.673 0.442-1.538 0.731-2.846 0.731-2.154 0-3.962-1.462-4.615-3.423h-2.5v1.923c1.308 2.615 4.038 4.615 7.115 4.615z" fill="#34A853" />
            <path d="M7.385 12.462c-0.173-0.5-0.269-1.038-0.269-1.577s0.096-1.077 0.269-1.577v-1.923h-2.5c-0.577 1.154-0.885 2.423-0.885 3.5s0.308 2.346 0.885 3.5l2.5-1.923z" fill="#FBBC05" />
            <path d="M12 7.231c1.154 0 2.231 0.385 3.038 1.154l2.269-2.269c-1.385-1.308-3.192-2.115-5.308-2.115-3.077 0-5.808 2-7.115 4.615l2.5 1.923c0.653-1.962 2.462-3.423 4.615-3.423z" fill="#EA4335" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Footer */}
        <p className="mt-8 text-sm text-center text-slate-500 font-medium">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-blue-500 hover:text-blue-400 transition-colors font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </p>

      </div>
    </div>
  )
}
