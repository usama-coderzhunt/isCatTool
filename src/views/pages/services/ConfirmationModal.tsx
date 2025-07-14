import { useState } from 'react'

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
  FormControl,
  Autocomplete,
  TextField
} from '@mui/material'

import { toast } from 'react-toastify'

import { useTranslation } from 'react-i18next'

import { useForm } from 'react-hook-form'

import type { ServicePlanTypes } from '@/types/servicesPlans'
import { useOrdersHooks } from '@/services/useOrdersHooks'
import { usePaymentsHooks } from '@/services/usePaymentsHooks'
import { useTransactionsHooks } from '@/services/useTransactionsHooks'
import type { OrdersTypes } from '@/types/ordersTypes'
import CustomTextField from '@/@core/components/mui/TextField'

import { useFinanceHooks } from '@/services/useFinanceHooks'

import CheckoutModal from '@/views/pages/services/CheckoutModal'
import PaymentInstructionsModal from '@/views/pages/services/PaymentInstructionsModal'
import { stripHtmlTags } from '@/utils/utility/stripeHtmlTags'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'
import { useParams } from 'next/navigation'
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'
import { useAuthStore } from '@/store/useAuthStore'
import { useRouter } from 'next/navigation'

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

interface FormData {
  manual_payment: number
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
  const { t } = useTranslation('global')

  const {
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>()

  const { lang } = useParams() as { lang: string }
  const currentLocale = Array.isArray(lang) ? lang[0] : lang
  const router = useRouter()
  // States
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [couponCode, setCouponCode] = useState<string>('')
  const [couponError, setCouponError] = useState<boolean>(false)
  const isFreePlan = Number(plan?.price) === 0 && Number(plan?.yearly_price) === 0
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [checkoutUrl, setCheckoutUrl] = useState('')
  const [isManualPaymentActive, setIsManualPaymentActive] = useState(true)
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false)
  const { setUserPermissions } = useAuthStore()

  const isSuperUser = getDecryptedLocalStorage('isSuperUser')
  const userRole = getDecryptedLocalStorage('userRole')

  const [paymentInstructions, setPaymentInstructions] = useState<{
    instructions?: string
    additionalDetails?: string
  }>({})

  const isButtonDisabled = () => {
    if (isFreePlan) return false

    if (plan.service_type === 'one_time') {
      return isLoading || !selectedMethod || (selectedMethod === 'manual' && !watch('manual_payment'))
    }

    return (
      isLoading ||
      (!subscriptionId && !selectedMethod && Number(plan?.price) !== 0 && Number(plan?.yearly_price) !== 0) ||
      (selectedMethod === 'manual' && !watch('manual_payment'))
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

  const { useInitiateOneTimePayment, useInitiatePaymentSubscription, useSubscriptionChangePlan, getManualPayment } =
    usePaymentsHooks()

  const { useCreateTransaction } = useTransactionsHooks()
  const { data: manualPaymentData } = getManualPayment(isManualPaymentActive)

  const getSelectedPaymentDetails = () => {
    if (!watch('manual_payment') || !manualPaymentData?.data?.results) return null

    return manualPaymentData.data.results.find((payment: any) => payment.id === watch('manual_payment'))
  }

  const selectedPayment = getSelectedPaymentDetails()

  const { mutate: createOrder, isLoading: isOrderLoading } = useCreateOrderOneTimePayment()
  const { mutate: initiateOneTimePayment, isLoading: isOneTimeLoading } = useInitiateOneTimePayment()
  const { mutate: initiateSubscriptionPayment, isLoading: isSubscriptionLoading } = useInitiatePaymentSubscription()
  const { mutate: changeSubscriptionPlan, isLoading: isChangePlanLoading } = useSubscriptionChangePlan()
  const { mutate: createTransaction, isLoading: isTransactionLoading } = useCreateTransaction()

  const handleCloseModal = () => {
    setSelectedMethod('')
    setCouponCode('')
    setCouponError(false)
    onClose()
  }

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value)
    setCouponError(false)
  }

  const handleCheckoutOpen = (url: string) => {
    setCheckoutUrl(url)
    setCheckoutModalOpen(true)
    handleCloseModal()
  }

  const handlePaymentProviderSelect = (payment: any) => {
    setValue('manual_payment', payment?.id || '')

    if (payment) {
      setPaymentInstructions({
        instructions: payment.instructions ? stripHtmlTags(payment.instructions) : undefined,
        additionalDetails: payment.additional_details ? stripHtmlTags(payment.additional_details) : undefined
      })
    }
  }

  const handleProceed = () => {
    if (selectedMethod === 'manual' && !watch('manual_payment')) {
      toast.error(t('paymentConfirmationModal.toasts.pleaseSelectManualPayment'))

      return
    }

    // For subscription plans with existing subscription
    if (subscriptionId && plan.service_type === 'subscription') {
      const paymentProvider = activePlanProvider ? activePlanProvider : selectedMethod

      if (!activePlanProvider && Number(plan?.price) !== 0 && Number(plan?.yearly_price) !== 0 && !selectedMethod) {
        toast.error(t('paymentConfirmationModal.toasts.pleaseSelectPaymentMethod'))

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
              const isUpgradingFromPaidToPaid =
                isPlanActive === 'active' && activePlanProvider && paymentProvider === 'stripe'

              if (isUpgradingFromPaidToPaid) {
                handleCheckoutOpen(response.data.checkout_url)
              } else {
                window.open(response.data.checkout_url, '_blank')
                handleCloseModal()
              }
            } else {
              toast.success(t('paymentConfirmationModal.toasts.subscriptionChangedPlanSuccess'))
              handleCloseModal()
            }
            if (!isSuperUser || userRole !== 'Admin') {
              const fetchUserPermissions = async (retryCount = 0) => {
                try {
                  await new Promise(resolve => setTimeout(resolve, 2000))
                  const { data: loggedInUser } = await axiosInstance.get(API_ROUTES.AUTH.userDetails, {
                    requiresAuth: true
                  } as any)

                  if (loggedInUser?.user_permissions && loggedInUser.user_permissions.length > 0) {
                    setUserPermissions(loggedInUser.user_permissions)
                    return true
                  } else {
                    if (retryCount < 3) {
                      return fetchUserPermissions(retryCount + 1)
                    } else {
                      toast.error(t('paymentsFeatureToasts.unableToFetchUserPermissions'))
                      return false
                    }
                  }
                } catch (error) {
                  if (retryCount < 3) {
                    return fetchUserPermissions(retryCount + 1)
                  } else {
                    toast.error(t('paymentsFeatureToasts.unableToUpdatePermissions'))
                    return false
                  }
                }
              }
              fetchUserPermissions()
            }
          },
          onError: (error: any) => {
            if (error?.response?.data?.message?.toLowerCase().includes('coupon')) {
              setCouponError(true)
            } else {
              toast.error(t('paymentConfirmationModal.toasts.failedToChangeSubscriptionPlan'))
            }
          }
        }
      )

      return
    }

    const getUser = getDecryptedLocalStorage('userID')

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
            toast.success(t('paymentConfirmationModal.toasts.orderCreatedSuccessForFreePlan'))
            window.location.href = '/dashboard'
            handleCloseModal()

            return
          }

          if (selectedMethod === 'manual') {
            const selectedPaymentProvider = manualPaymentData?.data?.results?.find(
              (payment: any) => payment.id === watch('manual_payment')
            )

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
                status: 'initiated',
                payment_details: {
                  provider: selectedPaymentProvider?.name || ''
                }
              },
              {
                onSuccess: () => {
                  toast.success(t('paymentConfirmationModal.toasts.manualPaymentTransactionCreatedSuccess'))
                  handleCloseModal()
                  setShowPaymentInstructions(true)
                  router.push(`/${currentLocale}/dashboard`)
                },
                onError: () => {
                  toast.error(t('paymentConfirmationModal.toasts.failedToCreateManualPaymentTransaction'))
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
                  toast.success(t('paymentsFeatureToasts.subscriptionPaymentInitiatedSuccess'))

                  if (paymentResponse?.data?.checkout_url) {
                    localStorage.setItem('currentLang', currentLocale)
                    localStorage.setItem('pendingOrderId', response.data.id.toString())
                    window.location.href = paymentResponse.data.checkout_url
                  }
                },
                onError: () => {
                  toast.error(t('paymentConfirmationModal.toasts.failedToInitiateSubscriptionPayment'))
                }
              }
            )
          } else {
            // For one-time plans - Always create new order and use its ID
            initiateOneTimePayment(
              {
                order_id: response.data.id,
                payment_method: selectedMethod
              },
              {
                onSuccess: paymentResponse => {
                  toast.success(t('paymentsFeatureToasts.oneTimeInitiatedSuccess'))

                  if (paymentResponse?.data?.checkout_url) {
                    localStorage.setItem('currentLang', currentLocale)
                    localStorage.setItem('pendingOrderId', response.data.id.toString())
                    window.location.href = paymentResponse.data.checkout_url
                  }
                },
                onError: () => {
                  toast.error(t('paymentsFeatureToasts.failedToInitiatePayment'))
                }
              }
            )
          }
        }
      },
      onError: (error: any) => {
        if (error?.response?.data?.message?.toLowerCase().includes('coupon')) {
          setCouponError(true)
        } else {
          toast.error(t('paymentConfirmationModal.toasts.failedToCreateOrder'))
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
      return planType === 'monthly'
        ? t('paymentConfirmationModal.switchBillingCycleTitleMonthly')
        : t('paymentConfirmationModal.switchBillingCycleTitleYearly')
    }

    return t('paymentConfirmationModal.title')
  }

  const getModalContent = () => {
    if (isBillingCycleSwitch) {
      return (
        <div className='mb-8'>
          <Typography variant='h5' className='text-primary font-semibold mb-4'>
            {serviceName}
          </Typography>
          <div className='bg-backgroundPaper p-6 rounded-lg border border-border'>
            <Typography variant='h6' className='text-textSecondary mb-2'>
              {t('paymentConfirmationModal.currentPlan')}
            </Typography>
            <Typography variant='body1' className='text-textSecondary mb-4'>
              {plan.name}
            </Typography>
            <Divider className='my-4' />
            <div className='flex justify-between items-center mb-4'>
              <Typography variant='body1' className='text-textSecondary font-medium'>
                {t('paymentConfirmationModal.newBillingCycle')}
              </Typography>
              <Typography variant='h6' className='text-primary font-semibold'>
                {planType === 'monthly' ? t('paymentConfirmationModal.monthly') : t('paymentConfirmationModal.yearly')}
              </Typography>
            </div>
            <div className='flex justify-between items-center mb-4'>
              <Typography variant='body1' className='text-textSecondary font-medium'>
                {t('paymentConfirmationModal.newPrice')}
              </Typography>
              <Typography variant='h6' className='text-primary font-semibold' dir='ltr'>
                ${planType === 'monthly' ? plan.price : plan.yearly_price}
                {plan.service_type !== 'one_time' && (
                  <span className='text-sm text-textSecondary ml-1'>
                    /{'  '}
                    {planType === 'monthly' ? t('paymentConfirmationModal.month') : t('paymentConfirmationModal.year')}
                  </span>
                )}
              </Typography>
            </div>
            {nextBillingDate && (
              <div className='mt-4 p-4 bg-backgroundDefault rounded-lg'>
                <Typography variant='body2' className='text-textSecondary'>
                  {t('paymentConfirmationModal.nextBillingDateDescription')}{' '}
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
        <div className='bg-backgroundPaper p-6 rounded-lg border border-border'>
          <Typography variant='h6' className='text-textSecondary mb-2'>
            {t('paymentConfirmationModal.selectedPlan')}
          </Typography>
          <Typography variant='body1' className='text-textSecondary mb-4'>
            {plan.name}
          </Typography>
          <Divider className='my-4' />
          <div className='flex justify-between items-center'>
            <Typography variant='body1' className='text-textSecondary font-medium'>
              {t('paymentConfirmationModal.totalAmount')}
            </Typography>
            <Typography variant='h4' className='text-primary font-semibold' dir='ltr'>
              ${planType === 'monthly' ? plan.price : plan.yearly_price}
              {plan.service_type !== 'one_time' && (
                <span className='text-sm text-textSecondary ml-1'>
                  / {planType === 'monthly' ? t('paymentConfirmationModal.month') : t('paymentConfirmationModal.year')}
                </span>
              )}
            </Typography>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
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
                {t('paymentConfirmationModal.selectPaymentMethod')}
              </Typography>
              <RadioGroup
                value={plan.service_type === 'one_time' ? selectedMethod : activePlanProvider || selectedMethod}
                onChange={e => setSelectedMethod(e.target.value)}
              >
                {subscriptionId && activePlanProvider && !isFreePlan && plan.service_type === 'subscription' ? (
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
                            ? t('paymentConfirmationModal.stripe')
                            : activePlanProvider === 'paypal'
                              ? t('paymentConfirmationModal.paypal')
                              : t('paymentConfirmationModal.manual')}
                        </span>
                      </div>
                    }
                  />
                ) : (
                  <>
                    <FormControlLabel
                      value='stripe'
                      control={<Radio />}
                      label={
                        <div className='flex items-center gap-2'>
                          <i className='tabler-credit-card text-2xl text-blue-600' />
                          <span className='text-lg'>{t('paymentConfirmationModal.stripe')}</span>
                        </div>
                      }
                    />
                    <FormControlLabel
                      value='paypal'
                      control={<Radio />}
                      label={
                        <div className='flex items-center gap-2'>
                          <i className='tabler-brand-paypal text-2xl text-blue-600' />
                          <span className='text-lg'>{t('paymentConfirmationModal.paypal')}</span>
                        </div>
                      }
                    />
                    <FormControlLabel
                      value='manual'
                      control={<Radio />}
                      label={
                        <div className='flex items-center gap-2'>
                          <i className='tabler-cash text-2xl text-green-600' />
                          <span className='text-lg'>{t('paymentConfirmationModal.manual')}</span>
                        </div>
                      }
                    />
                  </>
                )}
              </RadioGroup>
            </FormControl>
          )}
          {selectedMethod === 'manual' && (
            <div className='mb-6'>
              <FormControl fullWidth>
                <Autocomplete
                  value={selectedPayment || null}
                  onChange={(_, newValue) => {
                    handlePaymentProviderSelect(newValue)
                  }}
                  options={manualPaymentData?.data?.results || []}
                  getOptionLabel={(option: any) => option.name}
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      label={t('paymentConfirmationModal.paymentProviderLabel')}
                      showAsterisk={true}
                      InputLabelProps={{
                        shrink: true
                      }}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
                {/* {selectedPayment && (selectedPayment?.instructions || selectedPayment?.additional_details) && (
                  <div className='flex flex-col gap-y-3 mt-3'>
                    <Typography variant='h6' className='text-secondary'>
                      {t('paymentConfirmationModal.selectedPaymentProvider')}
                    </Typography>
                    {selectedPayment?.instructions && (
                      <Typography variant='body2' className='mt-1 p-3 bg-primaryLight rounded-md text-primary text-sm'>
                        <Typography variant='h6' className='text-primary mb-2'>
                          {t('paymentConfirmationModal.instructions')}
                        </Typography>
                        {selectedPayment.instructions}
                      </Typography>
                    )}
                    {selectedPayment?.additional_details && (
                      <Typography variant='body2' className='mt-1 p-3 bg-primaryLight rounded-md text-primary text-sm'>
                        <Typography variant='h6' className='text-primary mb-2'>
                          {t('paymentConfirmationModal.additionalDetails')}
                        </Typography>
                        {selectedPayment.additional_details}
                      </Typography>
                    )}
                  </div>
                )} */}
              </FormControl>
            </div>
          )}
          {shouldShowCouponField() && (
            <div className='mb-6'>
              <CustomTextField
                fullWidth
                label={t('paymentConfirmationModal.couponFieldLabel')}
                value={couponCode}
                onChange={handleCouponChange}
                error={couponError}
                helperText={couponError ? t('paymentConfirmationModal.toasts.invalidCoupon') : ''}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions className='p-6'>
          <Button variant='outlined' onClick={handleCloseModal} className='mr-2'>
            {t('paymentConfirmationModal.cancelBtn')}
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
              t('paymentConfirmationModal.switchBillingCycle')
            ) : (
              t('paymentConfirmationModal.proceedBtn')
            )}
          </Button>
        </DialogActions>
      </Dialog>
      <CheckoutModal open={checkoutModalOpen} onClose={() => setCheckoutModalOpen(false)} checkoutUrl={checkoutUrl} />
      <PaymentInstructionsModal
        open={showPaymentInstructions}
        onClose={() => setShowPaymentInstructions(false)}
        instructions={paymentInstructions.instructions}
        additionalDetails={paymentInstructions.additionalDetails}
      />
    </>
  )
}

export default ConfirmationModal
