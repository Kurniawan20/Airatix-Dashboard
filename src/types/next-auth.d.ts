import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {

  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      role: string;
      organizerId?: string;
      accessToken: string;
    } & DefaultSession['user'];
    accessToken?: string;
    organizerId?: string;
  }

  interface User {
    role: string;
    organizerId?: string;
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {

  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    role: string;
    organizerId?: string;
    accessToken: string;
  }
}
