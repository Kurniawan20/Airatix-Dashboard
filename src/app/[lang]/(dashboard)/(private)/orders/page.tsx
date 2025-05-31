'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Next-Auth Imports
import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'

// Third-party Imports
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'

// API Config Imports
import { API_ENDPOINTS, fetchWithAuthFallback } from '@/utils/apiConfig'

// Style Imports
import styles from '@core/styles/table.module.css'

// Status chip component for displaying event status
const StatusChip = ({ status }: { status: string }) => {
  const statusMap: Record<string, { color: 'success' | 'warning' | 'error' | 'info' | 'primary'; icon: string }> = {
    COMPLETED: { color: 'success', icon: 'ri-checkbox-circle-line' },
    RESERVED: { color: 'info', icon: 'ri-reserve-line' },
    CANCELLED: { color: 'error', icon: 'ri-close-circle-line' },
    REFUNDED: { color: 'info', icon: 'ri-refund-2-line' },
    LIVE: { color: 'primary', icon: '' } // Special case for LIVE status
  }

  // Special case for LIVE status
  if (status === 'LIVE') {
    return (
      <Chip
        size='small'
        label="LIVE"
        sx={{
          backgroundColor: '#1da1f2', // Twitter blue color for visibility
          color: 'white',
          fontWeight: 'bold',
          '& .MuiChip-label': {
            padding: '0 12px',
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
          }
        }}
      />
    )
  }

  const { color, icon } = statusMap[status] || statusMap.RESERVED

  return (
    <Chip
      size='small'
      label={status}
      color={color}
      icon={icon ? <i className={icon} style={{ marginRight: 0 }} /> : undefined}
      sx={{
        '& .MuiChip-label': {
          paddingLeft: icon ? 0 : '12px',
          paddingRight: '12px',
          display: 'flex',
          justifyContent: 'center',
          width: '100%'
        },
        '& .MuiChip-icon': {
          marginLeft: '8px',
          marginRight: '-4px'
        }
      }}
    />
  )
}

// Custom component for the action button
const ActionButton = ({ eventId }: { eventId: number }) => {
  const router = useRouter()
  
  return (
    <Button 
      variant="outlined" 
      size="small"
      onClick={() => router.push(`/en/event-transactions/event/${eventId}`)}
    >
      View
    </Button>
  )
}

// Column Definitions
const columnHelper = createColumnHelper<any>()

const columns = [
  columnHelper.accessor('event_title', {
    header: 'Event Title',
    cell: info => info.getValue()
  }),
  columnHelper.accessor('event_status', {
    header: 'Status',
    cell: info => <StatusChip status={info.getValue() || 'RESERVED'} />
  }),
  columnHelper.accessor('event_start_date', {
    header: 'Start Date',
    cell: info => new Date(info.getValue()).toLocaleDateString()
  }),
  columnHelper.accessor('event_end_date', {
    header: 'End Date',
    cell: info => new Date(info.getValue()).toLocaleDateString()
  }),
  columnHelper.accessor('transaction_count', {
    header: 'Transactions',
    cell: info => info.getValue()
  }),
  columnHelper.accessor('total_amount', {
    header: 'Total Amount',
    cell: info => `IDR ${info.getValue().toLocaleString()}`
  }),
  columnHelper.accessor('event_id', {
    header: 'Actions',
    cell: info => <ActionButton eventId={info.getValue()} />
  })
]

interface OrganizerData {
  organizer_id: string;
  organizer_name: string;
  organizer_email: string;
  total_amount: number;
  total_transactions: number;
}

interface EventData {
  event_id: number;
  event_title: string;
  event_start_date: string;
  event_end_date: string;
  event_status: string;
  total_amount: number;
  transaction_count: number;
}

const OrdersPage = () => {
  // State
  const [events, setEvents] = useState<EventData[]>([])
  const [organizerInfo, setOrganizerInfo] = useState<OrganizerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [globalFilter, setGlobalFilter] = useState('')

  // Hooks
  const router = useRouter()
  const { data: session } = useSession()
  
  // Get organizerId from session
  const organizerId = session?.organizerId || session?.user?.organizerId
  
  // Fetch organizer transactions data
  const fetchOrganizerTransactions = useCallback(async () => {
    // If no organizerId, we can't fetch data
    if (!organizerId || organizerId === '0') {
      setError('You are not associated with any organizer. Access denied.')
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // API call using the session's organizerId
      const response = await fetchWithAuthFallback(
        API_ENDPOINTS.TRANSACTIONS.ORGANIZER(organizerId)
      )

      if (!response.ok) {
        throw new Error(response.statusText || 'Failed to fetch organizer transactions')
      }

      const responseData = await response.json()

      if (responseData && responseData.data) {
        const { events: eventData, ...orgInfo } = responseData.data
        setOrganizerInfo(orgInfo)
        setEvents(eventData || [])
      } else {
        setEvents([])
        setError('No data available for this organizer')
      }
    } catch (error) {
      console.error('Error fetching organizer transactions:', error)
      setError('Failed to load organizer transactions. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [organizerId])

  // Load data when session is available
  useEffect(() => {
    if (session) {
      fetchOrganizerTransactions()
    }
  }, [session, fetchOrganizerTransactions])

  // Table instance with react-table
  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: page,
        pageSize: rowsPerPage,
      },
      globalFilter
    },
    onGlobalFilterChange: setGlobalFilter,
    manualPagination: false,
    pageCount: Math.ceil(events.length / rowsPerPage),
    
    // Required properties for TypeScript
    filterFns: {},
    defaultColumn: {}
  })

  // Pagination handlers
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Render loading state while waiting for session
  if (!session) {
    return (
      <Box sx={{ p: 3 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading session...</Typography>
      </Box>
    )
  }

  // Show access denied message for non-organizer users
  if (!organizerId || organizerId === '0') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          You are not associated with any organizer. This page is only accessible for event organizer staff.
        </Alert>
      </Box>
    )
  }

  return (
    <Stack spacing={6}>
      <Typography variant="h4">
        My Orders
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 6 }}>
          {error}
        </Alert>
      )}

      {organizerInfo && (
        <Paper sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {organizerInfo.organizer_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {organizerInfo.organizer_email}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Transactions
                </Typography>
                <Typography>
                  {organizerInfo.total_transactions} transactions
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography>
                  IDR {organizerInfo.total_amount?.toLocaleString()}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Card>
        <CardHeader 
          title="Events" 
          action={
            <TextField
              placeholder="Search..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <i className="ri-search-line" />
                  </InputAdornment>
                )
              }}
              size="small"
              sx={{ width: '250px' }}
            />
          }
        />
        <Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress />
            </Box>
          ) : events.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography>No events found</Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table className={styles.table}>
                  <TableHead>
                    {table.getHeaderGroups().map(headerGroup => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <TableCell key={header.id}>
                            {header.isPlaceholder ? null : (
                              <Box>
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              </Box>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableHead>
                  <TableBody>
                    {table.getRowModel().rows.map(row => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map(cell => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                <TablePagination
                  component="div"
                  count={events.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </>
          )}
        </Box>
      </Card>
    </Stack>
  )
}

export default OrdersPage
