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
  type ColumnFiltersState
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
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })

  // Hooks
  const router = useRouter()

  // Navigate to participant details
  const handleViewDetails = useCallback((id: string) => {
    router.push(`/participants/details/${id}`)
  }, [router])

  // Column Definitions
  const columnHelper = createColumnHelper<Participant>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('startNumber', {
        header: 'Start Number',
        cell: info => info.getValue() || '-'
      }),
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
      columnHelper.accessor('className', {
        header: 'Class',
        cell: info => info.getValue() || '-'
      }),
      columnHelper.accessor('vehicleBrand', {
        header: 'Vehicle Brand',
        cell: info => info.getValue() || '-'
      }),
      columnHelper.accessor('vehicleType', {
        header: 'Vehicle Type',
        cell: info => info.getValue() || '-'
      }),
      columnHelper.accessor('vehicleColor', {
        header: 'Color',
        cell: info => info.getValue() || '-'
      }),
      columnHelper.accessor('pos', {
        header: 'POS',
        cell: info => info.getValue() || '-'
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Tooltip title="View Details">
              <IconButton 
                color="primary" 
                onClick={() => handleViewDetails(row.original.id)}
                size="small"
              >
                <Typography sx={{ fontSize: '1.2rem' }}>👁️</Typography>
              </IconButton>
            </Tooltip>
          </Box>
        )
      })
    ],
    [columnHelper, handleViewDetails]
  )

  // Table Instance
  const table = useReactTable({
    data: participants,
    columns,
    state: {
      sorting,
      rowSelection,
      columnFilters,
      globalFilter,
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
    filterFns: {}
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
          sx={{ width: 300 }}
        />
        <Typography>
          {table.getFilteredRowModel().rows.length} participants found
        </Typography>
      </Box>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label='participant table'>
            <TableHead>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableCell 
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      sx={{
                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        fontWeight: 'bold',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && <i className='ri-arrow-up-s-line ml-1' />}
                        {header.column.getIsSorted() === 'desc' && <i className='ri-arrow-down-s-line ml-1' />}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map(row => (
                <TableRow 
                  key={row.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Box>
            <Typography variant='body2'>
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              of {table.getFilteredRowModel().rows.length} entries
            </Typography>
          </Box>
          <TablePagination
            component='div'
            count={table.getFilteredRowModel().rows.length}
            page={table.getState().pagination.pageIndex}
            rowsPerPage={table.getState().pagination.pageSize}
            rowsPerPageOptions={[10, 25, 50, 100]}
            onPageChange={(_, page) => table.setPageIndex(page)}
            onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
          />
        </Box>
      </Paper>
    </Box>
  )
}

export default ParticipantListTable
