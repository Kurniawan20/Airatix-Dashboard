export interface EventOrganizerUser {
  first_name: string
  last_name: string
  full_name: string
  timezone: string
  locale: string
}

export interface EventOrganizer {
  id: number
  uuid: string
  email: string
  created_at: string
  updated_at: string
  user: EventOrganizerUser | null
}

export interface EventOrganizersResponse {
  message: string
  data: {
    total_emails: number
    current_page: number
    per_page: number
    last_page: number
    items: EventOrganizer[]
  }
}

export interface EventOrganizerRegistration {
  first_name: string
  last_name: string
  email: string
  password: string
  password_confirmation: string
  timezone: string
  currency_code: string
  locale: string | null
}

export interface ValidationErrors {
  [key: string]: string[]
}

export interface ApiError {
  message: string
  errors?: ValidationErrors
}

export interface RegistrationResponse {
  status: number
  message: string
}

export interface EventOrganizerStats {
  total_events: number
  total_sales: number
  total_orders: number
  member_since: string
}

export interface EventOrganizerDetail extends EventOrganizer {
  stats: EventOrganizerStats
  user: EventOrganizerUser & {
    email_verified: boolean
    verified_at: string
  }
}

export interface EventOrganizerDetailResponse {
  message: string
  data: EventOrganizerDetail
}
