'use client'

// React Imports
import { useState, useMemo, useCallback } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'

// Third Party Imports
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type ColumnFiltersState,
  type FilterFn
} from '@tanstack/react-table'

// Types Import
import type { Participant } from '@/types/participant'

interface ParticipantListTableProps {
  participants: Participant[]
}

const ParticipantListTable = ({ participants }: ParticipantListTableProps) => {
  // States
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })

  // Hooks
  const router = useRouter()

  // Navigate to participant details
  const handleViewDetails = useCallback(
    (id: number) => {
      router.push(`/en/participants/details/${id}`)
    },
    [router]
  )

  // Helper function to get the first detail from the details array
  const getFirstDetail = useCallback((participant: Participant) => {
    return participant.details && participant.details.length > 0 ? participant.details[0] : null
  }, [])

  // Column Definitions
  const columnHelper = createColumnHelper<Participant>()

  const columns = useMemo(
    () => [
      columnHelper.accessor(
        row => {
          const detail = getFirstDetail(row)

          return detail ? detail.startNumber : '-'
        },
        {
          id: 'startNumber',
          header: 'Start Number',
          cell: info => info.getValue() || '-'
        }
      ),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: info => info.getValue() || '-'
      }),
      columnHelper.accessor('nik', {
        header: 'NIK',
        cell: info => info.getValue() || '-'
      }),
      columnHelper.accessor('city', {
        header: 'City',
        cell: info => info.getValue() || '-'
      }),
      columnHelper.accessor('province', {
        header: 'Province',
        cell: info => info.getValue() || '-'
      }),
      columnHelper.accessor('team', {
        header: 'Team',
        cell: info => info.getValue() || '-'
      }),
      columnHelper.accessor(
        row => {
          const detail = getFirstDetail(row)

          return detail ? detail.categoryClass : '-'
        },
        {
          id: 'categoryClass',
          header: 'Category',
          cell: info => info.getValue() || '-'
        }
      ),
      columnHelper.accessor(
        row => {
          const detail = getFirstDetail(row)

          return detail ? detail.className : '-'
        },
        {
          id: 'className',
          header: 'Class',
          cell: info => info.getValue() || '-'
        }
      ),
      columnHelper.accessor(
        row => {
          const detail = getFirstDetail(row)

          return detail ? detail.vehicleBrand : '-'
        },
        {
          id: 'vehicleBrand',
          header: 'Vehicle Brand',
          cell: info => info.getValue() || '-'
        }
      ),
      columnHelper.accessor(
        row => {
          const detail = getFirstDetail(row)

          return detail ? detail.vehicleType : '-'
        },
        {
          id: 'vehicleType',
          header: 'Vehicle Type',
          cell: info => info.getValue() || '-'
        }
      ),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: info => {
          const status = info.getValue()
          let color = 'primary'

          if (status === 'Approved') color = 'success'
          if (status === 'Rejected') color = 'error'

          return (
            <Box
              sx={{
                display: 'inline-block',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                backgroundColor: theme => theme.palette[color as 'primary' | 'success' | 'error'].main + '20',
                color: theme => theme.palette[color as 'primary' | 'success' | 'error'].main
              }}
            >
              {status}
            </Box>
          )
        }
      }),
      columnHelper.accessor('registrationDate', {
        header: 'Registration Date',
        cell: info => {
          const date = info.getValue()

          if (!date) return '-'

          return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        }
      }),
      columnHelper.accessor('orderId', {
        header: 'Order ID',
        cell: info => info.getValue() || '-'
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: info => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Tooltip title='View Details'>
              <IconButton
                size='small'
                onClick={() => handleViewDetails(info.row.original.id)}
                sx={{ color: 'primary.main' }}
              >
                <i className='ri-eye-line' />
              </IconButton>
            </Tooltip>
          </Box>
        )
      })
    ],
    [handleViewDetails, columnHelper, getFirstDetail]
  )

  // Create the table instance
  const table = useReactTable({
    data: participants,
    columns,
    state: {
      sorting,
      rowSelection,
      globalFilter,
      columnFilters,
      pagination
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: {
      fuzzy: () => true
    } as Record<'fuzzy', FilterFn<any>>
  })

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <TextField
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder='Search participants...'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <i className='ri-search-line' />
              </InputAdornment>
            )
          }}
          size='small'
        />
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden', mb: 4 }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableCell
                      key={header.id}
                      colSpan={header.colSpan}
                      sx={{
                        fontWeight: 'bold',
                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        userSelect: 'none',
                        backgroundColor: 'background.paper'
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() ? (
                          header.column.getIsSorted() === 'asc' ? (
                            <i className='ri-sort-asc' style={{ marginLeft: '4px' }} />
                          ) : (
                            <i className='ri-sort-desc' style={{ marginLeft: '4px' }} />
                          )
                        ) : null}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id} hover>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} sx={{ textAlign: 'center' }}>
                    <Typography variant='body1'>No participants found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component='div'
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
          onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
        />
      </Paper>
    </Box>
  )
}

export default ParticipantListTable
