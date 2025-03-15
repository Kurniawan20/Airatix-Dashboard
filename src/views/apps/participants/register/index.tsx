'use client'

// React Imports
import { useState, useRef } from 'react'

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
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, minLength, pipe, nonEmpty, optional } from 'valibot'
import type { InferInput } from 'valibot'

// API Import
import { registerParticipantApi } from '@/utils/apiConfig'

// Class Options Import
import { classOptions } from '@/data/classOptions'

// Mock data for dropdowns
const PROVINCES = [
  'Aceh', 'Bali', 'Bangka Belitung', 'Banten', 'Bengkulu', 'DI Yogyakarta', 
  'DKI Jakarta', 'Gorontalo', 'Jambi', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 
  'Kalimantan Barat', 'Kalimantan Selatan', 'Kalimantan Tengah', 'Kalimantan Timur', 
  'Kalimantan Utara', 'Kepulauan Riau', 'Lampung', 'Maluku', 'Maluku Utara', 
  'Nusa Tenggara Barat', 'Nusa Tenggara Timur', 'Papua', 'Papua Barat', 'Riau', 
  'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tengah', 'Sulawesi Tenggara', 
  'Sulawesi Utara', 'Sumatera Barat', 'Sumatera Selatan', 'Sumatera Utara'
]

// Sample cities for each province (in a real app, this would be filtered based on selected province)
const CITIES = {
  'Aceh': ['Banda Aceh', 'Langsa', 'Lhokseumawe', 'Sabang', 'Subulussalam'],
  'Bali': ['Denpasar', 'Singaraja', 'Tabanan', 'Gianyar', 'Karangasem'],
  'DKI Jakarta': ['Jakarta Pusat', 'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Timur', 'Jakarta Utara', 'Kepulauan Seribu'],
  'Jawa Barat': ['Bandung', 'Bekasi', 'Bogor', 'Cimahi', 'Cirebon', 'Depok', 'Sukabumi', 'Tasikmalaya'],
  'Jawa Tengah': ['Semarang', 'Solo', 'Magelang', 'Pekalongan', 'Salatiga', 'Tegal'],
  'Jawa Timur': ['Surabaya', 'Malang', 'Batu', 'Blitar', 'Kediri', 'Madiun', 'Mojokerto', 'Pasuruan', 'Probolinggo'],
  'Sulawesi Utara': ['Manado', 'Bitung', 'Tomohon', 'Kotamobagu', 'Minahasa', 'Minahasa Utara', 'Minahasa Selatan', 'Minahasa Tenggara']
}

type FormData = InferInput<typeof schema>

// Form validation schema
const schema = object({
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
  photo: pipe(optional(string())) // Optional photo field
})

const RegisterParticipantForm = () => {
  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
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
      photo: ''
    },
    resolver: valibotResolver(schema)
  })

  // Watch province to update cities
  const selectedProvince = watch('province')

  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        setError('Please upload an image file (JPEG, PNG, etc.)')
        
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should not exceed 5MB')
        
        return
      }
      
      // Create a preview
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const result = e.target?.result as string
        
        setPhotoPreview(result)
        setValue('photo', result) // Store base64 string in form data
      }
      
      reader.readAsDataURL(file)
    }
  }
  
  // Handle photo removal
  const handleRemovePhoto = () => {
    setPhotoPreview(null)
    setValue('photo', '')
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  // Trigger file input click
  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await registerParticipantApi(data)

      if (response.success) {
        setSuccess('Participant registered successfully')
        reset() // Reset form fields
        setPhotoPreview(null) // Clear photo preview
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
            {/* Photo Upload Section */}
            <Grid item xs={12}>
              <Typography variant='subtitle1' sx={{ mb: 2 }}>
                Participant Photo
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {photoPreview ? (
                  <Box sx={{ position: 'relative' }}>
                    <Avatar 
                      src={photoPreview} 
                      alt="Participant Photo" 
                      sx={{ width: 100, height: 100 }}
                    />
                    <IconButton 
                      size="small" 
                      onClick={handleRemovePhoto}
                      sx={{ 
                        position: 'absolute', 
                        top: -10, 
                        right: -10, 
                        bgcolor: 'error.main', 
                        color: 'white',
                        '&:hover': { bgcolor: 'error.dark' }
                      }}
                    >
                      ✕
                    </IconButton>
                  </Box>
                ) : (
                  <Box 
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      border: '2px dashed', 
                      borderColor: 'divider',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'text.secondary'
                    }}
                  >
                    <Typography variant="caption" align="center">
                      No photo<br />uploaded
                    </Typography>
                  </Box>
                )}
                <Box>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                  />
                  <Button 
                    variant="outlined" 
                    onClick={handleBrowseClick}
                    sx={{ mr: 2 }}
                  >
                    Browse
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Upload a photo of the participant (optional). Max size: 5MB.
                  </Typography>
                </Box>
              </Box>
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
                name='phoneNumber'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Phone Number/WhatsApp'
                    error={Boolean(errors.phoneNumber)}
                    helperText={errors.phoneNumber?.message}
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
                    <InputLabel id="province-label">Province</InputLabel>
                    <Select
                      {...field}
                      labelId="province-label"
                      label="Province"
                      onChange={(e) => {
                        field.onChange(e);
                        
                        // Reset city when province changes
                        setValue('city', '');
                      }}
                    >
                      {PROVINCES.map((province) => (
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
                    <InputLabel id="city-label">City</InputLabel>
                    <Select
                      {...field}
                      labelId="city-label"
                      label="City"
                      disabled={!selectedProvince}
                    >
                      {selectedProvince && CITIES[selectedProvince as keyof typeof CITIES]?.map((city) => (
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
            <Grid item xs={12} sm={6}>
              <Controller
                name='className'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.className)}>
                    <InputLabel id="class-label">Class</InputLabel>
                    <Select
                      {...field}
                      labelId="class-label"
                      label="Class"
                    >
                      {classOptions.map((option) => (
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
