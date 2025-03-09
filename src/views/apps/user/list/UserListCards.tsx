'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'

// Type Imports
import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'
import type { User } from '@/types/user'

// Component Imports
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

// API Imports
import { getAllUsersApi } from '@/utils/apiConfig'

const UserListCards = () => {
  // States
  const [userStats, setUserStats] = useState<UserDataType[]>([
    {
      title: 'Total Users',
      stats: '0',
      avatarIcon: 'ri-group-line',
      avatarColor: 'primary',
      trend: 'positive',
      trendNumber: '0%',
      subtitle: 'All registered users'
    },
    {
      title: 'Admin Users',
      stats: '0',
      avatarIcon: 'ri-admin-line',
      avatarColor: 'error',
      trend: 'positive',
      trendNumber: '0%',
      subtitle: 'Users with admin role'
    },
    {
      title: 'Active Users',
      stats: '0',
      avatarIcon: 'ri-user-follow-line',
      avatarColor: 'success',
      trend: 'positive',
      trendNumber: '0%',
      subtitle: 'Users with active status'
    },
    {
      title: 'Inactive Users',
      stats: '0',
      avatarIcon: 'ri-user-unfollow-line',
      avatarColor: 'warning',
      trend: 'negative',
      trendNumber: '0%',
      subtitle: 'Users with inactive status'
    }
  ])

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await getAllUsersApi()
        console.log('User stats API response:', response);

        if (response.success && response.data) {
          const users = response.data as User[]
          const totalUsers = users.length
          const adminUsers = users.filter(user => user.role === 'ADMIN').length
          const activeUsers = users.filter(user => user.active).length
          const inactiveUsers = users.filter(user => !user.active).length

          // Calculate percentages
          const adminPercentage = totalUsers > 0 ? Math.round((adminUsers / totalUsers) * 100) : 0
          const activePercentage = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
          const inactivePercentage = totalUsers > 0 ? Math.round((inactiveUsers / totalUsers) * 100) : 0

          setUserStats([
            {
              title: 'Total Users',
              stats: totalUsers.toString(),
              avatarIcon: 'ri-group-line',
              avatarColor: 'primary',
              trend: 'positive',
              trendNumber: '100%',
              subtitle: 'All registered users'
            },
            {
              title: 'Admin Users',
              stats: adminUsers.toString(),
              avatarIcon: 'ri-admin-line',
              avatarColor: 'error',
              trend: adminPercentage > 0 ? 'positive' : 'negative',
              trendNumber: `${adminPercentage}%`,
              subtitle: 'Users with admin role'
            },
            {
              title: 'Active Users',
              stats: activeUsers.toString(),
              avatarIcon: 'ri-user-follow-line',
              avatarColor: 'success',
              trend: activePercentage > 0 ? 'positive' : 'negative',
              trendNumber: `${activePercentage}%`,
              subtitle: 'Users with active status'
            },
            {
              title: 'Inactive Users',
              stats: inactiveUsers.toString(),
              avatarIcon: 'ri-user-unfollow-line',
              avatarColor: 'warning',
              trend: inactivePercentage > 0 ? 'negative' : 'positive',
              trendNumber: `${inactivePercentage}%`,
              subtitle: 'Users with inactive status'
            }
          ])
        } else {
          console.error('Error fetching user stats:', response.error || 'Unknown error')
          
          // Keep the default stats but update the subtitle to show the error
          setUserStats(prev => prev.map(stat => ({
            ...stat,
            subtitle: response.error || 'Failed to fetch user data'
          })))
        }
      } catch (error) {
        console.error('Error fetching user stats:', error)
        
        // Keep the default stats but update the subtitle to show the error
        setUserStats(prev => prev.map(stat => ({
          ...stat,
          subtitle: 'Error loading user data'
        })))
      }
    }

    fetchUserStats()
  }, [])

  return (
    <Grid container spacing={6}>
      {userStats.map((item, index) => (
        <Grid item xs={12} sm={6} lg={3} key={index}>
          <HorizontalWithSubtitle data={item} />
        </Grid>
      ))}
    </Grid>
  )
}

export default UserListCards
