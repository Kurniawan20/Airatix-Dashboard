'use client'

// React Imports
import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

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
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable, getFilteredRowModel } from '@tanstack/react-table'

// API Config Imports
import { API_ENDPOINTS, fetchWithAuthFallback } from '@/utils/apiConfig'

// Type Imports
import type { OrganizerSummary } from '@/types/event-transactions'

// Style Imports
import styles from '@core/styles/table.module.css'


const RowOptions = ({ organizerId, transactionCount }: { organizerId: number; transactionCount: number }) => {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleViewTransactions = () => {
    router.push(`/en/event-transactions/${organizerId}`)
    handleClose()
  }

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
        <MenuItem onClick={handleViewTransactions}>
          <ListItemIcon>
            <i className='ri-exchange-dollar-line' />
          </ListItemIcon>
          <ListItemText>View Transactions ({transactionCount})</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}

// Column Definitions
const columnHelper = createColumnHelper<OrganizerSummary>()

const columns = [
  columnHelper.accessor('organizer_id', {
    cell: info => `#${info.getValue()}`,
    header: 'Organizer ID'
  }),
  columnHelper.accessor('organizer_name', {
    cell: info => info.getValue(),
    header: 'Organizer Name'
  }),
  columnHelper.accessor('organizer_email', {
    cell: info => info.getValue(),
    header: 'Email'
  }),
  columnHelper.accessor('total_amount', {
    cell: info => `IDR ${info.getValue().toLocaleString()}`,
    header: 'Total Amount'
  }),
  columnHelper.accessor('total_transactions', {
    cell: info => info.getValue(),
    header: 'Transactions'
  }),
  columnHelper.accessor('events.length', {
    cell: info => info.getValue(),
    header: 'Events'
  }),
  columnHelper.display({
    id: 'actions',
    cell: ({ row }) => (
      <RowOptions 
        organizerId={row.original.organizer_id} 
        transactionCount={row.original.total_transactions}
      />
    ),
    header: 'Actions'
  })
]

const EventTransactionsPage = () => {
  const [data, setData] = useState<OrganizerSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [page, setPage] = useState(0)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        
        // Use the fetchWithAuthFallback function which tries multiple token sources
        const response = await fetchWithAuthFallback(API_ENDPOINTS.TRANSACTIONS.ALL);
        
        if (response.ok) {
          const responseText = await response.text();

          if (responseText) {
            try {

              const result = JSON.parse(responseText);

              console.log('Parsed transaction data:', result);

              // Filter out organizers with IDs 3, 5, 6, 2, and 7
              const excludedIds = [3, 5, 6, 2, 7];

              const filteredOrganizers = (result.data?.organizers || []).filter(
                (org: OrganizerSummary) => !excludedIds.includes(org.organizer_id)
              );

              setData(filteredOrganizers);
            } catch (parseError) {
              console.error('Error parsing JSON:', parseError);
              setError('Failed to parse transaction data');
            }
          } else {
            console.error('Empty response from transactions API');
            setError('No data received from server');
          }
        } else {
          console.error('Error fetching transactions:', response.status, response.statusText);
          setError(`Failed to fetch transactions: ${response.statusText}`);
        }
      } catch (err) {
        setError('Failed to fetch transactions');
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [])

  const table = useReactTable({
    data,
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
        </Box>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title='Event Transactions'
        action={
          <TextField
            size='small'
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder='Search organizers...'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-search-line' />
                </InputAdornment>
              )
            }}
          />
        }
      />
      <TableContainer>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
            <i className='ri-error-warning-line' style={{ fontSize: '2rem' }} />
            <p>{error}</p>
          </Box>
        ) : data.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No organizers found</Typography>
          </Box>
        ) : (
          <Table className={styles.table}>
            <TableHead>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableCell key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel()?.rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component='div'
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Card>
  )
}

export default EventTransactionsPage
