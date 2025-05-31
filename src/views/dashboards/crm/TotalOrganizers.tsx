'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Auth Imports
import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'

// Base API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://airatix.id:8000/public'

const TotalOrganizers = () => {
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { data: session } = useSession()
  
  // Check if user is an admin
  const organizerId = session?.user?.organizerId
  const isAdmin = !organizerId || organizerId === 0 || organizerId === '0'

  useEffect(() => {
    const fetchTotalOrganizers = async () => {
      try {
        setLoading(true)

        // First try with the main API endpoint
        let response = await fetch(`${API_BASE_URL}/organizers-public`)

        // If that fails, try with a fallback
        if (!response.ok && process.env.NEXT_PUBLIC_API_BASE_URL) {
          // Try with the default fallback URL
          response = await fetch(`https://airatix.id:8000/public/organizers-public`)
        }

        if (!response.ok) {
          throw new Error('Failed to fetch organizers data')
        }

        const result = await response.json()

        // Get the total count from the API response
        setTotalCount(result.total || result.data.length)
      } catch (err) {
        console.error('Error fetching total organizers:', err)

        // Set a default count to avoid showing an error
        setTotalCount(0)
        setError('Failed to load organizers data')
      } finally {
        setLoading(false)
      }
    }

    fetchTotalOrganizers()
  }, [])

  const handleViewAll = () => {
    // Get the current language from the URL
    const lang = window.location.pathname.split('/')[1] || 'en'

    router.push(`/${lang}/event-organizers`)
  }

  // If user is not an admin, don't render this component
  if (!isAdmin) {
    return null
  }
  
  return (
    <Card>
      <CardContent sx={{ p: theme => `${theme.spacing(5)} !important` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant='h5'>Total Organizers</Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'success.main',
              color: 'white'
            }}
          >
            <i className='ri-building-line' style={{ fontSize: '1.5rem' }}></i>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : error ? (
          <>
            <Typography variant='h3' sx={{ mb: 1, fontWeight: 'bold' }}>
              {totalCount}
            </Typography>
            <Typography variant='body2' sx={{ mb: 1, color: 'text.secondary' }}>
              Registered organizers
            </Typography>
            <Typography variant='caption' color='error' sx={{ display: 'block', mb: 3 }}>
              {error}
            </Typography>
          </>
        ) : (
          <>
            <Typography variant='h3' sx={{ mb: 1, fontWeight: 'bold' }}>
              {totalCount}
            </Typography>
            <Typography variant='body2' sx={{ mb: 4, color: 'text.secondary' }}>
              Registered organizers
            </Typography>
          </>
        )}

        <Button
          variant='contained'
          fullWidth
          onClick={handleViewAll}
          startIcon={<i className='ri-eye-line'></i>}
          color='success'
        >
          View All Organizers
        </Button>
      </CardContent>
    </Card>
  )
}

export default TotalOrganizers
