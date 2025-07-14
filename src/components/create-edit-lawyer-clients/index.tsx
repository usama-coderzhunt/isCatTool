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
import CustomDatePicker from '@/@core/components/mui/DatePicker'

import PhoneInput from '@/components/phoneInput'
import { useLawyerClientsHooks } from '@/services/lawyerClients'
import { LawyerClientTypes } from '@/types/lawyerClients'
import { toast } from 'react-toastify'
import { createLawyerClientSchema } from '@/utils/schemas/createLawyerClientSchema'
import { useTranslation } from 'react-i18next'
import { modalStyles } from '@/utils/constants/modalsStyles'

interface AddLawyerClientModalProps {
  open: boolean
  handleClose: React.Dispatch<React.SetStateAction<boolean>>
  title: string
  lawyerClientData?: LawyerClientTypes | null
  mode: 'create' | 'edit'
  entity: 'lead' | 'client'
}

const AddLawyerClientModal: React.FC<AddLawyerClientModalProps> = ({
  open,
  handleClose,
  title,
  lawyerClientData,
  mode,
  entity
}) => {
  const { t } = useTranslation('global')

  // hooks
  const { useCreateLawyerClient, useEditLawyerClient } = useLawyerClientsHooks()
  const { mutate: editLawyerClient } = useEditLawyerClient()
  const { mutate: createLawyerClient } = useCreateLawyerClient()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors }
  } = useForm<LawyerClientTypes>({
    resolver: zodResolver(createLawyerClientSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      middle_name: null,
      email: null,
      phone_number: null,
      date_of_birth: null,
      address: null,
      notes: null,
      client_type: entity,
      is_active: true
    }
  })

  const [phoneNumber, setPhoneNumber] = React.useState<string | null>(null)

  React.useEffect(() => {
    setPhoneNumber(null)
    if (mode === 'edit' && lawyerClientData) {
      setValue('first_name', lawyerClientData.first_name ?? '')
      setValue('last_name', lawyerClientData.last_name ?? null)
      setValue('middle_name', lawyerClientData.middle_name ?? null)
      setValue('email', lawyerClientData.email ?? null)
      setValue('phone_number', lawyerClientData.phone_number ?? null)
      setValue('date_of_birth', lawyerClientData.date_of_birth ?? null)
      setValue('address', lawyerClientData.address ?? null)
      setValue('notes', lawyerClientData.notes ?? null)
      setValue('client_type', lawyerClientData.client_type)
      setValue('is_active', lawyerClientData.is_active ?? false)
      setPhoneNumber(lawyerClientData.phone_number ?? null)
    } else if (mode === 'create') {
      reset()
    }
  }, [lawyerClientData, mode, setValue])

  const onSubmit: SubmitHandler<LawyerClientTypes> = (data: any) => {
    if (mode === 'create') {
      createLawyerClient(data as LawyerClientTypes, {
        onSuccess: () => {
          toast.success(
            `${t('lawyerClients.form.lawyer')} ${entity.charAt(0).toUpperCase() + entity.slice(1)} ${t('lawyerClients.form.createdSuccess')}`
          )
          handleCloseModal()
          setPhoneNumber(null)
        }
      })
    } else if (mode === 'edit' && lawyerClientData?.id) {
      editLawyerClient(
        { id: Number(lawyerClientData?.id), ...data },
        {
          onSuccess: () => {
            toast.success(
              `${t('lawyerClients.form.lawyer')} ${entity.charAt(0).toUpperCase() + entity.slice(1)} ${t('lawyerClients.form.updatedSuccess')}`
            )
            handleCloseModal()
            reset()
            setPhoneNumber(null)
          }
        }
      )
    }
  }

  const handleCloseModal = () => {
    if (mode === 'create') {
      reset()
      setPhoneNumber(null)
    }
    handleClose(false)
    // setRecaptchaToken(null)
  }

  const handlePhoneNumberChange = (newPhoneNumber: string) => {
    setPhoneNumber(newPhoneNumber)
    setValue('phone_number', newPhoneNumber, { shouldValidate: true })
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
            <Typography variant='h4'>{title}</Typography>
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
              {/* First Name */}
              <div className='col-span-6'>
                <CustomTextField
                  fullWidth
                  label={t('lawyerClients.form.firstName')}
                  type='text'
                  {...register('first_name')}
                  defaultValue={lawyerClientData?.first_name || null}
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message}
                  showAsterisk={true}
                />
              </div>

              {/* Last Name */}
              <div className='col-span-6'>
                <CustomTextField
                  fullWidth
                  label={t('lawyerClients.form.lastName')}
                  type='text'
                  {...register('last_name')}
                  defaultValue={lawyerClientData?.last_name || ''}
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                  showAsterisk={true}
                />
              </div>

              {/* Middle Name */}
              <div className='col-span-6'>
                <CustomTextField
                  fullWidth
                  label={t('lawyerClients.form.middleName')}
                  type='text'
                  {...register('middle_name')}
                  defaultValue={lawyerClientData?.middle_name || ''}
                  error={!!errors.middle_name}
                  helperText={errors.middle_name?.message}
                  onBlur={e => {
                    if (!e.target.value.trim()) {
                      setValue('middle_name', null, { shouldValidate: true })
                    }
                  }}
                />
              </div>

              {/* Email */}
              <div className='col-span-6'>
                <CustomTextField
                  fullWidth
                  label={t('lawyerClients.form.email')}
                  type='email'
                  {...register('email')}
                  defaultValue={lawyerClientData?.email || ''}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  onBlur={e => {
                    if (!e.target.value.trim()) {
                      setValue('email', null, { shouldValidate: true })
                    }
                  }}
                />
              </div>

              {/* Phone Number */}
              <div className='col-span-6'>
                <PhoneInput
                  initialPhoneNumber={phoneNumber}
                  onPhoneNumberChange={handlePhoneNumberChange}
                  label={t('lawyerClients.form.phoneNumber')}
                  error={!!errors.phone_number}
                  helperText={errors.phone_number?.message}
                  onBlur={e => {
                    if (!e.target.value.trim()) {
                      setValue('phone_number', null, { shouldValidate: true })
                    }
                  }}
                  showAsterisk={true}
                />
              </div>

              {/* Date of Birth */}
              <div className='col-span-6'>
                <CustomDatePicker
                  label={t('lawyerClients.form.dateOfBirth')}
                  name='date_of_birth'
                  control={control}
                  error={!!errors.date_of_birth}
                  helperText={errors.date_of_birth?.message}
                  defaultValue={lawyerClientData?.date_of_birth || undefined}
                />
              </div>

              {/* Address */}
              <div className='col-span-6'>
                <CustomTextField
                  fullWidth
                  label={t('lawyerClients.form.address')}
                  type='text'
                  {...register('address')}
                  defaultValue={lawyerClientData?.address || ''}
                  error={!!errors.address}
                  helperText={errors.address?.message}
                />
              </div>

              {/* Notes */}
              <div className='col-span-12 relative'>
                <CustomTextField
                  className='hover:appearance-none focus:outline-none'
                  fullWidth
                  label={t('clientModal.fields.notes')}
                  type='text'
                  {...register('notes')}
                  defaultValue={lawyerClientData?.notes || null}
                  error={!!errors.notes}
                  helperText={errors.notes?.message}
                  id='notes'
                  multiline
                  minRows={3}
                  maxRows={4}
                  sx={{ '& .MuiOutlinedInput-root': { height: 'auto' } }}
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
                  className='capitalize'
                  type='submit'
                >
                  {mode === 'create'
                    ? t(`${entity === 'lead' ? 'lawyerClients.form.addLead' : 'lawyerClients.form.addClient'}`)
                    : t(`${entity === 'lead' ? 'lawyerClients.form.updateLead' : 'lawyerClients.form.updateClient'}`)}
                </Button>
              </div>
            )}
          </form>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddLawyerClientModal
