'use client'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success'
      case 'Rejected':
        return 'error'
      default:
        return 'warning'
    }
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
        
        <Typography variant='body2' sx={{ mb: 4 }}>
          {participant.team}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
          <Chip 
            label={participant.status} 
            color={getStatusColor(participant.status) as 'success' | 'error' | 'warning'}
            sx={{ mr: 2 }}
          />
          <Chip 
            label={participant.className} 
            color='primary'
          />
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mx: 2, mb: 2 }}>
            <i className='ri-map-pin-line' style={{ marginRight: '8px' }} />
            <Typography variant='body2'>{participant.city}, {participant.province}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mx: 2, mb: 2 }}>
            <i className='ri-phone-line' style={{ marginRight: '8px' }} />
            <Typography variant='body2'>{participant.phoneNumber}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mx: 2, mb: 2 }}>
            <i className='ri-calendar-line' style={{ marginRight: '8px' }} />
            <Typography variant='body2'>
              {new Date(participant.registrationDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default ParticipantDetailHeader
