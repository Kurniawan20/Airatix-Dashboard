'use client'

// React Imports
import { useState, useEffect, useRef } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// Third-party Imports
import { useReactToPrint } from 'react-to-print'

// Type Imports
import type { Participant } from '@/types/participant'

// Component Imports
import PaymentQRCode from './PaymentQRCode'
import ParticipantDetailHeader from './ParticipantDetailHeader'

// API Imports
import { getParticipantByIdApi } from '@/utils/apiConfig'

// Registration fee by class (in IDR)
const registrationFeeByClass: Record<string, number> = {
  'Pro Stock': 1500000,
  'Bracket': 1000000,
  'FFA': 2000000,
  'Standard': 750000,
  'default': 1000000
}

const ParticipantDetail = () => {
  // States
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [participant, setParticipant] = useState<Participant | null>(null)
  
  // Refs
  const printRef = useRef<HTMLDivElement>(null)
  
  // Hooks
  const params = useParams()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const participantId = params.id as string

  // Get registration fee based on participant class
  const getRegistrationFee = (className: string): number => {
    return registrationFeeByClass[className] || registrationFeeByClass.default
  }

  useEffect(() => {
    const fetchParticipant = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await getParticipantByIdApi(Number(participantId))
        
        if (response.success && response.data) {
          setParticipant(response.data)
        } else {
          setError(response.error || 'Failed to fetch participant details')
        }
      } catch (err) {
        setError('An unexpected error occurred')
        console.error('Fetch participant error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (participantId) {
      fetchParticipant()
    } else {
      setError('Participant ID is required')
      setLoading(false)
    }
  }, [participantId])

  const handleBack = () => {
    router.back()
  }
  
  // Handle print functionality
  const reactToPrintContent = useReactToPrint({
    documentTitle: `Participant-${participant?.name || 'Details'}-${new Date().toISOString().split('T')[0]}`,
    onAfterPrint: () => {
      console.log('Print completed')
    }
  })

  // Create a wrapper function to handle the print button click
  const handlePrint = () => {
    if (printRef.current) {
      reactToPrintContent({
        // @ts-ignore - content property is required by useReactToPrint
        content: () => printRef.current
      })
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', my: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ my: 6 }}>
        {error}
      </Alert>
    )
  }

  if (!participant) {
    return (
      <Alert severity='warning' sx={{ my: 6 }}>
        No participant found with the provided ID.
      </Alert>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={handleBack} sx={{ mr: 2 }}>
                  <Typography sx={{ fontSize: '1.5rem' }}>←</Typography>
                </IconButton>
                <Typography variant='h5'>Participant Details</Typography>
              </Box>
            }
            action={
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip 
                  label={participant.className} 
                  color='primary' 
                  sx={{ fontWeight: 500 }} 
                />
                <Button 
                  variant='outlined' 
                  onClick={handlePrint}
                  size={isMobile ? 'small' : 'medium'}
                >
                  {isMobile ? 'Print' : 'Print Details'}
                </Button>
              </Box>
            }
          />
          <CardContent>
            {/* Printable content */}
            <Grid container spacing={6} ref={printRef}>
              {/* Participant Header */}
              <Grid item xs={12}>
                <ParticipantDetailHeader participant={participant} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ '@media print': { boxShadow: 'none', border: '1px solid #ddd' }, height: '100%' }}>
                  <CardHeader title='Personal Information' />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                          Name
                        </Typography>
                        <Typography variant='body2'>{participant.name}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                          NIK
                        </Typography>
                        <Typography variant='body2'>{participant.nik}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                          Phone Number
                        </Typography>
                        <Typography variant='body2'>{participant.phoneNumber}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                          Province
                        </Typography>
                        <Typography variant='body2'>{participant.province}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                          City
                        </Typography>
                        <Typography variant='body2'>{participant.city}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                          Team
                        </Typography>
                        <Typography variant='body2'>{participant.team}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                          POS
                        </Typography>
                        <Typography variant='body2'>{participant.pos}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ '@media print': { boxShadow: 'none', border: '1px solid #ddd' }, height: '100%' }}>
                  <CardHeader title='Vehicle Information' />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                          Vehicle Brand
                        </Typography>
                        <Typography variant='body2'>{participant.vehicleBrand}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                          Vehicle Type
                        </Typography>
                        <Typography variant='body2'>{participant.vehicleType}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                          Vehicle Color
                        </Typography>
                        <Typography variant='body2'>{participant.vehicleColor}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                          Chassis Number
                        </Typography>
                        <Typography variant='body2'>{participant.chassisNumber}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                          Engine Number
                        </Typography>
                        <Typography variant='body2'>{participant.engineNumber}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                          Class
                        </Typography>
                        <Typography variant='body2'>{participant.className}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card sx={{ '@media print': { boxShadow: 'none', border: '1px solid #ddd' } }}>
                  <CardHeader title='Registration Information' />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                          Start Number
                        </Typography>
                        <Typography variant='body2'>{participant.startNumber}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                          Registration Date
                        </Typography>
                        <Typography variant='body2'>
                          {new Date(participant.registrationDate).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                          Status
                        </Typography>
                        <Typography variant='body2'>
                          {participant.status}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Payment QR Code - only visible in the UI, not in print */}
              <Grid item xs={12} md={6} sx={{ '@media print': { display: 'none' } }}>
                <PaymentQRCode 
                  participant={participant} 
                  registrationFee={getRegistrationFee(participant.className)}
                />
              </Grid>
              
              {/* Print-specific payment information */}
              <Grid item xs={12} sx={{ display: 'none', '@media print': { display: 'block' } }}>
                <Card sx={{ '@media print': { boxShadow: 'none', border: '1px solid #ddd' } }}>
                  <CardHeader title='Payment Information' />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                          Registration Fee
                        </Typography>
                        <Typography variant='body2'>
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                          }).format(getRegistrationFee(participant.className))}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                          Payment Status
                        </Typography>
                        <Typography variant='body2'>Pending Payment</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                          Reference ID
                        </Typography>
                        <Typography variant='body2'>REG-{participant.id}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Signature section for print */}
              <Grid item xs={12} sx={{ display: 'none', '@media print': { display: 'block', marginTop: '30px' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 8 }}>
                  <Box sx={{ textAlign: 'center', width: '200px' }}>
                    <Typography variant='body2' sx={{ mb: 8 }}>Participant Signature</Typography>
                    <Divider />
                    <Typography variant='body2' sx={{ mt: 1 }}>{participant.name}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', width: '200px' }}>
                    <Typography variant='body2' sx={{ mb: 8 }}>Event Organizer</Typography>
                    <Divider />
                    <Typography variant='body2' sx={{ mt: 1 }}>Airatix EO</Typography>
                  </Box>
                </Box>
              </Grid>
              
              {/* Footer for print */}
              <Grid item xs={12} sx={{ display: 'none', '@media print': { display: 'block', marginTop: '50px' } }}>
                <Box sx={{ borderTop: '1px solid #ddd', pt: 2, textAlign: 'center' }}>
                  <Typography variant='caption'>
                    This document is electronically generated and does not require a physical signature.
                  </Typography>
                  <Typography variant='caption' display='block'>
                    {new Date().getFullYear()} Airatix Event Organizer. All rights reserved.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {/* Actions - not printed */}
            <Grid item xs={12} sx={{ textAlign: 'center', mt: 6, '@media print': { display: 'none' } }}>
              <Button variant='contained' onClick={handleBack} sx={{ mr: 2 }}>
                Back to Participants List
              </Button>
              <Button 
                variant='outlined' 
                onClick={handlePrint}
              >
                Download PDF
              </Button>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ParticipantDetail
