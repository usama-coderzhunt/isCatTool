import * as React from 'react'
import { useTranslation } from 'next-i18next'
import { useForm } from 'react-hook-form'

import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'

import FileUploaderSingle from '@/components/fileUploader'
import { modalStyles } from '@/utils/constants/modalsStyles'
import { useTranslationMemoryHooks } from '@/services/useTranslationMemoryHooks'
import { toast } from 'react-toastify'
import CustomTextField from '@/@core/components/mui/TextField'

interface ImportTranslationMemoryModalProps {
  open: boolean
  handleClose: () => void
  translationMemoryId: number
}

interface ImportFormData {
  sourceLang: string
  targetLang: string
}

const ImportTranslationMemoryModal = ({
  open,
  handleClose,
  translationMemoryId
}: ImportTranslationMemoryModalProps) => {
  const { t } = useTranslation('global')
  const [file, setFile] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ImportFormData>({
    defaultValues: {
      sourceLang: '',
      targetLang: ''
    }
  })

  // API Hook
  const { useImportTranslationMemory } = useTranslationMemoryHooks()
  const { mutate: importTranslationMemory } = useImportTranslationMemory()

  const handleCloseModal = () => {
    handleClose()
    setFile([])
    reset()
  }

  const onSubmit = (data: ImportFormData) => {
    if (!file || file.length === 0) {
      return
    }

    setIsLoading(true)

    importTranslationMemory(
      {
        translation_memory: translationMemoryId,
        file: file[0],
        source_lang: data.sourceLang.trim(),
        target_lang: data.targetLang.trim()
      },
      {
        onSuccess: () => {
          toast.success(t('translationMemories.toasts.translationMemoryImportedSuccess'))
          handleCloseModal()
          setIsLoading(false)
        },
        onError: () => {
          setIsLoading(false)
        }
      }
    )
  }

  const isFormValid = file && file.length > 0

  return (
    <Modal
      aria-labelledby='transition-modal-title'
      aria-describedby='transition-modal-description'
      open={open}
      onClose={handleCloseModal}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      sx={{
        overflow: 'auto !important',
        scrollbarWidth: 'none !important',
        '&::-webkit-scrollbar': {
          display: 'none !important'
        }
      }}
      slotProps={{
        backdrop: {
          timeout: 500
        }
      }}
    >
      <Fade in={open}>
        <Box sx={{ ...modalStyles, width: 450 }}>
          <div className='flex gap-x-2 justify-between items-center mb-6'>
            <Typography variant='h4'>{t('translationMemories.importModal.title')}</Typography>
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
              flexGrow: 1,
              maxHeight: 'calc(100vh - 20px)',
              scrollbarWidth: 'none !important',
              '&::-webkit-scrollbar': {
                display: 'none !important'
              }
            }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
              <div>
                <Typography variant='body2' className='text-textSecondary mb-2'>
                  {t('translationMemories.importModal.uploadFile')}
                </Typography>

                <FileUploaderSingle
                  files={file}
                  setFiles={setFile}
                  resetFiles={() => setFile([])}
                  errorMessage=''
                  allowedExtensions={{ 'text/xml': ['.tmx'], 'text/csv': ['.csv'] }}
                />
              </div>

              <div className='flex flex-col gap-4'>
                <CustomTextField
                  label={t('translationMemories.importModal.sourceLanguage')}
                  {...register('sourceLang', {
                    required: 'Source language is required',
                    validate: value => value.trim() !== '' || 'Source language is required'
                  })}
                  fullWidth
                  variant='outlined'
                  error={!!errors.sourceLang}
                  helperText={errors.sourceLang?.message}
                  showAsterisk={true}
                />

                <CustomTextField
                  label={t('translationMemories.importModal.targetLanguage')}
                  {...register('targetLang', {
                    required: 'Target language is required',
                    validate: value => value.trim() !== '' || 'Target language is required'
                  })}
                  fullWidth
                  variant='outlined'
                  error={!!errors.targetLang}
                  helperText={errors.targetLang?.message}
                  showAsterisk={true}
                />
              </div>

              <div className='w-full flex justify-end gap-3'>
                <Button variant='outlined' onClick={handleCloseModal} disabled={isLoading}>
                  {t('translationMemories.importModal.cancel')}
                </Button>
                <Button type='submit' variant='contained' disabled={!isFormValid || isLoading}>
                  {t('translationMemories.importModal.import')}
                </Button>
              </div>
            </form>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default ImportTranslationMemoryModal
