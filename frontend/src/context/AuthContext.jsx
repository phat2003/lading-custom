import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { authApi } from '../api/auth'
import { profileApi } from '../api/profile'
import { normalizePlan } from '../utils/planEntitlements'

const AuthContext = createContext(null)

// AuthProvider bọc toàn app, cung cấp user + hàm login/logout.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const storeUser = useCallback((nextUser) => {
    if (!nextUser) return null
    const normalizedUser = {
      ...nextUser,
      plan_type: normalizePlan(nextUser),
    }
    localStorage.setItem('user', JSON.stringify(normalizedUser))
    setUser(normalizedUser)
    return normalizedUser
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    const hydrateSession = async () => {
      const token = localStorage.getItem('token')
      const saved = localStorage.getItem('user')

      if (!token) {
        localStorage.removeItem('user')
        if (active) {
          setUser(null)
          setLoading(false)
        }
        return
      }

      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (active) setUser({ ...parsed, plan_type: normalizePlan(parsed) })
        } catch {
          localStorage.removeItem('user')
        }
      }

      try {
        const response = await profileApi.get({ signal: controller.signal })
        if (active) storeUser(response.data.data)
      } catch (error) {
        // Lỗi mạng tạm thời giữ user đã lưu làm fallback; 401 do API client xử lý tập trung.
        if (error?.code === 'ERR_CANCELED') return
      } finally {
        if (active) setLoading(false)
      }
    }

    hydrateSession()
    return () => {
      active = false
      controller.abort()
    }
  }, [storeUser])

  const refreshUser = useCallback(async () => {
    const response = await profileApi.get()
    return storeUser(response.data.data)
  }, [storeUser])

  const login = async (email, password) => {
    const res = await authApi.login({ email, password })
    const { token, user: u } = res.data.data
    localStorage.setItem('token', token)
    return storeUser(u)
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
      value={{ user, loading, login, register, logout, refreshUser, isAdmin, dashboardPath }}
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
