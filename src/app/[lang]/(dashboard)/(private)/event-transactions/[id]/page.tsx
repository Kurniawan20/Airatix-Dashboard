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
      onClick={() => router.push(`/en/event-transactions/${eventId}`)}
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

export default function RedirectPage({ params }: PageProps) {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new route structure
    // We're assuming this is an organizer ID, but in a real app you might want to
    // check if it's an organizer or event ID first
    router.replace(`/en/event-transactions/organizer/${params.id}`)
  }, [params.id, router])

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  )
}
