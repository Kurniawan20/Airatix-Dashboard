export interface QuestionAnswer {
  id: number
  question_id: number
  question_text: string
  ticket_id: number | null
  attendee_id: number | null
  answer: string | any // Can be string or object (for address fields)
  created_at: string
  updated_at: string
}

export interface Attendee {
  id: number
  name: string
  firstname: string
  lastname: string
  email: string
  check_in_status: string | null
  short_id: string
  public_id: string
  status: string
  checked_in_at: string | null
}

export interface Ticket {
  id: number
  title: string
  description: string
  quantity: number
  price_paid: number
  original_price: number
  attendees: Attendee[] | Record<string, Attendee>
}

export interface EventInfo {
  id: number
  title: string
  description: string
  start_date: string
  end_date: string
  location: string
  location_details: string | null
  status: string
  currency: string
  timezone: string
  attributes: any | null
  created_at: string
  updated_at: string
  organizer: {
    id: number
    name: string
    email: string
  }
}

export interface Transaction {
  id: number
  short_id: string
  status: string
  total_price: number
  payment_status: string | null
  payment_url: string | null
  created_at: string
  updated_at: string
  id_type: string | null
  id_number: string | null
  phone: string | null
  country: string | null
  province: string | null
  city: string | null
  metadata: string | null
  event: EventInfo
  tickets: Ticket[]
  question_answers?: QuestionAnswer[] // Added question_answers field
  firstname?: string
  lastname?: string
}

export interface EventSummary {
  event_id: number
  event_title: string
  event_start_date: string
  event_end_date: string
  total_amount: number
  transaction_count: number
  transactions: Transaction[]
}

export interface OrganizerSummary {
  organizer_id: number
  organizer_name: string
  organizer_email: string
  total_amount: number
  total_transactions: number
  events: EventSummary[]
}

export interface TransactionsResponse {
  message: string
  data: {
    total_amount: string
    total_transactions: number
    current_page: number
    per_page: number
    last_page: number
    organizers: OrganizerSummary[]
  }
}

export interface EventTransaction {
  id: number
  eventId: number
  eventName: string
  customerName: string
  ticketType: string
  quantity: number
  totalAmount: number
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  createdAt: string
}

export interface OrganizerTransactionsResponse {
  message: string
  data: OrganizerSummary & {
    current_page: number
    per_page: number
    last_page: number
  }
}

export interface EventTransactionResponse {
  message: string
  data: {
    total_amount: string
    total_transactions: number
    current_page: number
    per_page: number
    last_page: number
    events: {
      event_id: number
      event_title: string
      event_status: string
      event_start_date: string
      event_end_date: string
      total_amount: number
      transaction_count: number
      transactions: Transaction[]
    }[]
  }
}

export interface OrganizerTransactionResponse {
  message: string
  data: {
    organizer_id: string
    organizer_name: string
    organizer_email: string
    total_amount: number
    total_transactions: number
    current_page: number
    per_page: number
    last_page: number
    events: {
      event_id: number
      event_title: string
      event_start_date: string
      event_end_date: string
      event_status?: string
      total_amount: number
      transaction_count: number
      transactions: Transaction[]
    }[]
  }
}
