import { Chip } from '@mui/material'
import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

export const handleStatusDisplay = (status: string): JSX.Element => {
  const { t } = useTranslation('global')
  const statusConfig: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
    draft: {
      label: t('invoices.statuses.draft'),
      color: 'info'
    },
    sent: {
      label: t('invoices.statuses.sent'),
      color: 'info'
    },
    paid: {
      label: t('invoices.statuses.paid'),
      color: 'success'
    },
    overdue: {
      label: t('invoices.statuses.overdue'),
      color: 'error'
    },
    cancelled: {
      label: t('invoices.statuses.cancelled'),
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
