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

const TotalTax = () => {
  const [totalTax, setTotalTax] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { data: session } = useSession()
  
  useEffect(() => {
    const fetchTotalTax = async () => {
      try {
        setLoading(true)
        
        // Get organizerId from session
        const organizerId = session?.user?.organizerId || 13
        
        console.log('Fetching tax data for organizer:', organizerId)
        
        // Use the dynamic local endpoint with organizer ID from session
        const response = await fetchWithAuthFallback(API_ENDPOINTS.TRANSACTIONS.LOCAL_ORGANIZER(organizerId))

        if (!response.ok) {
          throw new Error('Failed to fetch transaction data')
        }

        const responseText = await response.text()

        if (!responseText) {
          throw new Error('Empty response from server')
        }

        const result = JSON.parse(responseText)

        console.log('Parsed transaction data for tax:', result)

        // Get the total_tax_all directly from the API response
        let tax = 0
        
        // Check if we have the total_tax_all field
        if (result.data?.total_tax_all) {
          console.log('Total tax (all):', result.data.total_tax_all)
          tax = parseFloat(result.data.total_tax_all)
        } else if (result.data?.organizers && Array.isArray(result.data.organizers)) {
          // Fallback: Sum up the total_tax_all from each organizer if the direct field is not available
          tax = result.data.organizers.reduce((sum: number, organizer: any) => {
            console.log('Organizer tax (all):', organizer.total_tax_all)
            return sum + (organizer.total_tax_all || 0)
          }, 0)
        }
        
        setTotalTax(tax)
      } catch (err: any) {
        console.error('Error fetching total tax:', err)

        // Set a default tax to avoid showing an error
        setTotalTax(0)
        setError('Failed to load transaction data')
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchTotalTax()
    }
  }, [session])

  const handleViewAll = () => {
    // Get the current language from the URL
    const lang = window.location.pathname.split('/')[1] || 'en'
    
    router.push(`/${lang}/event-transactions`)
  }

  // Format the tax as IDR currency
  const formattedTax = totalTax !== null 
    ? `IDR ${totalTax.toLocaleString()}`
    : 'IDR 0'

  return (
    <Card>
      <CardContent sx={{ p: theme => `${theme.spacing(5)} !important` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant='h5'>Total Tax</Typography>
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
            <i className='ri-percent-line' style={{ fontSize: '1.5rem' }}></i>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <>
            <Typography variant='h3' sx={{ mb: 1, fontWeight: 'bold' }}>
              {formattedTax}
            </Typography>
            <Typography variant='body2' sx={{ mb: 4, color: 'text.secondary' }}>
              Total tax collected
              {error && (
                <Typography component="span" color="error" sx={{ ml: 1, fontSize: '0.75rem' }}>
                  (Error loading data)
                </Typography>
              )}
            </Typography>
          </>
        )}

        <Button
          variant='contained'
          fullWidth
          onClick={handleViewAll}
          startIcon={<i className='ri-eye-line'></i>}
          color='info'
        >
          View All Transactions
        </Button>
      </CardContent>
    </Card>
  )
}

export default TotalTax
