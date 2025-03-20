'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import ParticipantListTable from './ParticipantListTable'

// Type Imports
import type { Participant } from '@/types/participant'

// API Imports
import { getAllParticipantsApi } from '@/utils/apiConfig'

const ParticipantList = () => {
  // States
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchParticipants = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await getAllParticipantsApi()

        if (response.success && response.data) {
          setParticipants(Array.isArray(response.data) ? response.data : [response.data])
        } else {
          setError(response.error || 'Failed to fetch participants')
        }
      } catch (err) {
        console.error('Error fetching participants:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchParticipants()
  }, [])

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
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <ParticipantListTable participants={participants} />
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ParticipantList
