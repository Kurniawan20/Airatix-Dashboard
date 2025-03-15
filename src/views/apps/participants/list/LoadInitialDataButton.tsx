'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'

// Services Import
import { loadParticipantsFromCSV } from '@/services/participantService'

interface LoadInitialDataButtonProps {
  onDataLoaded: () => void
  csvFilePath: string
}

const LoadInitialDataButton = ({ onDataLoaded, csvFilePath }: LoadInitialDataButtonProps) => {
  // States
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleLoadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch the CSV file
      const response = await fetch(csvFilePath)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV file: ${response.statusText}`)
      }
      
      const csvContent = await response.text()
      
      // Load participants from CSV
      const participants = loadParticipantsFromCSV(csvContent)
      
      if (participants.length === 0) {
        setError('No valid data found in the CSV file')
      } else {
        setSuccess(true)
        onDataLoaded()
      }
    } catch (err) {
      console.error('Error loading CSV data:', err)
      setError('Failed to load CSV data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSnackbar = () => {
    setSuccess(false)
  }

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleLoadData}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : <i className="ri-file-list-3-line" />}
      >
        {loading ? 'Loading...' : 'Load Sample Data'}
      </Button>
      
      <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Participant data loaded successfully!
        </Alert>
      </Snackbar>
      
      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}
    </>
  )
}

export default LoadInitialDataButton
