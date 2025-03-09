// Component Imports
import RegisterUser from '@views/apps/user/register'

// This page must be a client component because it uses the registerUserApi which makes fetch calls
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const RegisterUserPage = () => {
  return <RegisterUser />
}

export default RegisterUserPage
