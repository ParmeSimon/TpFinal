import { api } from './client'
import type { RoomDTO, CreateRoomDTO } from './types'

export const listRooms = () => api.get<RoomDTO[]>('/rooms').then(r => r.data)
export const listAvailable = () => api.get<RoomDTO[]>('/rooms/available').then(r => r.data)
export const getRoom = (id: number) => api.get<RoomDTO>(`/rooms/${id}`).then(r => r.data)
export const createRoom = (dto: CreateRoomDTO) => api.post<RoomDTO>('/rooms', dto).then(r => r.data)
export const updateRoom = (id: number, dto: CreateRoomDTO) => api.put<RoomDTO>(`/rooms/${id}`, dto).then(r => r.data)
export const deleteRoom = (id: number) => api.delete<void>(`/rooms/${id}`).then(r => r.data)