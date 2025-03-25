/**
 * Participant Types
 * This file contains types related to participants
 */

export interface ParticipantDetail {
  id: number
  participantId: number
  startNumber: string
  categoryClass: string
  className: string
  vehicleBrand: string
  vehicleType: string
  vehicleColor: string
  chassisNumber: string
  engineNumber: string
  phoneNumber: string
  pos: string
  createdAt: string
  updatedAt: string
}

export interface Participant {
  id: number
  name: string
  nik: string
  city: string
  province: string
  team: string
  file?: string
  registrationDate: string
  status: 'Pending' | 'Approved' | 'Rejected'
  orderId?: string
  phoneNumber?: string | null
  expirationDate?: string | null
  details: ParticipantDetail[]
}

export interface ParticipantResponse {
  success: boolean
  data: Participant[] | Participant
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
  city: string
  province: string
  team: string
  startNumber: string
  categoryClass: string
  className: string
  vehicleBrand: string
  vehicleType: string
  vehicleColor: string
  chassisNumber: string
  engineNumber: string
  phoneNumber: string
  pos: string
  file?: string
}
