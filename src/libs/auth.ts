// Third-party Imports
import Credentials from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import type { NextAuthOptions } from 'next-auth'
import type { Adapter } from 'next-auth/adapters'

// API Config Imports
import { loginApi, setAuthToken, getAuthToken } from '@/utils/apiConfig'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,

  // ** Configure one or more authentication providers
  // ** Please refer to https://next-auth.js.org/configuration/options#providers for more `providers` options
  providers: [
    Credentials({
      // ** The name to display on the sign in form (e.g. 'Sign in with...')
      // ** For more details on Credentials Provider, visit https://next-auth.js.org/providers/credentials
      name: 'Credentials',
      type: 'credentials',

      /*
       * As we are using our own Sign-in page, we do not need to change
       * username or password attributes manually in following credentials object.
       */
      credentials: {},
      async authorize(credentials) {
        try {
          // Make a request to your backend API to authenticate the user
          const { username, password } = credentials as {
            username: string
            password: string
          }

          // Call the login API
          const response = await loginApi(username, password)

          if (!response.success) {
            throw new Error(response.error || 'Authentication failed')
          }

          const { data } = response

          // Log the response data to check the token format
          console.log('Login API response data in authorize:', {
            token: data.token ? `${data.token.substring(0, 10)}...` : 'No token',
            username: data.username,
            role: data.role
          });

          // Return the user object
          
          return {
            id: username,
            name: data.username,
            email: data.email,
            role: data.role,
            organizerId: data.organizerId || '0', // Add organizerId, default to '0' for non-EO users
            accessToken: data.token
          }
        } catch (error) {
          console.error('Error in authorize:', error)
          return null
        }
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    })

    // ** ...add more providers here
  ],

  // ** Please refer to https://next-auth.js.org/configuration/options#session for more `session` options
  session: {
    /*
     * Choose how you want to save the user session.
     * The default is `jwt`, an encrypted JWT (JWE) stored in the session cookie.
     * If you use an `adapter` however, NextAuth default it to `database` instead.
     * You can still force a JWT session by explicitly defining `jwt`.
     * When using `database`, the session cookie will only contain a `sessionToken` value,
     * which is used to look up the session in the database.
     * If you use a custom credentials provider, user accounts will not be persisted in a database by NextAuth.js (even if one is configured).
     * The option to use JSON Web Tokens for session tokens must be enabled to use a custom credentials provider.
     */
    strategy: 'jwt',

    // ** Seconds - How long until an idle session expires and is no longer valid
    maxAge: 30 * 24 * 60 * 60 // ** 30 days
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#pages for more `pages` options
  pages: {
    signIn: '/login'
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#callbacks for more `callbacks` options
  callbacks: {
    /*
     * While using `jwt` as a strategy, `jwt()` callback will be called before
     * the `session()` callback. So we have to add custom parameters in `token`
     * via `jwt()` callback to make them accessible in the `session()` callback
     */
    async jwt({ token, user }) {
      if (user) {
        console.log('User authenticated, storing token in session storage');
        console.log('User object:', { role: user.role, organizerId: user.organizerId, hasAccessToken: !!user.accessToken });
        
        token.role = user.role;
        token.organizerId = user.organizerId;
        token.accessToken = user.accessToken;
        
        // Store token in session storage for direct API access
        if (user.accessToken) {
          setAuthToken(user.accessToken);
          console.log('Token stored in session storage');
        } else {
          console.log('No access token available to store');
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role
        session.user.organizerId = token.organizerId
        session.organizerId = token.organizerId
        
        // Make sure the token is available in the session
        if (token.accessToken) {
          session.accessToken = token.accessToken
          console.log('Session has access token:', !!session.accessToken);
          
          // Double-check that the token is stored in session storage
          const storedToken = getAuthToken();
          if (!storedToken) {
            console.log('Token not found in session storage, storing it now');
            setAuthToken(token.accessToken as string);
          }
        } else {
          console.log('No access token in token object');
        }
      }
      
      return session
    }
  }
}
