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

const TotalRevenue = () => {
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchTotalRevenue = async () => {
      try {
        setLoading(true)

        // Get the current year
        const currentYear = new Date().getFullYear()

        // Use the monthly gross API endpoint
        const response = await fetchWithAuthFallback(
          API_ENDPOINTS.TRANSACTIONS.MONTHLY_GROSS(currentYear)
        )

        if (!response.ok) {
          throw new Error('Failed to fetch revenue data')
        }

        const responseText = await response.text()

        if (!responseText) {
          throw new Error('Empty response from server')
        }

        const result = JSON.parse(responseText)
        console.log('Total revenue data:', result)

        // Set the total revenue from the API response

        setTotalRevenue(result.data.year_total)
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
  }, [])

  const handleViewAll = () => {
    // Get the current language from the URL
    const lang = window.location.pathname.split('/')[1] || 'en'

    router.push(`/${lang}/event-transactions`)
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
