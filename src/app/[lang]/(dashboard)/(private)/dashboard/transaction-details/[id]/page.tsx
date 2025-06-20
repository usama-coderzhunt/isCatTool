'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Typography } from '@mui/material'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'
import { useTransactionsHooks } from '@/services/useTransactionsHooks'
import TransactionDetailsCard from '@/views/pages/transactions/transactionDetailsCard'
import PaymentAuditLogsTable from '@/views/apps/commonTable/paymentAuditLogsTable'

const TransactionDetailsPage = () => {
  const params = useParams() as { lang: string; id: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')

  const isSuperUser = getDecryptedLocalStorage('isSuperUser')
  const userRole = getDecryptedLocalStorage('userRole')
  // states
  const [transactionId, setTransactionId] = useState<number>()

  // hooks
  const { getTransactionById } = useTransactionsHooks()
  const { data: transactionData, isLoading } = getTransactionById(Number(transactionId))

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  useEffect(() => {
    setTransactionId(Number(params.id))
  }, [params.id])

  return (
    <div className='w-full flex flex-col gap-y-10'>
      <Typography variant='h3'>{t('transactions.transactionDetails.title')}</Typography>
      <TransactionDetailsCard transactionDetails={transactionData} isLoading={isLoading} />
      {isSuperUser || userRole == 'Admin' ? <PaymentAuditLogsTable transactionId={transactionId} /> : <></>}{' '}
    </div>
  )
}

export default TransactionDetailsPage
