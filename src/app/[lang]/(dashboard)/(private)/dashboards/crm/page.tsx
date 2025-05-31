// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'

// Server Action Imports
import { getServerSession } from 'next-auth'

// Component Imports
import TotalRevenueWrapper from '@views/dashboards/crm/TotalRevenueWrapper'
import TotalOrganizersWrapper from '@views/dashboards/crm/TotalOrganizersWrapper'
import TotalEventsWrapper from '@views/dashboards/crm/TotalEventsWrapper'
import TotalFeeWrapper from '@views/dashboards/crm/TotalFeeWrapper'
import MonthlyRevenueChartWrapper from '@views/dashboards/crm/MonthlyRevenueChartWrapper'
import QuickLinks from '@views/dashboards/crm/QuickLinks'

const DashboardCRM = async () => {
  // Get the user session
  const session = await getServerSession()

  // Get the user's name or username
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'User'

  // Check if user is an event organizer or admin
  const organizerId = session?.user?.organizerId
  const isAdmin = !organizerId || organizerId === 0 || organizerId === '0'

  return (
    <Grid container spacing={6}>
      {/* Stats Cards Row - Horizontal Layout */}
      <Grid item xs={12}>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={6} md={isAdmin ? 3 : 4}>
            <TotalRevenueWrapper />
          </Grid>
          {isAdmin && (
            <Grid item xs={12} sm={6} md={3}>
              <TotalOrganizersWrapper />
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={isAdmin ? 3 : 4}>
            <TotalEventsWrapper />
          </Grid>
          <Grid item xs={12} sm={6} md={isAdmin ? 3 : 4}>
            <TotalFeeWrapper />
          </Grid>
        </Grid>
      </Grid>

      {/* Monthly Revenue Chart */}
      <Grid item xs={12}>
        <MonthlyRevenueChartWrapper />
      </Grid>

      {/* Welcome Card and Quick Links */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Box sx={{ mb: 4 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  margin: '0 auto',
                  backgroundColor: 'primary.main',
                  fontSize: '2.5rem'
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </Avatar>
            </Box>
            <Typography variant='h1' sx={{ mb: 4, fontWeight: 500 }}>
              Welcome
            </Typography>
            <Typography variant='h3' color='primary' sx={{ mb: 6 }}>
              {userName}
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Manage your event organizers and participants from this dashboard
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      {/* QuickLinks component has been removed as per requirements */}
    </Grid>
  )
}

export default DashboardCRM
