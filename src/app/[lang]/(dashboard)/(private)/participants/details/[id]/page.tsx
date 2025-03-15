'use client'

// React Imports
import { Suspense } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import ParticipantDetail from '@/views/apps/participants/details'

// Loading Component
const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', my: 6 }}>
    <CircularProgress />
  </Box>
)

const ParticipantDetailPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <ParticipantDetail />
    </Suspense>
  )
}

export default ParticipantDetailPage
