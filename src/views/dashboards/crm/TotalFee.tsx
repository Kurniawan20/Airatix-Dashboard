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

const TotalFee = () => {
  const [totalFee, setTotalFee] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchTotalFee = async () => {
      try {
        setLoading(true)

        // Use the correct API endpoint
        const response = await fetchWithAuthFallback(API_ENDPOINTS.TRANSACTIONS.ALL)

        if (!response.ok) {
          throw new Error('Failed to fetch transaction data')
        }

        const responseText = await response.text()

        if (!responseText) {
          throw new Error('Empty response from server')
        }

        const result = JSON.parse(responseText)

        console.log('Parsed transaction data for fee:', result)

        // Calculate the total fee from all organizers
        let fee = 0

        // Check if we have organizers data
        if (result.data?.organizers && Array.isArray(result.data.organizers)) {
          // Sum up the total_fee from each organizer
          fee = result.data.organizers.reduce((sum: number, organizer: any) => {
            // Log each organizer to see the structure
            console.log('Organizer fee:', organizer.total_fee)
            
            // Add the total_fee if available
            return sum + (organizer.total_fee || 0)
          }, 0)
        }

        setTotalFee(fee)
      } catch (err: any) {
        console.error('Error fetching total fee:', err)

        // Set a default fee to avoid showing an error
        setTotalFee(0)
        setError('Failed to load transaction data')
      } finally {
        setLoading(false)
      }
    }

    fetchTotalFee()
  }, [])

  const handleViewAll = () => {
    // Get the current language from the URL
    const lang = window.location.pathname.split('/')[1] || 'en'

    router.push(`/${lang}/event-transactions`)
  }

  // Format the fee as IDR currency
  const formattedFee = totalFee !== null 
    ? `IDR ${totalFee.toLocaleString()}`
    : 'IDR 0'

  return (
    <Card>
      <CardContent sx={{ p: theme => `${theme.spacing(5)} !important` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant='h5'>Total Fee</Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'warning.main',
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
              {formattedFee}
            </Typography>
            <Typography variant='body2' sx={{ mb: 1, color: 'text.secondary' }}>
              Total platform fee
            </Typography>
            <Typography variant='caption' color='error' sx={{ display: 'block', mb: 3 }}>
              {error}
            </Typography>
          </>
        ) : (
          <>
            <Typography variant='h3' sx={{ mb: 1, fontWeight: 'bold' }}>
              {formattedFee}
            </Typography>
            <Typography variant='body2' sx={{ mb: 4, color: 'text.secondary' }}>
              Total platform fee
            </Typography>
          </>
        )}

        <Button
          variant='contained'
          fullWidth
          onClick={handleViewAll}
          startIcon={<i className='ri-eye-line'></i>}
          color='warning'
        >
          View All Transactions
        </Button>
      </CardContent>
    </Card>
  )
}

export default TotalFee
