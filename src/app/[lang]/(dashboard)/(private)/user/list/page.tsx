'use client'

// Component Imports
import UserList from '@views/apps/user/list'

// Next.js exports
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const UserListApp = () => {
  return <UserList />
}

export default UserListApp
