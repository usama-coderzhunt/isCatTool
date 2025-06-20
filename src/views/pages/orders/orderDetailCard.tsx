'use client'

import { useTranslation } from 'next-i18next'
import { Card, Typography, Button } from '@mui/material'
import { useParams, useRouter } from 'next/navigation'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { useEffect } from 'react'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'

const OrderDetailCard = ({ row }: { row: any }) => {
  const { t, i18n } = useTranslation('global')
  const router = useRouter()
  const userPermissions = useAuthStore(state => state.userPermissions)
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params

  const isSuperUser = getDecryptedLocalStorage('isSuperUser')
  const userRole = getDecryptedLocalStorage('userRole')

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  return (
    <Card className='w-full max-w-full flex flex-col rounded-lg overflow-hidden shadow-lg'>
      <div className='px-6 py-4 w-full'>
        <div className='w-full flex flex-col'>
          <div className='w-full'>
            <div className='grid grid-cols-2 gap-x-8'>
              {/* Left Column */}
              <div>
                {/* Order Number */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('orders.orderDetailsCard.orderNumber')}
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {row.order_number || '-'}
                  </Typography>
                </div>

                {/* Order Type */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('orders.orderDetailsCard.orderType')}
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {row.is_subscription
                      ? t('orders.orderDetailsCard.subscription')
                      : t('orders.orderDetailsCard.oneTime')}
                  </Typography>
                </div>
              </div>

              {/* Right Column */}
              <div>
                {/* Amount */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('orders.orderDetailsCard.amount')}
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {row.amount || '-'}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Short Description Row */}
            {(isSuperUser || userRole === 'Admin') && (
              <div className='flex w-full items-center py-3 gap-x-4'>
                <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                  {t('orders.orderDetailsCard.notes')}
                </Typography>
                <Typography color='text.primary' className='font-medium'>
                  {row.notes ? row.notes : '-'}
                </Typography>
              </div>
            )}
          </div>
          {/* <div className='flex justify-end mt-2'>
                        {hasPermissions(userPermissions, ['view_transservice']) && (
                            <Button
                                sx={{
                                    width: 'max-content',
                                    padding: '0.5rem 1rem'
                                }}
                                variant='contained'
                                color='primary'
                                onClick={() => router.push(`/${currentLocale}/dashboard/service/${row.id}`)}
                            >
                                {t('services.openServiceDetails')}
                            </Button>
                        )}
                    </div> */}
        </div>
      </div>
    </Card>
  )
}

export default OrderDetailCard
