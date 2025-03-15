'use client'

// Component Imports
import ParticipantList from '@views/apps/participants/list'

// Next.js exports
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const ParticipantListApp = () => {
  return <ParticipantList />
}

export default ParticipantListApp
