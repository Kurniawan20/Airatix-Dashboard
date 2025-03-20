'use client'

import dynamic from 'next/dynamic'

// Dynamically import the TotalEvents component with no SSR
const TotalEvents = dynamic(
  () => import('@views/dashboards/crm/TotalEvents'),
  { ssr: false }
)

const TotalEventsWrapper = () => {
  return <TotalEvents />
}

export default TotalEventsWrapper
