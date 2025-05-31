/**
 * Organizer Types
 * This file contains types related to event organizers
 */

export interface OrganizerImage {
  id?: number
  url?: string
  type?: string
}

export interface Organizer {
  id: number
  name: string
  website: string | null
  description: string | null
  images: OrganizerImage[]
}

export interface OrganizersResponse {
  data: Organizer[]
}
