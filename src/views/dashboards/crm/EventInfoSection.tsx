'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next-Auth Imports
import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'

// Icon Import
import Icon from 'src/@core/components/icon'

// API Config Imports
import { API_ENDPOINTS, fetchWithAuthFallback } from '@/utils/apiConfig'

interface Event {
  event_id: number
  event_title: string
  event_status: string
  event_start_date: string
  event_end_date: string
  total_amount: number
  total_amount_all: number
  total_fee: number
  total_fee_all: number
  total_tax: number
  total_tax_all: number
  transaction_count: number
  completed_transaction_count: number
}

interface ApiResponse {
  message: string
  data: {
    organizer_id: string
    organizer_name: string
    organizer_email: string
    total_amount: number
    total_amount_all: number
    total_transactions: number
    completed_transactions: number
    events_count: number
    events_with_transactions: number
    events: Event[]
  }
}

const EventInfoSection = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [organizerData, setOrganizerData] = useState<{
    organizer_name: string
    total_amount: number
    total_transactions: number
  } | null>(null)

  // Get session for authentication
  const { data: session } = useSession()
  
  // Get organizerId from session
  const organizerId = session?.organizerId || session?.user?.organizerId || '8'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Use the authenticated fetch method with the proper API endpoint
        const response = await fetchWithAuthFallback(
          API_ENDPOINTS.TRANSACTIONS.ORGANIZER(organizerId)
        )

        if (!response.ok) {
          throw new Error('Failed to fetch organizer transactions')
        }

        const responseData = await response.json()
        
        setEvents(responseData.data.events)
        setOrganizerData({
          organizer_name: responseData.data.organizer_name,
          total_amount: responseData.data.total_amount,
          total_transactions: responseData.data.total_transactions
        })
        setError(null)
      } catch (err) {
        console.error('Error fetching event data:', err)
        setError('Failed to load event data. Using fallback data.')
        // Fallback to dummy data if API fails
        setEvents([
          {
            event_id: 1,
            event_title: 'Music Festival 2025',
            event_status: 'LIVE',
            event_start_date: '2025-06-15T09:00:00.000000Z',
            event_end_date: '2025-06-16T23:00:00.000000Z',
            total_amount: 8750000,
            total_amount_all: 9500000,
            transaction_count: 450,
            completed_transaction_count: 380
          },
          {
            event_id: 2,
            event_title: 'Tech Conference',
            event_status: 'LIVE',
            event_start_date: '2025-07-10T08:00:00.000000Z',
            event_end_date: '2025-07-12T18:00:00.000000Z',
            total_amount: 5950000,
            total_amount_all: 6500000,
            transaction_count: 320,
            completed_transaction_count: 290
          },
          {
            event_id: 3,
            event_title: 'Food & Wine Expo',
            event_status: 'UPCOMING',
            event_start_date: '2025-08-20T10:00:00.000000Z',
            event_end_date: '2025-08-22T20:00:00.000000Z',
            total_amount: 3720000,
            total_amount_all: 4100000,
            transaction_count: 210,
            completed_transaction_count: 180
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [organizerId])

  return (
    <>
      <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 2 }}>
        Event Details
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 3, bgcolor: '#fff5f5', borderRadius: 1, mb: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <>
          {events.map((event) => (
        <Box key={event.event_id} sx={{ mb: 6 }}>
          <Typography variant='h4' sx={{ mb: 3, fontWeight: 'bold' }}>
            {event.event_title}
          </Typography>
          
          <Grid container spacing={6} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} variant='outlined' sx={{ p: 3, height: '100%', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      color: 'white',
                      mr: 2
                    }}
                  >
                    <i className='ri-money-dollar-circle-line' style={{ fontSize: '1.25rem' }}></i>
                  </Box>
                  <Typography variant='subtitle1'>Total Revenue</Typography>
                </Box>
                <Typography variant='h5' sx={{ mt: 2, fontWeight: 'bold' }}>
                  IDR {event.total_amount.toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} variant='outlined' sx={{ p: 3, height: '100%', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: 'success.main',
                      color: 'white',
                      mr: 2
                    }}
                  >
                    <i className='ri-exchange-dollar-line' style={{ fontSize: '1.25rem' }}></i>
                  </Box>
                  <Typography variant='subtitle1'>Total Transactions</Typography>
                </Box>
                <Typography variant='h5' sx={{ mt: 2, fontWeight: 'bold' }}>
                  {event.completed_transaction_count}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} variant='outlined' sx={{ p: 3, height: '100%', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: 'warning.main',
                      color: 'white',
                      mr: 2
                    }}
                  >
                    <i className='ri-money-dollar-circle-line' style={{ fontSize: '1.25rem' }}></i>
                  </Box>
                  <Typography variant='subtitle1'>Total Fee</Typography>
                </Box>
                <Typography variant='h5' sx={{ mt: 2, fontWeight: 'bold' }}>
                  IDR {(event.total_fee_all || 0).toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} variant='outlined' sx={{ p: 3, height: '100%', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: 'info.main',
                      color: 'white',
                      mr: 2
                    }}
                  >
                    <i className='ri-percent-line' style={{ fontSize: '1.25rem' }}></i>
                  </Box>
                  <Typography variant='subtitle1'>Total Tax</Typography>
                </Box>
                <Typography variant='h5' sx={{ mt: 2, fontWeight: 'bold' }}>
                  IDR {(event.total_tax_all || 0).toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
          ))}
        </>
      )}
    </>
  )
}

export default EventInfoSection
