// Next Imports
import type { Metadata } from 'next'

// Component Imports
// import Login from '@/views/Login'
import Login from '@/views/Login'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account'
}

const LoginPage = async () => {
  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] p-6'>
      <Login />
    </div>
  )
}

export default LoginPage
