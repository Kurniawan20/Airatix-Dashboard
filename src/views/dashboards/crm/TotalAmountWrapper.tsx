'use client'

// React Imports
import dynamic from 'next/dynamic'

// Dynamically import the client component
const TotalAmount = dynamic(() => import('./TotalAmount'), { ssr: false })

const TotalAmountWrapper = () => {
  return <TotalAmount />
}

export default TotalAmountWrapper
