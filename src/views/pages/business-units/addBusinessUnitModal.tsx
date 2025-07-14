'use client'

import * as React from 'react'
import { useTranslation } from 'next-i18next'
import { useParams } from 'next/navigation'
import { Backdrop, Box, Modal, Fade, Button, Typography } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import CustomTextField from '@/@core/components/mui/TextField'
import { modalStyles } from '@/utils/constants/modalsStyles'
import { toast } from 'react-toastify'
import { useBusinessUnitHooks } from '@/services/useBusinessUnitHooks'
import { BusinessUnitType } from '@/types/businessUnitTypes'

interface AddBusinessUnitModalProps {
  open: boolean
  handleClose: () => void
  businessUnitData?: any
  businessUnitID?: string | null
  mode: 'create' | 'edit'
  title: string
}

const AddBusinessUnitModal = ({
  open,
  handleClose,
  businessUnitData,
  businessUnitID,
  mode,
  title
}: AddBusinessUnitModalProps) => {
  const { t } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { i18n } = useTranslation()

  React.useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  const { useCreateBusinessUnit, useEditBusinessUnit } = useBusinessUnitHooks()
  const { mutate: createBusinessUnit, isLoading: isCreating } = useCreateBusinessUnit()
  const { mutate: editBusinessUnit, isLoading: isEditing } = useEditBusinessUnit()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BusinessUnitType>({
    defaultValues: {
      name: '',
      description: null,
      notes: null
    }
  })

  React.useEffect(() => {
    if (businessUnitData && mode === 'edit') {
      reset({
        name: businessUnitData.name,
        description: businessUnitData.description || null,
        notes: businessUnitData.notes || null
      })
    }
  }, [businessUnitData, mode, reset])

  const onSubmit = async (data: any) => {
    if (mode === 'create') {
      createBusinessUnit(data, {
        onSuccess: () => {
          toast.success(t('businessUnits.toasts.businessUnitCreatedSuccess'))
          handleClose()
          handleModalClose()
          reset()
        }
      })
    } else if (mode === 'edit' && businessUnitID) {
      editBusinessUnit(
        { id: businessUnitID, ...data },
        {
          onSuccess: () => {
            toast.success(t('businessUnits.toasts.businessUnitUpdatedSuccess'))
            handleClose()
            handleModalClose()
            reset()
          }
        }
      )
    }
  }

  const handleModalClose = () => {
    reset({
      name: '',
      description: null,
      notes: null
    })
    handleClose()
  }

  return (
    <Modal
      aria-labelledby='transition-modal-title'
      aria-describedby='transition-modal-description'
      open={open}
      onClose={handleModalClose}
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
          <div className='flex gap-x-2 justify-between items-center mb-4 sticky top-[-16px] bg-backgroundPrimary z-50 pb-2 mx-[-16px] px-4'>
            <Typography variant='h4'>{title}</Typography>
            <Button
              onClick={handleModalClose}
              variant='outlined'
              className='min-w-fit w-[32px] h-[32px] border-none m-0 !p-0 rounded-full bg-transparent hover:bg-primary hover:text-white flex items-center justify-center'
            >
              <i className='tabler-x w-[18px] h-[18px]' />
            </Button>
          </div>
          <Box>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
              {/* Name */}
              <div className='col-span-12'>
                <Controller
                  name='name'
                  control={control}
                  rules={{ required: 'Name is required' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      label={t('businessUnits.form.name')}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      fullWidth
                      showAsterisk={true}
                    />
                  )}
                />
              </div>

              {/* Notes */}
              <div className='col-span-12'>
                <Controller
                  name='notes'
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      label={t('businessUnits.form.notes')}
                      error={!!errors.notes}
                      helperText={errors.notes?.message}
                      fullWidth
                      multiline
                      rows={4}
                    />
                  )}
                />
              </div>

              {/* Description */}
              <div className='col-span-12'>
                <Controller
                  name='description'
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      label={t('businessUnits.form.description')}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      fullWidth
                      multiline
                      rows={4}
                    />
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className='w-full flex justify-end'>
                <Button
                  variant='contained'
                  sx={{
                    width: 'max-content',
                    padding: '0.5rem 1rem'
                  }}
                  type='submit'
                  disabled={isCreating || isEditing}
                >
                  {mode === 'create' ? t('businessUnits.form.add') : t('businessUnits.form.update')}
                </Button>
              </div>
            </form>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddBusinessUnitModal
