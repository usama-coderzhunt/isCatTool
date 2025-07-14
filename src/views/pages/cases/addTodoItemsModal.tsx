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
import { useForm, Controller } from 'react-hook-form'

import CustomTextField from '@/@core/components/mui/TextField'

// Goggle ReCaptcha
import Recaptcha from '@/components/Recaptcha'
import { useRecaptchaStore } from '@/store/recaptchaStore'
import { TodoItem } from '@/types/todoItems'
import { useTodosHooks } from '@/services/useTodosHooks'
import { modalStyles } from '@/utils/constants/modalsStyles'
import CustomDatePicker from '@/@core/components/mui/DatePicker'
import { useNotificationHooks } from '@/services/useNotificationHooks'
import SearchableMultiSelect from '@/components/common/SearchableMultiSelect'
import CustomDateTimePicker from '@/@core/components/mui/DateTimePicker'
import { useCasesHooks } from '@/services/useCases'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomAppReactDatepicker from '@/@core/components/mui/AppReactDatepicker'
import { fetchNotificationsById } from '@/services/utility/notification'
import { API_ROUTES } from '@/utils/constants/apiRoutes'
import axiosInstance from '@/utils/api/axiosInstance'
import { fetchNotification, fetchTodo } from '@/services/utility/todoItems'

interface AddTransServiceModalProps {
  open: boolean
  handleClose: () => void
  handleOpen: (mode: 'view' | 'create' | 'edit', todoItem?: TodoItem) => void
  todoId: number | undefined
  title: string
  todoItemData?: TodoItem | null
  mode: 'view' | 'create' | 'edit'
  todoItemID?: string | null
}

const AddTodoItemsModal: React.FC<AddTransServiceModalProps> = ({
  open,
  handleClose,
  todoId,
  title,
  todoItemData,
  mode,
  todoItemID
}) => {
  const { t } = useTranslation('global')

  // store
  // const { recaptchaToken, setRecaptchaToken } = useRecaptchaStore();
  const [selectedNotifications, setSelectedNotifications] = React.useState<any[]>([])
  const [selectedTodo, setSelectedTodo] = React.useState<any[]>([])

  // Api Call
  const { useCreateTodoItem, useEditTodoItem, getTodos } = useTodosHooks()
  const { getNotifications } = useNotificationHooks()
  const { getCases } = useCasesHooks()

  const { mutate: createTodoItem } = useCreateTodoItem()
  const { mutate: editTodoItem } = useEditTodoItem()

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
  } = useForm<TodoItem>({
    mode: 'onSubmit',
    defaultValues: {
      subject: '',
      due_date: null,
      completed: false,
      description: null,
      send_to_google_calendar: 'NO',
      todo: todoId ?? 0,
      notification: null
    }
  })

  React.useEffect(() => {
    // Reset form values every time modal opens or todoId/todoItemData changes
    if (open) {
      if ((mode === 'edit' || mode === 'view') && todoItemData) {
        reset({
          subject: todoItemData.subject,
          due_date: todoItemData.due_date,
          completed: todoItemData.completed,
          description: todoItemData.description,
          send_to_google_calendar: todoItemData.send_to_google_calendar,
          notification: todoItemData.notification,
          todo: todoItemData.todo
        })
      } else {
        reset({
          subject: '',
          due_date: null,
          completed: false,
          description: null,
          send_to_google_calendar: 'NO',
          notification: null,
          todo: todoId ?? 0
        })
      }
    }
  }, [open, todoId, todoItemData, mode, reset])

  React.useEffect(() => {
    const loadNotification = async () => {
      if (mode === 'edit' || (mode === 'view' && todoItemData?.notification)) {
        const notification = await fetchNotification(Number(todoItemData?.notification))
        setSelectedNotifications(notification ? [notification] : [])
      } else {
        setSelectedNotifications([])
      }
    }

    const loadTodo = async () => {
      if (mode === 'edit' && todoItemData?.todo) {
        const todo = await fetchTodo(Number(todoItemData?.todo))
        setSelectedTodo(todo ? [todo] : [])
      } else {
        setSelectedTodo([])
      }
    }

    loadNotification()
    loadTodo()
  }, [mode, todoItemData?.notification, todoItemData?.todo])

  React.useEffect(() => {
    clearErrors()
  }, [clearErrors, open])

  const onSubmit: SubmitHandler<TodoItem> = data => {
    clearErrors()
    let hasError = false

    if (!data.subject?.trim()) {
      setError('subject', { message: 'Subject is required' })
      hasError = true
    }

    if (!data.todo || data.todo === 0) {
      setError('todo', { message: 'Todo is required' })
      hasError = true
    }

    if (hasError) {
      return
    }

    // --- Ensure notification and todo are always numbers, not arrays ---
    if (Array.isArray(data.notification)) {
      data.notification = data.notification[0] ?? null
    }
    if (Array.isArray(data.todo)) {
      data.todo = data.todo[0] ?? 0
    }

    if (mode === 'create') {
      createTodoItem(data, {
        onSuccess: () => {
          handleCloseModal()
        }
      })
    } else if (mode === 'edit' && todoItemID) {
      editTodoItem(
        { id: todoItemID, data: data },
        {
          onSuccess: () => {
            handleCloseModal()
          }
        }
      )
    }
  }

  const handleCloseModal = () => {
    handleClose()
    reset()
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
              {/* Subject */}
              <div className='col-span-6'>
                <CustomTextField
                  fullWidth
                  label={t('cases.todo.subject')}
                  type='text'
                  {...register('subject')}
                  defaultValue={todoItemData?.subject || null}
                  error={!!errors.subject}
                  helperText={errors.subject?.message}
                  disabled={mode === 'view'}
                  showAsterisk={true}
                />
              </div>

              {/* Due Date */}
              <div className='col-span-6'>
                <CustomAppReactDatepicker
                  label={t('cases.todo.dueDate')}
                  name='due_date'
                  control={control}
                  error={!!errors.due_date}
                  helperText={errors.due_date?.message}
                  defaultValue={todoItemData?.due_date || undefined}
                  disabled={mode === 'view'}
                  showTimeSelect
                  timeFormat='HH:mm'
                  timeIntervals={1}
                  dateFormat='yyyy-MM-dd HH:mm'
                  placeholderText='Due Date After'
                />
              </div>

              {/* Send to Google Calendar */}
              <div className='col-span-6'>
                <CustomTextField
                  select
                  fullWidth
                  label={t('cases.todo.sendToGoogleCalendar')}
                  {...register('send_to_google_calendar', {
                    validate: value =>
                      !value || value === 'NO' || value === 'SO' || value === 'SC'
                        ? true
                        : 'Please select either No or Staff Only or Staff and Client'
                  })}
                  defaultValue={todoItemData?.send_to_google_calendar || 'NO'}
                  error={!!errors.send_to_google_calendar}
                  helperText={errors.send_to_google_calendar?.message}
                  disabled={mode === 'view' || (mode === 'edit' && todoItemData?.completed === true)}
                  sx={{ '& .MuiSelect-select': { color: 'text.secondary' } }}
                >
                  <MenuItem value='' disabled sx={{ color: 'text.secondary' }}>
                    {t('common.select')}
                  </MenuItem>
                  <MenuItem value='NO'>{t('common.no')}</MenuItem>
                  <MenuItem value='SO'>{t('common.staff_only')}</MenuItem>
                  <MenuItem value='SC'>{t('common.staff_and_client')}</MenuItem>
                </CustomTextField>
              </div>

              {/* Notification */}
              <div className='col-span-6'>
                <Controller
                  name='notification'
                  control={control}
                  render={({ field }) => (
                    <SearchableMultiSelect<TodoItem>
                      {...field}
                      options={getNotifications}
                      labelKey='name'
                      value={field.value ?? undefined}
                      multiple={false}
                      disabled={mode === 'view'}
                      selectedOptionsList={mode === 'edit' || mode === 'view' ? selectedNotifications : undefined}
                      label={t('cases.todo.notification')}
                      className='w-full'
                      fieldError={errors.notification}
                      onChange={value => {
                        const numericValue = Array.isArray(value) ? value[0] : value
                        field.onChange(numericValue)
                        if (numericValue !== null && typeof numericValue === 'number' && numericValue > 0)
                          clearErrors('notification')
                      }}
                    />
                  )}
                />
              </div>

              {/* Completed */}
              {(mode === 'edit' || mode === 'view') && (
                <div className='col-span-6'>
                  <CustomTextField
                    select
                    fullWidth
                    label={t('cases.todo.completed')}
                    error={!!errors.completed}
                    helperText={errors.completed?.message}
                    disabled={mode === 'view'}
                    defaultValue={todoItemData?.completed ? t('common.yes') : t('common.no')}
                    {...register('completed')}
                    onChange={e => {
                      setValue('completed', e.target.value === 'Yes')
                      register('completed').onChange(e)
                    }}
                    sx={{ '& .MuiSelect-select': { color: 'text.secondary' } }}
                  >
                    <MenuItem value='' disabled sx={{ color: 'text.secondary' }}>
                      {t('common.select')}
                    </MenuItem>
                    <MenuItem value={t('common.yes')}>{t('common.yes')}</MenuItem>
                    <MenuItem value={t('common.no')}>{t('common.no')}</MenuItem>
                  </CustomTextField>
                </div>
              )}

              {!todoId && (
                <div className='col-span-6'>
                  <Controller
                    name='todo'
                    control={control}
                    render={({ field }) => (
                      <SearchableMultiSelect<TodoItem>
                        {...field}
                        options={getTodos}
                        labelKey='name'
                        value={field.value ?? 0}
                        multiple={false}
                        showAsterisk={true}
                        disabled={mode === 'view'}
                        selectedOptionsList={mode === 'edit' ? selectedTodo : undefined}
                        label={t('cases.todo.todo')}
                        className='w-full'
                        fieldError={errors.todo}
                        onChange={value => {
                          const numericValue = Array.isArray(value) ? value[0] : value
                          field.onChange(numericValue)
                          if (numericValue !== null && typeof numericValue === 'number' && numericValue > 0)
                            clearErrors('todo')
                        }}
                      />
                    )}
                  />
                </div>
              )}

              {/* Description */}
              <div className='col-span-12 relative'>
                <CustomTextField
                  className='hover:appearance-none focus:outline-none'
                  fullWidth
                  label={t('cases.todo.description')}
                  type='text'
                  {...register('description')}
                  defaultValue={todoItemData?.description || null}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  disabled={mode === 'view'}
                  autoFocus
                  id='description'
                  multiline
                  minRows={3}
                  maxRows={4}
                  sx={{ '& .MuiOutlinedInput-root': { height: 'auto' } }}
                />
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
                  {mode === 'create' ? t('cases.todo.addTodoItem') : t('cases.todo.updateTodoItem')}
                </Button>
              </div>
            )}
          </form>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddTodoItemsModal
