export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN'

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REJECTED'

export interface UserDTO {
  id: number
  firstName: string
  lastName: string
  email: string
  active : boolean
  roles: Role[]
  avatarUrl: string | null
}

export interface UpdateProfileDTO {
  firstName: string
  lastName: string
}

export interface EquipmentDTO {
  id: number
  name: string
}

export type RoomFileCategory = 'PHOTO' | 'DOCUMENT'

export interface RoomFileDTO {
  id: number
  url: string
  originalName: string
  contentType: string | null
  sizeBytes: number
  category: RoomFileCategory
  createdAt: string
}

export interface ChangePasswordDTO {
  currentPassword: string
  newPassword: string
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
  equipments: string[]
  createdAt: string
  photoUrls: string[]
}

export interface CreateRoomDTO {
  name: string
  capacity: number
  description: string
  available: boolean
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

// Créneau occupé exposé publiquement (planning), sans données personnelles.
export interface PublicBookingSlot {
  startTime: string
  endTime: string
  status: BookingStatus
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