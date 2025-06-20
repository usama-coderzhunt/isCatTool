import React, { useEffect, useState } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { usePaymentsHooks } from '@/services/usePaymentsHooks'

interface PaymentDetails {
  order_id: string
  secret: string
  provider_subscription_id: string
  provider: string
}

const PaypalPaymentSuccess = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [provider, setProvider] = useState<string | undefined>('')
  const { useCaptureOneTimePayment } = usePaymentsHooks()
  const capturePayment = useCaptureOneTimePayment(router)

  useEffect(() => {
    const paymentProvider = pathname?.split('/')[pathname?.split('/').length - 2]

    setProvider(paymentProvider)
  }, [pathname])

  // Extract payment details from URL
  const paymentDetails: PaymentDetails = {
    order_id: searchParams?.get('order_id') || '',
    secret: searchParams?.get('secret') || '',
    provider_subscription_id: searchParams?.get('subscription_id') || '',
    provider: provider || ''
  }

  const handleConfirm = async () => {
    try {
      const capturePayload = {
        order_id: paymentDetails.order_id,
        secret: paymentDetails.secret,
        provider_subscription_id: paymentDetails.provider_subscription_id,
        provider: paymentDetails.provider
      }
      await capturePayment.mutate(capturePayload)

      router.push('/dashboard')
    } catch (error) {
      console.error('Payment capture failed:', error)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50'>
      <div className='w-full max-w-md p-8 bg-white rounded-lg shadow-lg text-center'>
        {/* You can replace this with your actual logo */}
        <div className='mb-8'>
          <svg className='w-20 h-20 mx-auto text-green-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
          </svg>
        </div>

        <h1 className='text-2xl font-bold text-gray-800 mb-4'>Success!</h1>

        <p className='text-gray-600 mb-4'>Thank you for your payment, please confirm to continue.</p>

        <button
          onClick={handleConfirm}
          disabled={capturePayment.isLoading}
          className='w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-200 disabled:bg-indigo-400'
        >
          {capturePayment.isLoading ? 'Processing...' : 'Confirm'}
        </button>
      </div>
    </div>
  )
}

export default PaypalPaymentSuccess
