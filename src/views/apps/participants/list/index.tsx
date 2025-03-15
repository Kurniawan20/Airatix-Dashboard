'use client'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'

// Next Imports
import Link from 'next/link'

// Component Imports
import ParticipantListTable from './ParticipantListTable'

// Hardcoded Data Import
import { participantsData } from '@/data/participantsData'

const ParticipantList = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title='Participants' 
            action={
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant='contained' 
                  component={Link} 
                  href='/participants/register'
                  startIcon={<i className='ri-user-add-line' />}
                >
                  Add Participant
                </Button>
              </Box>
            }
          />
          <CardContent>
            <ParticipantListTable participants={participantsData} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ParticipantList
