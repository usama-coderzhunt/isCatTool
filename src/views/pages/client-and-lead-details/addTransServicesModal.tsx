import * as React from 'react'

import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import type { SubmitHandler } from 'react-hook-form'
import { Controller, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import CustomTextField from '@/@core/components/mui/TextField'
import { useServicesHooks } from '@/services/useServicesHooks'

import type { CreateTransService } from '@/types/services'
import { createServiceSchema } from '@/utils/schemas/createServiceSchema'
import SelectDropDown from '@/components/MuiDropDowns/SelectDropDown'
import {
  COMMUNICATION_TYPE_CHOICES,
  LANGUAGE_CHOICES,
  MARKETING_FUNNEL_CHOICES,
  PRIORITY_CHOICES,
  TRANSLATION_TYPE_CHOICES
} from '@/components/MuiDropDowns/choices'

// Goggle ReCaptcha
import Recaptcha from '@/components/Recaptcha'
import { useRecaptchaStore } from '@/store/recaptchaStore'

import { useTranslation } from 'next-i18next'
import { modalStyles } from '@/utils/constants/modalsStyles'

interface AddTransServiceModalProps {
  open: boolean
  handleClose: () => void
  handleOpen: (mode: 'view' | 'create' | 'edit', service?: CreateTransService) => void
  clientId: number
  title: string
  serviceData?: CreateTransService | null
  mode: 'view' | 'create' | 'edit'
  serviceID?: string | null
}

const AddTransServiceModal: React.FC<AddTransServiceModalProps> = ({
  open,
  handleClose,
  clientId,
  title,
  serviceData,
  mode,
  serviceID
}) => {
  const { t } = useTranslation()

  // store
  // const { recaptchaToken, setRecaptchaToken } = useRecaptchaStore();

  // Api Call
  const { useCreateTransService, useEditTransService } = useServicesHooks()
  const { mutate: createService } = useCreateTransService()
  const { mutate: editService } = useEditTransService()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    control,
    formState: { errors }
  } = useForm<CreateTransService>({
    resolver: zodResolver(createServiceSchema),
    mode: 'onSubmit',
    defaultValues: {
      communication_platform: null,
      translation_type: null,
      marketing_funnel: null,
      source_language: null,
      target_language: null,
      priority: null,
      cost: null,
      trans_client: clientId
    }
  })

  React.useEffect(() => {
    setValue('trans_client', clientId)

    if ((mode === 'edit' || mode === 'view') && serviceData) {
      setValue('communication_platform', serviceData.communication_platform)
      setValue('translation_type', serviceData.translation_type)
      setValue('marketing_funnel', serviceData.marketing_funnel)
      setValue('source_language', serviceData.source_language)
      setValue('target_language', serviceData.target_language)
      setValue('priority', serviceData.priority)
      setValue('cost', serviceData.cost)
    } else if (mode === 'create') {
      setValue('communication_platform', null)
      setValue('translation_type', null)
      setValue('marketing_funnel', null)
      setValue('source_language', null)
      setValue('target_language', null)
      setValue('priority', null)
      setValue('cost', null)
    }
  }, [serviceData, mode, setValue, clientId])

  const onSubmit: SubmitHandler<CreateTransService> = data => {
    // if (!recaptchaToken && process.env.NEXT_PUBLIC_ENV !== "development") {
    //   return;
    // }
    if (mode === 'create') {
      createService(data, {
        onSuccess: () => {
          handleCloseModal()
          reset()
        }
      })
    } else if (mode === 'edit' && serviceID) {
      editService(
        { id: serviceID, data: data },
        {
          onSuccess: () => {
            handleCloseModal()
          }
        }
      )
    }
  }

  const handleValueChange = (field: keyof CreateTransService, value: string | null) => {
    setValue(field, value)
  }

  const handleCloseModal = () => {
    handleClose();
    reset();
    // setRecaptchaToken(null)
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
              className='min-w-fit w-[32px] h-[32px] border-none m-0 !p-0 rounded-full bg-primaryLighter hover:bg-primary hover:text-white flex items-center justify-center'
            >
              <i className='tabler-x w-[18px] h-[18px]'></i>
            </Button>
          </div>
          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
            <div className='w-full grid grid-cols-12 gap-6'>
              {/* Communication Platform */}
              <div className='col-span-6'>
                {mode === 'view' ? (
                  <CustomTextField
                    fullWidth
                    label={t('services.communicationPlatform')}
                    type='text'
                    {...register('communication_platform')}
                    defaultValue={serviceData?.communication_platform || null}
                    error={!!errors.communication_platform}
                    helperText={errors.communication_platform?.message}
                    disabled={mode === 'view'}
                  />
                ) : (
                  <Controller
                    name="communication_platform"
                    control={control}
                    render={({ field }) => (
                      <SelectDropDown
                        id="communication_platform"
                        label={t("services.communicationPlatform")}
                        options={COMMUNICATION_TYPE_CHOICES}
                        selectedValue={field.value || ""}
                        onValueChange={(value) => field.onChange(value)}
                        error={!!errors.communication_platform}
                        helperText={errors.communication_platform?.message}
                      />
                    )}
                  />
                )}
              </div>

              {/* Translation Type */}
              <div className='col-span-6'>
                {mode === 'view' ? (
                  <CustomTextField
                    fullWidth
                    label={t('services.translationType')}
                    type='text'
                    {...register('translation_type')}
                    defaultValue={serviceData?.marketing_funnel || null}
                    error={!!errors.marketing_funnel}
                    helperText={errors.marketing_funnel?.message}
                    disabled={mode === 'view'}
                  />
                ) : (
                  <Controller
                    name="translation_type"
                    control={control}
                    render={({ field }) => (
                      <SelectDropDown
                        id="translation_type"
                        label={t("services.translationType")}
                        options={TRANSLATION_TYPE_CHOICES}
                        selectedValue={field.value || ""}
                        onValueChange={(value) => field.onChange(value)}
                        error={!!errors.translation_type}
                        helperText={errors.translation_type?.message}
                      />
                    )}
                  />
                )}
              </div>

              {/* Marketing Funnel */}
              <div className='col-span-6'>
                {mode === 'view' ? (
                  <CustomTextField
                    fullWidth
                    label={t('services.marketingFunnel')}
                    type='text'
                    {...register('marketing_funnel')}
                    defaultValue={serviceData?.marketing_funnel || null}
                    error={!!errors.marketing_funnel}
                    helperText={errors.marketing_funnel?.message}
                    disabled={mode === 'view'}
                  />
                ) : (
                  <Controller
                    name="marketing_funnel"
                    control={control}
                    render={({ field }) => (
                      <SelectDropDown
                        id="marketing_funnel"
                        label={t("services.marketingFunnel")}
                        options={MARKETING_FUNNEL_CHOICES}
                        selectedValue={field.value || ""}
                        onValueChange={(value) => field.onChange(value)}
                        error={!!errors.marketing_funnel}
                        helperText={errors.marketing_funnel?.message}
                      />
                    )}
                  />
                )}
              </div>

              {/* Cost */}
              <div className='col-span-6 relative'>
                <CustomTextField
                  className='hover:appearance-none focus:outline-none'
                  fullWidth
                  label={t('services.cost')}
                  type='number'
                  {...register('cost', { valueAsNumber: true })}
                  defaultValue={() => getValues().cost}
                  error={!!errors.cost}
                  helperText={errors.cost?.message}
                  disabled={mode === 'view'}
                  showAsterisk={true}
                />
              </div>

              {/* Source Language */}
              <div className='col-span-6'>
                {mode === 'view' ? (
                  <CustomTextField
                    fullWidth
                    label={t('services.sourceLanguage')}
                    type='text'
                    {...register('source_language')}
                    defaultValue={serviceData?.source_language || null}
                    error={!!errors.source_language}
                    helperText={errors.source_language?.message}
                    disabled={mode === 'view'}

                  />
                ) : (
                  <Controller
                    name="source_language"
                    control={control}
                    render={({ field }) => (
                      <SelectDropDown
                        id="source_language"
                        label={t("services.sourceLanguage")}
                        options={LANGUAGE_CHOICES}
                        selectedValue={field.value || ""}
                        onValueChange={(value) => field.onChange(value)}
                        error={!!errors.source_language}
                        helperText={errors.source_language?.message}
                      />
                    )}
                  />
                )}
              </div>

              {/* Target Language */}
              <div className='col-span-6'>
                {mode === 'view' ? (
                  <CustomTextField
                    fullWidth
                    label={t('services.targetLanguage')}
                    type='text'
                    {...register('target_language')}
                    defaultValue={serviceData?.target_language || null}
                    error={!!errors.target_language}
                    helperText={errors.target_language?.message}
                    disabled={mode === 'view'}
                  />
                ) : (
                  <Controller
                    name="target_language"
                    control={control}
                    render={({ field }) => (
                      <SelectDropDown
                        id="target_language"
                        label={t("services.targetLanguage")}
                        options={LANGUAGE_CHOICES}
                        selectedValue={field.value || ""}
                        onValueChange={(value) => field.onChange(value)}
                        error={!!errors.target_language}
                        helperText={errors.target_language?.message}
                      />
                    )}
                  />
                )}
              </div>

              {/* Priority */}
              <div className='col-span-6'>
                {mode === 'view' ? (
                  <CustomTextField
                    fullWidth
                    label={t('services.priority')}
                    type='text'
                    {...register('priority')}
                    defaultValue={serviceData?.priority || null}
                    error={!!errors.priority}
                    helperText={errors.priority?.message}
                    disabled={mode === 'view'}
                  />
                ) : (
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <SelectDropDown
                        id="priority"
                        label={t("services.priority")}
                        options={PRIORITY_CHOICES}
                        selectedValue={field.value || ""}
                        onValueChange={(value) => field.onChange(value)}
                        error={!!errors.priority}
                        helperText={errors.priority?.message}
                      />
                    )}
                  />
                )}
              </div>
            </div>

            {/* {mode !== "view" &&
              <Recaptcha />
            } */}

            {/* Submit Button */}
            {(mode === 'create' || mode === 'edit') && (
              <div className='w-full flex justify-end'>
                <Button
                  variant='contained'
                  type='submit'
                  // disabled={process.env.NEXT_PUBLIC_ENV === 'development' ? false : !recaptchaToken}
                  sx={{
                    width: 'max-content',
                    padding: '0.5rem 1rem'
                  }}
                >
                  {mode === 'create' ? t('services.createNewService') : t('services.updateService')}
                </Button>
              </div>
            )}
          </form>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddTransServiceModal
