'use client'

// React Imports
import dynamic from 'next/dynamic'

// Dynamically import the client component
const TotalRevenue = dynamic(() => import('./TotalRevenue'), { ssr: false })

const TotalRevenueWrapper = () => {
  return <TotalRevenue />
}

export default TotalRevenueWrapper
