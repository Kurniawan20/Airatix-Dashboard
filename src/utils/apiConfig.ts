/**
 * API Configuration and Utility Functions
 * This file contains API endpoints and utility functions for making API requests
 */

// Type Imports
import type { User } from '@/types/user'

// Base API URLs
const AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL || 'https://insight.airatix.id:8089/api'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://airatix.id:8000/api'

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${AUTH_API_BASE_URL}/auth/login`,
    REGISTER: `${AUTH_API_BASE_URL}/auth/register`,
    REFRESH_TOKEN: `${AUTH_API_BASE_URL}/auth/refresh-token`,
    LOGOUT: `${AUTH_API_BASE_URL}/auth/logout`,
    RESET_PASSWORD: `${AUTH_API_BASE_URL}/auth/reset-password`,
    FORGOT_PASSWORD: `${AUTH_API_BASE_URL}/auth/forgot-password`,
    ME: `${AUTH_API_BASE_URL}/users/me`
  },
  USERS: {
    ALL: `${AUTH_API_BASE_URL}/users`,
    GET_ALL: `${AUTH_API_BASE_URL}/users`,
    GET_BY_ID: (id: number) => `${AUTH_API_BASE_URL}/users/${id}`,
    CREATE: `${AUTH_API_BASE_URL}/users`,
    UPDATE: (id: number) => `${AUTH_API_BASE_URL}/users/${id}`,
    DELETE: (id: number) => `${AUTH_API_BASE_URL}/users/${id}`
  },
  PARTICIPANTS: {
    ALL: `${AUTH_API_BASE_URL}/participants`,
    REGISTER: `${AUTH_API_BASE_URL}/participants`,
    GET_BY_ID: (id: number) => `${AUTH_API_BASE_URL}/participants/${id}`,
    GET_NEXT_START_NUMBER: `${AUTH_API_BASE_URL}/participants/next-start-number`
  },
  TRANSACTIONS: {
    ALL: `${API_BASE_URL}/transactions`,
    ORGANIZER: (organizerId: string | number) => `${API_BASE_URL}/organizers/${organizerId}/transactions`,
    EVENT: (eventId: string | number, page: number = 1) =>
      `${API_BASE_URL}/events/${eventId}/transactions?page=${page}`,
    MONTHLY_GROSS: (year: number = new Date().getFullYear()) =>
      `${API_BASE_URL}/transactions/monthly-gross?year=${year}`
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
  } catch (error: any) {
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
 * Handles 401 Unauthorized responses by dispatching a custom event
 * This will trigger the AuthTokenInterceptor to redirect to login
 */
export const handleUnauthorizedResponse = (): void => {
  if (typeof window !== 'undefined') {
    console.log('Unauthorized response detected, dispatching event')

    // Dispatch a custom event that will be caught by the AuthTokenInterceptor
    window.dispatchEvent(new CustomEvent('api-unauthorized'))
  }
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

    // Check for 401 Unauthorized response and handle it
    if (response.status === 401) {
      handleUnauthorizedResponse()

      return {
        success: false,
        error: 'Unauthorized. Please login again.',
        status: response.status,
        data: null
      }
    }

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

      // Check for 401 Unauthorized response and handle it
      if (response.status === 401) {
        handleUnauthorizedResponse()
      }

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
 * @returns The list of users or error
 */
export const getAllUsersApi = async () => {
  try {
    console.log('Get all users API call')

    const response = await fetchWithAuthFallback(API_ENDPOINTS.USERS.GET_ALL, {
      method: 'GET'
    })

    if (!response.ok) {
      let errorMessage = 'Failed to fetch users'

      if (response.status === 401) {
        errorMessage = 'Unauthorized. Please login again.'
      } else if (response.status === 403) {
        errorMessage = 'You do not have permission to access this resource.'
      }

      return {
        success: false,
        error: errorMessage
      }
    }

    // Parse the JSON response
    const data = await response.json()

    console.log('Users data:', data)

    // Handle different response formats
    // Some APIs return data directly, others wrap it in a data property
    const usersData = data.data || data

    return {
      success: true,
      data: usersData
    }
  } catch (error) {
    console.error('Get all users API error:', error)

    return {
      success: false,
      error: 'An unexpected error occurred while fetching users'
    }
  }
}

/**
 * Get user profile API call
 * @returns The user profile data or error
 */
export const getUserProfileApi = async () => {
  try {
    console.log('Get user profile API call')

    const response = await fetchWithAuthFallback(API_ENDPOINTS.AUTH.ME, {
      method: 'GET'
    })

    if (!response.ok) {
      let errorMessage = 'Failed to fetch user profile'

      if (response.status === 401) {
        errorMessage = 'Unauthorized. Please login again.'
      }

      return {
        success: false,
        error: errorMessage
      }
    }

    // Parse the JSON response
    const data = await response.json()

    console.log('User profile data:', data)

    // Handle different response formats
    // Some APIs return data directly, others wrap it in a data property
    const userData = data.data || data

    return {
      success: true,
      data: userData
    }
  } catch (error) {
    console.error('Get user profile API error:', error)

    return {
      success: false,
      error: 'An unexpected error occurred while fetching user profile'
    }
  }
}

/**
 * Delete user API call
 * @param userId The ID of the user to delete
 * @returns The response from the delete user API
 */
export const deleteUserApi = async (userId: number) => {
  try {
    console.log('Deleting user with ID:', userId)
    const url = API_ENDPOINTS.USERS.DELETE(userId)

    console.log('Delete user URL:', url)

    const response = await fetchWithAuthFallback(url, {
      method: 'DELETE'
    })

    if (!response.ok) {
      let errorMessage = 'Failed to delete user'

      if (response.status === 401) {
        errorMessage = 'Unauthorized. Please login again.'
      } else if (response.status === 403) {
        errorMessage = 'You do not have permission to delete users.'
      } else if (response.status === 404) {
        errorMessage = 'User not found.'
      }

      return {
        success: false,
        error: errorMessage
      }
    }

    return {
      success: true
    }
  } catch (error) {
    console.error('Delete user API error:', error)

    return {
      success: false,
      error: 'An unexpected error occurred while deleting user'
    }
  }
}

/**
 * Update user API call
 * @param userId The ID of the user to update
 * @param userData The updated user data
 * @returns The response from the update user API
 */
export const updateUserApi = async (userId: number, userData: Partial<User>) => {
  try {
    console.log('Updating user with ID:', userId)
    const url = API_ENDPOINTS.USERS.UPDATE(userId)

    console.log('Update user URL:', url)

    const response = await fetchWithAuthFallback(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      let errorMessage = 'Failed to update user'

      if (response.status === 401) {
        errorMessage = 'Unauthorized. Please login again.'
      } else if (response.status === 403) {
        errorMessage = 'You do not have permission to update users.'
      } else if (response.status === 404) {
        errorMessage = 'User not found.'
      }

      return {
        success: false,
        error: errorMessage
      }
    }

    // Parse the JSON response
    const data = await response.json()

    return {
      success: true,
      data: data.data
    }
  } catch (error) {
    console.error('Update user API error:', error)

    return {
      success: false,
      error: 'An unexpected error occurred while updating user'
    }
  }
}

/**
 * Get all participants API call
 * @returns Response with all participants
 */
export const getAllParticipantsApi = async () => {
  try {
    // Get the token
    const token = getAuthToken()

    // Create headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }

    // Add token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Make the request
    const response = await fetch(API_ENDPOINTS.PARTICIPANTS.ALL, {
      method: 'GET',
      headers
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to fetch participants',
        status: response.status,
        data: null
      }
    }

    return {
      success: true,
      data: data, // The API now returns participants with nested details
      status: response.status,
      error: null
    }
  } catch (error) {
    console.error('Error fetching participants:', error)

    return {
      success: false,
      error: 'Network error occurred',
      status: 500,
      data: null
    }
  }
}

/**
 * Gets a participant by ID
 * @param id The participant ID
 * @returns Response with participant details
 */
export const getParticipantByIdApi = async (id: number) => {
  try {
    // Get the token
    const token = getAuthToken()

    // Create headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }

    // Add token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Make the request
    const response = await fetch(API_ENDPOINTS.PARTICIPANTS.GET_BY_ID(id), {
      method: 'GET',
      headers
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Failed to fetch participant with ID ${id}`,
        status: response.status,
        data: null
      }
    }

    return {
      success: true,
      data: data, // The API now returns participant with nested details
      status: response.status,
      error: null
    }
  } catch (error) {
    console.error(`Error fetching participant with ID ${id}:`, error)

    return {
      success: false,
      error: 'Network error occurred',
      status: 500,
      data: null
    }
  }
}

/**
 * Register participant API call
 * @param participantData The participant data to register
 * @returns The response from the register participant API
 */
export const registerParticipantApi = async (participantData: {
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
  file?: string
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
      let validationErrors = null

      try {
        const errorData = await response.json()

        errorMessage = errorData.message || errorMessage
        validationErrors = errorData.validationErrors || null
      } catch (e) {
        // If parsing JSON fails, use the default error message
      }

      return {
        success: false,
        error: errorMessage,
        validationErrors,
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

/**
 * Get next available start number API call
 * @returns The response from the get next start number API
 */
export const getNextStartNumberApi = async () => {
  try {
    console.log('Get next start number API call')

    const response = await fetchWithAuthFallback(API_ENDPOINTS.PARTICIPANTS.GET_NEXT_START_NUMBER, {
      method: 'GET'
    })

    if (!response.ok) {
      // Handle error response
      let errorMessage = 'Failed to fetch next start number'

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
    console.error('Get next start number API error:', error)

    return {
      success: false,
      error: 'Network error occurred',
      status: 500,
      data: null
    }
  }
}

/**
 * Get user by ID API call
 * @param userId The ID of the user to get
 * @returns The response from the get user by ID API
 */
export const getUserByIdApi = async (userId: number) => {
  try {
    console.log('Getting user with ID:', userId)
    const url = API_ENDPOINTS.USERS.GET_BY_ID(userId)

    console.log('Get user URL:', url)

    const response = await fetchWithAuthFallback(url, {
      method: 'GET'
    })

    if (!response.ok) {
      let errorMessage = 'Failed to get user'

      if (response.status === 401) {
        errorMessage = 'Unauthorized. Please login again.'
      } else if (response.status === 403) {
        errorMessage = 'You do not have permission to view this user.'
      } else if (response.status === 404) {
        errorMessage = 'User not found.'
      }

      return {
        success: false,
        error: errorMessage
      }
    }

    // Parse the JSON response
    const data = await response.json()

    return {
      success: true,
      data: data.data
    }
  } catch (error) {
    console.error('Get user API error:', error)

    return {
      success: false,
      error: 'An unexpected error occurred while fetching user'
    }
  }
}

/**
 * Create user API call
 * @param userData The user data to create
 * @returns The response from the create user API
 */
export const createUserApi = async (userData: Partial<User>) => {
  try {
    console.log('Creating user:', userData)
    const url = API_ENDPOINTS.USERS.CREATE

    console.log('Create user URL:', url)

    const response = await fetchWithAuthFallback(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      let errorMessage = 'Failed to create user'
      let validationErrors = null

      if (response.status === 401) {
        errorMessage = 'Unauthorized. Please login again.'
      } else if (response.status === 403) {
        errorMessage = 'You do not have permission to create users.'
      } else if (response.status === 422) {
        try {
          const errorData = await response.json()

          errorMessage = errorData.message || errorMessage
          validationErrors = errorData.errors || null
        } catch (e) {
          // If parsing JSON fails, use the default error message
        }
      }

      return {
        success: false,
        error: errorMessage,
        validationErrors
      }
    }

    // Parse the JSON response
    const data = await response.json()

    return {
      success: true,
      data: data.data
    }
  } catch (error) {
    console.error('Create user API error:', error)

    return {
      success: false,
      error: 'An unexpected error occurred while creating user'
    }
  }
}

export default API_ENDPOINTS
