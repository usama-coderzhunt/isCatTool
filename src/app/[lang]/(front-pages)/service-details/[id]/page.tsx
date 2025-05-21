'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useServicesHooks } from '@/services/useServicesHooks'
import ServiceDetails from '@/views/pages/services/serviceDetails'
import ServicePlans from '@/views/pages/services/servicesPlansListings'
import { useTranslation } from 'react-i18next'
import { Typography } from '@mui/material'

const ServiceDetailsPage = () => {
  const params = useParams() as { lang: string; id: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')
  const router = useRouter()

  const handleNavigation = () => {
    router.push(`/${currentLocale}/services`)
  }

  // States
  const [serviceId, setServiceId] = useState<number>()

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  useEffect(() => {
    setServiceId(Number(params.id))
  }, [params.id])

  // Hooks
  const { getServiceById } = useServicesHooks()
  const { data: serviceData, isLoading } = getServiceById(Number(serviceId))

  return (
    <div className='w-full flex flex-col gap-y-8 px-6 md:px-12 lg:px-16 py-8 max-w-[100rem] mx-auto'>
      <Typography variant='h3' className='text-3xl md   text-gray-800 tracking-tight'>
        {t('services.serviceDetails')}
      </Typography>
      <div className='bg-white shadow-lg rounded-lg'>
        <ServiceDetails serviceDetails={serviceData} isLoading={isLoading} handleBtnClick={handleNavigation} />
      </div>
      {serviceId && (
        <div className='mt-8'>
          <div>
            <ServicePlans serviceId={serviceId} serviceData={serviceData} />
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceDetailsPage
