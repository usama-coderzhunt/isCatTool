import * as React from 'react'
import { useTranslation } from 'next-i18next'

import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import CustomTextField from '@/@core/components/mui/TextField'
import { modalStyles } from '@/utils/constants/modalsStyles'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import { TranslationSubjectsTypes } from '@/types/translationSubjectsTypes'
import { useTranslationSubjectsHooks } from '@/services/useTranslationSubjectsHooks'
import {
  createTranslationSubjectSchema,
  TranslationSubjectSchema
} from '@/utils/schemas/createTranslationSubjectSchema'

interface AddTranslationSubjectsModalProps {
  open: boolean
  handleClose: () => void
  handleOpen: (mode: 'create' | 'edit', translationSubject?: TranslationSubjectsTypes) => void
  title: string
  translationSubjectData?: TranslationSubjectsTypes | null
  mode: 'create' | 'edit'
}

const AddTranslationSubjectModal: React.FC<AddTranslationSubjectsModalProps> = ({
  open,
  handleClose,
  title,
  translationSubjectData,
  mode
}) => {
  const { t } = useTranslation('global')

  // Api Call
  const { useCreateTranslationSubject, useEditTranslationSubject } = useTranslationSubjectsHooks()
  const { mutate: createTranslationSubject } = useCreateTranslationSubject()
  const { mutate: editTranslationSubject } = useEditTranslationSubject()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    clearErrors,
    formState: { errors }
  } = useForm<TranslationSubjectSchema>({
    resolver: zodResolver(createTranslationSubjectSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      description: ''
    }
  })

  React.useEffect(() => {
    if (mode === 'edit' && translationSubjectData) {
      setValue('name', translationSubjectData.name)
      setValue('description', translationSubjectData.description || '')
    }
  }, [translationSubjectData, mode, setValue])

  const onSubmit: SubmitHandler<TranslationSubjectSchema> = data => {
    if (mode === 'create') {
      createTranslationSubject(data, {
        onSuccess: () => {
          toast.success(t('translationSubjects.toasts.translationSubjectCreatedSuccess'))
          handleCloseModal()
        }
      })
    } else if (mode === 'edit' && translationSubjectData?.id) {
      editTranslationSubject(
        { id: translationSubjectData.id, ...data },
        {
          onSuccess: () => {
            toast.success(t('translationSubjects.toasts.translationSubjectUpdatedSuccess'))
            handleCloseModal()
          }
        }
      )
    }
  }

  const handleCloseModal = () => {
    handleClose()
    reset()
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
              {/* Name */}
              <div className='col-span-12'>
                <CustomTextField
                  fullWidth
                  label={t('translationSubjects.form.name')}
                  type='text'
                  {...register('name')}
                  defaultValue={translationSubjectData?.name || null}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  showAsterisk={true}
                />
              </div>

              {/* Description */}
              <div className='col-span-12 relative'>
                <CustomTextField
                  className='hover:appearance-none focus:outline-none'
                  fullWidth
                  label={t('translationSubjects.form.description')}
                  type='text'
                  {...register('description')}
                  defaultValue={translationSubjectData?.description || null}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  autoFocus
                  id='description'
                  multiline
                  minRows={3}
                  maxRows={4}
                  sx={{ '& .MuiOutlinedInput-root': { height: 'auto' } }}
                />
              </div>
            </div>

            <div className='w-full flex justify-end'>
              <Button
                variant='contained'
                type='submit'
                sx={{
                  width: 'max-content',
                  padding: '0.5rem 1rem'
                }}
              >
                {mode === 'create' ? t('translationSubjects.form.add') : t('translationSubjects.form.update')}
              </Button>
            </div>
          </form>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddTranslationSubjectModal
