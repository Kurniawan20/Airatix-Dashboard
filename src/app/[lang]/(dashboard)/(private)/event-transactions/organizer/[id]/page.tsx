'use client'

// React Imports
import { useState, useEffect } from 'react'

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
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'

// Third-party Imports
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable, getFilteredRowModel } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'

// API Config Imports
import { API_ENDPOINTS, fetchWithAuthFallback } from '@/utils/apiConfig'

// Type Imports
import type { Transaction, TransactionsResponse, EventSummary, EventTransactionResponse, OrganizerTransactionResponse } from '@/types/event-transactions'

// Style Imports
import styles from '@core/styles/table.module.css'

const StatusChip = ({ status, paymentStatus }: { status: string; paymentStatus: string | null }) => {
  const statusProps = {
    COMPLETED: { color: 'success' as const, icon: 'ri-checkbox-circle-line' },
    RESERVED: { 
      color: paymentStatus === 'AWAITING_PAYMENT' ? 'warning' : 'info',
      icon: paymentStatus === 'AWAITING_PAYMENT' ? 'ri-time-line' : 'ri-reserve-line'
    },
    CANCELLED: { color: 'error' as const, icon: 'ri-close-circle-line' },
    REFUNDED: { color: 'info' as const, icon: 'ri-refund-2-line' }
  }

  const currentStatus = status in statusProps ? status : 'RESERVED'
  const { color, icon } = statusProps[currentStatus as keyof typeof statusProps]

  return (
    <Box>
      <Chip
        size='small'
        label={status}
        color={color}
        icon={<i className={icon} />}
      />
      {paymentStatus && (
        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
          {paymentStatus.replace(/_/g, ' ')}
        </Typography>
      )}
    </Box>
  )
}

const RowOptions = ({ paymentUrl }: { paymentUrl: string | null }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  if (!paymentUrl) return null

  return (
    <>
      <IconButton onClick={handleClick}>
        <i className='ri-more-2-fill' />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => window.open(paymentUrl, '_blank')}>
          <ListItemIcon>
            <i className='ri-bank-card-line' />
          </ListItemIcon>
          <ListItemText>Payment Link</ListItemText>
        </MenuItem>
      </Menu>
    </>
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
      View Transactions
    </Button>
  )
}

// Custom back button component
const BackButton = ({ sx }: { sx?: any }) => {
  const router = useRouter()
  
  return (
    <Button 
      variant="outlined" 
      startIcon={<i className="ri-arrow-left-line" />}
      onClick={() => router.back()}
      sx={sx}
    >
      Back to Organizers
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
    cell: info => (
      <Chip 
        label={info.getValue() || 'N/A'} 
        color={info.getValue() === 'LIVE' ? 'success' : info.getValue() === 'DRAFT' ? 'warning' : 'default'} 
        size="small" 
      />
    )
  }),
  columnHelper.accessor('event_start_date', {
    header: 'Start Date',
    cell: info => new Date(info.getValue()).toLocaleString()
  }),
  columnHelper.accessor('event_end_date', {
    header: 'End Date',
    cell: info => new Date(info.getValue()).toLocaleString()
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

interface PageProps {
  params: {
    id: string
  }
}

const OrganizerTransactionsPage = ({ params }: PageProps) => {
  const [data, setData] = useState<Transaction[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [organizerInfo, setOrganizerInfo] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(0)

  useEffect(() => {
    const fetchOrganizerTransactions = async () => {
      try {
        const result = await fetchWithAuthFallback(API_ENDPOINTS.TRANSACTIONS.ORGANIZER(params.id))
        
        console.log('API Response:', result.data); // Debug log
        
        if (result.success && result.data.data) {
          setOrganizerInfo({
            organizer_id: result.data.data.organizer_id,
            organizer_name: result.data.data.organizer_name,
            organizer_email: result.data.data.organizer_email,
            total_amount: result.data.data.total_amount,
            total_transactions: result.data.data.total_transactions || 0
          });
          
          // Process events to ensure event_status is available
          const processedEvents = result.data.data.events?.map(event => {
            // If event_status is already available, use it
            if (event.event_status) {
              return event;
            }
            
            // Try to get status from the first transaction's event object
            const firstTransaction = event.transactions && event.transactions.length > 0 ? event.transactions[0] : null;
            const eventStatus = firstTransaction?.event?.status || 'N/A';
            
            return {
              ...event,
              event_status: eventStatus
            };
          }) || [];
          
          setEvents(processedEvents);
          
          const sumTransactions = processedEvents.reduce((sum, event) => sum + (event.transaction_count || 0), 0) || 0;
          
          console.log('Organizer Info:', {
            total_transactions: result.data.data.total_transactions,
            events_length: processedEvents.length,
            sum_transactions: sumTransactions,
            discrepancy: result.data.data.total_transactions - sumTransactions
          }); // Debug log
          
          // Log the first processed event to check if event_status is available
          if (processedEvents.length > 0) {
            console.log('First processed event:', {
              event_title: processedEvents[0].event_title,
              event_status: processedEvents[0].event_status
            });
          }
        } else {
          setError('Organizer information not available');
        }
      } catch (err) {
        setError('Failed to fetch organizer transactions')
        console.error('Error fetching organizer transactions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizerTransactions()
  }, [params.id])

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
      pagination: {
        pageSize: rowsPerPage,
        pageIndex: page
      }
    },
    onGlobalFilterChange: setGlobalFilter
  })

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  if (error) {
    return (
      <Card>
        <Box sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
          <i className='ri-error-warning-line' style={{ fontSize: '2rem' }} />
          <p>{error}</p>
          <BackButton sx={{ mt: 2 }} />
        </Box>
      </Card>
    )
  }

  if (!organizerInfo) {
    return (
      <Card>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Organizer information not available</Typography>
          <BackButton sx={{ mt: 2 }} />
        </Box>
      </Card>
    )
  }

  return (
    <Stack spacing={3}>
      <BackButton sx={{ alignSelf: 'flex-start' }} />

      {organizerInfo && (
        <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
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

export default OrganizerTransactionsPage
