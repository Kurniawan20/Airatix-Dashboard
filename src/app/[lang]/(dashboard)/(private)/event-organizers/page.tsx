'use client'

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
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Popover from '@mui/material/Popover'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'

// Third-party Imports
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getFilteredRowModel
} from '@tanstack/react-table'

// Type Imports
import type { EventOrganizer, EventOrganizersResponse } from '@/types/event-organizers'

// Style Imports
import styles from '@core/styles/table.module.css'

const RowOptions = ({ email, hasUser, uuid }: { email: string; hasUser: boolean; uuid: string }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const router = useRouter()
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleRegister = () => {
    // Get the current language from the URL
    const lang = window.location.pathname.split('/')[1] || 'en'

    router.push(`/${lang}/event-organizers/register?email=${encodeURIComponent(email)}`)
    handleClose()
  }

  const handleViewDetail = () => {
    const lang = window.location.pathname.split('/')[1] || 'en'

    router.push(`/${lang}/event-organizers/${uuid}`)
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
        {!hasUser ? (
          <MenuItem onClick={handleRegister}>
            <ListItemIcon>
              <i className='ri-user-add-line' />
            </ListItemIcon>
            <ListItemText>Register</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={handleViewDetail}>
            <ListItemIcon>
              <i className='ri-eye-line' />
            </ListItemIcon>
            <ListItemText>View Detail</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  )
}

const FilterPopover = ({
  anchorEl,
  onClose,
  filters,
  onFilterChange
}: {
  anchorEl: HTMLElement | null
  onClose: () => void
  filters: {
    status: string
  }
  onFilterChange: (filters: { status: string }) => void
}) => {
  const open = Boolean(anchorEl)

  const handleStatusChange = (event: any) => {
    onFilterChange({
      ...filters,
      status: event.target.value
    })
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
    >
      <Box sx={{ p: 3, width: 300 }}>
        <Typography variant='h6' sx={{ mb: 2 }}>
          Filters
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Registration Status</InputLabel>
          <Select value={filters.status} label='Registration Status' onChange={handleStatusChange} size='small'>
            <MenuItem value='all'>All</MenuItem>
            <MenuItem value='registered'>Registered</MenuItem>
            <MenuItem value='not_registered'>Not Registered</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Popover>
  )
}

// Column Definitions
const columnHelper = createColumnHelper<EventOrganizer>()

const columns = [
  columnHelper.accessor('email', {
    cell: info => info.getValue(),
    header: 'Email'
  }),
  columnHelper.accessor('user', {
    cell: info => {
      const user = info.getValue()

      if (!user)
        return (
          <Box>
            <Typography variant='body2' color='text.secondary' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='ri-information-line' />
              Not registered yet
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Click the action menu to register this organizer
            </Typography>
          </Box>
        )

      return (
        <Box>
          <Typography variant='body2'>{user.full_name}</Typography>
          <Typography variant='caption' color='text.secondary'>
            {user.timezone} • {user.locale.toUpperCase()}
          </Typography>
        </Box>
      )
    },
    header: 'User Info'
  }),
  columnHelper.accessor('created_at', {
    cell: info => new Date(info.getValue()).toLocaleString(),
    header: 'Created At'
  }),
  columnHelper.display({
    id: 'status',
    cell: ({ row }) => (
      <Chip
        size='small'
        label={row.original.user ? 'Registered' : 'Pending'}
        color={row.original.user ? 'success' : 'warning'}
        icon={<i className={row.original.user ? 'ri-check-line' : 'ri-time-line'} />}
      />
    ),
    header: 'Status'
  }),
  columnHelper.display({
    id: 'actions',
    cell: ({ row }) => (
      <RowOptions email={row.original.email} hasUser={row.original.user !== null} uuid={row.original.uuid} />
    ),
    header: 'Actions'
  })
]

const EventOrganizersPage = () => {
  const [data, setData] = useState<EventOrganizer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = useState('')

  const [pagination, setPagination] = useState({
    total: 0,
    page: 0,
    pageSize: 10
  })

  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null)

  const [filters, setFilters] = useState({
    status: 'all'
  })

  useEffect(() => {
    const fetchEventOrganizers = async () => {
      try {
        const response = await fetch('https://insight.airatix.id:8089/public/email-organizers')
        const result: EventOrganizersResponse = await response.json()

        setData(result.data.items)
        setPagination({
          total: result.data.total_emails,
          page: result.data.current_page - 1, // Convert to 0-based index
          pageSize: result.data.per_page
        })
      } catch (err) {
        setError('Failed to fetch event organizers')
        console.error('Error fetching event organizers:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEventOrganizers()
  }, [])

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget)
  }

  const handleFilterClose = () => {
    setFilterAnchorEl(null)
  }

  const handleFilterChange = (newFilters: { status: string }) => {
    setFilters(newFilters)
  }

  const filteredData = data.filter(item => {
    if (filters.status === 'all') return true
    if (filters.status === 'registered') return item.user !== null
    if (filters.status === 'not_registered') return item.user === null

    return true
  })

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
      pagination: {
        pageSize: pagination.pageSize,
        pageIndex: pagination.page
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    manualPagination: true,
    pageCount: Math.ceil(pagination.total / pagination.pageSize)
  })

  const handleChangePage = (_: unknown, newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }))
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10)

    setPagination(prev => ({
      ...prev,
      pageSize: newPageSize,
      page: 0
    }))
  }

  if (error) {
    return (
      <Card>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity='error'>{error}</Alert>
        </Box>
      </Card>
    )
  }

  const activeFiltersCount = Object.values(filters).filter(value => value !== 'all').length

  return (
    <Card>
      <CardHeader
        title='Event Organizers'
        action={
          <Stack direction='row' spacing={2}>
            <TextField
              size='small'
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder='Search event organizers...'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='ri-search-line' />
                  </InputAdornment>
                )
              }}
            />
            <Button
              variant='outlined'
              onClick={handleFilterClick}
              startIcon={<i className='ri-filter-3-line' />}
              endIcon={activeFiltersCount > 0 && <Chip size='small' label={activeFiltersCount} />}
            >
              Filters
            </Button>
          </Stack>
        }
      />
      <FilterPopover
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      <TableContainer>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
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
              {table.getRowModel().rows.map(row => (
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
        count={pagination.total}
        rowsPerPage={pagination.pageSize}
        page={pagination.page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Card>
  )
}

export default EventOrganizersPage
