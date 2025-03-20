'use client'

// React Imports
import dynamic from 'next/dynamic'

// Dynamically import the client component
const TotalFee = dynamic(() => import('./TotalFee'), { ssr: false })

const TotalFeeWrapper = () => {
  return <TotalFee />
}

export default TotalFeeWrapper
