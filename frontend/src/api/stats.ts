import { api } from './client'

export interface PublicStats {
  totalRooms: number
  availableRooms: number
  totalBookings: number
  confirmedBookings: number
}

export const getPublicStats = () =>
  api.get<PublicStats>('/public/stats').then(r => r.data)