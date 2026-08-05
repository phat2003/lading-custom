import axios from 'axios'
import { createApiContractError, normalizeApiError } from './apiError'

export const AUTH_SESSION_CLEARED_EVENT = 'auth-session-cleared'
const API_REQUEST_TIMEOUT_MS = 20000

let redirectingToLogin = false

const clearStoredAuthSession = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.dispatchEvent(new Event(AUTH_SESSION_CLEARED_EVENT))
}

// Client axios dùng chung cho toàn bộ app.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Tự động gắn JWT token vào header mỗi request (nếu đã đăng nhập).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Xử lý lỗi 401 tập trung: token hết hạn -> về trang login.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearStoredAuthSession()
      // Tránh redirect lặp nếu đang ở trang login.
      const isLoginPage =
        window.location.pathname === '/login' ||
        window.location.pathname.startsWith('/login/')
      if (!isLoginPage && !redirectingToLogin) {
        redirectingToLogin = true
        window.location.assign('/login')
      }
    }
    return Promise.reject(err)
  },
)

/**
 * Request helper cho API mới. Trả data/meta đã được tách khỏi Axios response và
 * ném normalized error an toàn cho UI. `config.signal` được Axios hỗ trợ trực tiếp.
 */
export const requestApi = async (config, errorOptions) => {
  try {
    const response = await api.request({
      timeout: API_REQUEST_TIMEOUT_MS,
      ...config,
    })
    const envelope = response?.data

    if (!envelope || envelope.success !== true) {
      throw createApiContractError(
        'Phản hồi từ máy chủ không đúng định dạng mong đợi.',
      )
    }

    return {
      data: envelope.data,
      message: typeof envelope.message === 'string' ? envelope.message : null,
      meta: envelope.meta || null,
    }
  } catch (error) {
    throw normalizeApiError(error, errorOptions)
  }
}

export default api
