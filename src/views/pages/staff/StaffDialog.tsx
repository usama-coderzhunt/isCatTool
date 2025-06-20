'use client'

import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material'
import { useStaffHooks } from '@/services/useStaffHooks'
import type { Staff } from '@/types/apps/staffTypes'
import CircularLoader from '@/components/CircularLoader'
import { Controller } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { createStaffSchema, updateStaffSchema } from '@/utils/schemas/createStaffSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRecaptchaStore } from '@/store/recaptchaStore'
import Recaptcha from '@/components/Recaptcha'
import CustomTextField from '@/@core/components/mui/TextField'
import PhoneInput from '@/components/phoneInput'
import { useTranslation } from 'next-i18next'
import { useParams } from 'next/navigation'
import { toast } from 'react-toastify'

interface StaffDialogProps {
  open: boolean
  onClose: () => void
  initialData?: Staff
  isUpdate?: boolean
}

interface FormData {
  username: string
  first_name: string
  middle_name: string
  last_name: string
  email: string
  phone_number: string
  position: number | undefined | null
  password: string
  password2: string
  country: string | null
}

const StaffDialog = ({ open, onClose, initialData, isUpdate }: StaffDialogProps) => {
  // store
  // const { recaptchaToken, setRecaptchaToken } = useRecaptchaStore();
  //States
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null)

  //Hooks
  const { useStaffPositions, useCreateStaffMember, useUpdateStaffMember } = useStaffHooks()
  const { data: positions, isLoading: loadingPositions } = useStaffPositions()

  const createStaff = useCreateStaffMember()
  const updateStaff = useUpdateStaffMember()

  const schema = isUpdate ? updateStaffSchema : createStaffSchema

  const {
    control,
    handleSubmit,
    reset,
    register,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: {
      username: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      password: '',
      password2: '',
      position: null
    }
  })

  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  useEffect(() => {
    if (open) {
      if (isUpdate && initialData) {
        // Set form values for update mode
        reset({
          position: initialData.position ? Number(initialData.position) : null,
          first_name: initialData.first_name ?? '',
          middle_name: initialData.middle_name ?? '',
          last_name: initialData.last_name ?? '',
          email: initialData.email ?? '',
          phone_number: initialData.phone_number ?? ''
        })
        setPhoneNumber(initialData.phone_number ?? null)
      } else {
        // Reset form for create mode
        reset({
          username: '',
          first_name: '',
          middle_name: '',
          last_name: '',
          email: '',
          phone_number: '',
          password: '',
          password2: '',
          position: null
        })
        setPhoneNumber(null)
      }
    }
  }, [open, isUpdate, initialData, reset])

  const onSubmit = async (data: any) => {
    const finalData = {
      ...data,
      position: data.position === '' || data.position === 0 ? null : data.position,
      username: data.username ?? '',
      middle_name: data.middle_name ?? '',
      phone_number: data.phone_number ?? ''
    }

    if (isUpdate && initialData) {
      updateStaff.mutate(
        {
          id: initialData.id,
          ...finalData
        },
        {
          onSuccess: () => {
            toast.success(t('staffTable.toasts.staffUpdatedSuccess'))
            handleCloseModal()
          }
        }
      )
    } else {
      createStaff.mutate(finalData, {
        onSuccess: () => {
          toast.success(t('staffTable.toasts.staffCreatedSuccess'))
          handleCloseModal()
        }
      })
    }
    reset()
  }

  const handleCloseModal = () => {
    onClose()
    reset({
      username: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      password: '',
      password2: '',
      position: null
    })
    setPhoneNumber(null)
  }

  const handlePhoneNumberChange = (newPhoneNumber: string) => {
    setPhoneNumber(newPhoneNumber)
    setValue('phone_number', newPhoneNumber, { shouldValidate: true })
  }

  if (loadingPositions) return <CircularLoader />

  return (
    <Dialog open={open} onClose={handleCloseModal} maxWidth={'md'} fullWidth>
      <DialogTitle className='text-[24px] font-normal flex justify-between items-center'>
        {isUpdate ? t('staffDialog.updateTitle') : t('staffDialog.createTitle')}
        <Button
          onClick={handleCloseModal}
          variant='outlined'
          className='min-w-fit w-[32px] h-[32px] border-none m-0 !p-0 rounded-full bg-transparent hover:bg-primary hover:text-white flex items-center justify-center'
        >
          <i className='tabler-x w-[18px] h-[18px]'></i>
        </Button>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} className='mt-8 grid grid-cols-1 md:grid-cols-2 gap-8'>
          {!isUpdate && (
            <CustomTextField
              fullWidth
              label={t('staffDialog.username')}
              type='text'
              {...register('username')}
              error={!!errors.username}
              helperText={errors.username?.message}
              showAsterisk={true}
            />
          )}
          <CustomTextField
            fullWidth
            label={t('staffDialog.firstName')}
            type='text'
            {...register('first_name')}
            error={!!errors.first_name}
            helperText={errors.first_name?.message}
            showAsterisk={true}
          />
          <CustomTextField
            fullWidth
            label={t('staffDialog.middleName')}
            {...register('middle_name')}
            error={!!errors.middle_name}
            helperText={errors.middle_name?.message}
            showAsterisk={true}
          />
          <CustomTextField
            fullWidth
            label={t('staffDialog.lastName')}
            type='text'
            {...register('last_name')}
            error={!!errors.last_name}
            helperText={errors.last_name?.message}
            showAsterisk={true}
          />
          <CustomTextField
            fullWidth
            label={t('staffDialog.email')}
            type='email'
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            showAsterisk={true}
          />
          <PhoneInput
            initialPhoneNumber={initialData?.phone_number || phoneNumber}
            onPhoneNumberChange={handlePhoneNumberChange}
            label={t('staffDialog.phoneNumber')}
            {...register('phone_number')}
            error={!!errors.phone_number}
            helperText={errors.phone_number?.message}
            showAsterisk={true}
            onBlur={e => {
              if (!e.target.value.trim()) {
                setValue('phone_number', '', { shouldValidate: true })
              }
            }}
          />
          {!isUpdate && (
            <>
              <CustomTextField
                label={t('staffDialog.password')}
                type='password'
                fullWidth
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                showAsterisk={true}
              />
              <CustomTextField
                label={t('staffDialog.confirmPassword')}
                type='password'
                fullWidth
                {...register('password2')}
                error={!!errors.password2}
                helperText={errors.password2?.message}
                showAsterisk={true}
              />
            </>
          )}
          {isUpdate ? (
            <Controller
              name='position'
              control={control}
              rules={{ required: t('validation.required') }}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel shrink>{t('staffDialog.position')}</InputLabel>
                  <Select label={t('staffDialog.position')} {...field} notched>
                    {positions?.results?.map((position: any) => (
                      <MenuItem key={position.id} value={position.id}>
                        {position.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{errors.position?.message}</FormHelperText>
                </FormControl>
              )}
            />
          ) : (
            <div className='flex flex-col gap-y-4'>
              <TextField
                select
                label={t('staffDialog.position')}
                fullWidth
                {...register('position')}
                className='text-lg'
                error={!!errors.position}
                helperText={errors.position?.message}
                onBlur={e => {
                  if (!e.target.value.trim()) {
                    setValue('position', null, { shouldValidate: true })
                  }
                }}
                InputLabelProps={{
                  shrink: true
                }}
              >
                <MenuItem value=''>None</MenuItem>
                {positions?.results?.map((position: any) => (
                  <MenuItem key={Number(position.id)} value={Number(position.id)}>
                    {position.name}
                  </MenuItem>
                ))}
              </TextField>
              {/* <Recaptcha /> */}
            </div>
          )}

          <div className='md:col-span-2 flex justify-end mt-4'>
            <Button
              type='submit'
              variant='contained'
              className='bg-[#7367F0] hover:bg-[#6054e0] text-white text-[18px] py-4 px-10 rounded-lg'
              // disabled={createStaff.isPending || updateStaff.isPending || process.env.NEXT_PUBLIC_ENV === 'development' ? false : !recaptchaToken}
            >
              {isUpdate ? t('staffDialog.updateStaff') : t('staffDialog.createStaff')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default StaffDialog
