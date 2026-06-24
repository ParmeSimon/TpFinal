import axios from 'axios'

// @ts-ignore
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('accessToken')
  if (token && cfg.headers) {
    cfg.headers.Authorization = `Bearer ${token}`
  }
  return cfg
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err.response?.status
    const url: string = err.config?.url ?? ''
    if ((status === 401 || status === 403) && !url.startsWith('/auth/') && !url.startsWith('/public/')) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      if (!window.location.pathname.startsWith('/login') && window.location.pathname !== '/') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)