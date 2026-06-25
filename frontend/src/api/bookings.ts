import { api } from './client'
import type { BookingDTO, CreateBookingDTO, PublicBookingSlot, UpdateBookingDTO } from './types'

// Planning public d'une salle : créneaux occupés, accessible sans connexion.
export const listRoomSlots = (roomId: number) =>
  api.get<PublicBookingSlot[]>(`/public/rooms/${roomId}/bookings`).then(r => r.data)

export const listMine = () => api.get<BookingDTO[]>('/bookings/me').then(r => r.data)
export const listAll = () => api.get<BookingDTO[]>('/bookings').then(r => r.data)
export const getBooking = (id: number) => api.get<BookingDTO>(`/bookings/${id}`).then(r => r.data)
export const createBooking = (dto: CreateBookingDTO) =>
  api.post<BookingDTO>('/bookings', dto).then(r => r.data)
export const updateBooking = (id: number, dto: UpdateBookingDTO) =>
  api.put<BookingDTO>(`/bookings/${id}`, dto).then(r => r.data)
export const cancelBooking = (id: number) =>
  api.put<BookingDTO>(`/bookings/${id}/cancel`).then(r => r.data)
export const confirmBooking = (id: number) =>
  api.put<BookingDTO>(`/bookings/${id}/confirm`).then(r => r.data)
export const rejectBooking = (id: number) =>
  api.put<BookingDTO>(`/bookings/${id}/reject`).then(r => r.data)