'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormHelperText from '@mui/material/FormHelperText'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { Mode } from '@core/types'
import type { Locale } from '@configs/i18n'
import type { Organizer } from '@/types/organizer'

// Component Imports
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { getAllOrganizersApi } from '@/utils/apiConfig'

const Register = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [organizers, setOrganizers] = useState<Organizer[]>([])
  const [loadingOrganizers, setLoadingOrganizers] = useState(false)
  const [organizerError, setOrganizerError] = useState<string | null>(null)
  // We don't need the selectedOrganizer state since we're using formData

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    organizerId: ''
  })

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-2-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-2-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-register-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-register-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-register-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-register-light-border.png'

  // Hooks
  const { settings } = useSettings()
  const { lang: locale } = useParams()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  
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
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }))
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <div className='pli-6 max-lg:mbs-40 lg:mbe-24'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[650px] max-is-full bs-auto'
          />
        </div>
        <img src={authBackground} className='absolute bottom-[4%] z-[-1] is-full max-md:hidden' />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link
          href={getLocalizedUrl('/', locale as Locale)}
          className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'
        >
          <Logo />
        </Link>

        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div>
            <Typography variant='h4'>Adventure starts here 🚀</Typography>
            <Typography className='mbs-1'>Make your app management easy and fun!</Typography>
          </div>
          <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()} className='flex flex-col gap-5'>
            <TextField 
              autoFocus 
              fullWidth 
              label='Username' 
              name='username'
              value={formData.username}
              onChange={handleFormChange}
            />
            <TextField 
              fullWidth 
              label='Email' 
              name='email'
              value={formData.email}
              onChange={handleFormChange}
            />
            <TextField
              fullWidth
              label='Password'
              name='password'
              value={formData.password}
              onChange={handleFormChange}
              type={isPasswordShown ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                      <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <div className='flex justify-between items-center gap-3'>
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <>
                    <span>I agree to </span>
                    <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
                      privacy policy & terms
                    </Link>
                  </>
                }
              />
            </div>

            
            <FormControl fullWidth>
              <InputLabel id='organizer-label'>
                Select Organizer
              </InputLabel>
              <Select
                labelId='organizer-label'
                label='Select Organizer'
                name='organizerId'
                value={formData.organizerId}
                onChange={handleFormChange}
                disabled={loadingOrganizers}
              >
                {loadingOrganizers ? (
                  <MenuItem value='' disabled>
                    <CircularProgress size={20} /> Loading organizers...
                  </MenuItem>
                ) : organizerError ? (
                  <MenuItem value='' disabled>
                    Error: {organizerError}
                  </MenuItem>
                ) : organizers.length === 0 ? (
                  <MenuItem value='' disabled>
                    No organizers available
                  </MenuItem>
                ) : (
                  <>
                    <MenuItem value=''>Select an organizer</MenuItem>
                    {organizers.map(organizer => (
                      <MenuItem key={organizer.id} value={organizer.id.toString()}>
                        {organizer.name} ({organizer.email})
                      </MenuItem>
                    ))}
                  </>
                )}
              </Select>
              <FormHelperText>
                Select the organizer you are associated with
              </FormHelperText>
            </FormControl>
            
            <Button fullWidth variant='contained' type='submit'>
              Sign Up
            </Button>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>Already have an account?</Typography>
              <Typography component={Link} href='/login' color='primary'>
                Sign in instead
              </Typography>
            </div>
            <Divider className='gap-3 text-textPrimary'>or</Divider>
            <div className='flex justify-center items-center gap-2'>
              <IconButton size='small' className='text-facebook'>
                <i className='ri-facebook-fill' />
              </IconButton>
              <IconButton size='small' className='text-twitter'>
                <i className='ri-twitter-fill' />
              </IconButton>
              <IconButton size='small' className='text-textPrimary'>
                <i className='ri-github-fill' />
              </IconButton>
              <IconButton size='small' className='text-googlePlus'>
                <i className='ri-google-fill' />
              </IconButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
