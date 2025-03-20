/**
 * Participant Types
 * This file contains types related to participants
 */

export interface Participant {
  id: number
  startNumber: string
  name: string
  nik: string
  city: string
  province: string
  team: string
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
  registrationDate: string
  status: 'Pending' | 'Approved' | 'Rejected'
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
  startNumber: string
  name: string
  nik: string
  city: string
  province: string
  team: string
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
