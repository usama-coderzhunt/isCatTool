import * as React from 'react'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'

import CustomTextField from '@/@core/components/mui/TextField'

import { toast } from 'react-toastify'
import { modalStyles } from '@/utils/constants/modalsStyles'
import { CouponsTypes } from '@/types/coupons'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { useCouponsHooks } from '@/services/useCouponsHooks'

interface AddCouponModalProps {
  open: boolean
  handleClose: React.Dispatch<React.SetStateAction<boolean>>
  couponData?: CouponsTypes | null
  mode: string | null
}

const AddCouponModal: React.FC<AddCouponModalProps> = ({ open, handleClose, couponData, mode }) => {
  const { t } = useTranslation('global')
  const [validFrom, setValidFrom] = useState<Date | null>(null)
  const [validUntil, setValidUntil] = useState<Date | null>(null)
  const [showDateErrors, setShowDateErrors] = useState(false)
  const [discountType, setDiscountType] = useState<string>('')

  const handleDiscountTypeChange = (event: any) => {
    setDiscountType(event.target.value)
    setValue('discount_type', event.target.value)
  }

  // hooks
  const { useCreateCoupon, useEditCoupon } = useCouponsHooks()
  const { mutate: createCoupon } = useCreateCoupon()
  const { mutate: editCoupon } = useEditCoupon()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<CouponsTypes>({
    mode: 'onSubmit',
    defaultValues: {
      code: '',
      discount_value: null,
      usage_limit: null,
      valid_from: '',
      valid_until: '',
      discount_type: 'percentage',
      description: ''
    }
  })

  React.useEffect(() => {
    if (mode === 'edit' && couponData) {
      setValue('code', couponData.code)
      setValue('discount_value', couponData.discount_value)
      setValue('valid_from', couponData.valid_from)
      setValue('valid_until', couponData.valid_until)
      setValue('discount_type', couponData.discount_type)
      setValue('description', couponData.description)
      setValue('usage_limit', couponData.usage_limit)

      if (couponData.valid_from) {
        setValidFrom(new Date(couponData.valid_from))
      }
      if (couponData.valid_until) {
        setValidUntil(new Date(couponData.valid_until))
      }
      if (couponData.discount_type) {
        setDiscountType(couponData.discount_type)
      }
    } else if (mode === 'create') {
      reset()
      setValidFrom(null)
      setValidUntil(null)
    }
  }, [couponData, mode, setValue, reset])

  const onSubmit: SubmitHandler<CouponsTypes> = (data: CouponsTypes) => {
    const formattedData = {
      ...data,
      valid_from: validFrom ? validFrom.toISOString() : '',
      valid_until: validUntil ? validUntil.toISOString() : '',
      discount_type: discountType || 'percentage'
    }

    if (mode === 'create') {
      createCoupon(formattedData as CouponsTypes, {
        onSuccess: () => {
          toast.success(t('coupons.form.success_create'))
          handleCloseModal()
        }
      })
    } else if (mode === 'edit' && couponData?.id) {
      editCoupon(
        { ...formattedData, id: Number(couponData?.id) },
        {
          onSuccess: () => {
            toast.success(t('coupons.form.success_edit'))
            handleCloseModal()
          }
        }
      )
    }
  }

  const handleCloseModal = () => {
    if (mode === 'create') {
      reset()
    }
    setDiscountType('')
    handleClose(false)
    setShowDateErrors(false)
    setValidFrom(null)
    setValidUntil(null)
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
        <Box sx={modalStyles}>
          <div className='flex gap-x-2 justify-between items-center mb-6'>
            <Typography variant='h4'>
              {mode === 'create' ? t('coupons.form.create') : t('coupons.form.edit')}
            </Typography>
            <Button
              onClick={handleCloseModal}
              variant='outlined'
              className='min-w-fit w-[32px] h-[32px] border-none m-0 !p-0 rounded-full bg-transparent hover:bg-primary hover:text-white flex items-center justify-center'
            >
              <i className='tabler-x w-[18px] h-[18px]'></i>
            </Button>
          </div>
          <form noValidate autoComplete='off' className='flex flex-col gap-6' onSubmit={handleSubmit(onSubmit)}>
            <div className='w-full grid grid-cols-12 gap-6'>
              {/* Code */}
              <div className='col-span-6'>
                <CustomTextField
                  fullWidth
                  label={t('coupons.form.code')}
                  type='text'
                  {...register('code', { required: 'Code is required' })}
                  defaultValue={couponData?.code || ''}
                  error={!!errors.code}
                  helperText={errors.code?.message}
                  showAsterisk={true}
                />
              </div>

              {/* Discount Value */}
              <div className='col-span-6 relative'>
                <CustomTextField
                  fullWidth
                  label={t('coupons.form.discount_value')}
                  type='number'
                  {...register('discount_value', {
                    required: 'Discount value is required',
                    min: { value: 0, message: 'Discount value must be greater than 0' }
                  })}
                  defaultValue={couponData?.discount_value || ''}
                  error={!!errors.discount_value}
                  helperText={errors.discount_value?.message}
                  showAsterisk={true}
                />
              </div>

              {/* Usage Limit */}
              <div className='col-span-6 relative'>
                <CustomTextField
                  fullWidth
                  label={t('coupons.form.usage_limit')}
                  type='number'
                  {...register('usage_limit', {
                    min: { value: 0, message: 'Usage limit must be greater than 0' }
                  })}
                  defaultValue={couponData?.usage_limit}
                  error={!!errors.usage_limit}
                  helperText={errors.usage_limit?.message}
                  onBlur={() => {
                    if (couponData?.usage_limit === 0) {
                      setValue('usage_limit', null)
                    }
                  }}
                />
              </div>

              {/* Valid From */}
              <div className='col-span-6'>
                <AppReactDatepicker
                  selected={validFrom}
                  onChange={(date: Date | null) => setValidFrom(date)}
                  showTimeSelect
                  timeFormat='HH:mm'
                  timeIntervals={1}
                  dateFormat='yyyy-MM-dd HH:mm'
                  shouldCloseOnSelect
                  monthsShown={1}
                  fixedHeight
                  showPopperArrow={false}
                  className='rtl-datepicker'
                  customInput={
                    <CustomTextField
                      fullWidth
                      label={t('coupons.form.valid_from')}
                      error={showDateErrors && !validFrom}
                      helperText={showDateErrors && !validFrom ? 'Valid from date is required' : ''}
                      showAsterisk={true}
                    />
                  }
                />
              </div>

              {/* Valid Until */}
              <div className='col-span-6'>
                <AppReactDatepicker
                  selected={validUntil}
                  onChange={(date: Date | null) => setValidUntil(date)}
                  showTimeSelect
                  timeFormat='HH:mm'
                  timeIntervals={1}
                  dateFormat='yyyy-MM-dd HH:mm'
                  shouldCloseOnSelect
                  monthsShown={1}
                  fixedHeight
                  showPopperArrow={false}
                  className='rtl-datepicker'
                  customInput={
                    <CustomTextField
                      fullWidth
                      label={t('coupons.form.valid_until')}
                      error={showDateErrors && !validUntil}
                      helperText={showDateErrors && !validUntil ? 'Valid until date is required' : ''}
                      showAsterisk={true}
                    />
                  }
                />
              </div>

              {/* Discount Type */}
              <div className='col-span-6'>
                <FormControl fullWidth>
                  <InputLabel shrink>{t('coupons.form.discount_type')}</InputLabel>
                  <Select
                    value={discountType}
                    label={t('coupons.form.discount_type')}
                    onChange={handleDiscountTypeChange}
                    notched
                  >
                    <MenuItem disabled>{t('coupons.form.select_discount_type')}</MenuItem>
                    <MenuItem value='percentage'>{t('coupons.form.percentage')}</MenuItem>
                    <MenuItem value='fixed'>{t('coupons.form.fixed')}</MenuItem>
                  </Select>
                </FormControl>
              </div>

              {/* Description */}
              <div className='col-span-12'>
                <CustomTextField
                  autoFocus
                  fullWidth
                  id='description'
                  label={t('coupons.form.description')}
                  type='text'
                  multiline
                  minRows={3}
                  maxRows={4}
                  {...register('description')}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 'auto'
                    }
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            {(mode === 'create' || mode === 'edit') && (
              <div className='w-full flex justify-end'>
                <Button
                  variant='contained'
                  sx={{
                    width: 'max-content',
                    padding: '0.5rem 1rem'
                  }}
                  onClick={() => setShowDateErrors(true)}
                  type='submit'
                >
                  {mode === 'create' ? t('coupons.form.create') : t('coupons.form.edit')}
                </Button>
              </div>
            )}
          </form>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddCouponModal
