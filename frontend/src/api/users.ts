import {api} from './client'
import type {UserDTO, UpdateUserDTO, UpdateProfileDTO, ChangePasswordDTO} from "./types"

export const listUsers = () => api.get<UserDTO[]>('/users').then(r => r.data)
export const getUser = (id: number) => api.get<UserDTO>(`/users/${id}`).then(r => r.data)
export const updateUser = (id: number, dto: UpdateUserDTO) => api.put<UserDTO>(`/users/${id}`, dto).then(r => r.data)

// Profil de l'utilisateur connecté (self-service)
export const updateProfile = (dto: UpdateProfileDTO) => api.put<UserDTO>('/users/me', dto).then(r => r.data)
export const changePassword = (dto: ChangePasswordDTO) => api.put<void>('/users/me/password', dto).then(r => r.data)