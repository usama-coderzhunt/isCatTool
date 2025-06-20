'use client'

import { useEffect, useLayoutEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { useTranslation } from 'react-i18next'

import { useColorScheme } from '@mui/material/styles'

import { useServicesHooks } from '@/services/useServicesHooks'
import ServicePlans from '@/views/pages/services/servicesPlansListings'
import ServiceDetailsHeroSection from '@/views/pages/services/servicesDetailsHeroSection'

import ServiceFeaturesList from '@/views/pages/services/serviceFeaturesList'
import ServiceFAQS from '@/views/pages/services/serviceFaqs'
import CustomerReviews from '@/views/front-pages/landing-page/CustomerReviews'
import Footer from '@/views/front-pages/landing-page/Footer'
import ServiceTestimonials from '@/views/pages/services/serviceTestimonials'

const ServiceDetailsPage = () => {
  const params = useParams() as { lang: string; id: string }
  const { lang: currentLocale } = params
  const { i18n } = useTranslation('global')
  const { mode: muiMode } = useColorScheme()
  const mode = muiMode === 'system' ? 'light' : muiMode || 'light'

  // States
  const [serviceId, setServiceId] = useState<string | undefined>()

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  useLayoutEffect(() => {
    setServiceId(params.id)
  }, [params.id])

  // Hooks
  const { getFrontPagesServiceById } = useServicesHooks()
  const { data: serviceData, isLoading } = getFrontPagesServiceById(serviceId)

  console.log('serviceData inside serviceDetailsPage', serviceData?.id)

  return (
    <>
      <ServiceDetailsHeroSection mode={mode} serviceData={serviceData} loading={isLoading} />
      <div className='w-full flex flex-col gap-y-8 pt-8'>
        <ServiceFeaturesList serviceData={serviceData} loading={isLoading} />
        {serviceId && (
          <div className='mt-8 bg-backgroundPaper'>
            <ServicePlans serviceId={serviceData?.id} serviceData={serviceData} />
          </div>
        )}
        <ServiceFAQS serviceData={serviceData} loading={isLoading} />
        <ServiceTestimonials serviceId={serviceData?.id} />
      </div>
      <Footer />
    </>
  )
}

export default ServiceDetailsPage
