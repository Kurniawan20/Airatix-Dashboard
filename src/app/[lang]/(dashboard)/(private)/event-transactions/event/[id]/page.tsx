'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
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
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Avatar from '@mui/material/Avatar'

// Third-party Imports
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable, getFilteredRowModel } from '@tanstack/react-table'

// API Config Imports
import { API_ENDPOINTS, fetchWithAuthFallback } from '@/utils/apiConfig'

// Type Imports
import type { Transaction, EventTransactionResponse, Ticket, Attendee } from '@/types/event-transactions'

// Style Imports
import styles from '@core/styles/table.module.css'

interface EventDetailProps {
  params: {
    id: string
  }
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
      Back
    </Button>
  )
}

// Helper function to sanitize HTML content
const sanitizeHtml = (html: string | null | undefined): string => {
  if (!html) return 'No description available';
  
  // Basic sanitization - remove potentially harmful script tags
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, ''); // Remove inline event handlers
}

// Ticket Dialog Component
interface TicketDialogProps {
  open: boolean
  onClose: () => void
  transaction: Transaction | null
}

const TicketDialog = ({ open, onClose, transaction }: TicketDialogProps) => {
  if (!transaction) return null

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Ticket Details - Transaction #{transaction.short_id}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <i className="ri-close-line" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="text.secondary">Transaction ID</Typography>
              <Typography>{transaction.id}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="text.secondary">Status</Typography>
              <Chip 
                label={transaction.status} 
                color={
                  transaction.status === 'COMPLETED' || transaction.status === 'PAID' ? 'success' : 
                  transaction.status === 'RESERVED' || transaction.status === 'PENDING' ? 'warning' : 
                  'error'
                } 
                size="small" 
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="text.secondary">Total Price</Typography>
              <Typography>IDR {transaction.total_price.toLocaleString()}</Typography>
            </Grid>
          </Grid>
        </Box>
        
        <Typography variant="h6" gutterBottom>Tickets</Typography>
        
        {transaction.tickets.length === 0 ? (
          <Typography color="text.secondary">No tickets found for this transaction</Typography>
        ) : (
          transaction.tickets.map((ticket, index) => (
            <Accordion key={ticket.id} defaultExpanded={index === 0}>
              <AccordionSummary expandIcon={<i className="ri-arrow-down-s-line" />}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pr: 2 }}>
                  <Typography variant="subtitle1">
                    <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(ticket.title) }} />
                  </Typography>
                  <Box>
                    <Chip 
                      label={`${ticket.quantity} ticket${ticket.quantity > 1 ? 's' : ''}`} 
                      size="small" 
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="subtitle2" component="span">
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
                
                <Typography variant="subtitle2" gutterBottom>Attendees</Typography>
                
                {Array.isArray(ticket.attendees) && ticket.attendees.length > 0 ? (
                  <Grid container spacing={2}>
                    {ticket.attendees.map((attendee) => (
                      <Grid item xs={12} sm={6} key={attendee.id}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {attendee.firstname ? attendee.firstname[0] : 'A'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">
                                {attendee.name || `${attendee.firstname} ${attendee.lastname}`}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {attendee.email}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              ID: {attendee.short_id}
                            </Typography>
                            <Chip 
                              label={attendee.check_in_status || 'Not Checked In'} 
                              color={attendee.check_in_status === 'CHECKED_IN' ? 'success' : 'default'} 
                              size="small" 
                            />
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : !Array.isArray(ticket.attendees) && Object.keys(ticket.attendees).length > 0 ? (
                  <Grid container spacing={2}>
                    {Object.values(ticket.attendees).map((attendee) => (
                      <Grid item xs={12} sm={6} key={attendee.id}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {attendee.firstname ? attendee.firstname[0] : 'A'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">
                                {attendee.name || `${attendee.firstname} ${attendee.lastname}`}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {attendee.email}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              ID: {attendee.short_id}
                            </Typography>
                            <Chip 
                              label={attendee.check_in_status || 'Not Checked In'} 
                              color={attendee.check_in_status === 'CHECKED_IN' ? 'success' : 'default'} 
                              size="small" 
                            />
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography color="text.secondary">No attendee information available</Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {transaction.payment_url && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<i className="ri-bank-card-line" />}
            onClick={() => window.open(transaction.payment_url, '_blank')}
          >
            Go to Payment
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

const EventTransactionPage = ({ params }: EventDetailProps) => {
  const router = useRouter()
  const [eventInfo, setEventInfo] = useState<{
    event_id: number;
    event_title: string;
    event_status: string;
    event_start_date: string;
    event_end_date: string;
    total_amount: number;
    transaction_count: number;
  } | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    last_page: 1
  })
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false)

  const handleOpenTicketDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setTicketDialogOpen(true)
  }

  const handleCloseTicketDialog = () => {
    setTicketDialogOpen(false)
  }

  useEffect(() => {
    const fetchEventTransactions = async () => {
      try {
        const result = await fetchWithAuthFallback(API_ENDPOINTS.TRANSACTIONS.EVENT(params.id, currentPage))
        
        console.log('API Response:', result.data); // Debug log
        
        if (result.success && result.data.data && result.data.data.events && result.data.data.events.length > 0) {
          const eventData = result.data.data.events[0];
          setEventInfo({
            event_id: eventData.event_id,
            event_title: eventData.event_title,
            event_status: eventData.event_status,
            event_start_date: eventData.event_start_date,
            event_end_date: eventData.event_end_date,
            total_amount: eventData.total_amount,
            transaction_count: eventData.transaction_count
          });
          setTransactions(eventData.transactions || []);
          setPagination({
            current_page: result.data.data.current_page,
            per_page: result.data.data.per_page,
            last_page: result.data.data.last_page
          });
        } else {
          setError('Event not found');
        }
      } catch (err) {
        setError('Failed to fetch event transactions')
        console.error('Error fetching event transactions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEventTransactions()
  }, [params.id, currentPage])

  return (
    <div>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <BackButton sx={{ mr: 2 }} />
        <Typography variant="h5">
          Event Transactions
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <>
          {eventInfo && (
            <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {eventInfo.event_title}
                  </Typography>
                  <Chip 
                    label={eventInfo.event_status} 
                    color={eventInfo.event_status === 'LIVE' ? 'success' : eventInfo.event_status === 'DRAFT' ? 'warning' : 'default'} 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Start Date
                    </Typography>
                    <Typography>
                      {new Date(eventInfo.event_start_date).toLocaleString()}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      End Date
                    </Typography>
                    <Typography>
                      {new Date(eventInfo.event_end_date).toLocaleString()}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Transactions
                    </Typography>
                    <Typography>
                      {eventInfo.transaction_count} transactions
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Amount
                    </Typography>
                    <Typography>
                      IDR {eventInfo.total_amount.toLocaleString()}
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
            <CardContent>
              {transactions.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography>No transactions found</Typography>
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table className={styles.table}>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Short ID</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Total Price</TableCell>
                          <TableCell>Payment Status</TableCell>
                          <TableCell>Created At</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <i className="ri-ticket-2-line" style={{ marginRight: '4px' }} />
                              Tickets
                            </Box>
                          </TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {transactions
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map(transaction => (
                            <TableRow key={transaction.id}>
                              <TableCell>{transaction.id}</TableCell>
                              <TableCell>{transaction.short_id}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={transaction.status} 
                                  color={
                                    transaction.status === 'COMPLETED' || transaction.status === 'PAID' ? 'success' : 
                                    transaction.status === 'RESERVED' || transaction.status === 'PENDING' ? 'warning' : 
                                    'error'
                                  } 
                                  size="small" 
                                />
                              </TableCell>
                              <TableCell>IDR {transaction.total_price.toLocaleString()}</TableCell>
                              <TableCell>
                                {transaction.payment_status ? (
                                  <Chip 
                                    label={transaction.payment_status} 
                                    color={
                                      transaction.payment_status === 'PAID' ? 'success' : 
                                      transaction.payment_status === 'AWAITING_PAYMENT' ? 'warning' : 
                                      'error'
                                    } 
                                    size="small" 
                                  />
                                ) : (
                                  <Typography variant="caption" color="text.secondary">N/A</Typography>
                                )}
                              </TableCell>
                              <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={transaction.tickets.length} 
                                  color="primary" 
                                  size="small" 
                                  onClick={() => handleOpenTicketDialog(transaction)}
                                  sx={{ cursor: 'pointer' }}
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex' }}>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleOpenTicketDialog(transaction)}
                                    title="View Tickets"
                                  >
                                    <i className="ri-ticket-2-line" />
                                  </IconButton>
                                  {transaction.payment_url && (
                                    <IconButton 
                                      size="small" 
                                      onClick={() => window.open(transaction.payment_url, '_blank')}
                                      title="Payment Link"
                                      sx={{ ml: 1 }}
                                    >
                                      <i className="ri-bank-card-line" />
                                    </IconButton>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <TablePagination
                      component="div"
                      count={transactions.length}
                      page={page}
                      onPageChange={(_, newPage) => setPage(newPage)}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={e => {
                        setRowsPerPage(parseInt(e.target.value, 10))
                        setPage(0)
                      }}
                    />
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
      <TicketDialog 
        open={ticketDialogOpen} 
        onClose={handleCloseTicketDialog} 
        transaction={selectedTransaction} 
      />
    </div>
  )
}

export default EventTransactionPage
