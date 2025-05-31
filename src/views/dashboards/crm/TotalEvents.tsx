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

// API Config Imports
import { API_ENDPOINTS, fetchWithAuthFallback } from '@/utils/apiConfig'


const TotalEvents = () => {
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    const fetchTotalEvents = async () => {
      try {
        setLoading(true)
        
        // Get organizerId from session
        const organizerId = session?.user?.organizerId
        
        console.log('Fetching events with organizerId:', organizerId)
        
        let response;
        
        // Only use organizer endpoint if organizerId exists and is not 0
        if (organizerId && organizerId !== 0 && organizerId !== '0') {
          // For event organizer: fetch their specific data
          console.log('Fetching events for organizer:', organizerId)
          response = await fetchWithAuthFallback(API_ENDPOINTS.TRANSACTIONS.ORGANIZER(organizerId))
        } else {
          // For admin users, fetch all data
          console.log('Fetching all events (admin view)')
          response = await fetchWithAuthFallback(API_ENDPOINTS.TRANSACTIONS.ALL)
        }

        if (!response.ok) {
          throw new Error('Failed to fetch events data')
        }

        const responseText = await response.text()

        if (!responseText) {
          throw new Error('Empty response from server')
        }

        const result = JSON.parse(responseText)
        console.log('Parsed transaction data:', result)
        
        // Calculate total events count
        let totalEvents = 0;
        
        // Handle different response formats based on user role
        
        if (organizerId) {
          // For event organizer: count events from their specific data
          if (result.data?.events && Array.isArray(result.data.events)) {
            totalEvents = result.data.events.length;
          }
        } else {
          // For admin: sum up events from all organizers
          if (result.data?.organizers && Array.isArray(result.data.organizers)) {
            totalEvents = result.data.organizers.reduce((sum: number, organizer: any) => {
              if (organizer.events && Array.isArray(organizer.events)) {
                return sum + organizer.events.length;
              }
              
              return sum + (organizer.event_count || 0);
            }, 0);
          }
        }

        setTotalCount(totalEvents)
      } catch (err: any) {
        console.error('Error fetching total events:', err)

        // Set a default count to avoid showing an error
        setTotalCount(0)
        setError('Failed to load events data')
      } finally {
        setLoading(false)
      }
    }

    fetchTotalEvents()
  }, [session?.user?.organizerId])

  const handleViewAll = () => {
    // Get the current language from the URL
    const lang = window.location.pathname.split('/')[1] || 'en'
    const organizerId = session?.user?.organizerId

    if (organizerId && organizerId !== 0 && organizerId !== '0') {
      // If user is an event organizer, direct to their orders page
      router.push(`/${lang}/orders`)
    } else {
      // If user is an admin, direct to the general transactions page
      router.push(`/${lang}/event-transactions`)
    }
  }

  return (
    <Card>
      <CardContent sx={{ p: theme => `${theme.spacing(5)} !important` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant='h5'>Total Events</Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'info.main',
              color: 'white'
            }}
          >
            <i className='ri-calendar-event-line' style={{ fontSize: '1.5rem' }}></i>
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
              Total events
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
              Total events
            </Typography>
          </>
        )}

        <Button 
          variant='contained' 
          fullWidth 
          onClick={handleViewAll}
          startIcon={<i className='ri-eye-line'></i>}
          color="info"
        >
          View All Events
        </Button>
      </CardContent>
    </Card>
  )
}

export default TotalEvents
