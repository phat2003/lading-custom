import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

// AuthProvider bọc toàn app, cung cấp user + hàm login/logout.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Khôi phục user từ localStorage khi load lại trang.
    const saved = localStorage.getItem('user')
    if (saved) {
      setUser(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await authApi.login({ email, password })
    const { token, user: u } = res.data.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
    return u
  }

  const register = async (payload) => {
    const res = await authApi.register(payload)
    return res.data.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  // Nơi "về nhà" sau khi đăng nhập / bấm "Vào Dashboard".
  // Định nghĩa một chỗ duy nhất để các trang không tự đoán mỗi nơi một kiểu.
  const dashboardPath = isAdmin ? '/admin' : '/projects'

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAdmin, dashboardPath }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook tiện dụng để dùng auth ở bất kỳ component nào.
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải dùng bên trong AuthProvider')
  return ctx
}
