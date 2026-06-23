import { api } from './client'
import type { RoomDTO } from './types'

export interface PublicStats {
  totalRooms: number
  availableRooms: number
  totalBookings: number
  confirmedBookings: number
}

export const getPublicStats = () =>
  api.get<PublicStats>('/public/stats').then(r => r.data)

export const getPublicRooms = (limit?: number) =>
  api.get<RoomDTO[]>('/public/rooms', { params: limit ? { limit } : {} }).then(r => r.data)