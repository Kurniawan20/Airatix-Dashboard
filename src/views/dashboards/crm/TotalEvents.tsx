'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

 

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

  useEffect(() => {
    const fetchTotalEvents = async () => {
      try {
        setLoading(true)

        // Use the correct API endpoint
        const response = await fetchWithAuthFallback(API_ENDPOINTS.TRANSACTIONS.ALL)

        if (!response.ok) {
          throw new Error('Failed to fetch events data')
        }

        const responseText = await response.text()

        if (!responseText) {
          throw new Error('Empty response from server')
        }

        const result = JSON.parse(responseText)

        console.log('Parsed transaction data:', result)

        // Get the total count of events from the API response
        // Sum up all the event counts from all organizers
        let totalEvents = 0

        // Check if we have organizers data
        if (result.data?.organizers && Array.isArray(result.data.organizers)) {
          // Sum up the event_count from each organizer
          totalEvents = result.data.organizers.reduce((sum: number, organizer: any) => {
            // Log each organizer to see the structure
            console.log('Organizer:', organizer)

            // Check if the organizer has events property
            if (organizer.events && Array.isArray(organizer.events)) {
              return sum + organizer.events.length
            }

            // Fallback to event_count if available
            return sum + (organizer.event_count || 0)
          }, 0)
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
  }, [])

  const handleViewAll = () => {
    // Get the current language from the URL
    const lang = window.location.pathname.split('/')[1] || 'en'

    router.push(`/${lang}/event-transactions`)
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
