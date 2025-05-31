'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormHelperText from '@mui/material/FormHelperText'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, minLength, email, pipe, nonEmpty } from 'valibot'
import type { InferInput } from 'valibot'

// API Import
import { registerUserApi, getAllOrganizersApi } from '@/utils/apiConfig'

// Type Imports
import type { Organizer } from '@/types/organizer'

type FormData = InferInput<typeof schema>

// Form validation schema
const schema = object({
  username: pipe(string(), nonEmpty('Username is required')),
  email: pipe(string(), nonEmpty('Email is required'), email('Enter a valid email')),
  password: pipe(string(), nonEmpty('Password is required'), minLength(5, 'Password must be at least 5 characters long')),
  confirmPassword: pipe(string(), nonEmpty('Confirm password is required')),
  firstName: pipe(string(), nonEmpty('First name is required')),
  lastName: pipe(string(), nonEmpty('Last name is required')),
  organizerId: pipe(string(), nonEmpty('Organizer is required'))
})

const RegisterUserForm = () => {
  // States
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [organizers, setOrganizers] = useState<Organizer[]>([])
  const [loadingOrganizers, setLoadingOrganizers] = useState(false)
  const [organizerError, setOrganizerError] = useState<string | null>(null)

  // Hooks
  const router = useRouter()
  
  // Fetch organizers on component mount
  useEffect(() => {
    const fetchOrganizers = async () => {
      setLoadingOrganizers(true)
      setOrganizerError(null)
      
      try {
        const response = await getAllOrganizersApi()
        
        if (response.success) {
          setOrganizers(response.data)
        } else {
          setOrganizerError(response.error || 'Failed to fetch organizers')
        }
      } catch (error) {
        console.error('Error fetching organizers:', error)
        setOrganizerError('An unexpected error occurred')
      } finally {
        setLoadingOrganizers(false)
      }
    }
    
    fetchOrganizers()
  }, [])
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      organizerId: ''
    },
    resolver: valibotResolver(schema)
  })

  const onSubmit = async (data: FormData) => {
    // Check if passwords match
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match')
      return
    }


    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Omit confirmPassword before sending to API
      const { confirmPassword, ...userData } = data

      const response = await registerUserApi(userData)

      if (response.success) {
        setSuccess('User registered successfully')
        reset() // Reset form fields
      } else {
        setError(response.error || 'Registration failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Register error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Register New User' />
      <CardContent>
        {error && (
          <Alert severity='error' sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity='success' sx={{ mb: 4 }}>
            {success}
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='firstName'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='First Name'
                    error={Boolean(errors.firstName)}
                    helperText={errors.firstName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='lastName'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Last Name'
                    error={Boolean(errors.lastName)}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='username'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Username'
                    error={Boolean(errors.username)}
                    helperText={errors.username?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='email'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='email'
                    label='Email'
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='password'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='password'
                    label='Password'
                    error={Boolean(errors.password)}
                    helperText={errors.password?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='confirmPassword'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='password'
                    label='Confirm Password'
                    error={Boolean(errors.confirmPassword)}
                    helperText={errors.confirmPassword?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>              
              <Controller
                name='organizerId'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.organizerId)}>
                    <InputLabel id='organizer-label'>
                      Select Organizer
                    </InputLabel>
                    <Select
                      {...field}
                      labelId='organizer-label'
                      label='Select Organizer'
                      disabled={loadingOrganizers}
                    >
                      {loadingOrganizers ? [
                        <MenuItem key="loading" value='' disabled>
                          <CircularProgress size={20} /> Loading organizers...
                        </MenuItem>
                      ] : organizerError ? [
                        <MenuItem key="error" value='' disabled>
                          Error: {organizerError}
                        </MenuItem>
                      ] : organizers.length === 0 ? [
                        <MenuItem key="empty" value='' disabled>
                          No organizers available
                        </MenuItem>
                      ] : [
                        <MenuItem key="default" value=''>Select an organizer</MenuItem>,
                        <MenuItem key="non-eo" value="0">Not an Event Organizer</MenuItem>,
                        ...organizers.map(organizer => (
                          <MenuItem key={organizer.id} value={organizer.id.toString()}>
                            {organizer.name}
                          </MenuItem>
                        ))
                      ]}
                    </Select>
                    {errors.organizerId && (
                      <FormHelperText>{errors.organizerId.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} className='flex justify-between'>
              <Button variant='outlined' onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type='submit' variant='contained' disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Register User'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default RegisterUserForm
