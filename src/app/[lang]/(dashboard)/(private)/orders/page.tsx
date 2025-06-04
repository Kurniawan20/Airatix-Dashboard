'use client'

// React Imports
import { useState, useEffect, useCallback, useMemo } from 'react'

// Excel Export
import * as XLSX from 'xlsx'

// Type Imports
import type { OrganizerData } from '@/types/organizers'
import type { Transaction, QuestionAnswer } from '@/types/event-transactions'

// Next Imports
import { useRouter } from 'next/navigation'

// Next-Auth Imports
import { useSession } from 'next-auth/react'

// MUI Imports
import {
  Box,
  Card,
  CardHeader,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  Typography,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Paper,
  Tab,
  Tabs,
  useTheme,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton
} from '@mui/material'

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

// Transaction Detail interface based on the new API response
interface TransactionDetail {
  transaction_id: number
  transaction_short_id: string
  transaction_status: string
  transaction_created_at: string
  transaction_updated_at: string
  total_amount: number
  total_tax: number
  total_fee: number
  net_amount: number
  event: {
    event_id: number
    event_title: string
    event_status: string
    event_start_date: string
    event_end_date: string
    organizer_id: number
    organizer_name: string
  }
  customer: {
    first_name: string
    last_name: string
    email: string
    phone: string
    country: string
    province: string
    city: string
  }
  transaction_details: {
    id: number
    short_id: string
    status: string
    total_price: number
    total_tax: number
    total_fee: number
    payment_status: string | null
    payment_url: string | null
    created_at: string
    updated_at: string
    firstname: string
    lastname: string
    id_type: string | null
    id_number: string | null
    phone: string | null
    country: string | null
    province: string | null
    city: string | null
    metadata: string | null
    event: {
      id: number
      title: string
      description: string
      start_date: string
      end_date: string
      location: string
      location_details: string | null
      status: string
      currency: string
      timezone: string
      attributes: any | null
      created_at: string
      updated_at: string
      organizer: {
        id: number
        name: string
        email: string
      }
    }
    tickets: Array<{
      id: number
      title: string
      description: string
      quantity: number
      price_paid: number
      original_price: number
      attendees: Array<{
        id: number
        name: string
        firstname: string
        lastname: string
        email: string
        check_in_status: string | null
        short_id: string
        public_id: string
        status: string
        checked_in_at: string | null
      }>
    }>
    question_answers: Array<{
      id: number
      question_id: number
      question_text: string
      ticket_id: number | null
      attendee_id: number | null
      answer: string | any
      created_at: string
      updated_at: string
    }>
  }
}

// Transaction Dialog Props interface
interface TransactionDialogProps {
  open: boolean
  onClose: () => void
  transaction: Transaction | null
}

// Transaction Dialog Component for displaying transaction details
const TransactionDialog = ({ open, onClose, transaction }: TransactionDialogProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactionDetail, setTransactionDetail] = useState<TransactionDetail | null>(null)
  
  // Fetch transaction details when dialog opens
  useEffect(() => {
    if (open && transaction) {
      fetchTransactionDetail(transaction.id.toString())
    } else {
      // Reset state when dialog closes
      setTransactionDetail(null)
      setError(null)
    }
  }, [open, transaction])
  
  // Function to fetch transaction details
  const fetchTransactionDetail = async (transactionId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetchWithAuthFallback(
        API_ENDPOINTS.TRANSACTIONS.PUBLIC_TRANSACTION_DETAIL(transactionId)
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch transaction details')
      }
      
      const data = await response.json()
      setTransactionDetail(data.data)
    } catch (err) {
      console.error('Error fetching transaction details:', err)
      setError('Failed to load transaction details. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // If transaction is null, don't render anything
  if (!transaction) return null
  
  // Show loading state
  if (loading) {
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
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    )
  }
  
  // Show error state
  if (error) {
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
          <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button variant='outlined' onClick={() => fetchTransactionDetail(transaction.id.toString())}>
              Retry
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    )
  }
  
  // Use the detailed transaction data if available, otherwise fall back to the original transaction
  const detailData = transactionDetail?.transaction_details || transaction
  
  // No debug code here to avoid React hooks errors
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='h6'>Transaction Details - #{detailData.short_id}</Typography>
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
              <Typography>{detailData.id}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' color='text.secondary'>
                Status
              </Typography>
              <Chip
                label={detailData.status}
                color={
                  detailData.status === 'COMPLETED' || detailData.status === 'PAID'
                    ? 'success'
                    : detailData.status === 'RESERVED' || detailData.status === 'PENDING'
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
              <Typography>IDR {detailData.total_price.toLocaleString()}</Typography>
            </Grid>
            {transactionDetail && (
              <>
                <Grid item xs={12} sm={4}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Total Tax
                  </Typography>
                  <Typography>IDR {transactionDetail.total_tax.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Total Fee
                  </Typography>
                  <Typography>IDR {transactionDetail.total_fee.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Net Amount
                  </Typography>
                  <Typography>IDR {transactionDetail.net_amount.toLocaleString()}</Typography>
                </Grid>
              </>
            )}
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
              <Typography>
                {transactionDetail?.customer?.first_name || detailData.firstname || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' color='text.secondary'>
                Last Name
              </Typography>
              <Typography>
                {transactionDetail?.customer?.last_name || detailData.lastname || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' color='text.secondary'>
                Email
              </Typography>
              <Typography>
                {transactionDetail?.customer?.email || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' color='text.secondary'>
                ID Type
              </Typography>
              <Typography>{detailData.id_type || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' color='text.secondary'>
                ID Number
              </Typography>
              <Typography>{detailData.id_number || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' color='text.secondary'>
                Phone
              </Typography>
              <Typography>
                {transactionDetail?.customer?.phone || detailData.phone || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' color='text.secondary'>
                Country
              </Typography>
              <Typography>
                {transactionDetail?.customer?.country || detailData.country || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' color='text.secondary'>
                Province
              </Typography>
              <Typography>
                {transactionDetail?.customer?.province || detailData.province || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='subtitle2' color='text.secondary'>
                City
              </Typography>
              <Typography>
                {transactionDetail?.customer?.city || detailData.city || 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Event Information */}
        {(detailData.event || transactionDetail?.event) && (
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
                  <Typography>
                    {transactionDetail?.event?.event_title || detailData.event?.title || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Event Date
                  </Typography>
                  <Typography>
                    {new Date(transactionDetail?.event?.event_start_date || detailData.event?.start_date).toLocaleDateString()} - 
                    {new Date(transactionDetail?.event?.event_end_date || detailData.event?.end_date).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Event Status
                  </Typography>
                  <Chip
                    label={transactionDetail?.event?.event_status || detailData.event?.status || 'N/A'}
                    color={
                      (transactionDetail?.event?.event_status || detailData.event?.status) === 'LIVE' ? 'success' : 'default'
                    }
                    size='small'
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Organizer
                  </Typography>
                  <Typography>
                    {transactionDetail?.event?.organizer_name || detailData.event?.organizer?.name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Location
                  </Typography>
                  <Typography>
                    {detailData.event?.location || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </>
        )}

        {/* Question Answers Section */}
        {detailData.question_answers && Array.isArray(detailData.question_answers) && detailData.question_answers.length > 0 && (
          <>
            <Typography variant='h6' gutterBottom>
              Form Responses
            </Typography>
            <Paper variant='outlined' sx={{ p: 2, mb: 3 }}>
              <List dense>
                {detailData.question_answers
                  .filter(qa => !qa.attendee_id) // Only show general questions (not attendee-specific)
                  .map((qa, qaIndex) => {
                    // Skip if question answer is invalid
                    if (!qa || typeof qa !== 'object') {
                      return null;
                    }
                    // Format the answer based on its type
                    let isObject = false;
                    let isAddress = false;
                    
                    // Check if the answer is an object (like address)
                    if (typeof qa.answer === 'object' && qa.answer !== null) {
                      isObject = true;
                      
                      // Check if it's specifically an address object
                      if (qa.answer && 
                          typeof qa.answer === 'object' && 
                          'city' in qa.answer && 
                          'country' in qa.answer && 
                          'address_line_1' in qa.answer) {
                        isAddress = true;
                      }
                    }
                    
                    // Check if the answer is a date string
                    const isDate = typeof qa.answer === 'string' && 
                      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(qa.answer);
                    
                    return (
                      <ListItem key={qa.id || `qa-${qaIndex}`} divider>
                        <ListItemText
                          primary={
                            <Typography variant='subtitle2'>
                              {qa.question_text || 'Question'}
                              {qa.ticket_id && (
                                <Chip 
                                  label={`Ticket #${qa.ticket_id}`} 
                                  size='small' 
                                  color='primary' 
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Typography>
                          }
                          secondary={
                            isAddress ? (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2">{qa.answer.address_line_1}</Typography>
                                <Typography variant="body2">
                                  {qa.answer.city}
                                  {qa.answer.state_or_region ? `, ${qa.answer.state_or_region}` : ''} 
                                  {qa.answer.zip_or_postal_code ? qa.answer.zip_or_postal_code : ''}
                                </Typography>
                                <Typography variant="body2">{qa.answer.country}</Typography>
                              </Box>
                            ) : isObject ? (
                              <Box sx={{ mt: 1 }}>
                                {Object.entries(qa.answer || {}).map(([key, value]) => (
                                  <Typography key={key} variant="body2">
                                    <strong>{key.replace(/_/g, ' ')}:</strong> {String(value || '')}
                                  </Typography>
                                ))}
                              </Box>
                            ) : isDate ? (
                              new Date(qa.answer).toLocaleString()
                            ) : (
                              qa.answer
                            )
                          }
                        />
                      </ListItem>
                    );
                  })}
              </List>
            </Paper>
          </>
        )}

        {/* Tickets Section */}
        <Typography variant='h6' gutterBottom>
          Tickets
        </Typography>

        {detailData.tickets && detailData.tickets.length > 0 ? (
          detailData.tickets.map((ticket, index) => (
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
                          
                          {/* Attendee-specific question answers */}
                          {detailData.question_answers && Array.isArray(detailData.question_answers) && (
                            <>
                              {detailData.question_answers
                                .filter(qa => {
                                  // Try to match by attendee ID
                                  if (qa.attendee_id && attendee.id) {
                                    return qa.attendee_id.toString() === attendee.id.toString();
                                  }
                                  // If that fails, try to match by short_id or public_id
                                  if (qa.attendee_id && attendee.short_id) {
                                    return qa.attendee_id.toString() === attendee.short_id.toString();
                                  }
                                  return false;
                                })
                                .length > 0 && (
                                  <>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Typography variant='subtitle2' sx={{ mb: 1 }}>
                                      Attendee Responses
                                    </Typography>
                                    <List dense disablePadding>
                                      {detailData.question_answers
                                        .filter(qa => {
                                          // Try to match by attendee ID
                                          if (qa.attendee_id && attendee.id) {
                                            return qa.attendee_id.toString() === attendee.id.toString();
                                          }
                                          // If that fails, try to match by short_id or public_id
                                          if (qa.attendee_id && attendee.short_id) {
                                            return qa.attendee_id.toString() === attendee.short_id.toString();
                                          }
                                          return false;
                                        })
                                        .map((qa, qaIndex) => {
                                          // Format the answer based on its type
                                          let isObject = false;
                                          let isAddress = false;
                                          
                                          // Check if the answer is an object (like address)
                                          if (typeof qa.answer === 'object' && qa.answer !== null) {
                                            isObject = true;
                                            
                                            // Check if it's specifically an address object
                                            if (qa.answer && 
                                                typeof qa.answer === 'object' && 
                                                'city' in qa.answer && 
                                                'country' in qa.answer && 
                                                'address_line_1' in qa.answer) {
                                              isAddress = true;
                                            }
                                          }
                                          
                                          // Check if the answer is a date string
                                          const isDate = typeof qa.answer === 'string' && 
                                            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(qa.answer);
                                          
                                          return (
                                            <ListItem key={qa.id || `qa-${qaIndex}`} disablePadding sx={{ mb: 1 }}>
                                              <ListItemText
                                                primary={
                                                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                                    {qa.question_text || 'Question'}
                                                  </Typography>
                                                }
                                                secondary={
                                                  isAddress ? (
                                                    <Box sx={{ mt: 0.5 }}>
                                                      <Typography variant="caption" display="block">{qa.answer.address_line_1}</Typography>
                                                      <Typography variant="caption" display="block">
                                                        {qa.answer.city}
                                                        {qa.answer.state_or_region ? `, ${qa.answer.state_or_region}` : ''} 
                                                        {qa.answer.zip_or_postal_code ? qa.answer.zip_or_postal_code : ''}
                                                      </Typography>
                                                      <Typography variant="caption" display="block">{qa.answer.country}</Typography>
                                                    </Box>
                                                  ) : isObject ? (
                                                    <Box sx={{ mt: 0.5 }}>
                                                      {Object.entries(qa.answer || {}).map(([key, value]) => (
                                                        <Typography key={key} variant="caption" display="block">
                                                          <strong>{key.replace(/_/g, ' ')}:</strong> {String(value || '')}
                                                        </Typography>
                                                      ))}
                                                    </Box>
                                                  ) : isDate ? (
                                                    <Typography variant="caption">{new Date(qa.answer).toLocaleString()}</Typography>
                                                  ) : (
                                                    <Typography variant="caption">{qa.answer}</Typography>
                                                  )
                                                }
                                              />
                                            </ListItem>
                                          );
                                        })}
                                    </List>
                                  </>
                                )}
                            </>
                          )}
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
                          
                          {/* Attendee-specific question answers */}
                          {detailData.question_answers && Array.isArray(detailData.question_answers) && (
                            <>
                              {detailData.question_answers
                                .filter(qa => {
                                  // Try to match by attendee ID
                                  if (qa.attendee_id && attendee.id) {
                                    return qa.attendee_id.toString() === attendee.id.toString();
                                  }
                                  // If that fails, try to match by short_id or public_id
                                  if (qa.attendee_id && attendee.short_id) {
                                    return qa.attendee_id.toString() === attendee.short_id.toString();
                                  }
                                  return false;
                                })
                                .length > 0 && (
                                  <>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Typography variant='subtitle2' sx={{ mb: 1 }}>
                                      Attendee Responses
                                    </Typography>
                                    <List dense disablePadding>
                                      {detailData.question_answers
                                        .filter(qa => {
                                          // Try to match by attendee ID
                                          if (qa.attendee_id && attendee.id) {
                                            return qa.attendee_id.toString() === attendee.id.toString();
                                          }
                                          // If that fails, try to match by short_id or public_id
                                          if (qa.attendee_id && attendee.short_id) {
                                            return qa.attendee_id.toString() === attendee.short_id.toString();
                                          }
                                          return false;
                                        })
                                        .map((qa, qaIndex) => {
                                          // Format the answer based on its type
                                          let isObject = false;
                                          let isAddress = false;
                                          
                                          // Check if the answer is an object (like address)
                                          if (typeof qa.answer === 'object' && qa.answer !== null) {
                                            isObject = true;
                                            
                                            // Check if it's specifically an address object
                                            if (qa.answer && 
                                                typeof qa.answer === 'object' && 
                                                'city' in qa.answer && 
                                                'country' in qa.answer && 
                                                'address_line_1' in qa.answer) {
                                              isAddress = true;
                                            }
                                          }
                                          
                                          // Check if the answer is a date string
                                          const isDate = typeof qa.answer === 'string' && 
                                            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(qa.answer);
                                          
                                          return (
                                            <ListItem key={qa.id || `qa-${qaIndex}`} disablePadding sx={{ mb: 1 }}>
                                              <ListItemText
                                                primary={
                                                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                                    {qa.question_text || 'Question'}
                                                  </Typography>
                                                }
                                                secondary={
                                                  isAddress ? (
                                                    <Box sx={{ mt: 0.5 }}>
                                                      <Typography variant="caption" display="block">{qa.answer.address_line_1}</Typography>
                                                      <Typography variant="caption" display="block">
                                                        {qa.answer.city}
                                                        {qa.answer.state_or_region ? `, ${qa.answer.state_or_region}` : ''} 
                                                        {qa.answer.zip_or_postal_code ? qa.answer.zip_or_postal_code : ''}
                                                      </Typography>
                                                      <Typography variant="caption" display="block">{qa.answer.country}</Typography>
                                                    </Box>
                                                  ) : isObject ? (
                                                    <Box sx={{ mt: 0.5 }}>
                                                      {Object.entries(qa.answer || {}).map(([key, value]) => (
                                                        <Typography key={key} variant="caption" display="block">
                                                          <strong>{key.replace(/_/g, ' ')}:</strong> {String(value || '')}
                                                        </Typography>
                                                      ))}
                                                    </Box>
                                                  ) : isDate ? (
                                                    <Typography variant="caption">{new Date(qa.answer).toLocaleString()}</Typography>
                                                  ) : (
                                                    <Typography variant="caption">{qa.answer}</Typography>
                                                  )
                                                }
                                              />
                                            </ListItem>
                                          );
                                        })}
                                    </List>
                                  </>
                                )}
                            </>
                          )}
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
        {detailData.payment_url && (
          <Button
            variant='contained'
            color='primary'
            startIcon={<i className='ri-bank-card-line' />}
            onClick={() => window.open(detailData.payment_url, '_blank')}
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
  const theme = useTheme()
  
  // Get organizerId from session
  const organizerId = session?.organizerId || session?.user?.organizerId
  
  // Function to export transactions data to Excel
  const exportToExcel = () => {
    // Create a formatted dataset for Excel
    const exportData = transactions.map(transaction => ({
      'Transaction ID': transaction.short_id,
      'Event': transaction.event?.title || 'N/A',
      'Status': transaction.status,
      'Payment Status': transaction.payment_status || 'N/A',
      'Customer': `${transaction.firstname || ''} ${transaction.lastname || ''}`,
      'Email': transaction.email || 'N/A',
      'Phone': transaction.phone || 'N/A',
      'Amount': transaction.total_price || 0,
      'Date': new Date(transaction.created_at).toLocaleDateString(),
      'Time': new Date(transaction.created_at).toLocaleTimeString()
    }))
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData)
    
    // Create workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Orders')
    
    // Generate filename with current date
    const fileName = `orders_export_${new Date().toISOString().split('T')[0]}.xlsx`
    
    // Save file
    XLSX.writeFile(wb, fileName)
  }
  
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
  const handleChangePage = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage)
    // Update the table's pagination state
    table.setPageIndex(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    setRowsPerPage(newRowsPerPage)
    setPage(0)
    
    // Update the table's pagination state
    table.setPageSize(newRowsPerPage)
    table.setPageIndex(0)
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
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
              <Tooltip title="Export to Excel">
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={exportToExcel}
                  startIcon={<i className="ri-file-excel-line" />}
                  disabled={transactions.length === 0 || loading}
                >
                  Export
                </Button>
              </Tooltip>
            </Box>
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
