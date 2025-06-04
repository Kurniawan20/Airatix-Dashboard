'use client'

// React Imports
import { useState, useEffect, useCallback, useMemo } from 'react'

// Type Imports
import type { OrganizerData } from '@/types/organizers'
import type { Transaction, QuestionAnswer } from '@/types/event-transactions'

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
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Divider from '@mui/material/Divider'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Avatar from '@mui/material/Avatar'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

// Third-party Imports
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'

// API Config Imports
import { API_ENDPOINTS, fetchWithAuthFallback } from '@/utils/apiConfig'

// Helper function to sanitize HTML content
const sanitizeHtml = (html: string | null | undefined): string => {
  if (!html) return ''

  // Basic sanitization
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

// Style Imports
import styles from '@core/styles/table.module.css'

// Transaction Dialog Props interface
interface TransactionDialogProps {
  open: boolean
  onClose: () => void
  transaction: Transaction | null
}

// Transaction Dialog Component for displaying transaction details
const TransactionDialog = ({ open, onClose, transaction }: TransactionDialogProps) => {
  if (!transaction) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='h6'>Transaction Details - #{transaction.short_id}</Typography>
          <IconButton onClick={onClose} size='small'>
            <i className='ri-close-line' />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' color='text.secondary'>
                Transaction ID
              </Typography>
              <Typography>{transaction.id}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' color='text.secondary'>
                Status
              </Typography>
              <Chip
                label={transaction.status}
                color={
                  transaction.status === 'COMPLETED' || transaction.status === 'PAID'
                    ? 'success'
                    : transaction.status === 'RESERVED' || transaction.status === 'PENDING'
                      ? 'warning'
                      : 'error'
                }
                size='small'
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' color='text.secondary'>
                Total Price
              </Typography>
              <Typography>IDR {transaction.total_price.toLocaleString()}</Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Customer Information Section */}
        <Typography variant='h6' gutterBottom>
          Customer Information
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' color='text.secondary'>
                First Name
              </Typography>
              <Typography>{transaction.firstname || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' color='text.secondary'>
                Last Name
              </Typography>
              <Typography>{transaction.lastname || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' color='text.secondary'>
                ID Type
              </Typography>
              <Typography>{transaction.id_type || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' color='text.secondary'>
                ID Number
              </Typography>
              <Typography>{transaction.id_number || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' color='text.secondary'>
                Phone
              </Typography>
              <Typography>{transaction.phone || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' color='text.secondary'>
                Country
              </Typography>
              <Typography>{transaction.country || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' color='text.secondary'>
                Province
              </Typography>
              <Typography>{transaction.province || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' color='text.secondary'>
                City
              </Typography>
              <Typography>{transaction.city || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Event Information */}
        {transaction.event && (
          <>
            <Typography variant='h6' gutterBottom>
              Event Information
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Event Title
                  </Typography>
                  <Typography>{transaction.event.title}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Event Date
                  </Typography>
                  <Typography>
                    {new Date(transaction.event.start_date).toLocaleDateString()} - {new Date(transaction.event.end_date).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Location
                  </Typography>
                  <Typography>{transaction.event.location || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </Box>
          </>
        )}

        {/* Tickets Section */}
        <Typography variant='h6' gutterBottom>
          Tickets
        </Typography>

        {transaction.tickets && transaction.tickets.length > 0 ? (
          transaction.tickets.map((ticket, index) => (
            <Accordion key={ticket.id} defaultExpanded={index === 0}>
              <AccordionSummary expandIcon={<i className='ri-arrow-down-s-line' />}>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pr: 2 }}
                >
                  <Typography variant='subtitle1'>
                    <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(ticket.title) }} />
                  </Typography>
                  <Box>
                    <Chip
                      label={`${ticket.quantity} ticket${ticket.quantity > 1 ? 's' : ''}`}
                      size='small'
                      color='primary'
                      sx={{ mr: 1 }}
                    />
                    <Typography variant='subtitle2' component='span'>
                      IDR {ticket.price_paid.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <div
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(ticket.description) }}
                    style={{
                      color: 'rgba(58, 53, 65, 0.68)',
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                      marginBottom: '8px'
                    }}
                  />
                  <Divider sx={{ my: 2 }} />
                </Box>

                <Typography variant='subtitle2' gutterBottom>
                  Attendees
                </Typography>

                {Array.isArray(ticket.attendees) && ticket.attendees.length > 0 ? (
                  <Grid container spacing={2}>
                    {ticket.attendees.map(attendee => (
                      <Grid item xs={12} sm={6} key={attendee.id}>
                        <Paper variant='outlined' sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {attendee.firstname ? attendee.firstname[0] : 'A'}
                            </Avatar>
                            <Box>
                              <Typography variant='subtitle2'>
                                {attendee.name || `${attendee.firstname} ${attendee.lastname}`}
                              </Typography>
                              <Typography variant='body2' color='text.secondary'>
                                {attendee.email}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant='caption' color='text.secondary'>
                              ID: {attendee.short_id}
                            </Typography>
                            <Chip
                              label={attendee.check_in_status || 'Not Checked In'}
                              color={attendee.check_in_status === 'CHECKED_IN' ? 'success' : 'default'}
                              size='small'
                            />
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : !Array.isArray(ticket.attendees) && Object.keys(ticket.attendees).length > 0 ? (
                  <Grid container spacing={2}>
                    {Object.values(ticket.attendees).map(attendee => (
                      <Grid item xs={12} sm={6} key={attendee.id}>
                        <Paper variant='outlined' sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {attendee.firstname ? attendee.firstname[0] : 'A'}
                            </Avatar>
                            <Box>
                              <Typography variant='subtitle2'>
                                {attendee.name || `${attendee.firstname} ${attendee.lastname}`}
                              </Typography>
                              <Typography variant='body2' color='text.secondary'>
                                {attendee.email}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant='caption' color='text.secondary'>
                              ID: {attendee.short_id}
                            </Typography>
                            <Chip
                              label={attendee.check_in_status || 'Not Checked In'}
                              color={attendee.check_in_status === 'CHECKED_IN' ? 'success' : 'default'}
                              size='small'
                            />
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography color='text.secondary'>No attendee information available</Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography color='text.secondary'>No tickets found for this transaction</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ mt: 2 }}>
        <Button onClick={onClose}>Close</Button>
        {transaction.payment_url && (
          <Button
            variant='contained'
            color='primary'
            startIcon={<i className='ri-bank-card-line' />}
            onClick={() => window.open(transaction.payment_url, '_blank')}
          >
            Go to Payment
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

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
const ActionButton = ({ transaction }: { transaction: Transaction }) => {
  const [open, setOpen] = useState(false)
  
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  
  return (
    <>
      <Button 
        variant="outlined" 
        size="small"
        onClick={handleOpen}
      >
        View
      </Button>
      <TransactionDialog 
        open={open} 
        onClose={handleClose} 
        transaction={transaction} 
      />
    </>
  )
}

// Column Definitions
const columnHelper = createColumnHelper<any>()

const columns = [
  columnHelper.accessor('short_id', {
    header: 'Transaction ID',
    cell: ({ row }) => <Typography variant='body2'>{row.original.short_id}</Typography>
  }),
  columnHelper.accessor('event.title', {
    header: 'Event',
    cell: ({ row }) => <Typography variant='body2'>{row.original.event?.title || 'N/A'}</Typography>
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ row }) => <StatusChip status={row.original.status} />
  }),
  columnHelper.accessor('payment_status', {
    header: 'Payment Status',
    cell: ({ row }) => <Typography variant='body2'>{row.original.payment_status || 'N/A'}</Typography>
  }),
  columnHelper.accessor('firstname', {
    header: 'Customer',
    cell: ({ row }) => <Typography variant='body2'>{`${row.original.firstname || ''} ${row.original.lastname || ''}`}</Typography>
  }),
  columnHelper.accessor('total_price', {
    header: 'Amount',
    cell: ({ row }) => <Typography variant='body2'>IDR {row.original.total_price?.toLocaleString() || '0'}</Typography>
  }),
  columnHelper.accessor('created_at', {
    header: 'Date',
    cell: ({ row }) => <Typography variant='body2'>{new Date(row.original.created_at).toLocaleDateString()}</Typography>
  }),
  columnHelper.accessor('id', {
    header: 'Actions',
    cell: ({ row }) => <ActionButton transaction={row.original} />
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
  const [transactions, setTransactions] = useState<any[]>([])
  const [organizerInfo, setOrganizerInfo] = useState<OrganizerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [globalFilter, setGlobalFilter] = useState('')
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

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
      // Use the dynamic endpoint with the organizer ID from session
      console.log('Fetching transactions for organizer ID:', organizerId)
      const response = await fetchWithAuthFallback(
        API_ENDPOINTS.TRANSACTIONS.LOCAL_ORGANIZER(organizerId)
      )

      if (!response.ok) {
        throw new Error(response.statusText || 'Failed to fetch organizer transactions')
      }

      const responseData = await response.json()

      if (responseData && responseData.data) {
        console.log('API response data:', responseData.data)
        
        // Extract organizer info
        const orgInfo = {
          organizer_id: '13',  // Hardcoded for the local endpoint
          organizer_name: 'Organizer 13',
          organizer_email: responseData.data.organizer_email || 'organizer13@example.com',
          total_amount: parseFloat(responseData.data.total_amount || '0'),
          total_transactions: responseData.data.total_transactions || 0
        }
        
        setOrganizerInfo(orgInfo)
        
        // Check if transactions array exists
        if (responseData.data.transactions && Array.isArray(responseData.data.transactions)) {
          console.log('Found transactions:', responseData.data.transactions.length)
          setTransactions(responseData.data.transactions)
        } else {
          // If no transactions array, check if we have events with transactions
          if (responseData.data.events && Array.isArray(responseData.data.events)) {
            // Collect all transactions from all events
            const allTransactions = []
            responseData.data.events.forEach(event => {
              if (event.transactions && Array.isArray(event.transactions)) {
                // Add event info to each transaction
                const transactionsWithEventInfo = event.transactions.map(transaction => ({
                  ...transaction,
                  event: {
                    id: event.event_id,
                    title: event.event_title,
                    status: event.event_status
                  }
                }))
                allTransactions.push(...transactionsWithEventInfo)
              }
            })
            
            console.log('Extracted transactions from events:', allTransactions.length)
            setTransactions(allTransactions)
          } else {
            setTransactions([])
            setError('No transaction data available')
          }
        }
      } else {
        setTransactions([])
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

  // Filter function for transactions
  const filterTransactions = useCallback(() => {
    let filtered = [...transactions]
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter)
    }
    
    // Apply date range filter
    if (startDate) {
      const start = new Date(startDate)
      filtered = filtered.filter(transaction => new Date(transaction.created_at) >= start)
    }
    
    if (endDate) {
      const end = new Date(endDate)
      // Set end date to end of day
      end.setHours(23, 59, 59, 999)
      filtered = filtered.filter(transaction => new Date(transaction.created_at) <= end)
    }
    
    return filtered
  }, [transactions, statusFilter, startDate, endDate])
  
  // Get unique status values for filter dropdown
  const statusOptions = useMemo(() => {
    const statuses = new Set<string>()
    transactions.forEach(transaction => {
      if (transaction.status) {
        statuses.add(transaction.status)
      }
    })
    return Array.from(statuses)
  }, [transactions])

  // Table instance with react-table
  const table = useReactTable({
    data: filterTransactions(),
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination: {
        pageIndex: page,
        pageSize: rowsPerPage,
      },
      globalFilter
    },
    onPaginationChange: (updater) => {
      // Use the updater function to get the new pagination state
      const newPagination = typeof updater === 'function' 
        ? updater({ pageIndex: page, pageSize: rowsPerPage }) 
        : updater
      
      setPage(newPagination.pageIndex)
      setRowsPerPage(newPagination.pageSize)
    },
    onGlobalFilterChange: setGlobalFilter,
    manualPagination: false,
    pageCount: Math.ceil(filterTransactions().length / rowsPerPage),
    
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
          title="Transactions" 
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
        <Divider />
        
        {/* Filter controls */}
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => {
              setStatusFilter('all')
              setStartDate('')
              setEndDate('')
              setGlobalFilter('')
            }}
          >
            Clear Filters
          </Button>
        </Box>
        
        <Divider />
        <Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress />
            </Box>
          ) : transactions.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography>No transactions found</Typography>
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
                  count={transactions.length}
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
