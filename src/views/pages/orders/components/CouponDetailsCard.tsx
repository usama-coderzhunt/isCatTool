import { Card, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { getDisplayDateTime } from '@/utils/utility/displayValue'
import CircularLoader from '@/components/CircularLoader'

interface CouponDetailsCardProps {
  couponData: any
  isLoading: boolean
}

const CouponDetailsCard = ({ couponData, isLoading }: CouponDetailsCardProps) => {
  const { t } = useTranslation('global')

  if (isLoading) return <CircularLoader />
  if (!couponData) return null

  return (
    <Card className='w-full flex flex-col rounded-lg overflow-hidden shadow-lg mb-6'>
      <div className='p-6'>
        <div className='grid grid-cols-2 gap-6'>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <Typography variant='body2' color='text.secondary' className='font-medium mb-2'>
              {t('orders.orderDetailsPage.couponDetails.couponCode')}
            </Typography>
            <Typography variant='body1' className='text-gray-800'>
              {couponData?.code}
            </Typography>
          </div>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <Typography variant='body2' color='text.secondary' className='font-medium mb-2'>
              {t('orders.orderDetailsPage.couponDetails.description')}
            </Typography>
            <Typography variant='body1' className='text-gray-800'>
              {couponData?.description}
            </Typography>
          </div>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <Typography variant='body2' color='text.secondary' className='font-medium mb-2'>
              {t('orders.orderDetailsPage.couponDetails.discountType')}
            </Typography>
            <Typography variant='body1' className='capitalize text-gray-800'>
              {couponData?.discount_type}
            </Typography>
          </div>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <Typography variant='body2' color='text.secondary' className='font-medium mb-2'>
              {t('orders.orderDetailsPage.couponDetails.discountValue')}
            </Typography>
            <Typography variant='body1' className='text-gray-800'>
              {couponData?.discount_value}
              {couponData?.discount_type === 'percentage' ? '%' : ''}
            </Typography>
          </div>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <Typography variant='body2' color='text.secondary' className='font-medium mb-2'>
              {t('orders.orderDetailsPage.couponDetails.status')}
            </Typography>
            <Typography variant='body1' className='text-gray-800'>
              {couponData?.is_active
                ? t('orders.orderDetailsPage.couponDetails.active')
                : t('orders.orderDetailsPage.couponDetails.inactive')}
            </Typography>
          </div>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <Typography variant='body2' color='text.secondary' className='font-medium mb-2'>
              {t('orders.orderDetailsPage.couponDetails.validFrom')}
            </Typography>
            <Typography variant='body1' className='text-gray-800'>
              {getDisplayDateTime(couponData?.valid_from)}
            </Typography>
          </div>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <Typography variant='body2' color='text.secondary' className='font-medium mb-2'>
              {t('orders.orderDetailsPage.couponDetails.validUntil')}
            </Typography>
            <Typography variant='body1' className='text-gray-800'>
              {getDisplayDateTime(couponData?.valid_until)}
            </Typography>
          </div>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <Typography variant='body2' color='text.secondary' className='font-medium mb-2'>
              {t('orders.orderDetailsPage.couponDetails.usageLimit')}
            </Typography>
            <Typography variant='body1' className='text-gray-800'>
              {couponData?.usage_limit || t('orders.orderDetailsPage.couponDetails.unlimited')}
            </Typography>
          </div>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <Typography variant='body2' color='text.secondary' className='font-medium mb-2'>
              {t('orders.orderDetailsPage.couponDetails.usedCount')}
            </Typography>
            <Typography variant='body1' className='text-gray-800'>
              {couponData?.used_count}
            </Typography>
          </div>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <Typography variant='body2' color='text.secondary' className='font-medium mb-2'>
              {t('orders.orderDetailsPage.couponDetails.createdAt')}
            </Typography>
            <Typography variant='body1' className='text-gray-800'>
              {getDisplayDateTime(couponData?.created_at)}
            </Typography>
          </div>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <Typography variant='body2' color='text.secondary' className='font-medium mb-2'>
              {t('orders.orderDetailsPage.couponDetails.updatedAt')}
            </Typography>
            <Typography variant='body1' className='text-gray-800'>
              {getDisplayDateTime(couponData?.updated_at)}
            </Typography>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default CouponDetailsCard
