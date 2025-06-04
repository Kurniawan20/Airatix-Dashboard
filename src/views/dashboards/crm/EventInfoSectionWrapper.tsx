'use client'

// React Imports
import dynamic from 'next/dynamic'

// Dynamically import the client component
const EventInfoSection = dynamic(() => import('./EventInfoSection'), { ssr: false })

const EventInfoSectionWrapper = () => {
  return <EventInfoSection />
}

export default EventInfoSectionWrapper
