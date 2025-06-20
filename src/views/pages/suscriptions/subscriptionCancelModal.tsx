import CustomTextField from '@/@core/components/mui/TextField'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, CircularProgress } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface SubscriptionCancelModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  isLoading?: boolean
}

const SubscriptionCancelModal = ({ open, onClose, onConfirm, isLoading }: SubscriptionCancelModalProps) => {
  const { t } = useTranslation('global')
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    onConfirm(reason)
    setReason('')
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle className='bg-primary text-white py-6 px-8 text-2xl font-semibold'>
        {t('subscriptions.subscriptionsCancelModal.title')}
      </DialogTitle>
      <DialogContent className='p-8'>
        <div className='mb-8'>
          <Typography variant='h6' className='text-textSecondary mb-4'>
            {t('subscriptions.subscriptionsCancelModal.message')}
          </Typography>
          <Typography variant='body1' className='text-textSecondary mb-4'>
            {t('subscriptions.subscriptionsCancelModal.warning')}
          </Typography>
          <CustomTextField
            showAsterisk={true}
            fullWidth
            multiline
            rows={4}
            label={t('subscriptions.subscriptionsCancelModal.reason')}
            value={reason}
            onChange={e => setReason(e.target.value)}
            className='mt-4'
          />
        </div>
      </DialogContent>
      <DialogActions className='p-6 border-t border-border'>
        <Button onClick={onClose} variant='outlined' disabled={isLoading}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button onClick={handleConfirm} variant='contained' color='primary' disabled={isLoading || !reason.trim()}>
          {isLoading ? (
            <div className='flex items-center gap-2'>
              <CircularProgress size={20} color='inherit' />
            </div>
          ) : (
            t('subscriptions.subscriptionsCancelModal.confirm')
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SubscriptionCancelModal
