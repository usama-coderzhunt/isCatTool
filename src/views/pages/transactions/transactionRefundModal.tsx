import CustomTextField from '@/@core/components/mui/TextField'
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface TransactionRefundModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (data: { reason: string; amount?: string }) => void
  isLoading?: boolean
  title: string
  message: string
}

const TransactionRefundModal = ({
  open,
  onClose,
  onConfirm,
  isLoading,
  title,
  message
}: TransactionRefundModalProps) => {
  const { t } = useTranslation('global')
  const [reason, setReason] = useState('')
  const [amount, setAmount] = useState<string>('')

  const handleConfirm = () => {
    const payload: { reason: string; amount?: string } = { reason }
    if (amount.trim()) {
      const numericAmount = parseFloat(amount)
      if (!isNaN(numericAmount) && numericAmount > 0) {
        payload.amount = amount.trim()
      }
    }
    onConfirm(payload)
    setReason('')
    setAmount('')
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
      setAmount(value)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle className='bg-primary text-white py-6 px-8 text-2xl font-semibold'>{title}</DialogTitle>
      <DialogContent className='p-8'>
        <div className='mb-8'>
          <Typography variant='h6' className='text-textSecondary mb-4'>
            {message}
          </Typography>
          <Typography variant='body1' className='text-textSecondary mb-4'>
            {t('transactions.transactionRefundModal.warning')}
          </Typography>
          <div className='space-y-4'>
            <CustomTextField
              showAsterisk={true}
              fullWidth
              multiline
              rows={4}
              label={t('transactions.transactionRefundModal.reason')}
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
            <CustomTextField
              fullWidth
              label={t('transactions.transactionRefundModal.amount')}
              value={amount}
              onChange={handleAmountChange}
              type='number'
              placeholder={t('transactions.transactionRefundModal.amountPlaceholder')}
              inputProps={{
                min: 0,
                step: '0.01'
              }}
            />
          </div>
        </div>
      </DialogContent>
      <DialogActions className='p-6 border-t border-border'>
        <Button onClick={onClose} variant='outlined' disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button onClick={handleConfirm} variant='contained' color='primary' disabled={isLoading || !reason.trim()}>
          {isLoading ? (
            <div className='flex items-center gap-2'>
              <CircularProgress size={20} color='inherit' />
            </div>
          ) : (
            t('transactions.transactionRefundModal.confirm')
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TransactionRefundModal
