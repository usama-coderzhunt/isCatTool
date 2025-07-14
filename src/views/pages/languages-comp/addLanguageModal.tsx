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
import { z } from 'zod'

import CustomTextField from '@/@core/components/mui/TextField'
import { toast } from 'react-toastify'
import { modalStyles } from '@/utils/constants/modalsStyles'
import { useTranslation } from 'react-i18next'
import { LanguageTypes } from '@/types/languageTypes'
import { useLanguageHooks } from '@/services/useLanguageHooks'

// Form Schema
const languageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required')
})

type LanguageFormData = z.infer<typeof languageSchema>

interface AddLanguageModalProps {
  open: boolean
  handleClose: React.Dispatch<React.SetStateAction<boolean>>
  languageData?: LanguageTypes | null
  mode: 'create' | 'edit'
}

const AddLanguageModal: React.FC<AddLanguageModalProps> = ({ open, handleClose, languageData, mode }) => {
  const { t } = useTranslation('global')
  // hooks
  const { useCreateLanguage, useEditLanguage } = useLanguageHooks()
  const { mutate: createLanguage } = useCreateLanguage()
  const { mutate: editLanguage } = useEditLanguage()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<LanguageFormData>({
    resolver: zodResolver(languageSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      code: ''
    }
  })

  React.useEffect(() => {
    if (mode === 'edit' && languageData) {
      setValue('name', languageData.name)
      setValue('code', languageData.code || '')
    } else if (mode === 'create') {
      reset()
    }
  }, [languageData, mode, setValue, reset])

  const onSubmit: SubmitHandler<LanguageFormData> = data => {
    if (mode === 'create') {
      createLanguage(data, {
        onSuccess: () => {
          toast.success(t('languages.toasts.languageCreatedSuccess'))
          handleCloseModal()
        }
      })
    } else if (mode === 'edit' && languageData?.id) {
      editLanguage(
        {
          id: languageData.id,
          ...data
        },
        {
          onSuccess: () => {
            toast.success(t('languages.toasts.languageUpdatedSuccess'))
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
            <Typography variant='h4'>
              {mode === 'create' ? t('languages.addLanguage') : t('languages.updateLanguage')}
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
            <div className='w-full flex flex-col gap-6'>
              {/* Name */}
              <div>
                <CustomTextField
                  fullWidth
                  label={t('languages.addLanguageModal.name')}
                  type='text'
                  {...register('name')}
                  defaultValue={languageData?.name || ''}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  showAsterisk={true}
                />
              </div>

              {/* Description */}
              <div>
                <CustomTextField
                  fullWidth
                  label={t('languages.addLanguageModal.code')}
                  {...register('code')}
                  defaultValue={languageData?.code || ''}
                  error={!!errors.code}
                  helperText={errors.code?.message}
                  showAsterisk={true}
                />
              </div>
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
              >
                {mode === 'create' ? t('languages.addLanguage') : t('languages.updateLanguage')}
              </Button>
            </div>
          </form>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddLanguageModal
