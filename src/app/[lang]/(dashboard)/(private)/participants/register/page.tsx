'use client'

// Component Imports
import RegisterParticipant from '@views/apps/participants/register'

// This page must be a client component because it uses the registerParticipantApi which makes fetch calls
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const RegisterParticipantPage = () => {
  return <RegisterParticipant />
}

export default RegisterParticipantPage
