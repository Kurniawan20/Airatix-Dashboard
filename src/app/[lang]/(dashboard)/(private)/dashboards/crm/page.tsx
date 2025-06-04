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
import TotalTaxWrapper from '@views/dashboards/crm/TotalTaxWrapper'
import EventInfoSectionWrapper from '@views/dashboards/crm/EventInfoSectionWrapper'
import MonthlyRevenueChartWrapper from '@views/dashboards/crm/MonthlyRevenueChartWrapper'
import TopEventsChartWrapper from '@views/dashboards/crm/TopEventsChartWrapper'
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
          <Grid item xs={12} sm={6} md={3}>
            <TotalRevenueWrapper />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TotalTaxWrapper />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TotalEventsWrapper />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TotalFeeWrapper />
          </Grid>
          {isAdmin && (
            <Grid item xs={12} sm={6} md={3}>
              <TotalOrganizersWrapper />
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* Event Info Section */}
      <Grid item xs={12}>
        <Card sx={{ p: 4 }}>
          <EventInfoSectionWrapper />
        </Card>
      </Grid>

      {/* Charts Row */}
      <Grid item xs={12}>
        <Grid container spacing={6}>
          {/* Monthly Revenue Chart */}
          <Grid item xs={12} md={6}>
            <MonthlyRevenueChartWrapper />
          </Grid>
          {/* Top Events Chart */}
          <Grid item xs={12} md={6}>
            <TopEventsChartWrapper />
          </Grid>
        </Grid>
      </Grid>

      {/* Welcome Card has been hidden as per requirements */}
    </Grid>
  )
}

export default DashboardCRM
