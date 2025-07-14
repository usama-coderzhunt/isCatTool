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
import SearchableMultiSelect from '@/components/common/SearchableMultiSelect'
import CustomAppReactDatepicker from '@/@core/components/mui/AppReactDatepicker'
import { TasksTypes } from '@/types/tasksTypes'
import { useProjectsHooks } from '@/services/useProjectsHooks'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTaskSchema } from '@/utils/schemas/createtaskSchema'
import { toast } from 'react-toastify'
import { Select, InputLabel, FormControl, CircularProgress, FormHelperText } from '@mui/material'
import { useUserManagementHooks } from '@/services/useUserManagementHooks'
import { fetchUser } from '@/services/utility/tasks'
import useTranslationModels from '@/services/useTranslationModelHooks'
import useTranslationSubjects from '@/services/useTranslationSubjectHooks'
import { useLanguageHooks } from '@/services/useLanguageHooks'

interface AddTaskModalProps {
  open: boolean
  handleClose: () => void
  handleOpen: (mode: 'create' | 'edit', task?: TasksTypes) => void
  projectId: number | undefined
  title: string
  taskData?: TasksTypes | null
  mode: 'create' | 'edit'
  taskID?: number | null
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ open, handleClose, projectId, title, taskData, mode, taskID }) => {
  const { t } = useTranslation('global')
  const PAGE_SIZE = 10

  const [selectedAssignees, setSelectedAssignees] = React.useState<any[]>([])

  // Api Call
  const { useCreateTask, useEditTask } = useProjectsHooks()
  const { useUsers } = useUserManagementHooks()
  const { getProjects } = useProjectsHooks()

  const { mutate: createTask } = useCreateTask()
  const { mutate: editTask } = useEditTask()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm<TasksTypes>({
    resolver: zodResolver(createTaskSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      project: projectId ?? undefined,
      description: '',
      due_date: null,
      similarity_threshold: '0.70',
      is_subtask: null,
      is_split: null,
      custom_prompt: '',
      assigned_to: null,
      parent_task: null,
      source_language: null,
      target_language: null,
      translation_model: null,
      translation_subject: null
    }
  })

  React.useEffect(() => {
    if (projectId) {
      setValue('project', projectId)
    }

    if (mode === 'edit' && taskData) {
      setValue('name', taskData.name)
      setValue('description', taskData.description)
      setValue('due_date', taskData.due_date)
      setValue('similarity_threshold', taskData.similarity_threshold)
      setValue('is_subtask', taskData.is_subtask)
      setValue('is_split', taskData.is_split)
      setValue('custom_prompt', taskData.custom_prompt)
      setValue('assigned_to', taskData.assigned_to)
      setValue('parent_task', taskData.parent_task)
      setValue('source_language', taskData.source_language)
      setValue('target_language', taskData.target_language)
      setValue('translation_model', taskData.translation_model)
      setValue('translation_subject', taskData.translation_subject)
      setValue('project', taskData.project)
    } else if (mode === 'create') {
      setValue('name', '')
      setValue('description', '')
      setValue('due_date', null)
      setValue('similarity_threshold', '0.70')
      setValue('is_subtask', null)
      setValue('is_split', null)
      setValue('custom_prompt', '')
      setValue('assigned_to', null)
      setValue('parent_task', null)
    }
  }, [taskData, mode, setValue, projectId])

  React.useEffect(() => {
    const loadAssignees = async () => {
      if (mode === 'edit' && taskData?.assigned_to) {
        const assignee = await fetchUser(Number(taskData?.assigned_to))
        setSelectedAssignees(assignee ? [assignee] : [])
      } else {
        setSelectedAssignees([])
      }
    }
    loadAssignees()
  }, [mode, taskData?.assigned_to])

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

  React.useEffect(() => {
    clearErrors()
  }, [clearErrors, open])

  const onSubmit: SubmitHandler<TasksTypes> = data => {
    const processedData = {
      ...data,
      is_subtask: data.is_subtask ?? false,
      is_split: data.is_split ?? false
    }

    if (mode === 'create') {
      const createData = projectId ? { ...processedData, project: projectId } : processedData

      createTask(createData, {
        onSuccess: () => {
          toast.success(t('tasks.toasts.taskCreatedSuccess'))
          handleCloseModal()
        }
      })
    } else if (mode === 'edit' && taskID) {
      const { project, ...editData } = processedData
      editTask(
        { id: taskID, data: editData },
        {
          onSuccess: () => {
            toast.success(t('tasks.toasts.taskUpdatedSuccess'))
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
        <Box
          sx={{
            ...modalStyles,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%',
            maxWidth: '800px',
            maxHeight: 'calc(100vh - 60px)',
            display: 'flex',
            flexDirection: 'column',
            m: 'auto',
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 4
          }}
        >
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
          <Box
            sx={{
              overflowY: 'auto',
              pr: 4,
              mr: -4,
              pt: 2,
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': {
                display: 'none'
              }
            }}
          >
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
              <div className='w-full grid grid-cols-12 gap-6'>
                {/* Name */}
                <div className='col-span-6'>
                  <CustomTextField
                    fullWidth
                    label={t('tasks.form.name')}
                    type='text'
                    {...register('name')}
                    defaultValue={taskData?.name || null}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    showAsterisk={true}
                  />
                </div>

                {/* Due Date */}
                <div className='col-span-6'>
                  <CustomAppReactDatepicker
                    label={t('tasks.form.dueDate')}
                    name='due_date'
                    control={control}
                    error={!!errors.due_date}
                    helperText={errors.due_date?.message}
                    defaultValue={taskData?.due_date || undefined}
                    showTimeSelect
                    timeFormat='HH:mm'
                    timeIntervals={1}
                    dateFormat='yyyy-MM-dd HH:mm'
                  />
                </div>

                <div className='col-span-6'>
                  <FormControl fullWidth>
                    <InputLabel id='is-subtask-label' shrink>
                      {t('tasks.form.isSubtask')}
                    </InputLabel>
                    <Controller
                      name='is_subtask'
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Select
                          labelId='is-subtask-label'
                          id='is-subtask'
                          label={t('tasks.form.isSubtask')}
                          notched
                          value={value === true ? 'yes' : value === false ? 'no' : ''}
                          onChange={e => {
                            if (e.target.value === '') {
                              onChange(null)
                            } else {
                              onChange(e.target.value === 'yes')
                            }
                          }}
                        >
                          <MenuItem value='' disabled>
                            {t('common.select')}
                          </MenuItem>
                          <MenuItem value='yes'>{t('common.yes')}</MenuItem>
                          <MenuItem value='no'>{t('common.no')}</MenuItem>
                        </Select>
                      )}
                    />
                  </FormControl>
                </div>

                <div className='col-span-6'>
                  <FormControl fullWidth>
                    <InputLabel id='is-split-label' shrink>
                      {t('tasks.form.isSplit')}
                    </InputLabel>
                    <Controller
                      name='is_split'
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Select
                          labelId='is-split-label'
                          id='is-split'
                          label={t('tasks.form.isSplit')}
                          notched
                          value={value === true ? 'yes' : value === false ? 'no' : ''}
                          onChange={e => {
                            if (e.target.value === '') {
                              onChange(null)
                            } else {
                              onChange(e.target.value === 'yes')
                            }
                          }}
                        >
                          <MenuItem value='' disabled>
                            {t('common.select')}
                          </MenuItem>
                          <MenuItem value='yes'>{t('common.yes')}</MenuItem>
                          <MenuItem value='no'>{t('common.no')}</MenuItem>
                        </Select>
                      )}
                    />
                  </FormControl>
                </div>

                {/* Assigned To */}
                <div className='col-span-6'>
                  <SearchableMultiSelect<TasksTypes>
                    options={useUsers}
                    name='assigned_to'
                    register={register}
                    returnAsArray={false}
                    returnAsString={false}
                    setValue={setValue}
                    fieldError={errors.assigned_to}
                    labelKey='username'
                    value={watch('assigned_to') ?? undefined}
                    className='w-full'
                    label={t('tasks.form.assignedTo')}
                    multiple={false}
                    selectedOptionsList={mode === 'edit' ? selectedAssignees : undefined}
                  />
                </div>

                {!projectId && mode === 'create' && (
                  <div className='col-span-6'>
                    <SearchableMultiSelect<TasksTypes>
                      options={getProjects}
                      name='project'
                      returnAsArray={false}
                      returnAsString={false}
                      register={register}
                      setValue={setValue}
                      fieldError={errors.project}
                      labelKey='name'
                      value={watch('project') || undefined}
                      className='w-full'
                      label={t('tasks.form.project')}
                      multiple={false}
                      showAsterisk={true}
                      onChange={value => {
                        const numericValue = value && value !== '' ? Number(value) : null
                        setValue('project', numericValue)
                        if (numericValue && numericValue > 0) {
                          clearErrors('project')
                        } else {
                          setError('project', { message: 'Project is required' })
                        }
                      }}
                    />
                  </div>
                )}

                {/* Source Language */}
                <div className='col-span-6'>
                  <Controller
                    name='source_language'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.source_language}>
                        <InputLabel shrink>{t('tasks.form.sourceLanguage')}</InputLabel>
                        <Select
                          {...field}
                          notched
                          label={t('tasks.form.sourceLanguage')}
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
                    rules={{ required: false }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.target_language}>
                        <InputLabel shrink>{t('tasks.form.targetLanguage')}</InputLabel>
                        <Select
                          {...field}
                          label={t('tasks.form.targetLanguage')}
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
                {/* Translation Model */}
                <div className='col-span-6'>
                  <Controller
                    name='translation_model'
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.translation_model}>
                        <InputLabel shrink>{t('tasks.form.translationModel')}</InputLabel>
                        <Select
                          {...field}
                          notched
                          label={t('tasks.form.translationModel')}
                          value={field.value || ''}
                          onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
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
                        <InputLabel shrink>{t('tasks.form.translationSubject')}</InputLabel>
                        <Select
                          {...field}
                          notched
                          label={t('tasks.form.translationSubject')}
                          value={field.value || ''}
                          onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
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

                {/* Custom Prompt */}
                <div className='col-span-12 relative'>
                  <CustomTextField
                    className='hover:appearance-none focus:outline-none'
                    fullWidth
                    label={t('tasks.form.customPrompt')}
                    type='text'
                    {...register('custom_prompt')}
                    defaultValue={taskData?.custom_prompt || null}
                    error={!!errors.custom_prompt}
                    helperText={errors.custom_prompt?.message}
                    autoFocus
                    id='custom_prompt'
                    multiline
                    minRows={3}
                    maxRows={4}
                    sx={{ '& .MuiOutlinedInput-root': { height: 'auto' } }}
                  />
                </div>

                {/* Description */}
                <div className='col-span-12 relative'>
                  <CustomTextField
                    className='hover:appearance-none focus:outline-none'
                    fullWidth
                    label={t('tasks.form.description')}
                    type='text'
                    {...register('description')}
                    defaultValue={taskData?.description || null}
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
                  {mode === 'create' ? t('tasks.form.add') : t('tasks.form.update')}
                </Button>
              </div>
            </form>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddTaskModal
