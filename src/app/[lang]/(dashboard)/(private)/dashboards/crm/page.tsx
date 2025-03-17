// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

// Server Action Imports
import { getServerSession } from 'next-auth'

const DashboardCRM = async () => {
  // Get the user session
  const session = await getServerSession()

  // Get the user's name or username
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'User'

  return (
    <Grid container spacing={6} justifyContent='center' alignItems='center' sx={{ height: '70vh' }}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant='h1' sx={{ mb: 4, fontWeight: 500 }}>
              Welcome
            </Typography>
            <Typography variant='h3' color='primary' sx={{ mb: 6 }}>
              {userName}
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              {/* Thank you for using Airatix Dashboard */}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default DashboardCRM
