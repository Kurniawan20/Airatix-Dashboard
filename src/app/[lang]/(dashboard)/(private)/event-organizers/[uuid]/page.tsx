'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'

// Type Imports
import type { EventOrganizerDetail, EventOrganizerDetailResponse } from '@/types/event-organizers'

// Base API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://airatix.id:8000/public'

const EventOrganizerDetailPage = ({ params }: { params: { uuid: string } }) => {
  const router = useRouter()
  const [data, setData] = useState<EventOrganizerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrganizerDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/email-organizers/${params.uuid}`)
        const result: EventOrganizerDetailResponse = await response.json()

        setData(result.data)
      } catch (err) {
        setError('Failed to fetch organizer details')
        console.error('Error fetching organizer details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizerDetails()
  }, [params.uuid])

  const handleBack = () => {
    router.push('/en/event-organizers')
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !data) {
    return (
      <Alert severity='error' sx={{ mb: 4 }}>
        {error || 'Failed to load organizer details'}
      </Alert>
    )
  }

  return (
    <>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Button variant='outlined' onClick={handleBack} startIcon={<i className='ri-arrow-left-line' />} sx={{ mr: 2 }}>
          Back
        </Button>
        <Typography variant='h5'>Event Organizer Details</Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title='Organizer Information'
              action={
                <Chip
                  color={data.user ? 'success' : 'warning'}
                  icon={<i className={data.user ? 'ri-check-line' : 'ri-time-line'} />}
                  label={data.user ? 'Registered' : 'Not Registered'}
                />
              }
            />
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Email
                      </Typography>
                      <Typography>{data.email}</Typography>
                    </Box>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Created At
                      </Typography>
                      <Typography>{new Date(data.created_at).toLocaleString()}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                {data.user && (
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          Full Name
                        </Typography>
                        <Typography>{data.user.full_name}</Typography>
                      </Box>
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          Timezone & Locale
                        </Typography>
                        <Typography>
                          {data.user.timezone} • {data.user.locale.toUpperCase()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          Email Verification
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            size='small'
                            color={data.user.email_verified ? 'success' : 'warning'}
                            label={data.user.email_verified ? 'Verified' : 'Not Verified'}
                          />
                          {data.user.email_verified && (
                            <Typography variant='caption' color='text.secondary'>
                              on {new Date(data.user.verified_at).toLocaleString()}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default EventOrganizerDetailPage
