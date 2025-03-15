'use client'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'

// Type Imports
import type { Participant } from '@/types/participant'

interface ParticipantDetailHeaderProps {
  participant: Participant
}

const ParticipantDetailHeader = ({ participant }: ParticipantDetailHeaderProps) => {
  // Get first letter of name for avatar
  const getInitials = (name: string) => {
    const nameParts = name.split(' ')
    
    return nameParts.length > 1
      ? `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`
      : nameParts[0].charAt(0)
  }

  // Get random color based on name
  const getAvatarColor = (name: string) => {
    const colors = ['primary', 'secondary', 'success', 'error', 'warning', 'info']
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    return colors[hash % colors.length] as 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
  }

  return (
    <Card>
      <CardContent sx={{ pt: 15, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <Avatar
          sx={{
            width: 120,
            height: 120,
            backgroundColor: `${getAvatarColor(participant.name)}.main`,
            mb: 4,
            fontSize: '3rem'
          }}
        >
          {getInitials(participant.name)}
        </Avatar>
        
        <Typography variant='h5' sx={{ mb: 2 }}>
          {participant.name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Chip 
            label={`#${participant.startNumber}`} 
            color='primary' 
            sx={{ mr: 2, fontWeight: 600 }} 
          />
          <Chip 
            label={participant.className} 
            color='secondary'
            sx={{ fontWeight: 500 }} 
          />
        </Box>
        
        <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <Typography sx={{ mr: 1, color: 'text.secondary' }}>📍</Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              {participant.city}, {participant.province}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <Typography sx={{ mr: 1, color: 'text.secondary' }}>👥</Typography>
            <Typography sx={{ color: 'text.secondary' }}>{participant.team}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ mr: 1, color: 'text.secondary' }}>📱</Typography>
            <Typography sx={{ color: 'text.secondary' }}>{participant.phoneNumber}</Typography>
          </Box>
        </Box>
        
        <Grid container spacing={4} sx={{ textAlign: 'center' }}>
          <Grid item xs={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              <Typography variant='h5'>{participant.vehicleBrand}</Typography>
              <Typography sx={{ color: 'text.secondary' }}>Brand</Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              <Typography variant='h5'>{participant.vehicleType}</Typography>
              <Typography sx={{ color: 'text.secondary' }}>Type</Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              <Typography variant='h5'>{participant.vehicleColor}</Typography>
              <Typography sx={{ color: 'text.secondary' }}>Color</Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ParticipantDetailHeader
