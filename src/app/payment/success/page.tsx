'use client'
import PaymentSuccess from '@/components/pricing/PaymentSuccess'
import { CircularProgress } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense, useState } from 'react'

const PaymentSuccessPage = () => {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <Suspense
      fallback={
        <div className='flex justify-center items-center h-screen'>
          <CircularProgress />
        </div>
      }
    >
      <QueryClientProvider client={queryClient}>
        <PaymentSuccess />
      </QueryClientProvider>
    </Suspense>
  )
}

export default PaymentSuccessPage
