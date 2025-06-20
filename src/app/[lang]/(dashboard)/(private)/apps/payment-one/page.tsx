'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, Typography, Grid, Box } from '@mui/material'
import { ServicePlanTypes } from '@/types/servicesPlans'
import { useRouter } from 'next/navigation'
import PaymentForm from './components/PaymentForm'

const PaymentPageOne = () => {
  const router = useRouter()
  const [planData, setPlanData] = useState<{ plan: ServicePlanTypes; serviceName: string } | null>(null)

  useEffect(() => {
    const storedData = localStorage.getItem('selectedPlan')
    if (storedData) {
      setPlanData(JSON.parse(storedData))
    } else {
      router.push('/en/apps/services')
    }
  }, [router])

  const handlePaymentSubmit = (data: any) => {
    // console.log('Payment submitted:', { planData, paymentData: data })
    // TODO: Implement payment processing
  }

  if (!planData) {
    return null
  }

  return (
    <div className='py-8'>
      <div className=''>
        <div className=''>
          <Typography variant='h4' className='mb-6'>
            Payment
          </Typography>

          <div className='w-full mt-6 grid grid-cols-12 gap-x-10'>
            <div className='col-span-8'>
              <PaymentForm planData={planData} onSubmit={handlePaymentSubmit} />
            </div>
            <div className='col-span-4'>
              <Card className=''>
                <CardContent className='p-6'>
                  <Box className='space-y-4'>
                    <Box className='space-y-2'>
                      <Box className='flex items-center justify-between'>
                        <Typography color='text.secondary'>Service</Typography>
                        <Typography>{planData.serviceName}</Typography>
                      </Box>

                      <Box className='flex items-center justify-between'>
                        <Typography color='text.secondary'>Plan</Typography>
                        <Typography>{planData.plan.name}</Typography>
                      </Box>

                      <Box className='flex items-center justify-between'>
                        <Typography color='text.secondary'>Price</Typography>
                        <Typography variant='h6' color='primary.main' className='font-bold'>
                          ${planData.plan.price}
                        </Typography>
                      </Box>
                    </Box>

                    <Box className='flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700'>
                      <Typography variant='h6' className='font-bold'>
                        Total
                      </Typography>
                      <Typography variant='h6' color='primary.main' className='font-bold'>
                        ${planData.plan.price}
                      </Typography>
                    </Box>
                  </Box>

                  <Box className='mt-6 flex items-center justify-center gap-8'>
                    {/* PayPal Logo */}
                    <img
                      className='h-8 w-auto dark:hidden'
                      src='https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/paypal.svg'
                      alt='PayPal'
                    />
                    <img
                      className='hidden h-8 w-auto dark:flex'
                      src='https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/paypal-dark.svg'
                      alt='PayPal'
                    />

                    {/* Stripe Logo */}
                    <img
                      className='h-8 w-auto dark:hidden'
                      src='https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/stripe.svg'
                      alt='Stripe'
                    />
                    <img
                      className='hidden h-8 w-auto dark:flex'
                      src='https://flowbite.s3.amazonaws.com/blocks/e-commerce/brand-logos/stripe-dark.svg'
                      alt='Stripe'
                    />

                    {/* Manual Payment Icon */}
                    <Box className='flex items-center justify-center h-8'>
                      <i className='tabler-cash text-2xl text-green-600' />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </div>
          </div>

          <Typography variant='body2' color='text.secondary' className='mt-6 text-center lg:text-left'>
            Payment processed by{' '}
            <a href='#' className='text-primary-700 underline hover:no-underline'>
              Paddle
            </a>{' '}
            for{' '}
            <a href='#' className='text-primary-700 underline hover:no-underline'>
              Your Company
            </a>
          </Typography>
        </div>
      </div>
    </div>
  )
}

export default PaymentPageOne
