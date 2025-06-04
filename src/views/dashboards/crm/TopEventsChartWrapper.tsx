'use client'

// React Imports
import dynamic from 'next/dynamic'

// Dynamically import the client component
const TopEventsChart = dynamic(() => import('./TopEventsChart'), { ssr: false })

const TopEventsChartWrapper = () => {
  return <TopEventsChart />
}

export default TopEventsChartWrapper
