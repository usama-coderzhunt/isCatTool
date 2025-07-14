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
import { useProjectsHooks } from '@/services/useProjectsHooks'
import CustomTextField from '@/@core/components/mui/TextField'

interface SplitTaskModalProps {
  open: boolean
  handleClose: React.Dispatch<React.SetStateAction<boolean>>
  title: string
  taskId: number | undefined
}

interface SplitTaskForm {
  number_of_subtasks: number | undefined
}

const SplitTaskModal: React.FC<SplitTaskModalProps> = ({ open, handleClose, title, taskId }) => {
  const { t } = useTranslation('global')
  const { useTaskSplitByCount } = useProjectsHooks()
  const { mutate: taskSplitByCount, isSuccess: isTaskSplit } = useTaskSplitByCount()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<SplitTaskForm>({
    defaultValues: {
      number_of_subtasks: undefined
    },
    mode: 'onSubmit'
  })

  const onSubmit: SubmitHandler<SplitTaskForm> = (data: SplitTaskForm) => {
    taskSplitByCount(
      {
        id: taskId || 0,
        data: {
          number_of_subtasks: Number(data.number_of_subtasks)
        }
      },
      {
        onSuccess: () => {
          handleCloseModal()
        }
      }
    )
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
              {/* Number of Subtasks */}
              <div className='w-full'>
                <Controller
                  control={control}
                  name='number_of_subtasks'
                  rules={{
                    required: 'Number of subtasks is required'
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      label={t('tasks.splitTaskModal.numberOfSubtasks')}
                      type='number'
                      fullWidth
                      {...register('number_of_subtasks')}
                      defaultValue={null}
                      error={!!errors.number_of_subtasks}
                      helperText={errors.number_of_subtasks?.message}
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
                {t('tasks.splitTaskModal.cancel')}
              </Button>
              <Button
                variant='contained'
                sx={{
                  width: 'max-content',
                  padding: '0.5rem 1rem'
                }}
                type='submit'
              >
                {t('tasks.splitTaskModal.splitTask')}
              </Button>
            </div>
          </form>
        </Box>
      </Fade>
    </Modal>
  )
}

export default SplitTaskModal
