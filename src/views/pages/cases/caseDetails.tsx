import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { Button, Card, Typography } from '@mui/material'
import { useParams } from 'next/navigation'

import CircularLoader from '@/components/CircularLoader'
import { CaseTypes } from '@/types/cases'

const CaseDetails = ({ caseDetails, isLoading }: { caseDetails: CaseTypes; isLoading: boolean }) => {
  const { t } = useTranslation('global')
  const params = useParams()
  const currentLocale = params.lang as string

  return (
    <Card className='w-full max-w-full flex flex-col rounded-lg overflow-hidden shadow-lg'>
      {isLoading ? (
        <div className='w-full h-full flex items-center justify-center py-10'>
          <CircularLoader />
        </div>
      ) : !caseDetails || Object.keys(caseDetails).length === 0 ? (
        <div className='w-full h-full flex items-center justify-center py-10'>
          <Typography variant='h6'>{t('cases.details.noData')}</Typography>
        </div>
      ) : (
        <div className='px-6 py-4 w-full'>
          <div className='w-full flex flex-col'>
            <div className='grid grid-cols-2 gap-x-8'>
              {/* Left Column */}
              <div>
                {/* Title Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('cases.details.title')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {caseDetails?.title}
                  </Typography>
                </div>

                {/* Summary Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('cases.details.summary')}:
                  </Typography>
                  <Typography
                    color='text.secondary'
                    className='flex-1'
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'normal',
                      lineHeight: '1.2em'
                    }}
                  >
                    {caseDetails?.summary}
                  </Typography>
                </div>

                {/* Payment Schedule Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('cases.details.paymentSchedule')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {caseDetails?.payment_schedule?.length ? caseDetails?.payment_schedule : '-'}
                  </Typography>
                </div>
              </div>

              {/* Right Column */}
              <div>
                {/* Cost Amount Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('cases.details.costAmount')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {caseDetails?.cost_amount}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          <div className='w-full flex items-center justify-start mt-10'>
            <Link href={`/${currentLocale}/apps/cases`}>
              <Button
                variant='outlined'
                color='inherit'
                className='min-w-fit inline-flex items-center justify-center p-2 rounded-full'
              >
                <i className='tabler-arrow-left'></i>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  )
}

export default CaseDetails
