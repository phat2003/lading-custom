import api from './client'

// Gọi các endpoint auth của backend.
export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
}
