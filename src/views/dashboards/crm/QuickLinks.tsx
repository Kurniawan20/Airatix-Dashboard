'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

const QuickLinks = () => {
  return (
    <Card>
      <CardContent sx={{ p: theme => `${theme.spacing(5)} !important` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant='h5'>Quick Links</Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'info.light',
              color: 'white'
            }}
          >
            <i className='ri-links-line' style={{ fontSize: '1.5rem' }}></i>
          </Box>
        </Box>
        <Box sx={{ '& > a': { display: 'block', mb: 2, color: 'primary.main', textDecoration: 'none' } }}>
          <a href='/en/event-organizers'>
            <i className='ri-user-settings-line' style={{ marginRight: '8px' }}></i>
            Manage Event Organizers
          </a>
          <a href='/en/participants'>
            <i className='ri-team-line' style={{ marginRight: '8px' }}></i>
            Manage Participants
          </a>
          <a href='/en/event-transactions'>
            <i className='ri-exchange-dollar-line' style={{ marginRight: '8px' }}></i>
            View Transactions
          </a>
          <a href='/en/user/list'>
            <i className='ri-user-line' style={{ marginRight: '8px' }}></i>
            Manage Users
          </a>
        </Box>
      </CardContent>
    </Card>
  )
}

export default QuickLinks
