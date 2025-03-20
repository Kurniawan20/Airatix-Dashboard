'use client'

// React and Next Imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import {
  Card,
  Grid,
  Button,
  TextField,
  CardHeader,
  CardContent,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Typography
} from '@mui/material'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, minLength, pipe, nonEmpty, optional } from 'valibot'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// API Import
import { registerParticipantApi, getNextStartNumberApi } from '@/utils/apiConfig'

// Class Options Import
import { classOptions, categoryClasses } from '@/data/classOptions'

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
  categoryClass: string
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
  categoryClass: pipe(string(), nonEmpty('Category class is required')),
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
  const [filteredClasses, setFilteredClasses] = useState(classOptions)
  const [redirecting, setRedirecting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [fetchingStartNumber, setFetchingStartNumber] = useState(true)
  const router = useRouter()

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      startNumber: '',
      name: '',
      nik: '',
      city: '',
      province: '',
      team: '',
      categoryClass: '',
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

  // Fetch next available start number when component mounts
  useEffect(() => {
    const fetchNextStartNumber = async () => {
      setFetchingStartNumber(true)
      
      try {
        const response = await getNextStartNumberApi()
        
        if (response.success && response.data) {
          setValue('startNumber', response.data.nextAvailableStartNumber)
        } else {
          console.error('Failed to fetch next start number:', response.error)
          
          // Fallback to default start number
          setValue('startNumber', '0001')
        }
      } catch (err) {
        console.error('Error fetching next start number:', err)
        
        // Fallback to default start number
        setValue('startNumber', '0001')
      } finally {
        setFetchingStartNumber(false)
      }
    }

    fetchNextStartNumber()
  }, [setValue])

  // Function to populate form with dummy data
  const populateDummyData = () => {
    // Select a random province
    const randomProvince = PROVINCES[Math.floor(Math.random() * PROVINCES.length)]

    // Select a random city from the province
    const provinceCities = CITIES[randomProvince as keyof typeof CITIES] || []
    const randomCity = provinceCities.length > 0 
      ? provinceCities[Math.floor(Math.random() * provinceCities.length)]
      : 'Jakarta Pusat'

    // Select a random category
    const randomCategory = categoryClasses[Math.floor(Math.random() * categoryClasses.length)].value

    // Filter classes by the selected category
    const categoryFilteredClasses = classOptions.filter(option => option.category === randomCategory)

    // Select a random class from the filtered classes
    const randomClass = categoryFilteredClasses.length > 0
      ? categoryFilteredClasses[Math.floor(Math.random() * categoryFilteredClasses.length)].value
      : ''

    // Set values for all form fields
    setValue('name', 'John Doe')
    setValue('nik', '1234567890123456')
    setValue('province', randomProvince)
    setValue('city', randomCity)
    setValue('team', 'Team Racing Champions')
    setValue('categoryClass', randomCategory)

    // We need to wait for the filtered classes to update before setting the class name
    setTimeout(() => {
      setValue('className', randomClass)
    }, 100)

    setValue('vehicleBrand', 'Toyota')
    setValue('vehicleType', 'Supra')
    setValue('vehicleColor', 'Red')
    setValue('chassisNumber', 'CHAS' + Math.floor(Math.random() * 10000000))
    setValue('engineNumber', 'ENG' + Math.floor(Math.random() * 10000000))
    setValue('phoneNumber', '08' + Math.floor(Math.random() * 1000000000))
    setValue('pos', 'Jakarta')
  }

  // Watch for category class changes to filter class options
  const selectedCategory = watch('categoryClass')

  useEffect(() => {
    if (selectedCategory) {
      const filtered = classOptions.filter(option => option.category === selectedCategory)
      setFilteredClasses(filtered)
      // Reset class selection when category changes
      setValue('className', '')
    } else {
      setFilteredClasses(classOptions)
    }
  }, [selectedCategory, setValue])

  // Watch province to update cities
  const selectedProvince = watch('province')

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setValidationErrors({})

    try {
      // Call the API to register the participant
      const response = await registerParticipantApi(data)
      
      if (response.success) {
        setSuccess('Participant registered successfully! Redirecting to details page...')
        generatePDF(data)
        
        // Store participant data in localStorage for the details page to access
        const participantData = {
          ...response.data,
          registrationDate: response.data.registrationDate || new Date().toISOString()
        }
        
        // Save to localStorage with a key that includes the ID
        localStorage.setItem(`participant_${response.data.id}`, JSON.stringify(participantData))
        
        // Also save the latest registered participant ID for easy access
        localStorage.setItem('latest_registered_participant_id', response.data.id.toString())
        
        // Set redirecting state to show loading indicator
        setRedirecting(true)
        
        // Redirect to details page after a short delay
        setTimeout(() => {
          router.push(`/en/participants/details/${response.data.id}`)
        }, 2000)
      } else {
        // Handle API error
        if (response.status === 400 && response.validationErrors) {
          setValidationErrors(response.validationErrors)
          setError('Validation failed. Please check the form for errors.')
        } else if (response.status === 409) {
          setError(response.error || 'A participant with this NIK or start number already exists.')
        } else if (response.status === 401 || response.status === 403) {
          setError('You are not authorized to register participants.')
        } else {
          setError(response.error || 'Failed to register participant')
        }
      }
    } catch (err) {
      console.error('Error registering participant:', err)

      setError('An unexpected error occurred. Please try again later.')
      
      // If API is not available, still allow PDF generation
      generatePDF(data)
    } finally {
      setLoading(false)
    }
  }

  // Function to generate PDF
  const generatePDF = (data: FormData) => {
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20)
      doc.setTextColor(40, 40, 40)
      doc.text('Participant Registration Form', 105, 20, { align: 'center' })
      
      // Add event logo or header
      doc.setFontSize(12)
      doc.setTextColor(80, 80, 80)
      doc.text('Drag Racing Event Registration', 105, 30, { align: 'center' })
      
      // Add date
      const today = new Date()
      doc.setFontSize(10)
      doc.text(`Registration Date: ${today.toLocaleDateString()}`, 105, 40, { align: 'center' })
      
      // Add start number in a box
      doc.setFillColor(66, 66, 245) // Primary color
      doc.setDrawColor(66, 66, 245)
      doc.rect(75, 45, 60, 25, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16)
      doc.text(`Start Number: #${data.startNumber}`, 105, 60, { align: 'center' })
      
      // Add participant information
      doc.setTextColor(40, 40, 40)
      doc.setFontSize(14)
      doc.text('Participant Information', 20, 80)
      
      doc.setFontSize(10)
      doc.setDrawColor(220, 220, 220)
      doc.line(20, 85, 190, 85)
      
      // Create table for participant info
      const participantInfo = [
        ['Name', data.name],
        ['NIK', data.nik],
        ['Province', data.province],
        ['City', data.city],
        ['Team', data.team],
        ['Phone Number', data.phoneNumber],
        ['POS', data.pos]
      ]
      
      // Use autoTable directly
      autoTable(doc, {
        startY: 90,
        head: [['Field', 'Value']],
        body: participantInfo,
        theme: 'grid',
        headStyles: { fillColor: [66, 66, 245], textColor: [255, 255, 255] },
        styles: { fontSize: 10 }
      })
      
      // Add class information
      const finalY = (doc as any).lastAutoTable.finalY || 150
      
      doc.setFontSize(14)
      doc.text('Class Information', 20, finalY + 10)
      
      doc.setFontSize(10)
      doc.line(20, finalY + 15, 190, finalY + 15)
      
      // Create table for class info
      const classInfo = [
        ['Category Class', data.categoryClass],
        ['Class Name', data.className]
      ]
      
      autoTable(doc, {
        startY: finalY + 20,
        head: [['Field', 'Value']],
        body: classInfo,
        theme: 'grid',
        headStyles: { fillColor: [66, 66, 245], textColor: [255, 255, 255] },
        styles: { fontSize: 10 }
      })
      
      // Add vehicle information
      const finalY2 = (doc as any).lastAutoTable.finalY || 200
      
      doc.setFontSize(14)
      doc.text('Vehicle Information', 20, finalY2 + 10)
      
      doc.setFontSize(10)
      doc.line(20, finalY2 + 15, 190, finalY2 + 15)
      
      // Create table for vehicle info
      const vehicleInfo = [
        ['Vehicle Brand', data.vehicleBrand],
        ['Vehicle Type', data.vehicleType],
        ['Vehicle Color', data.vehicleColor],
        ['Chassis Number', data.chassisNumber],
        ['Engine Number', data.engineNumber]
      ]
      
      autoTable(doc, {
        startY: finalY2 + 20,
        head: [['Field', 'Value']],
        body: vehicleInfo,
        theme: 'grid',
        headStyles: { fillColor: [66, 66, 245], textColor: [255, 255, 255] },
        styles: { fontSize: 10 }
      })
      
      // Add footer
      const finalY3 = (doc as any).lastAutoTable.finalY || 250
      
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text('This is an official registration document. Please keep it for your records.', 105, finalY3 + 15, { align: 'center' })
      
      // Add signature fields
      doc.setFontSize(10)
      doc.setTextColor(40, 40, 40)
      doc.text('Participant Signature', 50, finalY3 + 30, { align: 'center' })
      doc.text('Official Signature', 150, finalY3 + 30, { align: 'center' })
      
      doc.line(20, finalY3 + 45, 80, finalY3 + 45) // Participant signature line
      doc.line(120, finalY3 + 45, 180, finalY3 + 45) // Official signature line
      
      // Save the PDF
      doc.save(`participant_registration_${data.startNumber}.pdf`)
      
      console.log('PDF generated successfully')
    } catch (error) {
      console.error('Error generating PDF:', error)
      
      setError('Failed to generate PDF. Please try again.')
    }
  }

  return (
    <Card>
      <CardHeader 
        title='Register Participant' 
        action={
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={populateDummyData}
            startIcon={<i className="ri-magic-line" />}
          >
            Fill with Dummy Data
          </Button>
        }
      />
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
                      py: 2,
                      minWidth: '200px'
                    }}
                  >
                    {fetchingStartNumber ? (
                      <CircularProgress size={30} sx={{ color: 'white' }} />
                    ) : (
                      `#${watch('startNumber')}`
                    )}
                  </Typography>

                  <Typography variant='body2' color='white'>
                    {fetchingStartNumber 
                      ? 'Fetching next available start number...' 
                      : 'Pre-generated start number for this participant'}
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
                    error={Boolean(errors.name) || Boolean(validationErrors.name)}
                    helperText={errors.name?.message || validationErrors.name}
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
                    error={Boolean(errors.nik) || Boolean(validationErrors.nik)}
                    helperText={errors.nik?.message || validationErrors.nik}
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
                    error={Boolean(errors.team) || Boolean(validationErrors.team)}
                    helperText={errors.team?.message || validationErrors.team}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='province'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.province) || Boolean(validationErrors.province)}>
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
                  <FormControl fullWidth error={Boolean(errors.city) || Boolean(validationErrors.city)}>
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

            {/* Class Information Section */}
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
                Class Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='categoryClass'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.categoryClass) || Boolean(validationErrors.categoryClass)}>
                    <InputLabel id='category-class-label'>Category Class</InputLabel>
                    <Select {...field} label='Category Class' labelId='category-class-label'>
                      {categoryClasses.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.categoryClass && <FormHelperText>{errors.categoryClass.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='className'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.className) || Boolean(validationErrors.className)}>
                    <InputLabel id='class-name-label'>Class Name</InputLabel>
                    <Select {...field} label='Class Name' labelId='class-name-label' disabled={!selectedCategory}>
                      {filteredClasses.map(option => (
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
                name='vehicleBrand'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Vehicle Brand'
                    error={Boolean(errors.vehicleBrand) || Boolean(validationErrors.vehicleBrand)}
                    helperText={errors.vehicleBrand?.message || validationErrors.vehicleBrand}
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
                    error={Boolean(errors.vehicleType) || Boolean(validationErrors.vehicleType)}
                    helperText={errors.vehicleType?.message || validationErrors.vehicleType}
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
                    error={Boolean(errors.vehicleColor) || Boolean(validationErrors.vehicleColor)}
                    helperText={errors.vehicleColor?.message || validationErrors.vehicleColor}
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
                    error={Boolean(errors.chassisNumber) || Boolean(validationErrors.chassisNumber)}
                    helperText={errors.chassisNumber?.message || validationErrors.chassisNumber}
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
                    error={Boolean(errors.engineNumber) || Boolean(validationErrors.engineNumber)}
                    helperText={errors.engineNumber?.message || validationErrors.engineNumber}
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
                    error={Boolean(errors.phoneNumber) || Boolean(validationErrors.phoneNumber)}
                    helperText={errors.phoneNumber?.message || validationErrors.phoneNumber}
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
                    error={Boolean(errors.pos) || Boolean(validationErrors.pos)}
                    helperText={errors.pos?.message || validationErrors.pos}
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
                    error={Boolean(errors.file) || Boolean(validationErrors.file)}
                    helperText={errors.file?.message || validationErrors.file || 'Upload a file (optional). Max size: 5MB.'}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                fullWidth
                size='large'
                type='submit'
                variant='contained'
                sx={{ mb: 4 }}
                disabled={loading || redirecting}
              >
                {loading ? <CircularProgress size={24} /> : redirecting ? 'Redirecting...' : 'Register Participant'}
              </Button>
              
              {success && !redirecting && (
                <Button
                  fullWidth
                  size='large'
                  variant='outlined'
                  color='secondary'
                  onClick={() => generatePDF(watch())}
                  startIcon={<i className="ri-file-pdf-line" />}
                  sx={{ mb: 4 }}
                >
                  Download Registration PDF
                </Button>
              )}
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default RegisterParticipantForm
