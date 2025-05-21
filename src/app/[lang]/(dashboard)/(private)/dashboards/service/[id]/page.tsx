'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useServicesHooks } from '@/services/useServicesHooks'
import ServiceDetails from '@/views/pages/services/serviceDetails'
import ServicesPlansListing from '@/views/pages/services/servicesPlansListings'
import { useTranslation } from 'react-i18next'
import { Typography } from '@mui/material'

const ServiceDetailsPage = () => {
  const params = useParams() as { lang: string; id: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')
  const router = useRouter()

  const handleNavigation = () => {
    router.push(`/${currentLocale}/apps/services`)
  }

  // states
  const [serviceId, setServiceId] = useState<number>()

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  useEffect(() => {
    setServiceId(Number(params.id))
  }, [params.id])

  // hooks
  const { getServiceById } = useServicesHooks()
  const { data: serviceData, isLoading } = getServiceById(Number(serviceId))

  return (
    <div className='w-full flex flex-col gap-y-10'>
      <Typography variant='h3'>{t('services.serviceDetails')}</Typography>
      <ServiceDetails serviceDetails={serviceData} isLoading={isLoading} handleBtnClick={handleNavigation} />
      {serviceId && (
        <div>
          <ServicesPlansListing serviceId={serviceId} serviceData={serviceData} />
        </div>
      )}
    </div>
  )
}

export default ServiceDetailsPage
