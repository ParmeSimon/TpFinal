import { api } from './client'
import type { TokenResponse, UserDTO } from './types'

export const register = (data: { firstName: string; lastName: string; email: string; password: string }) =>
  api.post<UserDTO>('/auth/register', data).then(r => r.data)

export const login = (email: string, password: string) =>
  api.post<TokenResponse>('/auth/login', { email, password }).then(r => r.data)

export const refresh = (refreshToken: string) =>
  api.post<TokenResponse>('/auth/refresh', { refreshToken }).then(r => r.data)

export const me = () => api.get<UserDTO>('/users/me').then(r => r.data)