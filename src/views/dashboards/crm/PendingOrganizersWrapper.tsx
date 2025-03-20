'use client'

import dynamic from 'next/dynamic'

// Dynamically import the PendingOrganizers component with no SSR
const PendingOrganizers = dynamic(
  () => import('@views/dashboards/analytics/PendingOrganizers'),
  { ssr: false }
)

const PendingOrganizersWrapper = () => {
  return <PendingOrganizers />
}

export default PendingOrganizersWrapper
