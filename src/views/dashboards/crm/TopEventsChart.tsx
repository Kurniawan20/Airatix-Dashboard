'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// API Imports
import { API_ENDPOINTS, fetchWithAuthFallback } from '@/utils/apiConfig'

// Types
interface TopEvent {
  event_id: number
  event_title: string
  event_status: string
  event_start_date: string
  event_end_date: string
  total_amount: number
  total_tax: number
  total_fee: number
  net_amount: number
  transaction_count: number
  tickets_sold: number
  avg_transaction_value: number
}

interface TopEventsResponse {
  organizer_id: string
  organizer_name: string
  period: {
    start_date: string
    end_date: string
  }
  total_events_amount: number
  total_events_tickets: number
  top_events: TopEvent[]
}

const TopEventsChart = () => {
  // State for API data
  const [apiData, setApiData] = useState<TopEventsResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // Get session for authentication
  const { data: session } = useSession()

  // Calculate the highest amount for percentage calculation
  const maxAmount = apiData?.top_events?.length > 0 
    ? Math.max(...apiData.top_events.map(event => event.total_amount))
    : 0

  // Function to calculate percentage based on the highest amount
  const calculatePercentage = (amount: number): number => {
    if (maxAmount === 0) return 0
    return Math.round((amount / maxAmount) * 100)
  }

  // Fetch top events data
  useEffect(() => {
    const fetchTopEvents = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Get organizerId from session
        const organizerId = session?.user?.organizerId || 13
        
        console.log('Fetching top events data for organizer:', organizerId)
        
        const response = await fetchWithAuthFallback(
          API_ENDPOINTS.TRANSACTIONS.TOP_EVENTS(organizerId)
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch top events data')
        }
        
        const data = await response.json()
        
        if (data && data.data) {
          console.log('Top events data:', data.data)
          setApiData(data.data)
        } else {
          throw new Error('Invalid data format received')
        }
      } catch (err) {
        console.error('Error fetching top events:', err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }
    
    if (session) {
      fetchTopEvents()
    }
  }, [session])

  // Render component
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title='Top Events'
        titleTypographyProps={{ variant: 'h5' }}
        action={
          <IconButton size='small'>
            <i className='ri-more-2-fill'></i>
          </IconButton>
        }
      />
      <CardContent sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : apiData ? (
          <>
            <Box>
              <Typography variant='h3' sx={{ mb: 2, fontWeight: 'bold' }}>
                {apiData.total_events_tickets.toLocaleString()} Tickets
              </Typography>
              <Typography variant='body2' sx={{ mb: 4, color: 'text.secondary' }}>
                Total tickets sold
              </Typography>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              {apiData.top_events && apiData.top_events.length > 0 ? (
                apiData.top_events.map(event => {
                  const percentage = calculatePercentage(event.total_amount)
                  
                  return (
                    <Box key={event.event_id} sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant='body2'>{event.event_title}</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {event.tickets_sold} tickets
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 2 }}>
                          <LinearProgress 
                            variant='determinate' 
                            value={percentage} 
                            color={event.event_status === 'LIVE' ? 'primary' : 
                                  event.event_status === 'DRAFT' ? 'warning' : 'secondary'}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Typography variant='body2' color='text.secondary'>
                          IDR {event.total_amount.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  )
                })
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No events data available
                </Typography>
              )}
            </Box>
          </>
        ) : (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No data available
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default TopEventsChart
