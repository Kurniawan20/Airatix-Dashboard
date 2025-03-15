/**
 * API Configuration and Utility Functions
 * This file contains API endpoints and utility functions for making API requests
 */

// Type Imports
import type { User } from '@/types/user'

// Base API URLs
const AUTH_API_BASE_URL = 'http://airatix.id:8088/api'
const TRANSACTION_API_BASE_URL = 'https://airatix.id:8000/public'

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${AUTH_API_BASE_URL}/auth/login`,
    LOGOUT: `${AUTH_API_BASE_URL}/auth/logout`,
    REGISTER: `${AUTH_API_BASE_URL}/auth/register`
  },
  USERS: {
    ALL: `${AUTH_API_BASE_URL}/users`,
    BY_ID: (id: string) => `${AUTH_API_BASE_URL}/users/${id}`
  },
  TRANSACTIONS: {
    ALL: `${TRANSACTION_API_BASE_URL}/transactions`,
    ORGANIZER: (organizerId: string | number) => `${TRANSACTION_API_BASE_URL}/organizers/${organizerId}/transactions`,
    EVENT: (eventId: string | number, page: number = 1) =>
      `${TRANSACTION_API_BASE_URL}/events/${eventId}/transactions?page=${page}`
  },
  PARTICIPANTS: {
    ALL: `${AUTH_API_BASE_URL}/participants`,
    BY_ID: (id: string) => `${AUTH_API_BASE_URL}/participants/${id}`,
    REGISTER: `${AUTH_API_BASE_URL}/participants/register`
  }
}

/**
 * Creates an authenticated request with the JWT token
 * @param token The JWT token
 * @returns A function that can be used to make authenticated requests
 */
export const createAuthenticatedRequest = (token: string) => {
  return async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    return response
  }
}

/**
 * Login API call
 * @param username The username
 * @param password The password
 * @returns The response from the login API
 */
export const loginApi = async (username: string, password: string) => {
  try {
    console.log('Login API call with username:', username)

    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })

    const data = await response.json()

    console.log('Login API response:', data)

    if (!response.ok) {
      // Handle error response
      return {
        success: false,
        error: data.message || 'Login failed',
        status: response.status,
        data: null
      }
    }

    // Store token in session storage
    if (data.token) {
      console.log('Setting auth token from login response')
      setAuthToken(data.token)
    } else {
      console.log('No token in login response')
    }

    return {
      success: true,
      data,
      status: response.status,
      error: null
    }
  } catch (error) {
    console.error('Login API error:', error)

    return {
      success: false,
      error: 'Network error occurred',
      status: 500,
      data: null
    }
  }
}

/**
 * Register API call
 * @param userData The user data to register
 * @returns The response from the register API
 */
export const registerUserApi = async (userData: {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
}) => {
  try {
    console.log('Register API call with data:', {
      ...userData,
      password: userData.password ? '********' : 'no password'
    })

    const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })

    const data = await response.json()

    console.log('Register API response:', data)

    if (!response.ok) {
      // Handle error response
      return {
        success: false,
        error: data.message || 'Registration failed',
        status: response.status,
        data: null
      }
    }

    return {
      success: true,
      data,
      status: response.status,
      error: null
    }
  } catch (error) {
    console.error('Register API error:', error)

    return {
      success: false,
      error: 'Network error occurred',
      status: 500,
      data: null
    }
  }
}

/**
 * Gets the JWT token from session storage
 * @returns The JWT token or null if not found
 */
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    // Check for token in sessionStorage
    return sessionStorage.getItem('authToken')
  }

  return null
}

/**
 * Sets the JWT token in session storage
 * @param token The JWT token to store
 */
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('authToken', token)
  }
}

/**
 * Removes the JWT token from session storage
 */
export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('authToken')
  }
}

/**
 * Gets the JWT token from the NextAuth session
 * This is an alternative way to get the token if session storage doesn't work
 * @returns The JWT token or null if not found
 */
export const getSessionToken = async (): Promise<string | null> => {
  if (typeof window !== 'undefined') {
    try {
      // Try to get the token from the session
      const response = await fetch('/api/auth/session')
      const session = await response.json()

      console.log('Session from API:', session)

      // Check if the session has an access token
      if (session && session.accessToken) {
        return session.accessToken
      }

      // Check if the session has a user with an access token
      if (session && session.user && session.user.accessToken) {
        return session.user.accessToken
      }

      console.log('No token found in session')

      return null
    } catch (error) {
      console.error('Error getting session token:', error)

      return null
    }
  }

  return null
}

/**
 * Fetches transaction data with authentication
 * @param url The URL to fetch from
 * @param options Additional fetch options
 * @returns The response data or error
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  try {
    const token = getAuthToken()

    console.log('Auth Token:', token ? 'Token exists' : 'No token found')

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }

    console.log('Request Headers:', headers)
    console.log('Request URL:', url)

    const response = await fetch(url, {
      ...options,
      headers
    })

    console.log('Response Status:', response.status)

    const data = await response.json()

    console.log('Response Data:', data)

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Request failed',
        status: response.status,
        data: null
      }
    }

    return {
      success: true,
      data,
      status: response.status,
      error: null
    }
  } catch (error) {
    console.error('API error:', error)

    return {
      success: false,
      error: 'Network error occurred',
      status: 500,
      data: null
    }
  }
}

/**
 * Fetches transaction data with authentication, trying multiple token sources
 * @param url The URL to fetch from
 * @param options Additional fetch options
 * @returns The response data or error
 */
export const fetchWithAuthFallback = async (url: string, options: RequestInit = {}) => {
  try {
    // Try to get the token from session storage first
    let token = getAuthToken()

    // If no token in session storage, try to get it from the NextAuth session
    if (!token) {
      console.log('No token in session storage, trying to get it from NextAuth session')
      token = await getSessionToken()
    }

    console.log('Auth Token for fetch:', token ? 'Token exists' : 'No token found')

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }

    console.log('Request Headers:', Object.keys(headers))
    console.log('Request URL:', url)

    try {
      const response = await fetch(url, {
        ...options,
        headers
      })

      console.log('Response Status:', response.status)

      // Return the response directly without trying to parse it
      // Let the calling function handle the parsing based on the response status
      return response
    } catch (fetchError) {
      console.error('Fetch error:', fetchError)

      // Create a Response object to maintain the same interface
      return new Response(JSON.stringify({ error: 'Network error occurred' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    console.error('API error:', error)

    // Create a Response object to maintain the same interface
    return new Response(JSON.stringify({ error: 'Network error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

/**
 * Get all users API call
 * @returns The response from the get all users API
 */
export const getAllUsersApi = async () => {
  try {
    console.log('Fetching users from:', API_ENDPOINTS.USERS.ALL)
    const response = await fetchWithAuthFallback(API_ENDPOINTS.USERS.ALL)

    console.log('API response status:', response.status)

    if (!response.ok) {
      // Handle different error responses
      if (response.status === 401) {
        console.log('User is not authenticated (401)')

        return {
          success: false,
          error: 'Unauthorized. Please log in again.',
          status: 401
        }
      } else if (response.status === 403) {
        console.log('User does not have permission (403)')

        return {
          success: false,
          error: 'Access denied. You do not have permission to view users.',
          status: 403
        }
      } else {
        console.log(`API returned error status: ${response.status}`)

        return {
          success: false,
          error: 'Failed to fetch users. Please try again later.',
          status: response.status
        }
      }
    }

    // Parse the response
    const data = await response.json()

    console.log('API response data:', data ? 'Data received' : 'No data')

    // The API returns an array directly, not wrapped in a data property
    return {
      success: true,
      data: data // Use the array directly as the data property
    }
  } catch (error) {
    console.error('Error fetching users:', error)

    return {
      success: false,
      error: 'An unexpected error occurred while fetching users.'
    }
  }
}

/**
 * Delete user API call
 * @param userId The ID of the user to delete
 * @returns The response from the delete user API
 */
export const deleteUserApi = async (userId: string) => {
  try {
    console.log('Deleting user with ID:', userId)
    const url = API_ENDPOINTS.USERS.BY_ID(userId)

    console.log('Delete user URL:', url)

    const response = await fetchWithAuthFallback(url, {
      method: 'DELETE'
    })

    console.log('Delete API response status:', response.status)

    if (!response.ok) {
      // Handle different error responses
      if (response.status === 401) {
        console.log('User is not authenticated (401)')

        return {
          success: false,
          error: 'Unauthorized. Please log in again.',
          status: 401
        }
      } else if (response.status === 403) {
        console.log('User does not have permission (403)')

        return {
          success: false,
          error: 'Access denied. You do not have permission to delete users.',
          status: 403
        }
      } else if (response.status === 404) {
        console.log('User not found (404)')

        return {
          success: false,
          error: 'User not found.',
          status: 404
        }
      } else {
        console.log(`API returned error status: ${response.status}`)

        return {
          success: false,
          error: 'Failed to delete user. Please try again later.',
          status: response.status
        }
      }
    }

    // Check if the response has content before trying to parse it
    const contentType = response.headers.get('content-type')
    let data = null

    // Only try to parse JSON if there's content and it's JSON
    if (contentType && contentType.includes('application/json') && response.status !== 204) {
      try {
        const text = await response.text()

        if (text && text.trim() !== '') {
          data = JSON.parse(text)
          console.log('Delete API response data:', data)
        }
      } catch (parseError) {
        console.warn('Could not parse response as JSON:', parseError)
      }
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Error deleting user:', error)

    return {
      success: false,
      error: 'An unexpected error occurred while deleting the user.'
    }
  }
}

/**
 * Update user API call
 * @param userId The ID of the user to update
 * @param userData The user data to update
 * @returns The response from the update user API
 */
export const updateUserApi = async (userId: string, userData: Partial<User>) => {
  try {
    console.log('Updating user with ID:', userId)
    const url = API_ENDPOINTS.USERS.BY_ID(userId)

    console.log('Update user URL:', url)

    const response = await fetchWithAuthFallback(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })

    console.log('Update API response status:', response.status)

    if (!response.ok) {
      // Handle different error responses
      if (response.status === 401) {
        console.log('User is not authenticated (401)')

        return {
          success: false,
          error: 'Unauthorized. Please log in again.',
          status: 401
        }
      } else if (response.status === 403) {
        console.log('User does not have permission (403)')

        return {
          success: false,
          error: 'Access denied. You do not have permission to update users.',
          status: 403
        }
      } else if (response.status === 404) {
        console.log('User not found (404)')

        return {
          success: false,
          error: 'User not found.',
          status: 404
        }
      } else if (response.status === 422) {
        // Try to get validation error details
        try {
          const errorData = await response.json()

          console.log('Validation error:', errorData)

          return {
            success: false,
            error: errorData.message || 'Invalid user data provided.',
            status: 422,
            validationErrors: errorData.errors
          }
        } catch (parseError) {
          return {
            success: false,
            error: 'Invalid user data provided.',
            status: 422
          }
        }
      } else {
        console.log(`API returned error status: ${response.status}`)

        return {
          success: false,
          error: 'Failed to update user. Please try again later.',
          status: response.status
        }
      }
    }

    // Parse the response
    try {
      const text = await response.text()

      if (text && text.trim() !== '') {
        const data = JSON.parse(text)

        console.log('Update API response data:', data)

        return {
          success: true,
          data: data
        }
      }
    } catch (parseError) {
      console.warn('Could not parse response as JSON:', parseError)
    }

    // If we couldn't parse the response but it was successful
    return {
      success: true,
      data: null
    }
  } catch (error) {
    console.error('Error updating user:', error)

    return {
      success: false,
      error: 'An unexpected error occurred while updating the user.'
    }
  }
}

/**
 * Get all participants API call
 * @returns The response from the get all participants API
 */
export const getAllParticipantsApi = async () => {
  try {
    const token = getAuthToken()
    
    if (!token) {
      return {
        success: false,
        error: 'Authentication token not found',
        status: 401,
        data: null
      }
    }

    const response = await fetchWithAuthFallback(API_ENDPOINTS.PARTICIPANTS.ALL)
    
    if (!response.ok) {
      // Handle error response
      let errorMessage = 'Failed to fetch participants'
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        // If parsing JSON fails, use the default error message
      }
      
      return {
        success: false,
        error: errorMessage,
        status: response.status,
        data: null
      }
    }

    const data = await response.json()

    return {
      success: true,
      data: data.data || [],
      status: response.status,
      error: null
    }
  } catch (error) {
    console.error('Get all participants API error:', error)

    return {
      success: false,
      error: 'Network error occurred',
      status: 500,
      data: null
    }
  }
}

/**
 * Get participant by ID API call
 * @param id The participant ID
 * @returns The response from the get participant by ID API
 */
export const getParticipantByIdApi = async (id: string) => {
  try {
    console.log('Get participant by ID API call with ID:', id)

    // Validate ID
    if (!id) {
      return {
        success: false,
        error: 'Participant ID is required'
      }
    }

    const response = await fetchWithAuthFallback(API_ENDPOINTS.PARTICIPANTS.BY_ID(id))

    if (!response.ok) {
      let errorMessage = 'Failed to fetch participant'

      if (response.status === 401) {
        errorMessage = 'Unauthorized. Please login again.'
      } else if (response.status === 403) {
        errorMessage = 'You do not have permission to view this participant.'
      } else if (response.status === 404) {
        errorMessage = 'Participant not found.'
      }

      return {
        success: false,
        error: errorMessage
      }
    }

    const data = await response.json()

    return {
      success: true,
      data: data.data
    }
  } catch (error) {
    console.error('Get participant by ID API error:', error)

    return {
      success: false,
      error: 'An unexpected error occurred while fetching the participant'
    }
  }
}

/**
 * Register participant API call
 * @param participantData The participant data to register
 * @returns The response from the register participant API
 */
export const registerParticipantApi = async (participantData: {
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
  pos: string
}) => {
  try {
    console.log('Register participant API call with data:', participantData)

    const token = getAuthToken()
    
    if (!token) {
      return {
        success: false,
        error: 'Authentication token not found',
        status: 401,
        data: null
      }
    }

    const response = await fetchWithAuthFallback(API_ENDPOINTS.PARTICIPANTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(participantData)
    })

    if (!response.ok) {
      // Handle error response
      let errorMessage = 'Failed to register participant'
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        // If parsing JSON fails, use the default error message
      }
      
      return {
        success: false,
        error: errorMessage,
        status: response.status,
        data: null
      }
    }

    const data = await response.json()

    return {
      success: true,
      data,
      status: response.status,
      error: null
    }
  } catch (error) {
    console.error('Register participant API error:', error)

    return {
      success: false,
      error: 'Network error occurred',
      status: 500,
      data: null
    }
  }
}

export default API_ENDPOINTS
