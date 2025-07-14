import * as React from 'react'
import { useTranslation } from 'next-i18next'

import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import type { SubmitHandler } from 'react-hook-form'
import { Controller, useForm } from 'react-hook-form'
import CustomTextField from '@/@core/components/mui/TextField'
import { modalStyles } from '@/utils/constants/modalsStyles'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import { Select, InputLabel, FormControl, CircularProgress, FormHelperText } from '@mui/material'
import { useLanguageHooks } from '@/services/useLanguageHooks'
import { TranslationMemoryTypes } from '@/types/translationMemoryTypes'
import { useTranslationMemoryHooks } from '@/services/useTranslationMemoryHooks'
import { createTranslationMemorySchema, TranslationMemorySchema } from '@/utils/schemas/createTranslationMemorySchema'

interface AddTranslationMemoryModalProps {
  open: boolean
  handleClose: () => void
  handleOpen: (mode: 'create' | 'edit', translationMemory?: TranslationMemoryTypes) => void
  title: string
  translationMemoryData?: TranslationMemoryTypes | null
  mode: 'create' | 'edit'
}

const AddTranslationMemoryModal: React.FC<AddTranslationMemoryModalProps> = ({
  open,
  handleClose,
  title,
  translationMemoryData,
  mode
}) => {
  const { t } = useTranslation('global')
  const PAGE_SIZE = 10

  // Api Call
  const { useCreateTranslationMemory, useEditTranslationMemory } = useTranslationMemoryHooks()
  const { mutate: createTranslationMemory } = useCreateTranslationMemory()
  const { mutate: editTranslationMemory } = useEditTranslationMemory()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    clearErrors,
    formState: { errors }
  } = useForm<TranslationMemorySchema>({
    resolver: zodResolver(createTranslationMemorySchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      description: null,
      source_language: undefined,
      target_language: undefined
    }
  })

  React.useEffect(() => {
    if (mode === 'edit' && translationMemoryData) {
      setValue('name', translationMemoryData.name)
      setValue('description', translationMemoryData.description)
      if (translationMemoryData.source_language) {
        setValue('source_language', translationMemoryData.source_language)
      }
      if (translationMemoryData.target_language) {
        setValue('target_language', translationMemoryData.target_language)
      }
    }
  }, [translationMemoryData, mode, setValue])

  // Language dropdown state
  const [langPage, setLangPage] = React.useState(1)
  const [languages, setLanguages] = React.useState<any[]>([])
  const [langHasMore, setLangHasMore] = React.useState(true)
  const {
    data: langData,
    isLoading: isLangLoading,
    refetch: refetchLanguages
  } = useLanguageHooks().getLanguages(PAGE_SIZE, langPage, undefined, undefined)

  React.useEffect(() => {
    if (open) {
      if (mode === 'create') {
        reset({
          name: '',
          description: null,
          source_language: undefined,
          target_language: undefined
        })
      }
      setLangPage(1)
      setLanguages([])
      setLangHasMore(true)
      refetchLanguages()
    }
  }, [open, mode, reset, refetchLanguages])

  // Infinite scroll handler for dropdowns
  const handleDropdownScroll = (e: React.SyntheticEvent, type: 'lang' | 'model' | 'subject') => {
    const target = e.target as HTMLElement
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10) {
      if (type === 'lang' && langHasMore && !isLangLoading && langData?.data?.next) {
        setLangPage(p => p + 1)
      }
    }
  }

  // Accumulate paginated data for each dropdown
  React.useEffect(() => {
    if (langData?.data?.results) {
      setLanguages(prev => (langPage === 1 ? langData.data.results : [...prev, ...langData.data.results]))
      setLangHasMore(!!langData.data.next)
    }
  }, [langData, langPage])

  React.useEffect(() => {
    clearErrors()
  }, [clearErrors, open])

  const onSubmit: SubmitHandler<TranslationMemorySchema> = data => {
    if (mode === 'create') {
      createTranslationMemory(data, {
        onSuccess: () => {
          toast.success(t('translationMemories.toasts.translationMemoryCreatedSuccess'))
          handleCloseModal()
        }
      })
    } else if (mode === 'edit' && translationMemoryData?.id) {
      editTranslationMemory(
        { id: translationMemoryData.id, ...data },
        {
          onSuccess: () => {
            toast.success(t('translationMemories.toasts.translationMemoryUpdatedSuccess'))
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
              <div className='col-span-6'>
                <CustomTextField
                  fullWidth
                  label={t('translationMemories.form.name')}
                  type='text'
                  {...register('name')}
                  defaultValue={translationMemoryData?.name || null}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  showAsterisk={true}
                />
              </div>

              {/* Source Language */}
              <div className='col-span-6'>
                <Controller
                  name='source_language'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <FormControl fullWidth required error={!!errors.source_language}>
                      <InputLabel
                        shrink
                        sx={{
                          '& .MuiInputLabel-asterisk': {
                            color: 'error.main'
                          }
                        }}
                      >
                        {t('translationMemories.form.sourceLanguage')}
                      </InputLabel>
                      <Select
                        {...field}
                        notched
                        label={t('translationMemories.form.sourceLanguage')}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        MenuProps={{
                          PaperProps: {
                            onScroll: (e: React.SyntheticEvent) => handleDropdownScroll(e, 'lang'),
                            style: {
                              maxHeight: 300,
                              maxWidth: 350,
                              scrollbarWidth: 'none',
                              msOverflowStyle: 'none',
                              overflowY: 'auto'
                            },
                            sx: {
                              '&::-webkit-scrollbar': { display: 'none' }
                            }
                          }
                        }}
                      >
                        {languages.map((lang: any) => (
                          <MenuItem key={lang.id} value={lang.id}>
                            {lang.name}
                          </MenuItem>
                        ))}
                        {isLangLoading && (
                          <MenuItem disabled>
                            <CircularProgress size={20} />
                          </MenuItem>
                        )}
                      </Select>
                      <FormHelperText>{errors.source_language?.message}</FormHelperText>
                    </FormControl>
                  )}
                />
              </div>
              {/* Target Language */}
              <div className='col-span-6'>
                <Controller
                  name='target_language'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <FormControl fullWidth required error={!!errors.target_language}>
                      <InputLabel
                        shrink
                        sx={{
                          '& .MuiInputLabel-asterisk': {
                            color: 'error.main'
                          }
                        }}
                      >
                        {t('translationMemories.form.targetLanguage')}
                      </InputLabel>
                      <Select
                        {...field}
                        label={t('translationMemories.form.targetLanguage')}
                        value={field.value || ''}
                        notched
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        MenuProps={{
                          PaperProps: {
                            onScroll: (e: React.SyntheticEvent) => handleDropdownScroll(e, 'lang'),
                            style: {
                              maxHeight: 300,
                              maxWidth: 350,
                              scrollbarWidth: 'none',
                              msOverflowStyle: 'none',
                              overflowY: 'auto'
                            },
                            sx: {
                              '&::-webkit-scrollbar': { display: 'none' }
                            }
                          }
                        }}
                      >
                        {languages.map((lang: any) => (
                          <MenuItem key={lang.id} value={lang.id}>
                            {lang.name}
                          </MenuItem>
                        ))}
                        {isLangLoading && (
                          <MenuItem disabled>
                            <CircularProgress size={20} />
                          </MenuItem>
                        )}
                      </Select>
                      <FormHelperText>{errors.target_language?.message}</FormHelperText>
                    </FormControl>
                  )}
                />
              </div>

              {/* Description */}
              <div className='col-span-12 relative'>
                <CustomTextField
                  className='hover:appearance-none focus:outline-none'
                  fullWidth
                  label={t('translationMemories.form.description')}
                  type='text'
                  {...register('description')}
                  defaultValue={translationMemoryData?.description || null}
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
                {mode === 'create'
                  ? t('translationMemories.form.addBtnText')
                  : t('translationMemories.form.updateBtnText')}
              </Button>
            </div>
          </form>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddTranslationMemoryModal
