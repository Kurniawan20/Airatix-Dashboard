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

// Type Imports
import type { Participant, ParticipantDetail as ParticipantDetailType } from '@/types/participant'

// Component Imports
import PaymentQRCode from './PaymentQRCode'
import ParticipantDetailHeader from './ParticipantDetailHeader'
import FormattedPdfExport from './FormattedPdfExport'

// API Imports
import { getParticipantByIdApi } from '@/utils/apiConfig'

const ParticipantDetail = () => {
  // States
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [activeDetail, setActiveDetail] = useState<ParticipantDetailType | null>(null)

  // Refs
  const printRef = useRef<HTMLDivElement>(null)

  // Hooks
  const params = useParams()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const participantId = params.id as string

  useEffect(() => {
    const fetchParticipant = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await getParticipantByIdApi(Number(participantId))

        if (response.success && response.data) {
          setParticipant(response.data)

          // Set the first detail as active if available
          if (response.data.details && response.data.details.length > 0) {
            setActiveDetail(response.data.details[0])
          }
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

  // Handle switching between different participant details if multiple exist
  const handleSwitchDetail = (detail: ParticipantDetailType) => {
    setActiveDetail(detail)
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

  if (!activeDetail && participant.details.length > 0) {
    setActiveDetail(participant.details[0])

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', my: 6 }}>
        <CircularProgress />
      </Box>
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
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {activeDetail && <Chip label={activeDetail.className} color='primary' sx={{ fontWeight: 500, mr: 2 }} />}
                <Button variant='outlined' onClick={handleBack} size={isMobile ? 'small' : 'medium'}>
                  {isMobile ? 'Back' : 'Go Back'}
                </Button>
                <FormattedPdfExport participant={participant} activeDetail={activeDetail} />
              </Box>
            }
          />
          <CardContent>
            {/* Multiple details selector if available */}
            {participant.details.length > 1 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant='subtitle1' sx={{ mb: 2 }}>
                  Registered Classes:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {participant.details.map(detail => (
                    <Chip
                      key={detail.id}
                      label={`${detail.startNumber} - ${detail.className}`}
                      variant={activeDetail?.id === detail.id ? 'filled' : 'outlined'}
                      color={activeDetail?.id === detail.id ? 'primary' : 'default'}
                      onClick={() => handleSwitchDetail(detail)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
                <Divider sx={{ my: 3 }} />
              </Box>
            )}

            {/* Printable content */}
            <Grid container spacing={6} ref={printRef}>
              {/* Participant Header */}
              <Grid item xs={12}>
                <ParticipantDetailHeader participant={participant} detail={activeDetail || undefined} />
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
                        <Typography variant='body2'>
                          {activeDetail?.phoneNumber || participant.phoneNumber || '-'}
                        </Typography>
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
                      {activeDetail?.pos && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                            POS
                          </Typography>
                          <Typography variant='body2'>{activeDetail.pos}</Typography>
                        </Grid>
                      )}
                      {participant.orderId && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                            Order ID
                          </Typography>
                          <Typography variant='body2'>{participant.orderId}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {activeDetail && (
                <Grid item xs={12} md={6}>
                  <Card sx={{ '@media print': { boxShadow: 'none', border: '1px solid #ddd' }, height: '100%' }}>
                    <CardHeader title='Vehicle Information' />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                            Start Number
                          </Typography>
                          <Typography variant='body2'>{activeDetail.startNumber}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                            Category Class
                          </Typography>
                          <Typography variant='body2'>{activeDetail.categoryClass}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                            Class Name
                          </Typography>
                          <Typography variant='body2'>{activeDetail.className}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                            Vehicle Brand
                          </Typography>
                          <Typography variant='body2'>{activeDetail.vehicleBrand}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                            Vehicle Type
                          </Typography>
                          <Typography variant='body2'>{activeDetail.vehicleType}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                            Vehicle Color
                          </Typography>
                          <Typography variant='body2'>{activeDetail.vehicleColor}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                            Chassis Number
                          </Typography>
                          <Typography variant='body2'>{activeDetail.chassisNumber}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                            Engine Number
                          </Typography>
                          <Typography variant='body2'>{activeDetail.engineNumber}</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Registration Status and Payment Information */}
              <Grid item xs={12}>
                <Card sx={{ '@media print': { boxShadow: 'none', border: '1px solid #ddd' } }}>
                  <CardHeader title='Registration Information' />
                  <CardContent>
                    <Grid container spacing={6}>
                      {/* Registration status */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 4 }}>
                          <Typography variant='subtitle2' sx={{ color: 'text.primary', mb: 1 }}>
                            Registration Status
                          </Typography>
                          <Chip
                            label={participant.status}
                            color={
                              participant.status === 'Approved'
                                ? 'success'
                                : participant.status === 'Rejected'
                                  ? 'error'
                                  : 'warning'
                            }
                          />
                        </Box>
                        <Box sx={{ mb: 4 }}>
                          <Typography variant='subtitle2' sx={{ color: 'text.primary', mb: 1 }}>
                            Registration Date
                          </Typography>
                          <Typography variant='body2'>
                            {new Date(participant.registrationDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Payment QR Code (Only show if status is Pending) */}
                      {participant.status === 'Pending' && (
                        <Grid item xs={12} sm={6}>
                          <PaymentQRCode
                            participantId={participant.id}
                            amount={1000000}
                            orderId={participant.orderId}
                          />
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ParticipantDetail
