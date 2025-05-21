'use client'

import { useTranslation } from 'next-i18next'
import { Card, Typography, Button } from '@mui/material'
import { useParams, useRouter } from 'next/navigation'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { useEffect } from 'react'

const ServiceDetailsCard = ({ row }: { row: any }) => {
  const { t, i18n } = useTranslation('global')
  const router = useRouter()
  const userPermissions = useAuthStore(state => state.userPermissions)
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  return (
    <Card className='w-full max-w-full flex flex-col rounded-lg overflow-hidden shadow-lg'>
      <div className='px-6 py-4 w-full'>
        <div className='w-full flex flex-col'>
          <div className="w-full">
            <div className='grid grid-cols-2 gap-x-8'>
              {/* Left Column */}
              <div>
                {/* Name Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('services.name')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {row.name || '-'}
                  </Typography>
                </div>

                {/* Status Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('services.status')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {row.is_active ? t('services.active') : t('services.inactive')}
                  </Typography>
                </div>
              </div>

              {/* Right Column */}
              <div>
                {/* Billing Cycle Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('services.billingCycle')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {row.billing_cycle || '-'}
                  </Typography>
                </div>

                {/* Trial Period Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('services.trialPeriod')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {row.trial_period_days ? `${row.trial_period_days} ${t('services.days')}` : '-'}
                  </Typography>
                </div>
              </div>
            </div>
            {/* Short Description Row */}
            <div className='flex w-full items-center py-3 gap-x-4'>
              <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                {t('services.shortDescription')}:
              </Typography>
              <Typography color='text.primary' className='font-medium'>
                {row.short_description ? row.short_description.replace(/<[^>]*>/g, '') : '-'}
              </Typography>
            </div>
          </div>
          <div className='flex justify-end mt-2'>
            {hasPermissions(userPermissions, ['view_transservice']) && (
              <Button
                sx={{
                  width: 'max-content',
                  padding: '0.5rem 1rem'
                }}
                variant='contained'
                color='primary'
                onClick={() => router.push(`/${currentLocale}/dashboards/service/${row.id}`)}
              >
                {t('services.openServiceDetails')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ServiceDetailsCard 
