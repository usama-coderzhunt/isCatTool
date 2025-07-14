import * as React from 'react'

import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import type { SubmitHandler } from 'react-hook-form'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { modalStyles } from '@/utils/constants/modalsStyles'
import SearchableMultiSelect from '@/components/common/SearchableMultiSelect'
import { useTranslationModelsHooks } from '@/services/useTranslationModelsHooks'

interface TranslationModelPermissionModalProps {
  open: boolean
  handleClose: React.Dispatch<React.SetStateAction<boolean>>
  title: string
  userId: number
}

interface TranslationModelPermissionForm {
  translation_model: number | undefined
}

const TranslationModelPermissionModal: React.FC<TranslationModelPermissionModalProps> = ({
  open,
  handleClose,
  title,
  userId
}) => {
  const { t } = useTranslation('global')
  const { getTranslationModels, useTranslationModelPermissions } = useTranslationModelsHooks()
  const { mutate: addTranslationModelPermission, isSuccess: isPermissionAdded } = useTranslationModelPermissions()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors }
  } = useForm<TranslationModelPermissionForm>({
    defaultValues: {
      translation_model: undefined
    },
    mode: 'onSubmit'
  })

  // Show success toast when permission is added
  React.useEffect(() => {
    if (isPermissionAdded) {
      toast.success(t('translationModelPermissionModal.toasts.translationModelPermissionAddedSuccess'))
      handleCloseModal()
    }
  }, [isPermissionAdded])

  const onSubmit: SubmitHandler<TranslationModelPermissionForm> = (data: TranslationModelPermissionForm) => {
    if (!data.translation_model) {
      toast.error(t('translationModelPermissionModal.toasts.pleaseSelectTranslationModel'))
      return
    }

    addTranslationModelPermission({
      id: data.translation_model,
      user_id: userId
    })
  }

  const handleCloseModal = () => {
    reset()
    handleClose(false)
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
        <Box sx={{ ...modalStyles, width: 450 }}>
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
            <div className='w-full flex flex-col gap-6'>
              {/* Translation Model */}
              <div className='w-full'>
                <Controller
                  control={control}
                  name='translation_model'
                  rules={{
                    required: 'Translation Model is required'
                  }}
                  render={({ field }) => (
                    <SearchableMultiSelect<any>
                      options={getTranslationModels}
                      name='translation_model'
                      register={register}
                      returnAsArray={false}
                      returnAsString={false}
                      setValue={setValue}
                      fieldError={errors.translation_model}
                      labelKey='name'
                      value={watch('translation_model') || undefined}
                      className='w-full'
                      label={t('translationModelPermissionModal.translationModel')}
                      multiple={false}
                      showAsterisk={true}
                    />
                  )}
                />
              </div>
            </div>
            {/* Submit Button */}
            <div className='w-full flex justify-end gap-x-2'>
              <Button
                variant='outlined'
                sx={{
                  width: 'max-content',
                  padding: '0.5rem 1rem'
                }}
                onClick={handleCloseModal}
              >
                {t('translationModelPermissionModal.cancel')}
              </Button>
              <Button
                variant='contained'
                sx={{
                  width: 'max-content',
                  padding: '0.5rem 1rem'
                }}
                type='submit'
              >
                {t('translationModelPermissionModal.btnText')}
              </Button>
            </div>
          </form>
        </Box>
      </Fade>
    </Modal>
  )
}

export default TranslationModelPermissionModal
