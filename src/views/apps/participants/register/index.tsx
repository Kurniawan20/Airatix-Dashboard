'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import FormHelperText from '@mui/material/FormHelperText'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, minLength, pipe, nonEmpty, optional } from 'valibot'

// API Import
import { registerParticipantApi } from '@/utils/apiConfig'

// Class Options Import
import { classOptions } from '@/data/classOptions'

// Mock data for dropdowns
const PROVINCES = [
  'Aceh',
  'Bali',
  'Bangka Belitung',
  'Banten',
  'Bengkulu',
  'DI Yogyakarta',
  'DKI Jakarta',
  'Gorontalo',
  'Jambi',
  'Jawa Barat',
  'Jawa Tengah',
  'Jawa Timur',
  'Kalimantan Barat',
  'Kalimantan Selatan',
  'Kalimantan Tengah',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Kepulauan Riau',
  'Lampung',
  'Maluku',
  'Maluku Utara',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Papua',
  'Papua Barat',
  'Riau',
  'Sulawesi Barat',
  'Sulawesi Selatan',
  'Sulawesi Tengah',
  'Sulawesi Tenggara',
  'Sulawesi Utara',
  'Sumatera Barat',
  'Sumatera Selatan',
  'Sumatera Utara'
]

// Sample cities for each province (in a real app, this would be filtered based on selected province)
const CITIES = {
  Aceh: ['Banda Aceh', 'Langsa', 'Lhokseumawe', 'Sabang', 'Subulussalam'],
  Bali: ['Denpasar', 'Singaraja', 'Tabanan', 'Gianyar', 'Karangasem'],
  'DKI Jakarta': [
    'Jakarta Pusat',
    'Jakarta Barat',
    'Jakarta Selatan',
    'Jakarta Timur',
    'Jakarta Utara',
    'Kepulauan Seribu'
  ],
  'Jawa Barat': ['Bandung', 'Bekasi', 'Bogor', 'Cimahi', 'Cirebon', 'Depok', 'Sukabumi', 'Tasikmalaya'],
  'Jawa Tengah': ['Semarang', 'Solo', 'Magelang', 'Pekalongan', 'Salatiga', 'Tegal'],
  'Jawa Timur': ['Surabaya', 'Malang', 'Batu', 'Blitar', 'Kediri', 'Madiun', 'Mojokerto', 'Pasuruan', 'Probolinggo'],
  'Sulawesi Utara': [
    'Manado',
    'Bitung',
    'Tomohon',
    'Kotamobagu',
    'Minahasa',
    'Minahasa Utara',
    'Minahasa Selatan',
    'Minahasa Tenggara'
  ]
}

type FormData = {
  startNumber: string
  name: string
  nik: string
  city: string
  province: string
  team: string
  className: string
  vehicleBrand: string
  vehicleType: string
  vehicleColor: string
  chassisNumber: string
  engineNumber: string
  phoneNumber: string
  pos: string
  file: string
}

// Form validation schema
const schema = object({
  startNumber: pipe(string(), nonEmpty('Start number is required')),
  name: pipe(string(), nonEmpty('Name is required')),
  nik: pipe(string(), nonEmpty('NIK is required'), minLength(16, 'NIK must be 16 digits')),
  city: pipe(string(), nonEmpty('City is required')),
  province: pipe(string(), nonEmpty('Province is required')),
  team: pipe(string(), nonEmpty('Team is required')),
  className: pipe(string(), nonEmpty('Class name is required')),
  vehicleBrand: pipe(string(), nonEmpty('Vehicle brand is required')),
  vehicleType: pipe(string(), nonEmpty('Vehicle type is required')),
  vehicleColor: pipe(string(), nonEmpty('Vehicle color is required')),
  chassisNumber: pipe(string(), nonEmpty('Chassis number is required')),
  engineNumber: pipe(string(), nonEmpty('Engine number is required')),
  phoneNumber: pipe(string(), nonEmpty('Phone number is required')),
  pos: pipe(string(), nonEmpty('POS is required')),
  file: optional(string()) // Optional file field
})

const RegisterParticipantForm = () => {
  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      startNumber: '0001',
      name: '',
      nik: '',
      city: '',
      province: '',
      team: '',
      className: '',
      vehicleBrand: '',
      vehicleType: '',
      vehicleColor: '',
      chassisNumber: '',
      engineNumber: '',
      phoneNumber: '',
      pos: '',
      file: ''
    },
    resolver: valibotResolver(schema)
  })

  // Watch province to update cities
  const selectedProvince = watch('province')

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await registerParticipantApi(data)

      if (response.success) {
        setSuccess('Participant registered successfully')
        reset() // Reset form fields
      } else {
        setError(response.error || 'Registration failed')
      }
    } catch (err: any) {
      setError('An unexpected error occurred')
      console.error('Register error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Register New Participant' />
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
            {/* Start Number Field - Styled as a card for better organization */}
            <Grid item xs={12}>
              <Card
                sx={{
                  mb: 2,
                  backgroundColor: 'primary.main',
                  boxShadow: 3,
                  borderRadius: 2
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography
                    variant='h5'
                    sx={{
                      mb: 2,
                      fontWeight: 'bold',
                      color: 'white',
                      textTransform: 'uppercase'
                    }}
                  >
                    Participant Start Number
                  </Typography>

                  <Typography
                    variant='h2'
                    sx={{
                      mb: 2,
                      fontWeight: 'bold',
                      color: 'white',
                      letterSpacing: '0.5rem',
                      display: 'inline-block',
                      border: '3px solid',
                      borderColor: 'white',
                      borderRadius: 1,
                      px: 6,
                      py: 2
                    }}
                  >
                    #{watch('startNumber')}
                  </Typography>

                  <Typography variant='body2' color='white'>
                    Pre-generated start number for this participant
                  </Typography>

                  {/* Hidden field to store the value */}
                  <Controller
                    name='startNumber'
                    control={control}
                    render={({ field }) => <input type='hidden' {...field} />}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Participant Information Section */}
            <Grid item xs={12}>
              <Typography
                variant='h6'
                sx={{
                  mb: 2,
                  fontWeight: 'bold',
                  pb: 1,
                  borderBottom: '2px solid',
                  borderColor: 'primary.light'
                }}
              >
                Participant Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='name'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Name'
                    error={Boolean(errors.name)}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='nik'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='NIK'
                    error={Boolean(errors.nik)}
                    helperText={errors.nik?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='team'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Team'
                    error={Boolean(errors.team)}
                    helperText={errors.team?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='province'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.province)}>
                    <InputLabel id='province-label'>Province</InputLabel>
                    <Select
                      {...field}
                      labelId='province-label'
                      label='Province'
                      onChange={e => {
                        field.onChange(e)

                        // Reset city when province changes
                        setValue('city', '')
                      }}
                    >
                      {PROVINCES.map(province => (
                        <MenuItem key={province} value={province}>
                          {province}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.province && <FormHelperText>{errors.province.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='city'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.city)}>
                    <InputLabel id='city-label'>City</InputLabel>
                    <Select {...field} labelId='city-label' label='City' disabled={!selectedProvince}>
                      {selectedProvince &&
                        CITIES[selectedProvince as keyof typeof CITIES]?.map(city => (
                          <MenuItem key={city} value={city}>
                            {city}
                          </MenuItem>
                        ))}
                    </Select>
                    {errors.city && <FormHelperText>{errors.city.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Vehicle Information Section */}
            <Grid item xs={12}>
              <Typography
                variant='h6'
                sx={{
                  mb: 2,
                  fontWeight: 'bold',
                  pb: 1,
                  borderBottom: '2px solid',
                  borderColor: 'primary.light'
                }}
              >
                Vehicle Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='className'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.className)}>
                    <InputLabel id='class-name-label'>Class Name</InputLabel>
                    <Select {...field} label='Class Name' labelId='class-name-label'>
                      {classOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.className && <FormHelperText>{errors.className.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='vehicleBrand'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Vehicle Brand'
                    error={Boolean(errors.vehicleBrand)}
                    helperText={errors.vehicleBrand?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='vehicleType'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Vehicle Type'
                    error={Boolean(errors.vehicleType)}
                    helperText={errors.vehicleType?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='vehicleColor'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Vehicle Color'
                    error={Boolean(errors.vehicleColor)}
                    helperText={errors.vehicleColor?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='chassisNumber'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Chassis Number'
                    error={Boolean(errors.chassisNumber)}
                    helperText={errors.chassisNumber?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='engineNumber'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Engine Number'
                    error={Boolean(errors.engineNumber)}
                    helperText={errors.engineNumber?.message}
                  />
                )}
              />
            </Grid>

            {/* Contact Information Section */}
            <Grid item xs={12}>
              <Typography
                variant='h6'
                sx={{
                  mb: 2,
                  fontWeight: 'bold',
                  pb: 1,
                  borderBottom: '2px solid',
                  borderColor: 'primary.light'
                }}
              >
                Contact Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='phoneNumber'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Phone Number'
                    error={Boolean(errors.phoneNumber)}
                    helperText={errors.phoneNumber?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='pos'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='POS'
                    error={Boolean(errors.pos)}
                    helperText={errors.pos?.message}
                  />
                )}
              />
            </Grid>

            {/* File Upload Section */}
            <Grid item xs={12}>
              <Typography
                variant='h6'
                sx={{
                  mb: 2,
                  fontWeight: 'bold',
                  pb: 1,
                  borderBottom: '2px solid',
                  borderColor: 'primary.light'
                }}
              >
                File Upload
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='file'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='file'
                    InputLabelProps={{ shrink: true }}
                    label='Upload File'
                    inputProps={{ accept: 'image/*' }}
                    onChange={e => {
                      const file = (e.target as HTMLInputElement).files?.[0]

                      if (file) {
                        // Validate file size (max 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                          setError('File size should not exceed 5MB')

                          return
                        }

                        // Create a preview and store base64
                        const reader = new FileReader()

                        reader.onload = e => {
                          const result = e.target?.result as string

                          setValue('file', result) // Store base64 string in form data
                        }

                        reader.readAsDataURL(file)
                      }
                    }}
                    error={Boolean(errors.file)}
                    helperText={errors.file?.message || 'Upload a file (optional). Max size: 5MB.'}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type='submit'
                variant='contained'
                size='large'
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Registering...' : 'Register Participant'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default RegisterParticipantForm
