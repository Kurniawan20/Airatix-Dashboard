'use client'

// React Imports
import { useState, useEffect } from 'react'
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

// Component Imports
import UserProfile from '@views/pages/user-profile'

// Type Imports
import type { Data } from '@/types/pages/profileTypes'
import type { UserProfileResponse } from '@/types/user'

// API Imports
import { getUserProfileApi } from '@/utils/apiConfig'

const ProfileTab = dynamic(() => import('@views/pages/user-profile/profile'))

// Vars
const tabContentList = (data?: Data): { [key: string]: ReactElement } => ({
  profile: <ProfileTab data={data?.users.profile} />
})

const UserProfilePage = () => {
  // States
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<Data | null>(null)

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await getUserProfileApi()

      if (!response.success) {
        setError(response.error || 'Failed to fetch user profile')
        setLoading(false)

        return
      }

      const userData: UserProfileResponse = response.data

      // Transform API response to match the expected Data format
      const transformedData: Data = {
        profileHeader: {
          fullName: `${userData.firstName} ${userData.lastName}`,
          coverImg: '/images/pages/profile-banner.png',
          profileImg: '/images/avatars/1.png',
          designation: userData.role,
          designationIcon: 'ri-briefcase-line'
        },
        users: {
          profile: {
            about: [
              {
                icon: 'ri-user-3-line',
                property: 'full name',
                value: `${userData.firstName} ${userData.lastName}`
              },
              {
                icon: 'ri-mail-line',
                property: 'email',
                value: userData.email
              },
              {
                icon: 'ri-user-3-line',
                property: 'username',
                value: userData.username
              },
              {
                icon: 'ri-government-line',
                property: 'role',
                value: userData.role
              }
            ],
            contacts: [
              {
                icon: 'ri-mail-line',
                property: 'email',
                value: userData.email
              }
            ],
            teams: [],
            overview: [
              {
                icon: 'ri-user-3-line',
                property: 'user id',
                value: userData.id
              }
            ],
            teamsTech: [],
            connections: [],
            projectTable: []
          },
          teams: [],
          projects: [],
          connections: []
        }
      }

      setProfileData(transformedData)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError('An unexpected error occurred while fetching user profile')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserProfile()
  }, [])

  if (loading) {
    return (
      <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '70vh' }}>
        <CircularProgress />
      </Grid>
    )
  }

  if (error) {
    return (
      <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '70vh' }}>
        <Grid item xs={12} md={8} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Alert severity="error" sx={{ width: '100%' }}>
                  {error}
                </Alert>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Unable to load your profile information. This could be due to network issues or the server might be unavailable.
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<i className="ri-refresh-line" />}
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    fetchUserProfile();
                  }}
                >
                  Retry
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  if (!profileData) {
    return (
      <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '70vh' }}>
        <Grid item xs={12} md={8} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6">No profile data available</Typography>
                <Typography variant="body1">
                  We couldn&apos;t retrieve your profile information. Please try again.
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<i className="ri-refresh-line" />}
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    fetchUserProfile();
                  }}
                >
                  Retry
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  return (
    <UserProfile data={profileData} tabContentList={tabContentList(profileData)} />
  )
}

export default UserProfilePage
