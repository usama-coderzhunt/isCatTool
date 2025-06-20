'use client'

import { Card, Typography } from '@mui/material'
import CircularLoader from '@/components/CircularLoader'
import type { Staff } from '@/types/staffTypes'
import { useTranslation } from 'next-i18next'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

interface StaffDetailsProps {
  staffDetails: Staff | undefined
  isLoading: boolean
  positionName: string
}

const StaffDetails = ({ staffDetails: staff, isLoading, positionName }: StaffDetailsProps) => {
  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  return (
    <div className='w-full flex flex-col gap-y-10'>
      <Card className='w-full max-w-full flex flex-col rounded-lg overflow-hidden shadow-lg'>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <CircularLoader />
          </div>
        ) : (
          <div className='px-6 py-4 w-full'>
            <div className='w-full flex flex-col'>
              <div className='grid grid-cols-2 gap-x-8'>
                {/* Left Column */}
                <div>
                  <div className='flex items-center py-3 gap-x-4'>
                    <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                      {t('staffDetails.fullName')}:
                    </Typography>
                    <Typography color='text.secondary' className='flex-1'>
                      {`${staff?.first_name} ${staff?.middle_name || ''} ${staff?.last_name}`}
                    </Typography>
                  </div>
                  <div className='flex items-center py-3 gap-x-4'>
                    <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                      {t('staffDetails.email')}:
                    </Typography>
                    <Typography color='text.secondary' className='flex-1'>
                      {staff?.email}
                    </Typography>
                  </div>
                  <div className='flex items-center py-3 gap-x-4'>
                    <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                      {t('staffDetails.phoneNumber')}:
                    </Typography>
                    <Typography color='text.secondary' className='flex-1'>
                      <span dir="ltr">{staff?.phone_number}</span>
                    </Typography>
                  </div>
                </div>
                {/* Right Column */}
                <div>
                  <div className='flex items-center py-3 gap-x-4'>
                    <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                      {t('staffDetails.position')}:
                    </Typography>
                    <Typography color='text.secondary' className='flex-1'>
                      {positionName}
                    </Typography>
                  </div>
                  <div className='flex items-center py-3 gap-x-4'>
                    <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                      {t('staffDetails.status')}:
                    </Typography>
                    <Typography color='text.secondary' className='flex-1'>
                      {staff?.is_active ? t('staffDetails.active') : t('staffDetails.inactive')}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default StaffDetails 
