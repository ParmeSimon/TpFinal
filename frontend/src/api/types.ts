export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN'

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REJECTED'

export interface UserDTO {
  id: number
  firstName: string
  lastName: string
  email: string
  active : boolean
  roles: Role[]
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export interface RoomDTO {
  id: number
  name: string
  capacity: number
  description: string
  available: boolean
  currentlyBooked: boolean
  imageUrl: string
  equipments: string[]
  createdAt: string
}

export interface CreateRoomDTO {
  name: string
  capacity: number
  description: string
  available: boolean
  imageUrl: string
  equipmentIds: number[]
}

export interface BookingDTO {
  id: number
  roomId: number
  roomName: string
  userId: number
  userEmail: string
  startTime: string
  endTime: string
  purpose: string
  attendees: number | null
  status: BookingStatus
  createdAt: string
}

export interface CreateBookingDTO {
  roomId: number
  startTime: string
  endTime: string
  purpose: string
  attendees: number
}

export interface UpdateBookingDTO {
  roomId: number
  startTime: string
  endTime: string
  purpose: string
  attendees: number
}

export interface UpdateUserDTO {
  firstName: string
  lastName: string
  roles: Role[]
  active: boolean
}