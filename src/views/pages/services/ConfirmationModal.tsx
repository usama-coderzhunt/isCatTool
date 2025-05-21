import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl
} from '@mui/material'
import { ServicePlanTypes } from '@/types/servicesPlans'
import { useOrdersHooks } from '@/services/useOrdersHooks'
import { usePaymentsHooks } from '@/services/usePaymentsHooks'
import { useTransactionsHooks } from '@/services/useTransactionsHooks'
import { OrdersTypes } from '@/types/ordersTypes'
import { toast } from 'react-toastify'
import { useState } from 'react'
import CustomTextField from '@/@core/components/mui/TextField'

interface ConfirmationModalProps {
  open: boolean
  onClose: () => void
  plan: ServicePlanTypes
  serviceName: string
  planType: 'monthly' | 'yearly' | 'one_time'
  subscriptionId?: number
  activePlanProvider?: string
  isPlanActive: string
  nextBillingDate?: string
  isBillingCycleSwitch?: boolean
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  plan,
  serviceName,
  planType,
  subscriptionId,
  activePlanProvider,
  isPlanActive,
  nextBillingDate,
  isBillingCycleSwitch
}) => {
  // States
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [couponCode, setCouponCode] = useState<string>('')
  const [couponError, setCouponError] = useState<string>('')
  const isFreePlan = Number(plan?.price) === 0 && Number(plan?.yearly_price) === 0

  const isButtonDisabled = () => {
    if (isFreePlan) return false

    if (plan.service_type === 'one_time') {
      return isLoading || !selectedMethod
    }

    return (
      isLoading || (!subscriptionId && !selectedMethod && Number(plan?.price) !== 0 && Number(plan?.yearly_price) !== 0)
    )
  }

  const shouldShowPaymentMethod = () => {
    if (isFreePlan) return false

    if (plan.service_type === 'one_time' && !isFreePlan) return true

    // Show payment methods for subscription plans that are not free
    if (plan.service_type === 'subscription') {
      return true
    }
    return false
  }

  const shouldShowCouponField = () => {
    if (Number(plan?.price) === 0 && Number(plan?.yearly_price) === 0) {
      return false
    }
    if (isPlanActive === 'active' && Number(plan?.price) !== 0 && Number(plan?.yearly_price) !== 0) {
      return false
    }
    return true
  }

  // Hooks
  const { useCreateOrderOneTimePayment } = useOrdersHooks()
  const { useInitiateOneTimePayment, useInitiatePaymentSubscription, useSubscriptionChangePlan } = usePaymentsHooks()
  const { useCreateTransaction } = useTransactionsHooks()

  const { mutate: createOrder, isLoading: isOrderLoading } = useCreateOrderOneTimePayment()
  const { mutate: initiateOneTimePayment, isLoading: isOneTimeLoading } = useInitiateOneTimePayment()
  const { mutate: initiateSubscriptionPayment, isLoading: isSubscriptionLoading } = useInitiatePaymentSubscription()
  const { mutate: changeSubscriptionPlan, isLoading: isChangePlanLoading } = useSubscriptionChangePlan()
  const { mutate: createTransaction, isLoading: isTransactionLoading } = useCreateTransaction()

  const handleCloseModal = () => {
    setSelectedMethod('')
    setCouponCode('')
    setCouponError('')
    onClose()
  }

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value)
    setCouponError('')
  }

  const handleProceed = () => {
    if (subscriptionId && plan.service_type === 'subscription') {
      const paymentProvider = activePlanProvider ? activePlanProvider : selectedMethod

      if (!activePlanProvider && Number(plan?.price) !== 0 && Number(plan?.yearly_price) !== 0 && !selectedMethod) {
        toast.error('Please select a payment method')
        return
      }

      changeSubscriptionPlan(
        {
          subscription_id: subscriptionId,
          service_plan_id: plan.id,
          billing_cycle: planType,
          currency_code: 'USD',
          payment_method: paymentProvider
        },
        {
          onSuccess: response => {
            if (response?.data?.checkout_url) {
              window.location.href = response.data.checkout_url
            } else {
              toast.success('Subscription plan changed successfully')
              handleCloseModal()
            }
          },
          onError: (error: any) => {
            if (error?.response?.data?.message?.toLowerCase().includes('coupon')) {
              setCouponError(error.response.data.message || 'Enter a valid coupon code')
            } else {
              toast.error('Failed to change subscription plan')
            }
          }
        }
      )
      return
    }

    const getUser = localStorage.getItem('userID')

    const orderData: Partial<OrdersTypes> = {
      amount: planType === 'monthly' ? Number(plan?.price) : Number(plan?.yearly_price),
      user: getUser ? parseInt(getUser) : undefined,
      service_plan: plan.id,
      currency_code: 'USD',
      ...(plan.service_type === 'subscription' && { is_subscription: true }),
      ...(plan.service_type !== 'one_time' && {
        billing_cycle: isFreePlan ? 'monthly' : planType === 'monthly' ? 'monthly' : 'yearly'
      }),
      ...(couponCode && !isFreePlan && { coupon_code: couponCode })
    }

    createOrder(orderData, {
      onSuccess: response => {
        if (response?.data?.id) {
          if (isFreePlan) {
            toast.success('Order created successfully for free plan')
            handleCloseModal()
            return
          }

          if (selectedMethod === 'manual') {
            createTransaction(
              {
                order: response.data.id,
                payment_method: selectedMethod,
                amount:
                  (plan.service_type === 'one_time'
                    ? plan?.price
                    : planType === 'monthly'
                      ? plan?.price
                      : plan?.yearly_price
                  )?.toString() || '',
                user: Number(getUser) || 0,
                status: 'initiated'
              },
              {
                onSuccess: () => {
                  toast.success('Manual payment transaction created successfully')
                  handleCloseModal()
                },
                onError: () => {
                  toast.error('Failed to create manual payment transaction')
                }
              }
            )
          } else if (plan.service_type === 'subscription') {
            initiateSubscriptionPayment(
              {
                order_id: response.data.id,
                payment_method: selectedMethod,
                billing_cycle: planType === 'monthly' ? 'monthly' : 'yearly'
              },
              {
                onSuccess: paymentResponse => {
                  if (paymentResponse?.data?.checkout_url) {
                    localStorage.setItem('pendingOrderId', response.data.id.toString())
                    window.location.href = paymentResponse.data.checkout_url
                  }
                },
                onError: () => {
                  toast.error('Failed to initiate subscription payment')
                }
              }
            )
          } else {
            // For one-time plans
            initiateOneTimePayment(
              {
                order_id: response.data.id,
                payment_method: selectedMethod
              },
              {
                onSuccess: paymentResponse => {
                  if (paymentResponse?.data?.checkout_url) {
                    localStorage.setItem('pendingOrderId', response.data.id.toString())
                    window.location.href = paymentResponse.data.checkout_url
                  }
                },
                onError: () => {
                  toast.error('Failed to initiate one-time payment')
                }
              }
            )
          }
        }
      },
      onError: (error: any) => {
        if (error?.response?.data?.message?.toLowerCase().includes('coupon')) {
          setCouponError(error.response.data.message || 'Enter a valid coupon code')
        } else {
          toast.error('Failed to create order')
        }
      }
    })
  }

  const isLoading =
    isOrderLoading ||
    isTransactionLoading ||
    isChangePlanLoading ||
    (plan.service_type === 'subscription' ? isSubscriptionLoading : isOneTimeLoading)

  const getModalTitle = () => {
    if (isBillingCycleSwitch) {
      return `Switch to ${planType} Billing`
    }
    return 'Confirm Your Purchase'
  }

  const getModalContent = () => {
    if (isBillingCycleSwitch) {
      return (
        <div className='mb-8'>
          <Typography variant='h5' className='text-primary font-semibold mb-4'>
            {serviceName}
          </Typography>
          <div className='bg-white p-6 rounded-lg border border-gray-200'>
            <Typography variant='h6' className='text-gray-900 mb-2'>
              Current Plan
            </Typography>
            <Typography variant='body1' className='text-gray-600 mb-4'>
              {plan.name}
            </Typography>
            <Divider className='my-4' />
            <div className='flex justify-between items-center mb-4'>
              <Typography variant='body1' className='text-gray-900 font-medium'>
                New Billing Cycle
              </Typography>
              <Typography variant='h6' className='text-primary font-semibold'>
                {planType === 'monthly' ? 'Monthly' : 'Yearly'}
              </Typography>
            </div>
            <div className='flex justify-between items-center mb-4'>
              <Typography variant='body1' className='text-gray-900 font-medium'>
                New Price
              </Typography>
              <Typography variant='h6' className='text-primary font-semibold'>
                ${planType === 'monthly' ? plan.price : plan.yearly_price}
                {plan.service_type !== 'one_time' && (
                  <span className='text-sm text-gray-500 ml-1'>/{planType === 'monthly' ? 'month' : 'year'}</span>
                )}
              </Typography>
            </div>
            {nextBillingDate && (
              <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
                <Typography variant='body2' className='text-gray-600'>
                  Your billing cycle will change on your next billing date:{' '}
                  {new Date(nextBillingDate).toLocaleDateString()}
                </Typography>
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className='mb-8'>
        <Typography variant='h5' className='text-primary font-semibold mb-4'>
          {serviceName}
        </Typography>
        <div className='bg-white p-6 rounded-lg border border-gray-200'>
          <Typography variant='h6' className='text-gray-900 mb-2'>
            Selected Plan
          </Typography>
          <Typography variant='body1' className='text-gray-600 mb-4'>
            {plan.name}
          </Typography>
          <Divider className='my-4' />
          <div className='flex justify-between items-center'>
            <Typography variant='body1' className='text-gray-900 font-medium'>
              Total Amount
            </Typography>
            <Typography variant='h4' className='text-primary font-semibold'>
              ${planType === 'monthly' ? plan.price : plan.yearly_price}
              {plan.service_type !== 'one_time' && (
                <span className='text-sm text-gray-300 ml-1'>/ {planType === 'monthly' ? 'month' : 'year'}</span>
              )}
            </Typography>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
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
      <DialogTitle className='bg-primary text-white py-6 px-8 text-2xl font-semibold'>{getModalTitle()}</DialogTitle>
      <DialogContent className='p-8'>
        {getModalContent()}
        {shouldShowPaymentMethod() && (
          <FormControl component='fieldset' className='mb-6'>
            <Typography variant='h6' className='mb-4'>
              Select Payment Method
            </Typography>
            <RadioGroup
              value={plan.service_type === 'one_time' ? selectedMethod : activePlanProvider || selectedMethod}
              onChange={e => setSelectedMethod(e.target.value)}
            >
              {subscriptionId && activePlanProvider && !isFreePlan && plan.service_type === 'subscription' ? (
                // Show only active provider when upgrading between paid subscription plans
                <FormControlLabel
                  value={activePlanProvider}
                  control={<Radio disabled />}
                  label={
                    <div className='flex items-center gap-2'>
                      <i
                        className={`tabler-${activePlanProvider === 'stripe' ? 'credit-card' : activePlanProvider === 'paypal' ? 'brand-paypal' : 'cash'} text-2xl ${activePlanProvider === 'stripe' ? 'text-blue-600' : activePlanProvider === 'paypal' ? 'text-blue-600' : 'text-green-600'}`}
                      />
                      <span className='text-lg'>
                        {activePlanProvider === 'stripe'
                          ? 'Stripe'
                          : activePlanProvider === 'paypal'
                            ? 'PayPal'
                            : 'Manual Payment'}
                      </span>
                    </div>
                  }
                />
              ) : (
                // Show all payment methods for one-time plans or new subscriptions
                <>
                  <FormControlLabel
                    value='stripe'
                    control={<Radio />}
                    label={
                      <div className='flex items-center gap-2'>
                        <i className='tabler-credit-card text-2xl text-blue-600' />
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
                </>
              )}
            </RadioGroup>
          </FormControl>
        )}
        {shouldShowCouponField() && (
          <div className='mb-6'>
            <CustomTextField
              fullWidth
              label='Coupon Code (Optional)'
              value={couponCode}
              onChange={handleCouponChange}
              error={!!couponError}
              helperText={couponError}
            />
          </div>
        )}
      </DialogContent>
      <DialogActions className='p-6 bg-gray-50'>
        <Button variant='outlined' onClick={handleCloseModal} className='mr-2'>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={handleProceed}
          disabled={isButtonDisabled()}
          className='bg-primary text-white'
        >
          {isLoading ? (
            <CircularProgress size={24} color='inherit' />
          ) : isBillingCycleSwitch ? (
            'Switch Billing Cycle'
          ) : (
            'Proceed to Payment'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationModal
