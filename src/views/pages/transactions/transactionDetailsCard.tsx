import { useTranslation } from 'next-i18next'
import { Button, Card, Typography, Chip } from '@mui/material'
import CircularLoader from '@/components/CircularLoader'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'
import { getDisplayDateTime } from '@/utils/utility/displayValue'
import { TransactionsTypes } from '@/types/transactionsTypes'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Image from 'next/image'

const TransactionDetailsCard = ({
  transactionDetails,
  isLoading
}: {
  transactionDetails: TransactionsTypes
  isLoading: boolean
}) => {
  const { t } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params

  const isSuperUser = getDecryptedLocalStorage('isSuperUser')
  const userRole = getDecryptedLocalStorage('userRole')

  const handleStatusDisplay = (status: string) => {
    const statusConfig: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'info' | 'default' }> =
      {
        initiated: {
          label: t('transactions.table.statuses.initiated'),
          color: 'info'
        },
        processing: {
          label: t('transactions.table.statuses.processing'),
          color: 'info'
        },
        completed: {
          label: t('transactions.table.statuses.completed'),
          color: 'success'
        },
        failed: {
          label: t('transactions.table.statuses.failed'),
          color: 'error'
        },
        refunded: {
          label: t('transactions.table.statuses.refunded'),
          color: 'error'
        },
        partially_refunded: {
          label: t('transactions.table.statuses.partially_refunded'),
          color: 'warning'
        },
        cancelled: {
          label: t('transactions.table.statuses.cancelled'),
          color: 'error'
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
    <div className='w-full'>
      <Card className='w-full flex flex-col rounded-lg overflow-hidden shadow-lg px-8 py-6 min-h-[250px]'>
        {isLoading ? (
          <div className='flex flex-1 items-center justify-center min-h-[180px]'>
            <CircularLoader />
          </div>
        ) : !transactionDetails ? (
          <div className='flex flex-1 items-center justify-center min-h-[180px]'>
            <Typography variant='h6'>{t('transactions.transactionDetails.noData')}</Typography>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-2 gap-x-12'>
              {/* Left Column */}
              <div className='flex flex-col gap-y-4'>
                {/* Reference ID */}
                <div className='flex items-center'>
                  <Typography variant='subtitle1' className='font-bold w-36'>
                    {t('transactions.transactionDetails.referenceId')}:
                  </Typography>
                  <Typography variant='body1'>{transactionDetails.reference_id || '-'}</Typography>
                </div>
                {/* Amount */}
                <div className='flex items-center'>
                  <Typography variant='subtitle1' className='font-bold w-36'>
                    {t('transactions.transactionDetails.amount')}:
                  </Typography>
                  <Typography variant='body1'>${transactionDetails.amount || '-'}</Typography>
                </div>
                {/* Notes */}
                {isSuperUser ||
                  (userRole === 'Admin' && (
                    <div className='flex items-center'>
                      <Typography variant='subtitle1' className='font-bold w-36'>
                        {t('transactions.transactionDetails.notes')}:
                      </Typography>
                      <Typography variant='body1'>{transactionDetails.notes || '-'}</Typography>
                    </div>
                  ))}
              </div>
              {/* Right Column */}
              <div className='flex flex-col gap-y-4'>
                {/* Status */}
                <div className='flex items-center'>
                  <Typography variant='subtitle1' className='font-bold w-36'>
                    {t('transactions.transactionDetails.status')}:
                  </Typography>
                  {handleStatusDisplay(transactionDetails.status)}
                </div>
                {/* Created Date */}
                <div className='flex items-center'>
                  <Typography variant='subtitle1' className='font-bold w-36'>
                    {t('transactions.transactionDetails.createdAt')}:
                  </Typography>
                  <Typography variant='body1'>{getDisplayDateTime(transactionDetails.created_at) || '-'}</Typography>
                </div>
                {/* Updated Date */}
                <div className='flex items-center'>
                  <Typography variant='subtitle1' className='font-bold w-36'>
                    {t('transactions.transactionDetails.updatedAt')}:
                  </Typography>
                  <Typography variant='body1'>{getDisplayDateTime(transactionDetails.updated_at) || '-'}</Typography>
                </div>
              </div>
            </div>
            {/* Back Button */}
            <div className='w-full flex items-center justify-start mt-10'>
              <Link href={`/${currentLocale}/apps/transactions`}>
                <Button variant='contained' color='primary' className='shadow-2xl'>
                  {t('transactions.transactionDetails.backToTransactions')}
                </Button>
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

export default TransactionDetailsCard
