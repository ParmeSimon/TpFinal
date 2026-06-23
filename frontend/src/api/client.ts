import axios from 'axios'

export const api = axios.create({ baseURL: '/api' })

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
    // 401 = token absent/invalide. 403 = Spring renvoie ça aussi quand le filtre
    // JWT n'a pas pu peupler la SecurityContext (token expiré silencieusement).
    // Sur ces statuts pour un endpoint protégé, on purge la session locale.
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