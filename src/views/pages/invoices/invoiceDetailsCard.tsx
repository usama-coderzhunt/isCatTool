'use client'

import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { Card, Typography } from '@mui/material'
import { handleStatusDisplay } from '@/utils/utility/displayInvoicesStatus'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'

const InvoiceDetailsCard = ({ row }: { row: any }) => {
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

  return (
    <>
      <Card className='w-full max-w-full flex flex-col md:flex-row rounded-lg overflow-hidden shadow-lg'>
        <div className='px-6 py-4 w-full'>
          <div className='w-full flex flex-col'>
            <div className='grid grid-cols-2 gap-x-8'>
              {/* Left Column */}
              <div>
                {/* Invoice Number Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('invoices.invoiceDetails.invoiceNumber')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {row.invoice_number}
                  </Typography>
                </div>

                {/* Status Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('invoices.invoiceDetails.status')}:
                  </Typography>
                  {handleStatusDisplay(row.status)}
                </div>
              </div>

              {/* Right Column */}
              <div>
                {/* Subtotal Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('invoices.invoiceDetails.subtotal')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    <span dir='ltr'>{row.subtotal?.length ? row.subtotal : '-'}</span>
                  </Typography>
                </div>
              </div>
            </div>
            {/* Notes Row */}
            {(isSuperUser || userRole === 'Admin') && (
              <div className='w-full mt-4'>
                <div className='flex gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('invoices.invoiceDetails.notes')}:
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

export default InvoiceDetailsCard
