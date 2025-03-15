/**
 * Participant Types
 * This file contains types related to participants
 */

export interface Participant {
  id: string
  startNumber: string // 4-digit sequential number
  name: string
  nik: string
  phoneNumber: string
  city: string
  province: string
  team: string
  className: string
  vehicleBrand: string
  vehicleType: string
  vehicleColor: string
  chassisNumber: string
  engineNumber: string
  pos: string
  createdAt: string
  updatedAt: string
}

export interface ParticipantResponse {
  success: boolean
  data: Participant[]
  message?: string
  pagination?: {
    current_page: number
    per_page: number
    last_page: number
    total: number
  }
}

export interface ParticipantRegistrationData {
  name: string
  nik: string
  phoneNumber: string
  city: string
  province: string
  team: string
  className: string
  vehicleBrand: string
  vehicleType: string
  vehicleColor: string
  chassisNumber: string
  engineNumber: string
  pos: string
}
