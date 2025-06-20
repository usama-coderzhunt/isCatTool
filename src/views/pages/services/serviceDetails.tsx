import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import { Button, Card, Typography } from '@mui/material'

import CircularLoader from '@/components/CircularLoader'
import { ServiceTypes } from '@/types/services'
import { getDisplayDateTime } from '@/utils/utility/displayValue'

const ServiceDetails = ({
  serviceDetails,
  isLoading,
  handleBtnClick
}: {
  serviceDetails: ServiceTypes
  isLoading: boolean
  handleBtnClick: any
}) => {
  const { t } = useTranslation('global')

  return (
    <div className='w-full'>
      <Card className='w-full flex flex-col rounded-lg overflow-hidden shadow-lg'>
        {serviceDetails?.image && (
          <div className='relative w-full h-[250px] overflow-hidden'>
            <Image
              src={serviceDetails.image}
              alt='service-image'
              fill
              priority
              className='object-cover'
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            />
          </div>
        )}
        {isLoading ? (
          <div className='w-full h-full flex items-center justify-center py-10'>
            <CircularLoader />
          </div>
        ) : !serviceDetails ? (
          <div className='w-full h-full flex items-center justify-center py-10'>
            <Typography variant='h6'>{t('services.noServiceDataFound')}</Typography>
          </div>
        ) : (
          <>
            <div className='p-6'>
              {/* Service Name */}
              <Typography variant='h4' className='font-bold mb-4'>
                {serviceDetails.name}
              </Typography>

              {/* Short Description */}
              <Typography variant='h6' className='mb-6'>
                {serviceDetails.short_description ? serviceDetails.short_description.replace(/<[^>]*>/g, '') : '-'}
              </Typography>

              {/* Description */}
              <div className='mb-8'>
                <Typography variant='body1' className='whitespace-pre-lin'>
                  {serviceDetails.description ? serviceDetails.description.replace(/<[^>]*>/g, '') : '-'}
                </Typography>
              </div>

              {/* Additional Info */}
              <div className='grid grid-cols-2 gap-6 mb-8'>
                <div className='bg-surfacePaper p-4 rounded-lg'>
                  <Typography variant='body2' className='font-medium mb-2'>
                    {t('services.table.createdAt')}
                  </Typography>
                  <Typography variant='body1'>{getDisplayDateTime(serviceDetails.created_at)}</Typography>
                </div>
                <div className='bg-surfacePaper p-4 rounded-lg'>
                  <Typography variant='body2' className='font-medium mb-2'>
                    {t('services.table.updatedAt')}
                  </Typography>
                  <Typography variant='body1'>{getDisplayDateTime(serviceDetails.updated_at)}</Typography>
                </div>
              </div>

              {/* Back Button */}
              <div className='w-full flex items-center justify-start'>
                <Button onClick={handleBtnClick} variant='contained' color='primary' className='shadow-lg px-6 py-2'>
                  {t('services.backToServices')}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

export default ServiceDetails
