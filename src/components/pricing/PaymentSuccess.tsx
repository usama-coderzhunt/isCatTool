import React, { useEffect, useState, useRef } from 'react'
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { usePaymentsHooks } from '@/services/usePaymentsHooks'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'
import { useAuthStore } from '@/store/useAuthStore'
interface PaymentDetails {
  stripe_session_id: string
  order_id: string
  provider: string
  payer_id: string
  secret: string
  provider_order_id: string
  provider_subscription_id: string | null
}

const PaymentSuccess = () => {
  const { t } = useTranslation('global')
  const { lang } = useParams() as { lang: string }
  const currentLocale = Array.isArray(lang) ? lang[0] : lang
  const { i18n } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [provider, setProvider] = useState<string | undefined>('')
  const { useCaptureOneTimePayment } = usePaymentsHooks()
  const capturePayment = useCaptureOneTimePayment(router)
  const hasAttemptedCapture = useRef(false)
  const { setUserPermissions } = useAuthStore()

  const isSuperUser = getDecryptedLocalStorage('isSuperUser')
  const userRole = getDecryptedLocalStorage('userRole')

  useEffect(() => {
    const currentProvider = searchParams?.get('provider') || ''
    setProvider(currentProvider)
  }, [searchParams])

  const currentLangLocalStorage = localStorage.getItem('currentLang')
  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  // Extract payment details from URL
  const paymentDetails: PaymentDetails = {
    stripe_session_id: searchParams?.get('session_id') || '',
    order_id: searchParams?.get('orderId') || searchParams?.get('order_id') || '',
    provider: searchParams?.get('provider') || '',
    payer_id: searchParams?.get('PayerID') || searchParams?.get('payer_id') || '',
    secret: searchParams?.get('secret') || '',
    provider_order_id: searchParams?.get('token') || searchParams?.get('ba_token') || '',
    provider_subscription_id: searchParams?.get('subscription_id') || null
  }

  useEffect(() => {
    const capturePaymentAutomatically = async () => {
      if (hasAttemptedCapture.current) {
        return
      }
      if (!paymentDetails.order_id || !paymentDetails.provider) {
        toast.error(t('paymentsFeatureToasts.missingRequiredFieldsForPaymentCapture'))
        return
      }
      if (paymentDetails.provider === 'paypal' && !paymentDetails.provider_order_id) {
        toast.error(t('paymentsFeatureToasts.missingPayPalToken'))
        return
      }

      toast.info(t('paymentsFeatureToasts.attemptingPaymentCapture') + JSON.stringify(paymentDetails))
      hasAttemptedCapture.current = true

      try {
        const capturePayload = {
          ...(paymentDetails.provider === 'stripe'
            ? { stripe_session_id: paymentDetails.stripe_session_id }
            : paymentDetails.provider === 'paypal' && paymentDetails.provider_subscription_id
              ? { provider_subscription_id: paymentDetails.provider_subscription_id }
              : { provider_order_id: paymentDetails.provider_order_id }),
          order_id: paymentDetails.order_id,
          provider: paymentDetails.provider,
          ...(paymentDetails.provider === 'paypal' && paymentDetails.provider_subscription_id
            ? {}
            : { payer_id: paymentDetails.payer_id }),
          secret: paymentDetails.secret
        }
        await capturePayment.mutate(capturePayload)
        toast.success(t('paymentsFeatureToasts.oneTimePaymentCapturedSuccess'))

        // Only fetch and set user permissions if payment capture was successful
        if (!isSuperUser || userRole !== 'Admin') {
          const fetchUserPermissions = async (retryCount = 0) => {
            try {
              await new Promise(resolve => setTimeout(resolve, 2000))
              const { data: loggedInUser } = await axiosInstance.get(API_ROUTES.AUTH.userDetails, {
                requiresAuth: true
              } as any)

              if (loggedInUser?.user_permissions && loggedInUser.user_permissions.length > 0) {
                setUserPermissions(loggedInUser.user_permissions)
                return true
              } else {
                if (retryCount < 3) {
                  return fetchUserPermissions(retryCount + 1)
                } else {
                  toast.error(t('paymentsFeatureToasts.unableToFetchUserPermissions'))
                  return false
                }
              }
            } catch (error) {
              if (retryCount < 3) {
                return fetchUserPermissions(retryCount + 1)
              } else {
                toast.error(t('paymentsFeatureToasts.unableToUpdatePermissions'))
                return false
              }
            }
          }
          await fetchUserPermissions()
        }

        router.push(`/${currentLangLocalStorage}/dashboard`)
      } catch (error) {
        toast.error(t('paymentsFeatureToasts.paymentCaptureFailed'))
        router.push(`/${currentLangLocalStorage}/apps/orders`)
      }
    }

    if (provider) {
      capturePaymentAutomatically()
    }
  }, [provider, paymentDetails, capturePayment, router])

  return (
    <div
      className='flex flex-col items-center justify-center min-h-screen bg-gray-50'
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#F9FAFB'
      }}
    >
      <div
        className='w-full max-w-md p-8 bg-white rounded-lg shadow-lg text-center'
        style={{
          width: '100%',
          maxWidth: '28rem',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          textAlign: 'center',
          margin: 'auto'
        }}
      >
        <div className='mb-8' style={{ marginBottom: '2rem' }}>
          <svg
            className='w-20 h-20 mx-auto text-green-500'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            style={{ width: '5rem', height: '5rem', margin: '0 auto', color: '#10B981' }}
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
          </svg>
        </div>

        <h1
          className='text-2xl font-bold text-gray-800 mb-4'
          style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F2937', marginBottom: '1rem' }}
        >
          Payment Successful!
        </h1>

        <p className='text-gray-600 mb-4' style={{ color: '#4B5563', marginBottom: '1rem' }}>
          Please wait while we process your payment...
        </p>

        <button
          disabled={true}
          className='w-full bg-primary text-white py-3 px-6 rounded-lg transition duration-200'
          style={{
            width: '100%',
            backgroundColor: '#818CF8',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            transition: 'background-color 0.2s',
            cursor: 'not-allowed',
            outline: 'none',
            border: 'none'
          }}
        >
          {capturePayment.isLoading ? 'Processing Payment Verification...' : 'Redirecting...'}
        </button>
      </div>
    </div>
  )
}

export default PaymentSuccess
