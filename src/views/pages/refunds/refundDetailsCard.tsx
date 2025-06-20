'use client'

import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { Card, Chip, Typography } from '@mui/material'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'

const RefundDetailsCard = ({ row }: { row: any }) => {
  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params

  const isSuperUser = getDecryptedLocalStorage('isSuperUser')
  const userRole = getDecryptedLocalStorage('userRole')

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  const handleStatusDisplay = (status: string): JSX.Element => {
    const { t } = useTranslation('global')
    const statusConfig: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'info' | 'default' }> =
      {
        pending: {
          label: t('refunds.table.pending'),
          color: 'warning'
        },
        processing: {
          label: t('refunds.table.processing'),
          color: 'info'
        },
        completed: {
          label: t('refunds.table.completed'),
          color: 'success'
        },
        failed: {
          label: t('refunds.table.failed'),
          color: 'error'
        },
        cancelled: {
          label: t('refunds.table.cancelled'),
          color: 'error'
        },
        partially_refunded: {
          label: t('refunds.table.partially_refunded'),
          color: 'warning'
        }
      }
    const config = statusConfig[status] || { label: '-', color: 'default' }
    return (
      <Chip
        label={config.label}
        color={config.color}
        size='small'
        variant='tonal'
        className={`${config.label === '-' ? 'w-[58.22]' : ''}`}
      />
    )
  }

  return (
    <>
      <Card className='w-full max-w-full flex flex-col md:flex-row rounded-lg overflow-hidden shadow-lg'>
        <div className='px-6 py-4 w-full'>
          <div className='w-full flex flex-col'>
            <div className='grid grid-cols-2 gap-x-8'>
              {/* Left Column */}
              <div>
                {/* Reference ID Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('refunds.refundDetailsCard.refundReferenceId')}
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {row.refund_reference_id}
                  </Typography>
                </div>

                {/* Status Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('refunds.refundDetailsCard.status')}
                  </Typography>
                  {handleStatusDisplay(row.status)}
                </div>
              </div>

              {/* Right Column */}
              <div>
                {/* Subtotal Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('refunds.refundDetailsCard.amount')}
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    <span dir='ltr'>{row.amount?.length ? row.amount : '-'}</span>
                  </Typography>
                </div>
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('refunds.refundDetailsCard.reason')}
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    <span dir='ltr'>{row.reason?.length ? row.reason : '-'}</span>
                  </Typography>
                </div>
              </div>
            </div>
            {/* Notes Row */}
            {(isSuperUser || userRole === 'Admin') && (
              <div className='w-full mt-4'>
                <div className='flex gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('refunds.refundDetailsCard.notes')}
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {row.notes?.length ? row.notes : '-'}
                  </Typography>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </>
  )
}

export default RefundDetailsCard
