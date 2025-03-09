'use client'

// React Imports
import type { CSSProperties } from 'react'

// Component Imports
import MaterializeLogo from '@core/svg/Logo'

const Logo = ({ color }: { color?: CSSProperties['color'] }) => {
  return (
    <div className='flex items-center justify-center min-bs-[40px]'>
      <div className='flex-shrink-0'>
        <MaterializeLogo />
      </div>
    </div>
  )
}

export default Logo
