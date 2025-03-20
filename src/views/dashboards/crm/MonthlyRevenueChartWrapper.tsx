'use client'

// React Imports
import dynamic from 'next/dynamic'

// Dynamically import the client component
const MonthlyRevenueChart = dynamic(() => import('./MonthlyRevenueChart'), { ssr: false })

const MonthlyRevenueChartWrapper = () => {
  return <MonthlyRevenueChart />
}

export default MonthlyRevenueChartWrapper
