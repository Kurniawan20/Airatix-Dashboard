'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Services Import
import { loadParticipantsFromCSV } from '@/services/participantService'

interface ImportCSVButtonProps {
  onImportSuccess: () => void
}

const ImportCSVButton = ({ onImportSuccess }: ImportCSVButtonProps) => {
  // States
  const [open, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    setFile(null)
    setError(null)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file')
        setFile(null)
      } else {
        setFile(selectedFile)
        setError(null)
      }
    }
  }

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const content = await file.text()
      const participants = loadParticipantsFromCSV(content)
      
      if (participants.length === 0) {
        setError('No valid data found in the CSV file')
      } else {
        handleClose()
        onImportSuccess()
      }
    } catch (err) {
      console.error('Error importing CSV:', err)
      setError('Failed to import CSV. Please check the file format.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant='contained' color='primary' onClick={handleOpen} startIcon={<i className='ri-upload-2-line' />}>
        Import CSV
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>Import Participants from CSV</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity='error' sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          <Typography variant='body1' gutterBottom>
            Select a CSV file to import participants data. The CSV should have the following headers:
          </Typography>
          <Typography variant='body2' component='pre' sx={{ backgroundColor: 'action.hover', p: 2, borderRadius: 1, overflowX: 'auto' }}>
            POS,NOMOR_START,NAME,NIK,KOTA,PROVINSI,TEAM,NAMA_CLASS,MERK_KENDARAAN,TYPE,WARNA,NO RANGKA,NO MESIN
          </Typography>
          <Box sx={{ mt: 3 }}>
            <input
              accept='.csv'
              style={{ display: 'none' }}
              id='raised-button-file'
              type='file'
              onChange={handleFileChange}
            />
            <label htmlFor='raised-button-file'>
              <Button variant='outlined' component='span'>
                Select CSV File
              </Button>
            </label>
            {file && (
              <Typography variant='body2' sx={{ mt: 1 }}>
                Selected file: {file.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            variant='contained' 
            color='primary' 
            disabled={!file || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ImportCSVButton
