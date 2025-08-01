import * as React from 'react'

import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import CustomTextField from '@/@core/components/mui/TextField'
import { useServicesHooks } from '@/services/useServicesHooks'
import { useTranslation } from 'next-i18next'
import { modalStyles } from '@/utils/constants/modalsStyles'
import { ServicePlanTypes } from '@/types/servicesPlans'
import { MenuItem } from '@mui/material'
import { InputLabel } from '@mui/material'
import { FormControl, Select } from '@mui/material'
import { createServicePlanSchema } from '@/utils/schemas/createServicePlanSchema'
import { toast } from 'react-toastify'
import KeyValuePairInput from '@/components/common/KeyValuePairInput'
import { Controller } from 'react-hook-form'
import { FormControlLabel, Switch } from '@mui/material'

interface AddServicePlanModalProps {
  open: boolean
  handleClose: () => void
  handleOpen: (mode: 'view' | 'create' | 'edit', servicePlan?: ServicePlanTypes & { serviceID?: string }) => void
  serviceId: string
  title: string
  servicePlanData?: (ServicePlanTypes & { serviceID?: number }) | null
  mode: 'view' | 'create' | 'edit'
  parentServiceFeatures?: Record<string, any>
  parentServiceLimits?: Record<string, any>
}

const AddServicePlanModal: React.FC<AddServicePlanModalProps> = ({
  open,
  handleClose,
  serviceId,
  title,
  servicePlanData,
  mode,
  parentServiceFeatures = {},
  parentServiceLimits = {}
}) => {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    clearErrors,
    control,
    watch,
    formState: { errors }
  } = useForm<ServicePlanTypes>({
    mode: 'onSubmit',
    defaultValues: {
      id: undefined,
      name: '',
      service_type: '',
      price: null,
      yearly_price: null,
      trial_period_days: null,
      is_active: undefined,
      requires_payment_info_for_free_plan: undefined,
      service: serviceId,
      features: {},
      limits: {}
    }
  })

  const [service_type, setServiceType] = React.useState<string>('')
  const watchServiceType = watch('service_type')

  // Api Call
  const { useCreateServicePlan, useEditServicePlan } = useServicesHooks()
  const { mutate: createServicePlan } = useCreateServicePlan()
  const { mutate: editServicePlan } = useEditServicePlan()

  // Available Keys
  const availableFeatureKeys = Object.keys(parentServiceFeatures || {})
  const availableLimitKeys = Object.keys(parentServiceLimits || {})

  React.useEffect(() => {
    setValue('service', serviceId)

    if ((mode === 'edit' || mode === 'view') && servicePlanData) {
      setValue('name', servicePlanData.name)
      setValue('service_type', servicePlanData.service_type)
      setValue('price', servicePlanData.price)
      setValue(
        'yearly_price',
        servicePlanData.yearly_price ? String(Math.round(Number(servicePlanData.yearly_price))) : null
      )
      setValue('trial_period_days', servicePlanData.trial_period_days)
      setValue('is_active', servicePlanData.is_active)
      setValue('requires_payment_info_for_free_plan', servicePlanData.requires_payment_info_for_free_plan)
      setValue('service', servicePlanData.service)
      setValue('features', servicePlanData.features || {})
      setValue('limits', servicePlanData.limits || {})
      setServiceType(servicePlanData.service_type || '')
      if (servicePlanData.serviceID) {
        setValue('id', servicePlanData.serviceID)
      }
    } else if (mode === 'create') {
      reset()
      setServiceType('')
    }
  }, [servicePlanData, mode, setValue, serviceId])

  const handleServiceTypeChange = (event: any) => {
    const value = event.target.value
    setServiceType(value)
    setValue('service_type', value)
    clearErrors('service_type')
  }

  const onSubmit: SubmitHandler<ServicePlanTypes & { id?: number }> = data => {
    const latestValues = getValues()
    const payload = {
      name: latestValues.name,
      service_type: latestValues.service_type,
      price: latestValues.price,
      service: latestValues.service,
      features: latestValues.features,
      limits: latestValues.limits,
      yearly_price: latestValues.yearly_price,
      trial_period_days: latestValues.trial_period_days,
      is_active: latestValues.is_active === undefined ? true : latestValues.is_active,
      requires_payment_info_for_free_plan:
        latestValues.requires_payment_info_for_free_plan === undefined
          ? false
          : latestValues.requires_payment_info_for_free_plan
    }

    if (mode === 'create') {
      createServicePlan(payload, {
        onSuccess: () => {
          handleCloseModal()
          reset()
          toast.success(t('services.servicePlans.createSuccess'))
        },
        onError: error => {
          console.error('Error creating service plan:', error)
          toast.error(t('services.servicePlans.createError'))
        }
      })
    } else if (mode === 'edit' && servicePlanData?.serviceID) {
      const editData = {
        ...payload,
        id: servicePlanData.serviceID
      }
      editServicePlan(editData, {
        onSuccess: () => {
          handleCloseModal()
          toast.success(t('services.servicePlans.updateSuccess'))
        },
        onError: error => {
          console.error('Error updating service plan:', error)
          toast.error(t('services.servicePlans.updateError'))
        }
      })
    }
  }

  const handleCloseModal = () => {
    handleClose()
    reset({
      name: '',
      service_type: '',
      price: null,
      yearly_price: null,
      trial_period_days: null,
      is_active: undefined,
      requires_payment_info_for_free_plan: undefined,
      service: serviceId,
      features: {},
      limits: {}
    })
    setServiceType('')
  }

  const handleFeaturesListChange = (
    pairs: { key: string; value: string | number | boolean; type: 'string' | 'number' | 'boolean' }[],
    onChange: (value: any) => void
  ) => {
    const newFeaturesList = pairs.reduce(
      (acc, { key, value, type }) => {
        let processedValue = value
        if (type === 'number') {
          processedValue = Number(value)
        } else if (type === 'boolean') {
          processedValue = value === 'true' || value === true
        }
        acc[key] = processedValue
        return acc
      },
      {} as Record<string, string | number | boolean>
    )

    onChange(newFeaturesList)
  }

  const handleLimitsListChange = (
    pairs: { key: string; value: string | number | boolean; type: 'string' | 'number' | 'boolean' }[],
    onChange: (value: any) => void
  ) => {
    const filteredPairs = pairs.filter(
      pair => pair.key && pair.value !== undefined && pair.value !== null && pair.value !== ''
    )
    const newLimitsList = filteredPairs.reduce(
      (acc, { key, value, type }) => {
        let processedValue = value
        if (type === 'number') {
          processedValue = Number(value)
        } else if (type === 'boolean') {
          processedValue = value === 'true' || value === true
        }
        acc[key] = processedValue
        return acc
      },
      {} as Record<string, string | number | boolean>
    )
    onChange(newLimitsList)
  }

  return (
    <Modal
      aria-labelledby='transition-modal-title'
      aria-describedby='transition-modal-description'
      open={open}
      onClose={handleCloseModal}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500
        }
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            ...modalStyles,
            // width: '450px',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '800px',
            maxHeight: 'calc(100vh - 60px)',
            display: 'flex',
            flexDirection: 'column',
            m: 'auto',
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
            overflow: 'hidden'
          }}
        >
          <div className='flex gap-x-2 justify-between items-center mb-4 sticky top-0 z-50 pb-2 border-b mx-[-16px] px-4'>
            <Typography variant='h4'>{title}</Typography>
            <Button
              onClick={handleCloseModal}
              variant='outlined'
              className='min-w-fit w-[32px] h-[32px] border-none m-0 !p-0 rounded-full bg-primaryLighter hover:bg-primary hover:text-white flex items-center justify-center'
            >
              <i className='tabler-x w-[18px] h-[18px]'></i>
            </Button>
          </div>
          <Box
            sx={{
              overflowY: 'auto',
              pr: 4,
              mr: -4,
              pt: 2,
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': {
                display: 'none'
              }
            }}
          >
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
              <div className='w-full grid col-span-12 gap-6'>
                {/* Name */}
                <div className='col-span-6'>
                  <CustomTextField
                    fullWidth
                    label={t('services.servicePlans.form.fields.name')}
                    type='text'
                    {...register('name', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    })}
                    defaultValue={servicePlanData?.name || null}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={mode === 'view'}
                    showAsterisk={true}
                  />
                </div>

                {/* Price */}
                <div className='col-span-6'>
                  <CustomTextField
                    className='hover:appearance-none focus:outline-none'
                    fullWidth
                    label={t('services.servicePlans.form.fields.price')}
                    type='number'
                    {...register('price', {
                      required: 'Price is required',
                      valueAsNumber: true,
                      min: {
                        value: 0,
                        message: 'Price must be greater than or equal to 0'
                      }
                    })}
                    defaultValue={() => getValues().price}
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    disabled={mode === 'view'}
                    showAsterisk={true}
                  />
                </div>

                {/* Service Type */}
                <div className='col-span-6'>
                  <FormControl fullWidth error={!!errors.service_type} required>
                    <InputLabel
                      sx={{
                        '& .MuiInputLabel-asterisk': {
                          color: 'error.main'
                        }
                      }}
                      shrink
                    >
                      {t('services.servicePlans.form.fields.service_type')}
                    </InputLabel>
                    <Select
                      value={service_type}
                      label={t('services.servicePlans.form.fields.service_type')}
                      {...register('service_type', {
                        required: 'Service type is required',
                        onChange: e => {
                          handleServiceTypeChange(e)
                        }
                      })}
                      notched
                    >
                      <MenuItem disabled>{t('services.servicePlans.form.fields.selectServiceType')}</MenuItem>
                      <MenuItem value='subscription'>{t('services.servicePlans.form.fields.subscription')}</MenuItem>
                      <MenuItem value='one_time'>{t('services.servicePlans.form.fields.oneTime')}</MenuItem>
                    </Select>
                    {errors.service_type && (
                      <Typography
                        color='error'
                        className='mx-0.5 mt-[3px] text-[13px] font-normal leading-3 text-[#ff4c51]'
                        variant='caption'
                      >
                        {errors.service_type.message}
                      </Typography>
                    )}
                  </FormControl>
                </div>

                {watchServiceType === 'subscription' && (
                  <div className='col-span-6'>
                    <CustomTextField
                      className='hover:appearance-none focus:outline-none'
                      fullWidth
                      label={t('services.servicePlans.form.fields.yearly_price')}
                      type='number'
                      {...register('yearly_price', {
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: 'Yearly price must be greater than or equal to 0'
                        }
                      })}
                      defaultValue={() => {
                        const value = getValues().yearly_price
                        return value ? String(Math.round(Number(value))) : null
                      }}
                      error={!!errors.yearly_price}
                      helperText={errors.yearly_price?.message}
                      disabled={false}
                    />
                  </div>
                )}

                {/* Trial Period Days */}
                <div className='col-span-6'>
                  <CustomTextField
                    className='hover:appearance-none focus:outline-none'
                    fullWidth
                    label={t('services.servicePlans.form.fields.trial_period_days')}
                    type='number'
                    {...register('trial_period_days', { valueAsNumber: true })}
                    defaultValue={() => getValues().trial_period_days}
                    error={!!errors.trial_period_days}
                    helperText={errors.trial_period_days?.message}
                    disabled={false}
                  />
                </div>

                {/* Is Active */}
                <div className='col-span-6'>
                  <FormControl fullWidth>
                    <InputLabel id='is-active-label' shrink>
                      {t('services.servicePlans.form.fields.planStatus')}
                    </InputLabel>
                    <Controller
                      name='is_active'
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Select
                          labelId='is-active-label'
                          id='is-active'
                          label='Plan Status'
                          notched
                          value={value === true ? 'yes' : value === false ? 'no' : ''}
                          onChange={e => onChange(e.target.value === 'yes')}
                          disabled={mode === 'view'}
                        >
                          <MenuItem value='' disabled>
                            {t('services.servicePlans.form.fields.selectPlanStatus')}
                          </MenuItem>
                          <MenuItem value='yes'>{t('common.yes')}</MenuItem>
                          <MenuItem value='no'>{t('common.no')}</MenuItem>
                        </Select>
                      )}
                    />
                  </FormControl>
                </div>

                {/* Requires Payment Info For Free Plan */}
                <div className='col-span-6'>
                  <FormControl fullWidth>
                    <InputLabel id='requires-payment-label' shrink>
                      {t('services.servicePlans.form.fields.paymentInfoForFreePlan')}
                    </InputLabel>
                    <Controller
                      name='requires_payment_info_for_free_plan'
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Select
                          labelId='requires-payment-label'
                          id='requires-payment'
                          label='Payment Info For Free Plan'
                          notched
                          value={value === true ? 'yes' : value === false ? 'no' : ''}
                          onChange={e => onChange(e.target.value === 'yes')}
                          disabled={mode === 'view'}
                        >
                          <MenuItem value='' disabled>
                            {t('services.servicePlans.form.fields.selectPaymentInfoForFreePlan')}
                          </MenuItem>
                          <MenuItem value='yes'>{t('common.yes')}</MenuItem>
                          <MenuItem value='no'>{t('common.no')}</MenuItem>
                        </Select>
                      )}
                    />
                  </FormControl>
                </div>

                {/* Features List */}
                <div className='col-span-12'>
                  <Controller
                    name='features'
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <KeyValuePairInput
                        pairs={Object.entries(value || {}).map(([key, value]) => ({
                          key,
                          value: value as string | number | boolean,
                          type: typeof value as 'string' | 'number' | 'boolean'
                        }))}
                        onChange={newPairs => handleFeaturesListChange(newPairs, onChange)}
                        disabled={mode === 'view'}
                        showTypeSelector={true}
                        availableKeys={availableFeatureKeys}
                        label={t('keyValuePair.featuresList')}
                      />
                    )}
                  />
                </div>

                {/* Limits List */}
                <div className='col-span-12'>
                  <Controller
                    name='limits'
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <KeyValuePairInput
                        pairs={Object.entries(value || {}).map(([key, value]) => ({
                          key,
                          value: value as string | number | boolean,
                          type: typeof value as 'string' | 'number' | 'boolean'
                        }))}
                        onChange={newPairs => handleLimitsListChange(newPairs, onChange)}
                        disabled={mode === 'view'}
                        showTypeSelector={true}
                        availableKeys={availableLimitKeys}
                        label={t('keyValuePair.limitsList')}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Submit Button */}
              {(mode === 'create' || mode === 'edit') && (
                <div className='w-full flex justify-end'>
                  <Button
                    variant='contained'
                    type='submit'
                    sx={{
                      width: 'max-content',
                      padding: '0.5rem 1rem'
                    }}
                  >
                    {mode === 'create' ? t('services.servicePlans.addPlan') : t('services.servicePlans.updatePlan')}
                  </Button>
                </div>
              )}
            </form>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddServicePlanModal
