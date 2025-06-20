import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material'
import { usePaymentsHooks } from '@/services/usePaymentsHooks'
import { useTransactionsHooks } from '@/services/useTransactionsHooks'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'

interface PaymentMethodModalProps {
  open: boolean
  onClose: () => void
  orderId: number
  isSubscription?: boolean
  amount?: string | number | null | undefined
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({ open, onClose, orderId, isSubscription, amount }) => {
  const { t } = useTranslation('global')
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [billingCycle, setBillingCycle] = useState<string>('monthly')
  const { useInitiateOneTimePayment, useInitiatePaymentSubscription } = usePaymentsHooks()
  const { useCreateTransaction } = useTransactionsHooks()
  const { mutate: initiateOneTimePayment, isLoading: isOneTimeLoading } = useInitiateOneTimePayment()
  const { mutate: initiateSubscriptionPayment, isLoading: isSubscriptionLoading } = useInitiatePaymentSubscription()
  const { mutate: createTransaction, isLoading: isTransactionLoading } = useCreateTransaction()

  const handleConfirm = () => {
    if (!selectedMethod) return

    if (selectedMethod === 'manual') {
      const user = getDecryptedLocalStorage('userID')
      createTransaction(
        {
          order: orderId,
          payment_method: selectedMethod,
          amount: amount?.toString() || '',
          user: Number(user) || 0,
          status: 'initiated'
        },
        {
          onSuccess: () => {
            onClose()
          }
        }
      )
    } else if (isSubscription) {
      initiateSubscriptionPayment(
        {
          order_id: orderId,
          payment_method: selectedMethod,
          billing_cycle: billingCycle
        },
        {
          onSuccess: response => {
            if (response?.data?.checkout_url) {
              toast.success(t('paymentsFeatureToasts.subscriptionPaymentInitiatedSuccess'))
              localStorage.setItem('pendingOrderId', orderId.toString())
              window.location.href = response.data.checkout_url
            }
          }
        }
      )
    } else {
      initiateOneTimePayment(
        {
          order_id: orderId,
          payment_method: selectedMethod
        },
        {
          onSuccess: response => {
            toast.success(t('paymentsFeatureToasts.oneTimeInitiatedSuccess'))
            if (response?.data?.checkout_url) {
              localStorage.setItem('pendingOrderId', orderId.toString())
              window.location.href = response.data.checkout_url
            }
          }
        }
      )
    }
  }

  const isLoading = isSubscription ? isSubscriptionLoading : isOneTimeLoading || isTransactionLoading

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '1rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle className='bg-primary text-white py-6 px-8 text-2xl font-semibold'>
        Select Payment Method
      </DialogTitle>
      <DialogContent className='p-8'>
        <FormControl component='fieldset' className='w-full'>
          <RadioGroup value={selectedMethod} onChange={e => setSelectedMethod(e.target.value)} className='space-y-4'>
            <FormControlLabel
              value='stripe'
              control={<Radio />}
              label={
                <div className='flex items-center gap-2'>
                  <i className='tabler-credit-card text-2xl text-blue-500' />
                  <span className='text-lg'>Stripe</span>
                </div>
              }
            />
            <FormControlLabel
              value='paypal'
              control={<Radio />}
              label={
                <div className='flex items-center gap-2'>
                  <i className='tabler-brand-paypal text-2xl text-blue-600' />
                  <span className='text-lg'>PayPal</span>
                </div>
              }
            />
            <FormControlLabel
              value='manual'
              control={<Radio />}
              label={
                <div className='flex items-center gap-2'>
                  <i className='tabler-cash text-2xl text-green-600' />
                  <span className='text-lg'>Manual Payment</span>
                </div>
              }
            />
          </RadioGroup>
        </FormControl>

        {isSubscription && (
          <FormControl fullWidth className='mt-6 max-w-[200px] w-full'>
            <InputLabel id='billing-cycle-label'>Billing Cycle</InputLabel>
            <Select
              labelId='billing-cycle-label'
              value={billingCycle}
              label='Billing Cycle'
              onChange={e => setBillingCycle(e.target.value)}
            >
              <MenuItem value='monthly'>Monthly</MenuItem>
              <MenuItem value='yearly'>Yearly</MenuItem>
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions className='p-6 bg-white border-t border-gray-200'>
        <Button
          onClick={onClose}
          variant='outlined'
          className='px-6 py-2 rounded-lg font-semibold normal-case hover:bg-gray-50'
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant='contained'
          color='primary'
          disabled={isLoading || !selectedMethod}
          className='px-6 py-2 rounded-lg font-semibold normal-case shadow-lg hover:shadow-xl transition-shadow duration-300'
        >
          {isLoading ? (
            <div className='flex items-center gap-2'>
              <CircularProgress size={20} color='inherit' />
              <span>Processing...</span>
            </div>
          ) : (
            'Confirm Payment'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PaymentMethodModal
