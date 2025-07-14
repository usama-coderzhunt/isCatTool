'use client'

import * as React from 'react'
import { useTranslation } from 'next-i18next'
import { useParams } from 'next/navigation'
import {
  Backdrop,
  Box,
  Modal,
  Fade,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { useProjectsHooks } from '@/services/useProjectsHooks'
import { modalStyles } from '@/utils/constants/modalsStyles'
import { toast } from 'react-toastify'
import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslationModels } from '@/services/useTranslationModelHooks'
import { useTranslationSubjects } from '@/services/useTranslationSubjectHooks'
import CircularProgress from '@mui/material/CircularProgress'
import { useLanguageHooks } from '@/services/useLanguageHooks'

interface AddProjectModalProps {
  open: boolean
  handleClose: () => void
  projectData?: any
  projectID?: number | null
  mode: 'view' | 'create' | 'edit'
  title: string
}

type ProjectForm = {
  name: string
  source_language: number | null
  target_language: number | null
  translation_model: number | null
  translation_subject: number | null
}

const PAGE_SIZE = 10

const AddProjectModal = ({ open, handleClose, projectData, projectID, mode, title }: AddProjectModalProps) => {
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')

  React.useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  const { useCreateProject, useEditProject } = useProjectsHooks()
  const { mutate: createProject } = useCreateProject()
  const { mutate: editProject } = useEditProject()

  // Language dropdown state
  const [langPage, setLangPage] = React.useState(1)
  const [languages, setLanguages] = React.useState<any[]>([])
  const [langHasMore, setLangHasMore] = React.useState(true)
  const {
    data: langData,
    isLoading: isLangLoading,
    refetch: refetchLanguages
  } = useLanguageHooks().getLanguages(PAGE_SIZE, langPage, undefined, undefined)

  // Translation Model dropdown state
  const [modelPage, setModelPage] = React.useState(1)
  const [models, setModels] = React.useState<any[]>([])
  const [modelHasMore, setModelHasMore] = React.useState(true)
  const { data: modelData, isLoading: isModelLoading } = useTranslationModels(modelPage, PAGE_SIZE)

  // Translation Subject dropdown state
  const [subjectPage, setSubjectPage] = React.useState(1)
  const [subjects, setSubjects] = React.useState<any[]>([])
  const [subjectHasMore, setSubjectHasMore] = React.useState(true)
  const { data: subjectData, isLoading: isSubjectLoading } = useTranslationSubjects(subjectPage, PAGE_SIZE)

  // Accumulate paginated data for each dropdown
  React.useEffect(() => {
    if (langData?.data?.results) {
      setLanguages(prev => (langPage === 1 ? langData.data.results : [...prev, ...langData.data.results]))
      setLangHasMore(!!langData.data.next)
    }
  }, [langData, langPage])

  React.useEffect(() => {
    if (modelData?.results) {
      setModels(prev => (modelPage === 1 ? modelData.results : [...prev, ...modelData.results]))
      setModelHasMore(!!modelData.next)
    }
  }, [modelData, modelPage])

  React.useEffect(() => {
    if (subjectData?.results) {
      setSubjects(prev => (subjectPage === 1 ? subjectData.results : [...prev, ...subjectData.results]))
      setSubjectHasMore(!!subjectData.next)
    }
  }, [subjectData, subjectPage])

  // Infinite scroll handler for dropdowns
  const handleDropdownScroll = (e: React.SyntheticEvent, type: 'lang' | 'model' | 'subject') => {
    const target = e.target as HTMLElement
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10) {
      if (type === 'lang' && langHasMore && !isLangLoading && langData?.data?.next) {
        setLangPage(p => p + 1)
      }
      if (type === 'model' && modelHasMore && !isModelLoading) setModelPage(p => p + 1)
      if (type === 'subject' && subjectHasMore && !isSubjectLoading) setSubjectPage(p => p + 1)
    }
  }

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<ProjectForm>({
    defaultValues: {
      name: '',
      source_language: null,
      target_language: null,
      translation_model: null,
      translation_subject: null
    }
  })

  React.useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && projectData) {
      setValue('name', projectData.name || '')
      setValue('source_language', projectData.source_language || null)
      setValue('target_language', projectData.target_language || null)
      setValue('translation_model', projectData.translation_model || null)
      setValue('translation_subject', projectData.translation_subject || null)
    } else if (mode === 'create') {
      reset()
    }
  }, [projectData, mode, setValue, reset])

  const onSubmit = (data: ProjectForm) => {
    if (mode === 'create') {
      createProject(data, {
        onSuccess: () => {
          toast.success(t('projects.toasts.projectCreatedSuccess'))
          handleCloseModal()
        }
      })
    } else if (mode === 'edit' && projectID) {
      editProject(
        { id: projectID, data },
        {
          onSuccess: () => {
            toast.success(t('projects.toasts.projectUpdatedSuccess'))
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
      slotProps={{ backdrop: { timeout: 500 } }}
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
                <Controller
                  name='name'
                  control={control}
                  rules={{ required: t('validation.required') }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.name}>
                      <CustomTextField
                        {...field}
                        label={t('projects.addProjectModal.name')}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        fullWidth
                        showAsterisk={true}
                      />
                    </FormControl>
                  )}
                />
              </div>
              {/* Source Language */}
              <div className='col-span-6'>
                <Controller
                  name='source_language'
                  control={control}
                  rules={{ required: t('validation.required') }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.source_language} required>
                      <InputLabel
                        shrink
                        sx={{
                          '& .MuiInputLabel-asterisk': {
                            color: 'error.main'
                          }
                        }}
                      >
                        {t('projects.addProjectModal.sourceLanguage')}
                      </InputLabel>
                      <Select
                        {...field}
                        notched
                        label={t('projects.addProjectModal.sourceLanguage')}
                        value={field.value || ''}
                        onChange={e => field.onChange(Number(e.target.value))}
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
                  rules={{ required: t('validation.required') }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.target_language} required>
                      <InputLabel
                        sx={{
                          '& .MuiInputLabel-asterisk': {
                            color: 'error.main'
                          }
                        }}
                        shrink
                      >
                        {t('projects.addProjectModal.targetLanguage')}
                      </InputLabel>
                      <Select
                        {...field}
                        label={t('projects.addProjectModal.targetLanguage')}
                        disabled={mode === 'view'}
                        value={field.value || ''}
                        notched
                        onChange={e => field.onChange(Number(e.target.value))}
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
              {/* Translation Model */}
              <div className='col-span-6'>
                <Controller
                  name='translation_model'
                  control={control}
                  rules={{ required: t('validation.required') }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.translation_model} required>
                      <InputLabel
                        shrink
                        sx={{
                          '& .MuiInputLabel-asterisk': {
                            color: 'error.main'
                          }
                        }}
                      >
                        {t('projects.addProjectModal.translationModel')}
                      </InputLabel>
                      <Select
                        {...field}
                        notched
                        label={t('projects.addProjectModal.translationModel')}
                        disabled={mode === 'view'}
                        value={field.value || ''}
                        onChange={e => field.onChange(Number(e.target.value))}
                        MenuProps={{
                          PaperProps: {
                            onScroll: (e: React.SyntheticEvent) => handleDropdownScroll(e, 'model'),
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
                        {models.map((model: any) => (
                          <MenuItem key={model.id} value={model.id}>
                            {model.name}
                          </MenuItem>
                        ))}
                        {isModelLoading && (
                          <MenuItem disabled>
                            <CircularProgress size={20} />
                          </MenuItem>
                        )}
                      </Select>
                      <FormHelperText>{errors.translation_model?.message}</FormHelperText>
                    </FormControl>
                  )}
                />
              </div>
              {/* Translation Subject */}
              <div className='col-span-6'>
                <Controller
                  name='translation_subject'
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.translation_subject}>
                      <InputLabel
                        shrink
                        sx={{
                          '& .MuiInputLabel-asterisk': {
                            color: 'error.main'
                          }
                        }}
                      >
                        {t('projects.addProjectModal.translationSubject')}
                      </InputLabel>
                      <Select
                        {...field}
                        notched
                        label={t('projects.addProjectModal.translationSubject')}
                        disabled={mode === 'view'}
                        value={field.value || ''}
                        onChange={e => field.onChange(Number(e.target.value))}
                        MenuProps={{
                          PaperProps: {
                            onScroll: (e: React.SyntheticEvent) => handleDropdownScroll(e, 'subject'),
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
                        {subjects.map((subject: any) => (
                          <MenuItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </MenuItem>
                        ))}
                        {isSubjectLoading && (
                          <MenuItem disabled className='flex items-center justify-center'>
                            <CircularProgress size={20} />
                          </MenuItem>
                        )}
                      </Select>
                      <FormHelperText>{errors.translation_subject?.message}</FormHelperText>
                    </FormControl>
                  )}
                />
              </div>
            </div>
            {(mode === 'create' || mode === 'edit') && (
              <div className='w-full flex justify-end'>
                <Button variant='contained' sx={{ width: 'max-content', padding: '0.5rem 1rem' }} type='submit'>
                  {mode === 'create' ? t('projects.addProjectModal.add') : t('projects.addProjectModal.update')}
                </Button>
              </div>
            )}
          </form>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddProjectModal
