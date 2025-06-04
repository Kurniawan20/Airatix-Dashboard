'use client'

// React Imports
import { useState, useEffect } from 'react'

// Navigation Imports
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

const TotalRevenue = () => {
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    const fetchTotalRevenue = async () => {
      try {
        setLoading(true)
        
        // Get organizerId from session
        const organizerId = session?.user?.organizerId
        
        // Get the current year
        const currentYear = new Date().getFullYear()
        
        let response;
        let result;
        
        // Use the dynamic local endpoint with organizer ID from session
        console.log('Fetching revenue data for organizer:', organizerId)
        response = await fetchWithAuthFallback(API_ENDPOINTS.TRANSACTIONS.LOCAL_ORGANIZER(organizerId))
        
        if (!response.ok) {
          throw new Error('Failed to fetch revenue data')
        }
        
        const responseText = await response.text()
        
        if (!responseText) {
          throw new Error('Empty response from server')
        }
        
        result = JSON.parse(responseText)
        console.log('Total revenue data:', result)
        
        // Get the total_amount directly from the API response (completed transactions only)
        let revenue = 0
        
        // Check if we have the total_amount field
        if (result.data?.total_amount) {
          console.log('Total revenue (completed):', result.data.total_amount)
          revenue = parseFloat(result.data.total_amount)
        } else if (result.data?.organizers && Array.isArray(result.data.organizers)) {
          // Fallback: Sum up the total_amount from each organizer if the direct field is not available
          revenue = result.data.organizers.reduce((sum: number, organizer: any) => {
            console.log('Organizer revenue:', organizer.total_amount)
            return sum + (organizer.total_amount || 0)
          }, 0)
        }
        
        setTotalRevenue(revenue)
      } catch (err) {
        console.error('Error fetching total revenue:', err)

        // Set a default count to avoid showing an error
        setTotalRevenue(0)
        setError('Failed to load revenue data')
      } finally {
        setLoading(false)
      }
    }

    fetchTotalRevenue()
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

  // Format the revenue as IDR currency
  const formattedRevenue = totalRevenue !== null 
    ? `IDR ${totalRevenue.toLocaleString()}`
    : 'IDR 0'

  return (
    <Card>
      <CardContent sx={{ p: theme => `${theme.spacing(5)} !important` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant='h5'>Total Revenue</Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              color: 'white'
            }}
          >
            <i className='ri-money-dollar-circle-line' style={{ fontSize: '1.5rem' }}></i>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : error ? (
          <>
            <Typography variant='h3' sx={{ mb: 1, fontWeight: 'bold' }}>
              {formattedRevenue}
            </Typography>
            <Typography variant='body2' sx={{ mb: 1, color: 'text.secondary' }}>
              Total gross revenue
            </Typography>
            <Typography variant='caption' color='error' sx={{ display: 'block', mb: 3 }}>
              {error}
            </Typography>
          </>
        ) : (
          <>
            <Typography variant='h3' sx={{ mb: 1, fontWeight: 'bold' }}>
              {formattedRevenue}
            </Typography>
            <Typography variant='body2' sx={{ mb: 4, color: 'text.secondary' }}>
              Total gross revenue
            </Typography>
          </>
        )}

        <Button variant='contained' fullWidth onClick={handleViewAll} startIcon={<i className='ri-eye-line'></i>}>
          View Transactions
        </Button>
      </CardContent>
    </Card>
  )
}

export default TotalRevenue
