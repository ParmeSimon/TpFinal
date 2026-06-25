import { api } from './client'
import type { EquipmentDTO } from './types'

export const listEquipments = () => api.get<EquipmentDTO[]>('/equipments').then(r => r.data)
export const createEquipment = (name: string) =>
  api.post<EquipmentDTO>('/equipments', { name }).then(r => r.data)