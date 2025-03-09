'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Type Imports
import type { User } from '@/types/user'

// Component Imports
import UserListTable from './UserListTable'
import UserListCards from './UserListCards'

// API Imports
import { getAllUsersApi } from '@/utils/apiConfig'

const UserList = () => {
  // States
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await getAllUsersApi()

        if (response.success && response.data) {
          setUsers(response.data)
        } else {
          setError(response.error || 'Failed to fetch users')
        }
      } catch (err) {
        console.error('Error fetching users:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <UserListCards />
      </Grid>
      <Grid item xs={12}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <UserListTable tableData={users} />
        )}
      </Grid>
    </Grid>
  )
}

export default UserList
