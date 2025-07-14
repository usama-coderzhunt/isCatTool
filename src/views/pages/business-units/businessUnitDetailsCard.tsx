'use client'

import { useTranslation } from 'next-i18next'
import { Card, Typography } from '@mui/material'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

const BusinessUnitDetailsCard = ({ row }: { row: any }) => {
  const { t, i18n } = useTranslation('global')
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
          <div className='w-full'>
            <div className='grid grid-cols-2 gap-x-8'>
              {/* Left Column */}
              <div>
                {/* Name Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('businessUnits.detailsCard.name')}
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {row?.name || '-'}
                  </Typography>
                </div>

                {/* Case Flow Max Cases Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('businessUnits.detailsCard.caseFlowMaxCases')}
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {row?.limits?.caseflow_max_cases || 'N/A'}
                  </Typography>
                </div>
              </div>

              {/* Right Column */}
              <div>
                {/* Case Flow Max Active Users Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('businessUnits.detailsCard.caseFlowMaxActiveUsers')}
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {row?.limits?.caseflow_max_active_users || 'N/A'}
                  </Typography>
                </div>

                {/* Case Flow Max Active Clients Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('businessUnits.detailsCard.caseFlowMaxActiveClients')}
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {row?.limits?.caseflow_max_active_clients || 'N/A'}
                  </Typography>
                </div>
              </div>
            </div>
            {/* Notes Row */}
            <div className='flex w-full items-center py-3 gap-x-4'>
              <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                {t('businessUnits.detailsCard.notes')}
              </Typography>
              <Typography color='text.primary' className='font-medium'>
                {row?.notes ? row?.notes : '-'}
              </Typography>
            </div>

            {/* Description Row */}
            <div className='flex w-full items-center py-3 gap-x-4'>
              <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                {t('businessUnits.detailsCard.description')}
              </Typography>
              <Typography color='text.primary' className='font-medium'>
                {row?.description ? row?.description : '-'}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default BusinessUnitDetailsCard
