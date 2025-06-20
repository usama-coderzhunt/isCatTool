import { Chip } from '@mui/material'
import { useTranslation } from 'react-i18next'

type StatusColor = 'success' | 'warning' | 'error' | 'info' | 'default'

interface StatusConfig {
  label: string
  color: StatusColor
}

export const useStatusDisplay = () => {
  const { t } = useTranslation('global')

  const handleStatusDisplay = (status: string) => {
    const statusConfig: Record<string, StatusConfig> = {
      active: {
        label: t('subscriptions.table.status_active'),
        color: 'success'
      },
      trialing: {
        label: t('subscriptions.table.status_trialing'),
        color: 'info'
      },
      cancelled: {
        label: t('subscriptions.table.status_cancelled'),
        color: 'error'
      },
      expired: {
        label: t('subscriptions.table.status_expired'),
        color: 'error'
      },
      upgraded: {
        label: t('subscriptions.table.status_upgraded'),
        color: 'warning'
      },
      downgraded: {
        label: t('subscriptions.table.status_downgraded'),
        color: 'warning'
      },
      pending: {
        label: t('subscriptions.table.status_pending'),
        color: 'info'
      },
      failed: {
        label: t('subscriptions.table.status_failed'),
        color: 'error'
      },
      refunded: {
        label: t('subscriptions.table.status_refunded'),
        color: 'success'
      },
      partially_refunded: {
        label: t('subscriptions.table.status_partially_refunded'),
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

  return { handleStatusDisplay }
}
