'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import FormHelperText from '@mui/material/FormHelperText'

// Types
import type { EventOrganizerRegistration, ValidationErrors } from '@/types/event-organizers'

interface PageProps {
  searchParams: { email?: string }
}

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Jakarta', label: 'Asia/Jakarta (UTC+7)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (UTC+9)' },
]

const CURRENCY_OPTIONS = [
  { value: 'IDR', label: 'Indonesian Rupiah (IDR)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'SGD', label: 'Singapore Dollar (SGD)' },
]

const LOCALE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Indonesian' },
]

const generatePassword = () => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'
  
  // Ensure at least one of each character type
  let password = 
    lowercase.charAt(Math.floor(Math.random() * lowercase.length)) +
    uppercase.charAt(Math.floor(Math.random() * uppercase.length)) +
    numbers.charAt(Math.floor(Math.random() * numbers.length)) +
    symbols.charAt(Math.floor(Math.random() * symbols.length))
  
  // Add more random characters to reach desired length
  const allChars = lowercase + uppercase + numbers + symbols
  for (let i = 0; i < 8; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length))
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

const RegisterEventOrganizerPage = ({ searchParams }: PageProps) => {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [formData, setFormData] = useState<EventOrganizerRegistration>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    timezone: 'Asia/Jakarta',
    currency_code: 'IDR',
    locale: 'en'
  })

  // Get the current language from the URL
  const lang = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'en' : 'en'

  // Redirect if no email is provided
  useEffect(() => {
    if (!searchParams.email) {
      router.push(`/${lang}/event-organizers`)
    } else {
      setFormData(prev => ({
        ...prev,
        email: searchParams.email || ''
      }))
    }
  }, [searchParams.email, router, lang])

  const handleChange = (field: keyof EventOrganizerRegistration) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    // Clear validation error when field changes
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleGeneratePassword = () => {
    const newPassword = generatePassword()
    setFormData(prev => ({
      ...prev,
      password: newPassword,
      password_confirmation: newPassword
    }))
    // Show the password when generated
    setShowPassword(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setValidationErrors({})
    
    try {
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/${lang}/event-organizers`)
      } else if (response.status === 422) {
        setValidationErrors(data.errors || {})
      } else if (response.status === 403) {
        setError('Account registration is currently disabled. Please try again later.')
      } else {
        setError(data.message || 'An error occurred during registration')
      }
    } catch (error) {
      setError('Network error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // If no email is provided, show nothing while redirecting
  if (!searchParams.email) {
    return null
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader 
          title="Register Event Organizer" 
          action={
            <Button 
              startIcon={<i className="ri-arrow-left-line" />}
              onClick={() => router.push(`/${lang}/event-organizers`)}
            >
              Back
            </Button>
          }
        />
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.first_name}
                onChange={handleChange('first_name')}
                error={!!validationErrors.first_name}
                helperText={validationErrors.first_name?.[0]}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.last_name}
                onChange={handleChange('last_name')}
                error={!!validationErrors.last_name}
                helperText={validationErrors.last_name?.[0]}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                InputProps={{
                  readOnly: true,
                  sx: { bgcolor: 'action.hover' }
                }}
                error={!!validationErrors.email}
                helperText={validationErrors.email?.[0]}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
                error={!!validationErrors.password}
                helperText={validationErrors.password?.[0]}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          onClick={handleGeneratePassword}
                          edge="end"
                          title="Generate Password"
                        >
                          <i className="ri-refresh-line" />
                        </IconButton>
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </Stack>
                    </InputAdornment>
                  )
                }}
                required
              />
              <FormHelperText>
                Password must be at least 8 characters long with numbers and special characters
              </FormHelperText>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password_confirmation}
                onChange={handleChange('password_confirmation')}
                error={!!validationErrors.password_confirmation}
                helperText={validationErrors.password_confirmation?.[0]}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Timezone"
                value={formData.timezone}
                onChange={handleChange('timezone')}
                error={!!validationErrors.timezone}
                helperText={validationErrors.timezone?.[0]}
              >
                {TIMEZONE_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Currency"
                value={formData.currency_code}
                onChange={handleChange('currency_code')}
                error={!!validationErrors.currency_code}
                helperText={validationErrors.currency_code?.[0]}
              >
                {CURRENCY_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Language"
                value={formData.locale}
                onChange={handleChange('locale')}
                error={!!validationErrors.locale}
                helperText={validationErrors.locale?.[0]}
              >
                {LOCALE_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <Button 
                  variant="outlined" 
                  onClick={() => router.push(`/${lang}/event-organizers`)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  type="submit"
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </form>
  )
}

export default RegisterEventOrganizerPage
