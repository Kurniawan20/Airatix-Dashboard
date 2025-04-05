'use client'

import { useEffect, useState } from 'react'

import { useRouter, usePathname, useParams } from 'next/navigation'

import { signOut, useSession } from 'next-auth/react'

import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'

/**
 * This component intercepts 401 Unauthorized responses and redirects to login page
 * It sets up a global event listener for API responses
 */
const AuthTokenInterceptor = () => {
  // State to track if we've already initiated a redirect
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Hooks
  const router = useRouter()
  const pathname = usePathname()
  const { lang: locale } = useParams()
  const { data: session } = useSession()

  useEffect(() => {
    if (!session) return // No need to set up listener if no session exists

    // Function to handle unauthorized responses
    const handleUnauthorized = async () => {
      // Prevent multiple redirects
      if (isRedirecting) return
      setIsRedirecting(true)

      console.log('Token expired. Redirecting to login page...')

      try {
        // Clear session storage
        sessionStorage.removeItem('authToken')

        // Sign out from NextAuth
        await signOut({ redirect: false })

        // Redirect to login page with return URL
        const redirectUrl = `/${locale as Locale}/login?redirectTo=${pathname}`

        router.push(redirectUrl)
      } catch (error) {
        console.error('Error during sign out:', error)

        // Fallback redirect if signOut fails
        const redirectUrl = getLocalizedUrl('/login', locale as Locale)

        router.push(redirectUrl)
      }
    }

    // Create a custom event for API 401 responses
    const handleApiUnauthorized = (event: Event) => {
      if (event instanceof CustomEvent) {
        handleUnauthorized()
      }
    }

    // Add event listener for our custom event
    window.addEventListener('api-unauthorized', handleApiUnauthorized)

    // Clean up event listener
    return () => {
      window.removeEventListener('api-unauthorized', handleApiUnauthorized)
    }
  }, [session, router, pathname, locale, isRedirecting])

  // This component doesn't render anything
  return null
}

export default AuthTokenInterceptor
