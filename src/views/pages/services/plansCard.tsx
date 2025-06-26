import { ServiceTypes } from '@/types/services'
import { ServicePlanTypes } from '@/types/servicesPlans'
import {
  Button,
  Card,
  CardContent,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  Grid,
  Divider
} from '@mui/material'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import CustomAvatar from '@core/components/mui/Avatar'
import { useTranslation } from 'react-i18next'
import ConfirmationModal from './ConfirmationModal'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { cipher, getDecryptedLocalStorage } from '@/utils/utility/decrypt'

interface PlansCardProps {
  serviceData: ServiceTypes
  disabledEdit?: boolean
  setOpen: (open: boolean) => void
  setModalMode: (mode: 'create' | 'edit') => void
  setSelectedService: any
  setServicePlanId: (id: number) => void
  setDelName: (name: string) => void
  setOpenDeleteModal: (open: boolean) => void
  planType: 'monthly' | 'yearly'
  isPlanActive?: string
  subscriptionId?: number
  activePlanProvider?: string
  activePlanId?: number
  activePlanBillingCycle?: string
  nextBillingDate?: string
  isSinglePlan?: boolean
}

const PlansCard: React.FC<PlansCardProps> = ({
  serviceData,
  disabledEdit,
  setOpen,
  setModalMode,
  setSelectedService,
  setServicePlanId,
  setDelName,
  setOpenDeleteModal,
  planType,
  isPlanActive,
  activePlanId,
  subscriptionId,
  activePlanProvider,
  activePlanBillingCycle,
  nextBillingDate,
  isSinglePlan = false
}) => {
  const [anchorEl, setAnchorEl] = React.useState<{ [key: number]: HTMLElement | null }>({})
  const router = useRouter()
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<ServicePlanTypes | null>(null)
  const { t, i18n } = useTranslation('global')
  const [showLimitsMap, setShowLimitsMap] = useState<{ [planId: number]: boolean }>({})
  const isSuperUser = getDecryptedLocalStorage('isSuperUser')
  const userRole = getDecryptedLocalStorage('userRole')
  const { lang } = useParams()
  const currentLocale = Array.isArray(lang) ? lang[0] : lang

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  const getPlanPrice = (plan: ServicePlanTypes) => {
    if (plan.service_type === 'one_time') {
      return Number(plan.price)
    }
    if (plan.id === activePlanId && isPlanActive === 'active') {
      if (planType === 'yearly') {
        return Number(plan.yearly_price)
      }
      return Number(plan.price)
    }
    return planType === 'monthly' ? Number(plan.price) : Number(plan.yearly_price)
  }

  const getButtonText = (plan: ServicePlanTypes) => {
    if (!subscriptionId) return t('servicePlanCard.getStarted')

    if (plan.id === activePlanId && isPlanActive === 'active') {
      const isFreePlan = Number(plan.price) === 0 && Number(plan.yearly_price) === 0
      if (isFreePlan) return t('servicePlanCard.activeBtn')

      if (activePlanBillingCycle === 'monthly' && planType === 'yearly') {
        return t('servicePlanCard.upgradeToYearly')
      }
      if (activePlanBillingCycle === 'yearly' && planType === 'monthly') {
        return t('servicePlanCard.downgradeToMonthly')
      }
      return t('servicePlanCard.activeBtn')
    }

    const activePlan = serviceData.plans?.find(p => p.id === activePlanId)
    if (!activePlan || plan.service_type !== activePlan.service_type) {
      return t('servicePlanCard.getStarted')
    }

    const newPlanPrice = getPlanPrice(plan)
    const activePlanPrice = getPlanPrice(activePlan)
    return newPlanPrice > activePlanPrice ? t('servicePlanCard.upgradeBtn') : t('servicePlanCard.downgradeBtn')
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>, planId: number) => {
    setAnchorEl(prev => ({
      ...prev,
      [planId]: event.currentTarget
    }))
  }

  const handleClose = (planId: number) => {
    setAnchorEl(prev => ({
      ...prev,
      [planId]: null
    }))

    localStorage.removeItem('selectedPlan')
    localStorage.removeItem('returnUrl')
  }

  const formatValue = (value: number | boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CustomAvatar color='success' skin='light' size={20}>
          <i className='tabler-check text-sm' />
        </CustomAvatar>
      ) : (
        <CustomAvatar color='error' skin='light' size={20}>
          <i className='tabler-x text-sm' />
        </CustomAvatar>
      )
    }
    return value
  }

  const handleGetStarted = (plan: ServicePlanTypes) => {
    if (!userRole) {
      localStorage.setItem('selectedPlan', cipher(JSON.stringify(plan)))
      localStorage.setItem('returnUrl', cipher(window.location.pathname))

      toast.info(t('services.servicePlans.loginToContinue'))
      router.push(`/${currentLocale}/login`)
      return
    }
    setSelectedPlan(plan)
    setConfirmationModalOpen(true)
  }

  const handleUpgradePlan = (plan: ServicePlanTypes) => {
    if (!userRole) {
      localStorage.setItem('selectedPlan', cipher(JSON.stringify(plan)))
      localStorage.setItem('returnUrl', cipher(window.location.pathname))
      toast.info(t('services.servicePlans.loginToContinue'))
      router.push(`/${currentLocale}/login`)
      return
    }
    setSelectedPlan(plan)
    setConfirmationModalOpen(true)
  }

  const handleActivePlanAction = (plan: ServicePlanTypes) => {
    if (
      (activePlanBillingCycle === 'monthly' && planType === 'yearly') ||
      (activePlanBillingCycle === 'yearly' && planType === 'monthly')
    ) {
      setSelectedPlan(plan)
      setConfirmationModalOpen(true)
    }
  }

  useEffect(() => {
    if (userRole) {
      const savedPlan = getDecryptedLocalStorage('selectedPlan')
      const returnUrl = getDecryptedLocalStorage('returnUrl')

      if (savedPlan && returnUrl) {
        setSelectedPlan(JSON.parse(savedPlan))
        setConfirmationModalOpen(true)

        localStorage.removeItem('selectedPlan')
        localStorage.removeItem('returnUrl')
      }
    }
  }, [userRole])

  if (!serviceData) {
    return null
  }

  const allPlans = serviceData ? [...serviceData.plans] : []
  const activeIndex = allPlans.findIndex(plan => plan.id === activePlanId && isPlanActive === 'active')

  const plansToShow = allPlans
  if (activeIndex !== -1) {
    const [activePlan] = plansToShow.splice(activeIndex, 1)
    plansToShow.splice(1, 0, activePlan) // Insert at index 1 (center of first row)
  }

  return (
    <>
      <div className={`${isSinglePlan ? 'w-full' : 'w-full grid grid-cols-3 gap-4'}`}>
        {plansToShow.length > 0 ? (
          plansToShow.map((plan: ServicePlanTypes, index: number) => {
            const isLimits = !!showLimitsMap[plan.id]
            return (
              <Grid key={index} item xs={12} lg={4}>
                <Card
                  className={`relative h-full flex flex-col ${plan.id === activePlanId && isPlanActive === 'active' ? 'border-2 border-primary shadow-xl' : ''}`}
                >
                  {/* <div className='relative w-[150px] h-[130px] mx-auto mt-7'>
                    <Image src={serviceData.image} alt={serviceData.name} fill priority />
                  </div> */}
                  {plan.id === activePlanId && isPlanActive === 'active' && (
                    <div className='text-xs text-yellow-500 absolute top-3 left-3'>
                      <i className='tabler-star-filled size-6 text-yellow-500' />
                    </div>
                  )}
                  {(userRole === 'Admin' || isSuperUser === true) && !disabledEdit && (
                    <div className='bg-white rounded-full absolute top-3 right-3'>
                      <IconButton
                        onClick={e => handleClick(e, plan.id)}
                        className='bg-backgroundPaper hover:bg-primary hover:text-white transition-all duration-300'
                      >
                        <i className='tabler-dots-vertical' />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl[plan.id]}
                        open={Boolean(anchorEl[plan.id])}
                        onClose={() => handleClose(plan.id)}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right'
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right'
                        }}
                      >
                        <MenuItem
                          onClick={() => {
                            handleClose(plan.id)
                            setModalMode('edit')
                            setOpen(true)
                            setSelectedService({ ...plan, serviceID: plan.id })
                          }}
                        >
                          <ListItemIcon>
                            <i className='tabler-edit text-[20px]' />
                          </ListItemIcon>
                          {t('services.servicePlans.edit')}
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleClose(plan.id)
                            setServicePlanId(plan.id)
                            setDelName(plan.name)
                            setOpenDeleteModal(true)
                          }}
                        >
                          <ListItemIcon>
                            <i className='tabler-trash text-[20px] text-red-500' />
                          </ListItemIcon>
                          {t('services.servicePlans.delete')}
                        </MenuItem>
                      </Menu>
                    </div>
                  )}
                  <CardContent className='flex flex-col gap-8 p-x-[45px] py-[60px] flex-grow'>
                    <div className='flex flex-col items-center gap-y-[2px] relative'>
                      <Typography className='text-center' variant='h4'>
                        {plan.name}
                      </Typography>
                      <div
                        className={`flex flex-wrap ${i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row'} items-baseline gap-x-1`}
                      >
                        {plan.id === activePlanId && isPlanActive === 'active' ? (
                          <div className='flex flex-col items-center'>
                            <div
                              className='relative overflow-hidden flex justify-center flex-wrap items-baseline gap-x-1'
                              dir='ltr'
                            >
                              <Typography
                                key={`${planType}-${plan.price}-${plan.yearly_price}`}
                                variant='h2'
                                color='primary.main'
                                className='font-extrabold'
                              >
                                {planType === 'yearly'
                                  ? `$${(Number(plan.yearly_price) / 12).toFixed(2)}`
                                  : `$${plan.price}`}
                              </Typography>
                              {planType === 'monthly' && (
                                <Typography color='text.disabled' className='font-medium lowercase relative top-1'>
                                  / {t('servicePlanCard.monthly')}
                                </Typography>
                              )}
                            </div>
                            {planType === 'yearly' && (
                              <Typography
                                variant='body2'
                                color='text.secondary'
                                className='w-full text-center block mt-1'
                              >
                                {t('servicePlanCard.perMonth')} ${plan.yearly_price}{' '}
                                {t('servicePlanCard.billedAnnually')}
                              </Typography>
                            )}
                          </div>
                        ) : (
                          <div
                            className='relative overflow-hidden flex items-baseline justify-center gap-x-1'
                            dir='ltr'
                          >
                            {plan.service_type === 'one_time' ? (
                              <Typography
                                key={`${planType}-${plan.price}-${plan.yearly_price}`}
                                variant='h2'
                                color='primary.main'
                                className='font-extrabold'
                              >
                                ${plan.price}
                              </Typography>
                            ) : planType === 'monthly' ? (
                              <>
                                <Typography
                                  key={`${planType}-${plan.price}-${plan.yearly_price}`}
                                  variant='h2'
                                  color='primary.main'
                                  className='font-extrabold'
                                >
                                  ${plan.price}
                                </Typography>
                                <Typography color='text.disabled' className='font-medium lowercase relative top-1'>
                                  / {t('servicePlanCard.monthly')}
                                </Typography>
                              </>
                            ) : (
                              <div className='flex flex-col items-center'>
                                <div className='flex items-center gap-x-1'>
                                  <Typography
                                    key={`${planType}-${plan.price}-${plan.yearly_price}`}
                                    variant='h2'
                                    color='primary.main'
                                    className='font-extrabold'
                                  >
                                    ${(Number(plan.yearly_price) / 12).toFixed(2)}
                                  </Typography>
                                </div>
                                <Typography
                                  variant='body2'
                                  color='text.secondary'
                                  className='w-full text-center block mt-1'
                                >
                                  {t('servicePlanCard.perMonth')} ${plan.yearly_price}{' '}
                                  {t('servicePlanCard.billedAnnually')}
                                </Typography>
                              </div>
                            )}
                          </div>
                        )}
                        {plan.service_type === 'one_time' && (
                          <Typography
                            color='text.disabled'
                            className='font-medium lowercase'
                            sx={{
                              position: 'relative',
                              top: '4px'
                            }}
                          >
                            {['en', 'fr', 'es'].includes(i18n.language) && <span>/ </span>}
                            {t('servicePlanCard.oneTime')}
                            {i18n.language === 'ar' && <span> /</span>}
                          </Typography>
                        )}
                      </div>
                    </div>

                    {/* Centered custom Tailwind toggle for Features/Limits */}
                    {(isSuperUser === true || userRole === 'Admin') && (
                      <div className='w-full flex justify-center'>
                        <div className='flex items-center justify-center bg-surfacePaper rounded-full p-1 w-fit border border-border'>
                          <Button
                            variant='text'
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold normal-case transition-all duration-200 shadow-none !outline-none ${
                              !isLimits ? 'bg-primary text-white shadow' : 'bg-transparent text-gray-500'
                            }`}
                            onClick={() =>
                              setShowLimitsMap(prev => ({
                                ...prev,
                                [plan.id]: false
                              }))
                            }
                          >
                            {t('servicePlanCard.featuresBtn')}
                          </Button>
                          <Button
                            variant='text'
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold normal-case transition-all duration-200 shadow-none !outline-none ${
                              isLimits ? 'bg-primary text-white shadow' : 'bg-transparent text-gray-500'
                            }`}
                            onClick={() =>
                              setShowLimitsMap(prev => ({
                                ...prev,
                                [plan.id]: true
                              }))
                            }
                          >
                            {t('servicePlanCard.limitBtn')}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Features or Limits Section */}
                    <div>
                      <div className='flex flex-col gap-3 mbs-3'>
                        {Object.entries(
                          isSuperUser === true || userRole === 'Admin'
                            ? isLimits
                              ? plan.limits || {}
                              : plan.features || {}
                            : plan.features || {}
                        ).map(([key, value]) => (
                          <div key={key} className='grid grid-cols-12 items-center gap-x-4'>
                            <div className='col-span-8 flex items-center gap-x-3'>
                              <i className='tabler-bullet bg-primaryLight w-4 h-4 rounded-full' />
                              <Typography variant='h6' className='text-wrap'>
                                {(isSuperUser === true || userRole === 'Admin') && isLimits
                                  ? serviceData.limit_list[key]
                                  : serviceData.features_list[key]}
                              </Typography>
                            </div>
                            <div className='col-span-4 flex justify-end'>
                              <Typography variant='h6'>{formatValue(value as number | boolean | string)}</Typography>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {(isSuperUser === true || userRole === 'Admin') && (
                      <div className='flex flex-col justify-start gap-3'>
                        {plan.stripe_price_id && (
                          <div className='flex flex-wrap gap-x-3 p-3 bg-primaryLight rounded-md'>
                            <Typography variant='body2' className='font-semibold mb-1'>
                              {t('servicePlanCard.stripePlanInformation')}:
                            </Typography>
                            <Typography variant='body2'>{plan.stripe_price_id}</Typography>
                          </div>
                        )}
                        {plan.paypal_plan_id && Object.keys(plan.paypal_plan_id).length > 0 && (
                          <div className='flex flex-col gap-y-2 p-3 bg-primaryLight rounded-md'>
                            <Typography variant='body2' className='font-semibold mb-1'>
                              {t('servicePlanCard.paypalPlanInformation')}:
                            </Typography>
                            {Object.entries(plan.paypal_plan_id).map(([key, value]) => (
                              <div
                                key={key}
                                className='w-full flex flex-wrap items-start gap-x-2 pr-2'
                                style={{ wordBreak: 'break-word' }}
                              >
                                <Typography
                                  variant='body2'
                                  className='mb-1 font-semibold break-all min-w-0 max-w-full'
                                  style={{ wordBreak: 'break-all', whiteSpace: 'pre-line' }}
                                >
                                  {key}:
                                </Typography>
                                <Typography
                                  variant='body2'
                                  className='break-all min-w-0 max-w-full'
                                  style={{ wordBreak: 'break-all', whiteSpace: 'pre-line' }}
                                >
                                  {typeof value === 'string' ? value : String(value)}
                                </Typography>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {/* {!(isSuperUser === true || userRole === 'Admin') && ( */}
                    <div className='w-full mt-auto'>
                      {plan.id === activePlanId && isPlanActive === 'active' ? (
                        <Button
                          variant='contained'
                          className={`shadow-2xl w-full ${
                            Number(plan.price) === 0 && Number(plan.yearly_price) === 0
                              ? 'bg-primary text-white !cursor-not-allowed'
                              : (activePlanBillingCycle === 'monthly' && planType === 'yearly') ||
                                  (activePlanBillingCycle === 'yearly' && planType === 'monthly')
                                ? 'bg-primary text-white'
                                : 'bg-primary text-white !cursor-not-allowed'
                          }`}
                          disabled={Number(plan.price) === 0 && Number(plan.yearly_price) === 0}
                          onClick={() => handleActivePlanAction(plan)}
                        >
                          {getButtonText(plan)}
                        </Button>
                      ) : (
                        <Button
                          variant='contained'
                          className={`shadow-2xl w-full ${subscriptionId ? 'bg-primaryLight text-primary' : 'bg-primary text-white'}`}
                          onClick={() => (subscriptionId ? handleUpgradePlan(plan) : handleGetStarted(plan))}
                        >
                          {getButtonText(plan)}
                        </Button>
                      )}
                    </div>
                    {/* )} */}
                  </CardContent>
                </Card>
              </Grid>
            )
          })
        ) : (
          <div className='col-span-12 my-10 p-6 flex items-center justify-center bg-backgroundPaper shadow-lg rounded-[6px]'>
            <Typography variant='h5' color='text.secondary' className='font-medium'>
              {t('servicePlanCard.noPlansFound')}
            </Typography>
          </div>
        )}
      </div>
      {selectedPlan && (
        <>
          <ConfirmationModal
            open={confirmationModalOpen}
            onClose={() => setConfirmationModalOpen(false)}
            plan={selectedPlan}
            serviceName={serviceData.name}
            planType={planType}
            subscriptionId={subscriptionId}
            isPlanActive={isPlanActive || ''}
            activePlanProvider={activePlanProvider}
            nextBillingDate={nextBillingDate}
            isBillingCycleSwitch={
              selectedPlan.id === activePlanId &&
              isPlanActive === 'active' &&
              ((activePlanBillingCycle === 'monthly' && planType === 'yearly') ||
                (activePlanBillingCycle === 'yearly' && planType === 'monthly'))
            }
          />
        </>
      )}
    </>
  )
}

export default PlansCard
