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
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

// Type Imports
import type { EventOrganizerDetail, EventOrganizerDetailResponse } from '@/types/event-organizers'
import type { OrganizerSummary, TransactionsResponse } from '@/types/event-transactions'

const StatCard = ({ icon, label, value }: { icon: string; label: string; value: string | number }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            backgroundColor: 'primary.lighter'
          }}
        >
          <i className={icon} style={{ fontSize: '24px', color: 'var(--mui-palette-primary-main)' }} />
        </Box>
        <Box>
          <Typography variant='body2' color='text.secondary'>
            {label}
          </Typography>
          <Typography variant='h6'>{value}</Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
)

const EventOrganizerDetailPage = ({ params }: { params: { uuid: string } }) => {
  const router = useRouter()
  const [data, setData] = useState<EventOrganizerDetail | null>(null)
  const [transactionData, setTransactionData] = useState<OrganizerSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [transactionLoading, setTransactionLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transactionError, setTransactionError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrganizerDetails = async () => {
      try {
        const response = await fetch(`https://insight.airatix.id:8089/public/email-organizers/${params.uuid}`)
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

  useEffect(() => {
    const fetchTransactionData = async () => {
      if (!data) returns

      try {
        const response = await fetch(`https://airatix.id:8000/public/transactions?organizer_id=${data.id}`)
        const result: TransactionsResponse = await response.json()

        // Find the organizer in the response
        const organizer = result.data.organizers?.find(org => org.organizer_id === data.id)

        if (organizer) {
          setTransactionData(organizer)
        }
      } catch (err) {
        setTransactionError('Failed to fetch transaction data')
        console.error('Error fetching transaction data:', err)
      } finally {
        setTransactionLoading(false)
      }
    }

    if (data) {
      fetchTransactionData()
    }
  }, [data])

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
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

        {/* Statistics */}
        {data.user && (
          <Grid item xs={12}>
            <Typography variant='h6' sx={{ mb: 4 }}>
              Statistics
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard icon='ri-calendar-event-line' label='Total Events' value={data.stats.total_events} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon='ri-money-dollar-circle-line'
                  label='Total Sales'
                  value={formatCurrency(data.stats.total_sales)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard icon='ri-shopping-cart-line' label='Total Orders' value={data.stats.total_orders} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon='ri-user-star-line'
                  label='Member Since'
                  value={new Date(data.stats.member_since).toLocaleDateString()}
                />
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Transaction Data */}
        {data.user && (
          <Grid item xs={12}>
            <Card>
              <CardHeader title='Event Transactions' />
              <CardContent>
                {transactionLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : transactionError ? (
                  <Alert severity='error'>{transactionError}</Alert>
                ) : !transactionData ? (
                  <Alert severity='info'>No transaction data available for this organizer.</Alert>
                ) : (
                  <>
                    <Box sx={{ mb: 4 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography variant='subtitle2' color='text.secondary'>
                            Total Transactions
                          </Typography>
                          <Typography variant='h6'>{transactionData.total_transactions}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant='subtitle2' color='text.secondary'>
                            Total Amount
                          </Typography>
                          <Typography variant='h6' color='success.main'>
                            {formatCurrency(transactionData.total_amount)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant='subtitle2' color='text.secondary'>
                            Events with Transactions
                          </Typography>
                          <Typography variant='h6'>{transactionData.events.length}</Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <Typography variant='subtitle1' sx={{ mb: 2 }}>
                      Events
                    </Typography>

                    <TableContainer>
                      <Table size='small'>
                        <TableHead>
                          <TableRow>
                            <TableCell>Event ID</TableCell>
                            <TableCell>Event Name</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell align='right'>Transactions</TableCell>
                            <TableCell align='right'>Amount</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {transactionData.events.map(event => (
                            <TableRow key={event.event_id}>
                              <TableCell>#{event.event_id}</TableCell>
                              <TableCell>{event.event_title}</TableCell>
                              <TableCell>{new Date(event.event_start_date).toLocaleDateString()}</TableCell>
                              <TableCell>{new Date(event.event_end_date).toLocaleDateString()}</TableCell>
                              <TableCell align='right'>{event.transaction_count}</TableCell>
                              <TableCell align='right'>{formatCurrency(event.total_amount)}</TableCell>
                              <TableCell>
                                <Button
                                  size='small'
                                  onClick={() => router.push(`/en/event-transactions/${event.event_id}`)}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </>
  )
}

export default EventOrganizerDetailPage
