'use client'

// React Imports
import dynamic from 'next/dynamic'

// Dynamically import the client component
const TotalTax = dynamic(() => import('./TotalTax'), { ssr: false })

const TotalTaxWrapper = () => {
  return <TotalTax />
}

export default TotalTaxWrapper
