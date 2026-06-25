import { api } from './client'
import type { UserDTO, RoomFileDTO, RoomFileCategory } from './types'

// --- Avatar de l'utilisateur connecté ---
export const uploadAvatar = (file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post<UserDTO>('/users/me/avatar', fd).then(r => r.data)
}

export const deleteAvatar = () => api.delete<UserDTO>('/users/me/avatar').then(r => r.data)

// --- Fichiers rattachés aux salles (photos & documents) ---
export const listRoomFiles = (roomId: number) =>
  api.get<RoomFileDTO[]>(`/rooms/${roomId}/files`).then(r => r.data)

export const uploadRoomFile = (roomId: number, file: File, category?: RoomFileCategory) => {
  const fd = new FormData()
  fd.append('file', file)
  if (category) fd.append('category', category)
  return api.post<RoomFileDTO>(`/rooms/${roomId}/files`, fd).then(r => r.data)
}

export const deleteRoomFile = (roomId: number, fileId: number) =>
  api.delete<void>(`/rooms/${roomId}/files/${fileId}`).then(r => r.data)