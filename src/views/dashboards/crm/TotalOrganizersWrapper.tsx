'use client'

import dynamic from 'next/dynamic'

// Dynamically import the TotalOrganizers component with no SSR
const TotalOrganizers = dynamic(
  () => import('@views/dashboards/crm/TotalOrganizers'),
  { ssr: false }
)

const TotalOrganizersWrapper = () => {
  return <TotalOrganizers />
}

export default TotalOrganizersWrapper
