// Next Imports
import type { Metadata } from 'next'

// Component Imports
// import Register from '@/views/Register'
import Register from '@/views/Register'

export const metadata: Metadata = {
  title: 'Register',
  description: 'Register to your account'
}

const RegisterPage = async () => {
  // Vars

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] p-6'>
      <Register />
    </div>
  )
}

export default RegisterPage
