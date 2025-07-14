'use client'
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

import { createClientSchema } from '@/utils/schemas/createClientSchema'
import { useClientHooks } from '@/services/useClientHook'
import type { CreateClient } from '@/types/apps/TableDataTypes'
import CountrySelect from '@/components/MuiDropDowns/CountrySelect'

import PhoneInput from '@/components/phoneInput'
import { useTranslation } from 'react-i18next'
import { modalStyles } from '@/utils/constants/modalsStyles'
import { toast } from 'react-toastify'

interface AddClientModalProps {
  open: boolean
  handleClose: React.Dispatch<React.SetStateAction<boolean>>
  title: string
  clientData?: CreateClient | null
  mode: 'create' | 'edit'
  entity: 'lead' | 'client'
  pathName: string
}

const AddClientModal: React.FC<AddClientModalProps> = ({
  open,
  handleClose,
  title,
  clientData,
  mode,
  entity,
  pathName
}) => {
  const { t } = useTranslation('global')

  const { useSaveClient, useUpdateClient } = useClientHooks()
  const { mutate: editClient } = useUpdateClient()
  const { mutate: createClient } = useSaveClient()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    control,
    formState: { errors }
  } = useForm<CreateClient>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      first_name: '',
      last_name: null,
      middle_name: null,
      email: null,
      phone_number: null,
      date_of_birth: null,
      address: null,
      customer_country: null,
      notes: null,
      client_type: entity,
      is_active: true
    }
  })

  const [selectedCountry, setSelectedCountry] = React.useState(mode === 'edit' ? clientData?.customer_country : '')
  const [phoneNumber, setPhoneNumber] = React.useState<string | null>(null)

  React.useEffect(() => {
    setPhoneNumber(null)
    if (mode === 'edit' && clientData) {
      setValue('first_name', clientData.first_name ?? '')
      setValue('last_name', clientData.last_name ?? null)
      setValue('middle_name', clientData.middle_name ?? null)
      setValue('email', clientData.email ?? null)
      setValue('phone_number', clientData.phone_number ?? null)
      setValue('date_of_birth', clientData.date_of_birth ?? null)
      setValue('address', clientData.address ?? null)
      setValue('customer_country', clientData.customer_country ?? null)
      setValue('notes', clientData.notes ?? null)
      setValue('client_type', clientData.client_type)
      setValue('is_active', clientData.is_active ?? false)
      setPhoneNumber(clientData.phone_number ?? null)
    } else if (mode === 'create') {
      reset()
    }
  }, [clientData, mode, setValue])

  React.useEffect(() => {
    setSelectedCountry(getValues().customer_country)
  }, [getValues()])

  const onSubmit: SubmitHandler<CreateClient> = (data: any) => {
    if (mode === 'create') {
      createClient(data, {
        onSuccess: () => {
          toast.success(
            `${pathName?.includes('/clients') ? t('clientTable.client') : t('clientTable.lead')} ${t('clientTable.clientCreated')}`
          )
          handleCloseModal()
          setPhoneNumber(null)
        }
      })
    } else if (mode === 'edit' && clientData?.id) {
      editClient(
        { id: Number(clientData?.id), ...data },
        {
          onSuccess: () => {
            toast.success(
              `${pathName?.includes('/clients') ? t('clientTable.client') : t('clientTable.lead')} ${t('clientTable.clientUpdatedSuccess')}`
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
            <Typography variant='h4'>
              {mode === 'create'
                ? t(`${entity === 'client' ? 'clientTable.addClient' : 'clientTable.addLead'}`)
                : t(`${entity === 'client' ? 'clientTable.updateClient' : 'clientTable.updateLead'}`)}
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
              {/* First Name */}
              <div className='col-span-6'>
                <CustomTextField
                  fullWidth
                  label={t('clientModal.fields.firstName')}
                  type='text'
                  {...register('first_name')}
                  defaultValue={clientData?.first_name || null}
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message}
                  showAsterisk={true}
                />
              </div>

              {/* Last Name */}
              <div className='col-span-6'>
                <CustomTextField
                  fullWidth
                  label={t('clientModal.fields.lastName')}
                  type='text'
                  {...register('last_name')}
                  defaultValue={clientData?.last_name || ''}
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                />
              </div>

              {/* Middle Name */}
              <div className='col-span-6'>
                <CustomTextField
                  fullWidth
                  label={t('clientModal.fields.middleName')}
                  type='text'
                  {...register('middle_name')}
                  defaultValue={clientData?.middle_name || ''}
                  error={!!errors.middle_name}
                  helperText={errors.middle_name?.message}
                />
              </div>

              {/* Email */}
              <div className='col-span-6'>
                <CustomTextField
                  fullWidth
                  label={t('clientModal.fields.email')}
                  type='email'
                  {...register('email')}
                  defaultValue={clientData?.email || ''}
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
                  label={t('clientModal.fields.phoneNumber')}
                  error={!!errors.phone_number}
                  helperText={errors.phone_number?.message}
                  onBlur={e => {
                    if (!e.target.value.trim()) {
                      setValue('phone_number', null, { shouldValidate: true })
                    }
                  }}
                />
              </div>

              {/* Date of Birth */}
              <div className='col-span-6'>
                <CustomDatePicker
                  label={t('clientModal.fields.dateOfBirth')}
                  name='date_of_birth'
                  control={control}
                  error={!!errors.date_of_birth}
                  helperText={errors.date_of_birth?.message}
                  defaultValue={clientData?.date_of_birth || undefined}
                />
              </div>

              {/* Address */}
              <div className='col-span-6'>
                <CustomTextField
                  fullWidth
                  label={t('clientModal.fields.address')}
                  type='text'
                  {...register('address')}
                  defaultValue={clientData?.address || ''}
                  error={!!errors.address}
                  helperText={errors.address?.message}
                />
              </div>

              {/* Customer Country */}
              <div className='col-span-6'>
                <CountrySelect
                  onCountryChange={value => {
                    setValue('customer_country', value, { shouldValidate: true })
                  }}
                  selectedCountry={selectedCountry ?? undefined}
                />

                {errors.customer_country && (
                  <Typography variant='body2' color='error'>
                    {errors.customer_country.message}
                  </Typography>
                )}
              </div>

              <div className='col-span-12 relative'>
                <CustomTextField
                  className='hover:appearance-none focus:outline-none'
                  fullWidth
                  label={t('clientModal.fields.notes')}
                  type='text'
                  {...register('notes')}
                  defaultValue={clientData?.notes || null}
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
                  type='submit'
                >
                  {mode === 'create'
                    ? t(`${entity === 'client' ? 'clientTable.addClient' : 'clientTable.addLead'}`)
                    : t(`${entity}Modal.buttons.update`)}
                </Button>
              </div>
            )}
          </form>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddClientModal
