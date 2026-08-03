import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const validateForm = () => {
    const nextErrors = { email: '', password: '' }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const passwordRegex = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/

    if (!form.email.trim()) {
      nextErrors.email = 'Email không được để trống'
    } else if (!emailRegex.test(form.email)) {
      nextErrors.email = 'Email không hợp lệ'
    }

    if (!form.password.trim()) {
      nextErrors.password = 'Mật khẩu không được để trống'
    } else if (!passwordRegex.test(form.password)) {
      nextErrors.password = 'Mật khẩu phải từ 6 ký tự, có số và ký tự đặc biệt'
    }

    setFieldErrors(nextErrors)
    return !nextErrors.email && !nextErrors.password
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await login(form.email, form.password)
      setForm({ email: '', password: '' })
      setFieldErrors({ email: '', password: '' })
      onClose()
      onSuccess?.()
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-[420px] rounded-2xl border border-slate-800 bg-slate-950/95 p-8 shadow-[0_0_40px_rgba(15,23,42,0.6)]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          ×
        </button>
        <h2 className="mb-6 text-center text-2xl font-bold text-white">Login</h2>

        {error && (
          <div className="mb-4 rounded-lg border border-red-900/70 bg-red-950/30 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Email:</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, email: e.target.value }))
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: '' }))
                }
              }}
              placeholder="Enter your email"
              className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ${fieldErrors.email ? 'border-red-500' : 'border-slate-300'}`}
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Password:</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, password: e.target.value }))
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: '' }))
                }
              }}
              placeholder="Enter your password"
              className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ${fieldErrors.password ? 'border-red-500' : 'border-slate-300'}`}
            />
            {fieldErrors.password && <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-60"
          >
            {loading ? 'Đang xử lý...' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-400">
          First time here?{' '}
          <span className="cursor-pointer text-blue-400">Create an account</span>
        </p>
      </div>
    </div>
  )
}
