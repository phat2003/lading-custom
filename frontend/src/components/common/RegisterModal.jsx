import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function RegisterModal({ isOpen, onClose, onSuccess }) {
  const { register } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

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
      setForm({ email: '', password: '', full_name: '' })
      onClose()
      onSuccess?.()
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative p-8 bg-white rounded-lg shadow-lg w-96">
        <button
          onClick={onClose}
          className="absolute text-gray-500 top-2 right-2 hover:text-gray-700"
        >
          ×
        </button>
        <h2 className="mb-6 text-2xl font-bold text-center">Create Account</h2>

        {error && (
          <div className="p-2 mb-4 text-sm text-red-600 bg-red-100 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Email:</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Full name:</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
              placeholder="Enter your full name"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Password:</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Create a password"
              className="w-full p-2 border rounded"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white transition bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Đang xử lý...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          Already have an account?{' '}
          <span className="text-blue-600 cursor-pointer">Login here</span>
        </p>
      </div>
    </div>
  )
}
