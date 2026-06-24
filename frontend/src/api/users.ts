import {api} from './client'
import type {UserDTO, UpdateUserDTO} from "./types"

export const listUsers = () => api.get<UserDTO[]>('/users').then(r => r.data)
export const getUser = (id: number) => api.get<UserDTO>(`/users/${id}`).then(r => r.data)
export const updateUser = (id: number, dto: UpdateUserDTO) => api.put<UserDTO>(`/users/${id}`, dto).then(r => r.data)