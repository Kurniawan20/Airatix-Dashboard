'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import { TableRow, TableCell } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import FormHelperText from '@mui/material/FormHelperText'
import FormControlLabel from '@mui/material/FormControlLabel'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'
import { toast } from 'react-toastify'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { User } from '@/types/user'
import type { Locale } from '@configs/i18n'

// Component Imports
import TableFilters from './TableFilters'
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'
import { deleteUserApi, updateUserApi } from '@/utils/apiConfig'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

// Extending User type to include action property
interface UsersTypeWithAction extends User {
  action?: string
}

type UserRoleType = {
  [key: string]: { icon: string; color: string }
}

type UserStatusType = {
  [key: string]: ThemeColor
}

// Styled Components
const Icon = styled('i')({})

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

// Vars
const userRoleObj: UserRoleType = {
  admin: { icon: 'ri-vip-crown-line', color: 'error' },
  author: { icon: 'ri-computer-line', color: 'warning' },
  editor: { icon: 'ri-edit-box-line', color: 'info' },
  maintainer: { icon: 'ri-pie-chart-2-line', color: 'success' },
  subscriber: { icon: 'ri-user-3-line', color: 'primary' }
}

const userStatusObj: UserStatusType = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}

// Define getAvatar function before using it in column definitions
const getAvatar = (params: Pick<User, 'avatar' | 'firstName' | 'lastName'>) => {
  const { avatar, firstName, lastName } = params

  if (avatar) {
    return <CustomAvatar src={avatar} skin='light' size={34} />
  } else {
    return (
      <CustomAvatar skin='light' size={34}>
        {getInitials(`${firstName} ${lastName}`)}
      </CustomAvatar>
    )
  }
}

const UserListTable = ({ tableData }: { tableData?: User[] }) => {
  // States
  const [data, setData] = useState<User[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [filteredData, setFilteredData] = useState<User[]>([])
  const [rowSelection, setRowSelection] = useState({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Edit user states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    isActive: true
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Set data when tableData changes
  useEffect(() => {
    if (tableData && tableData.length > 0) {
      setData(tableData)
      setFilteredData(tableData)
    }
    setIsLoading(false)
  }, [tableData])

  // Update filteredData when globalFilter or data changes
  useEffect(() => {
    let newFilteredData = [...data]
    
    if (globalFilter) {
      newFilteredData = newFilteredData.filter(item => {
        return (
          item.username?.toLowerCase().includes(globalFilter.toLowerCase()) ||
          item.email?.toLowerCase().includes(globalFilter.toLowerCase()) ||
          item.firstName?.toLowerCase().includes(globalFilter.toLowerCase()) ||
          item.lastName?.toLowerCase().includes(globalFilter.toLowerCase()) ||
          item.role?.toLowerCase().includes(globalFilter.toLowerCase())
        )
      })
    }
    
    setFilteredData(newFilteredData)
  }, [globalFilter, data])

  // Hooks
  const { lang: locale } = useParams()

  // Handle opening delete dialog
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
    setDeleteError(null)
  }

  // Handle closing delete dialog
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false)
    setUserToDelete(null)
    setDeleteError(null)
  }

  // Handle confirming user deletion
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const response = await deleteUserApi(userToDelete.id)
      
      if (response.success) {
        // Remove the deleted user from the data
        const updatedData = data.filter(user => user.id !== userToDelete.id)
        setData(updatedData)
        setFilteredData(updatedData)
        setDeleteDialogOpen(false)
        setUserToDelete(null)
        
        // Show success toast notification
        toast.success(`User ${userToDelete.username} has been deleted successfully`, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        })
      } else {
        // Handle error
        setDeleteError(response.error || 'Failed to delete user')
        
        // Show error toast notification
        toast.error(response.error || 'Failed to delete user', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        })
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setDeleteError('An unexpected error occurred')
      
      // Show error toast notification
      toast.error('An unexpected error occurred while deleting the user', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle opening edit dialog
  const handleEditClick = (user: User) => {
    setUserToEdit(user)
    setEditFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '', // Empty password field by default
      role: user.role || '',
      isActive: user.active || false
    })
    setEditDialogOpen(true)
    setUpdateError(null)
    setValidationErrors({})
  }

  // Handle closing edit dialog
  const handleEditDialogClose = () => {
    setEditDialogOpen(false)
    setUserToEdit(null)
    setUpdateError(null)
    setValidationErrors({})
  }

  // Handle form input changes
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setEditFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setEditFormData(prev => ({ ...prev, [name]: value }))
    }
    
    // Clear validation error for this field when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Validate form data
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (editFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (editFormData.password && editFormData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle confirming user update
  const handleEditConfirm = async () => {
    if (!userToEdit) return
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    setIsUpdating(true)
    setUpdateError(null)
    
    // Create update data object, only including fields that have values
    const updateData: Partial<User> = {}
    
    if (editFormData.firstName) updateData.firstName = editFormData.firstName
    if (editFormData.lastName) updateData.lastName = editFormData.lastName
    if (editFormData.email) updateData.email = editFormData.email
    if (editFormData.password) updateData.password = editFormData.password
    if (editFormData.role) updateData.role = editFormData.role as UserRole
    
    // Always include isActive in the update data
    updateData.active = editFormData.isActive
    
    try {
      const response = await updateUserApi(userToEdit.id, updateData)
      
      if (response.success && response.data) {
        // Update the user in the data array
        const updatedData = data.map(user => 
          user.id === userToEdit.id ? { ...user, ...response.data } : user
        )
        
        setData(updatedData)
        setFilteredData(updatedData)
        setEditDialogOpen(false)
        setUserToEdit(null)
        
        // Show success toast notification
        toast.success(`User ${userToEdit.username} has been updated successfully`, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        })
      } else {
        // Handle error
        setUpdateError(response.error || 'Failed to update user')
        
        // If there are validation errors from the server
        if (response.validationErrors) {
          setValidationErrors(response.validationErrors)
        }
        
        // Show error toast notification
        toast.error(response.error || 'Failed to update user', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        })
      }
    } catch (error) {
      console.error('Error updating user:', error)
      setUpdateError('An unexpected error occurred')
      
      // Show error toast notification
      toast.error('An unexpected error occurred while updating the user', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Define columns after the handler functions are defined
  const columnHelper = createColumnHelper<User>()
  const columns = [
    columnHelper.accessor('id', {
      header: ({ table }) => (
        <Checkbox
          {...{
            checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            onChange: table.getToggleAllRowsSelectedHandler()
          }}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          {...{
            checked: row.getIsSelected(),
            disabled: !row.getCanSelect(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler()
          }}
        />
      ),
      footer: 'ID'
    }),
    columnHelper.accessor('username', {
      header: 'Username',
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          {getAvatar({ avatar: row.original.avatar, firstName: row.original.firstName, lastName: row.original.lastName })}
          <div className='flex flex-col'>
            <Typography className='font-medium' color='text.primary'>
              {row.original.username}
            </Typography>
            <Typography variant='body2'>{row.original.email}</Typography>
          </div>
        </div>
      ),
      footer: 'Username'
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: ({ row }) => (
        <Typography
          className={classnames({
            'text-primary-500': row.original.role === 'ADMIN',
            'text-success-500': row.original.role === 'USER',
            'text-warning-500': row.original.role === 'MANAGER'
          })}
        >
          {row.original.role}
        </Typography>
      ),
      footer: 'Role'
    }),
    columnHelper.accessor(row => `${row.firstName} ${row.lastName}`, {
      id: 'fullName',
      header: 'Name',
      cell: ({ row }) => (
        <Typography>{`${row.original.firstName} ${row.original.lastName}`}</Typography>
      ),
      footer: 'Name'
    }),
    columnHelper.accessor('active', {
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.active ? 'Active' : 'Inactive'
        const color: ThemeColor = row.original.active ? 'success' : 'secondary'

        return (
          <Chip
            variant='tonal'
            label={status}
            color={color}
            size='small'
            className={classnames('rounded-full text-xs', {
              'bg-success-100 text-success-500': status === 'Active',
              'bg-secondary-100 text-secondary-500': status === 'Inactive'
            })}
          />
        )
      },
      footer: 'Status'
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created Date',
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt)
        return <Typography>{date.toLocaleDateString()}</Typography>
      },
      footer: 'Created Date'
    }),
    columnHelper.accessor('action', {
      header: 'Actions',
      cell: ({ row }) => (
        <div className='flex items-center'>
          <IconButton onClick={() => handleEditClick(row.original)}>
            <i className='ri-edit-line text-textSecondary' />
          </IconButton>
          <IconButton 
            onClick={() => handleDeleteClick(row.original)}
            color="error"
            className="hover:bg-error-100 dark:hover:bg-error-900/20"
          >
            <i className='ri-delete-bin-7-line text-error-500' />
          </IconButton>
          <OptionMenu
            iconButtonProps={{ size: 'small' }}
            options={[
              {
                text: 'View',
                icon: 'ri-eye-line',
                menuItemProps: { className: 'text-textPrimary' }
              },
              {
                text: 'Suspend',
                icon: 'ri-hand-line',
                menuItemProps: { className: 'text-warning-500' }
              }
            ]}
          />
        </div>
      ),
      footer: 'Actions'
    })
  ]

  // Hooks
  const table = useReactTable({
    data: filteredData as User[] || [],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      globalFilter,
      rowSelection
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <>
      <Card>
        <CardHeader title='Filters' className='pbe-4' />
        <TableFilters setData={setFilteredData} tableData={data} />
        <Divider />
        <div className='flex justify-between gap-4 p-5 flex-col items-start sm:flex-row sm:items-center'>
          <div className='flex gap-2'>
            <Button
              color='secondary'
              variant='outlined'
              startIcon={<i className='ri-upload-2-line' />}
              className='max-sm:is-full'
            >
              Export
            </Button>
            <Link href={getLocalizedUrl('/user/register', locale as Locale)}>
              <Button
                color='primary'
                variant='contained'
                startIcon={<i className='ri-user-add-line' />}
                className='max-sm:is-full'
              >
                Register User
              </Button>
            </Link>
          </div>
          <div className='flex items-center gap-x-4 max-sm:gap-y-4 flex-col max-sm:is-full sm:flex-row'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search User'
              className='max-sm:is-full'
            />
          </div>
        </div>
        <div className='overflow-x-auto'>
          {isLoading ? (
            <div className='flex justify-center items-center h-64'>
              <CircularProgress />
            </div>
          ) : (
            <table className={tableStyles.table}>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id}>
                        {header.isPlaceholder ? null : (
                          <>
                            <div
                              className={classnames({
                                'flex items-center': header.column.getIsSorted(),
                                'cursor-pointer select-none': header.column.getCanSort()
                              })}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {{
                                asc: <i className='ri-arrow-up-s-line text-xl' />,
                                desc: <i className='ri-arrow-down-s-line text-xl' />
                              }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                            </div>
                          </>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              {table.getFilteredRowModel().rows.length === 0 ? (
                <tbody>
                  <TableRow>
                    <TableCell colSpan={columns.length} className='text-center'>
                      No users found
                    </TableCell>
                  </TableRow>
                </tbody>
              ) : (
                <tbody>
                  {table
                    .getRowModel()
                    .rows.slice(0, table.getState().pagination.pageSize)
                    .map(row => {
                      return (
                        <TableRow key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                          {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                          ))}
                        </TableRow>
                      )
                    })}
                </tbody>
              )}
            </table>
          )}
        </div>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component='div'
          className='border-bs'
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          SelectProps={{
            inputProps: { 'aria-label': 'rows per page' }
          }}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
          onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
        />
      </Card>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Are you sure you want to delete this user?
            {userToDelete && (
              <div className='mt-4'>
                <Typography variant='body1' className='font-medium'>
                  User: {userToDelete.firstName} {userToDelete.lastName} ({userToDelete.username})
                </Typography>
                <Typography variant='body2' className='text-textSecondary'>
                  Email: {userToDelete.email}
                </Typography>
                <Typography variant='body2' className='text-textSecondary'>
                  Role: {userToDelete.role}
                </Typography>
              </div>
            )}
            {deleteError && (
              <Typography variant='body2' className='mt-4 text-error-500'>
                Error: {deleteError}
              </Typography>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color='primary'>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            disabled={isDeleting}
            color='error'
            variant='contained'
            startIcon={isDeleting ? <CircularProgress size={20} color='inherit' /> : <i className='ri-delete-bin-7-line' />}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        aria-labelledby='edit-dialog-title'
        aria-describedby='edit-dialog-description'
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle id='edit-dialog-title'>
          Edit User
          {userToEdit && (
            <Typography variant='subtitle1' color='text.secondary'>
              {userToEdit.username}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {updateError && (
            <Typography variant='body2' className='mb-4 text-error-500'>
              Error: {updateError}
            </Typography>
          )}
          <form className='mt-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <TextField
                fullWidth
                label='First Name'
                name='firstName'
                value={editFormData.firstName}
                onChange={handleEditFormChange}
                error={!!validationErrors.firstName}
                helperText={validationErrors.firstName}
                variant='outlined'
                margin='normal'
              />
              <TextField
                fullWidth
                label='Last Name'
                name='lastName'
                value={editFormData.lastName}
                onChange={handleEditFormChange}
                error={!!validationErrors.lastName}
                helperText={validationErrors.lastName}
                variant='outlined'
                margin='normal'
              />
              <TextField
                fullWidth
                label='Email'
                name='email'
                value={editFormData.email}
                onChange={handleEditFormChange}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                variant='outlined'
                margin='normal'
              />
              <TextField
                fullWidth
                label='Password'
                name='password'
                type='password'
                value={editFormData.password}
                onChange={handleEditFormChange}
                error={!!validationErrors.password}
                helperText={validationErrors.password || 'Leave blank to keep current password'}
                variant='outlined'
                margin='normal'
              />
              <FormControl fullWidth margin='normal' error={!!validationErrors.role}>
                <InputLabel id='role-label'>Role</InputLabel>
                <Select
                  labelId='role-label'
                  label='Role'
                  name='role'
                  value={editFormData.role}
                  onChange={handleEditFormChange}
                >
                  <MenuItem value='ADMIN'>Admin</MenuItem>
                  <MenuItem value='USER'>User</MenuItem>
                  <MenuItem value='MANAGER'>Manager</MenuItem>
                </Select>
                {validationErrors.role && (
                  <FormHelperText>{validationErrors.role}</FormHelperText>
                )}
              </FormControl>
              <FormControl fullWidth margin='normal'>
                <FormControlLabel
                  control={
                    <Checkbox
                      name='isActive'
                      checked={editFormData.isActive}
                      onChange={handleEditFormChange}
                    />
                  }
                  label='Active'
                />
              </FormControl>
            </div>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose} color='primary'>Cancel</Button>
          <Button 
            onClick={handleEditConfirm} 
            disabled={isUpdating}
            color='primary'
            variant='contained'
            startIcon={isUpdating ? <CircularProgress size={20} color='inherit' /> : <i className='ri-save-line' />}
          >
            {isUpdating ? 'Updating...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default UserListTable
