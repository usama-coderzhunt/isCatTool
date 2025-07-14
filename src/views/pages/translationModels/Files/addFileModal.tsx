import * as React from 'react'
import { useTranslation } from 'next-i18next'
import { useForm } from 'react-hook-form'

import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import FileUploaderSingle from '@/components/fileUploader'
import { modalStyles } from '@/utils/constants/modalsStyles'
import { useProjectsHooks } from '@/services/useProjectsHooks'
import { toast } from 'react-toastify'
import SearchableMultiSelect from '@/components/common/SearchableMultiSelect'

interface AddFileModalProps {
  open: boolean
  handleClose: () => void
  taskId?: number
}

interface FormData {
  task?: number
}

const AddFileModal = ({ open, handleClose, taskId }: AddFileModalProps) => {
  const { t } = useTranslation('global')
  const [file, setFile] = React.useState<any[]>([])
  const [selectedTaskId, setSelectedTaskId] = React.useState<number | undefined>(taskId)

  const {
    register,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      task: taskId
    }
  })

  // API Hook
  const { useCreateFile, getTasks } = useProjectsHooks()
  const { mutate: createFile, isLoading: isCreating } = useCreateFile()

  // Custom hook function for SearchableMultiSelect
  const useTasksOptions = (pageSize: number, page: number, searchQuery?: string) => {
    return getTasks(undefined, pageSize, page, searchQuery)
  }

  const handleCloseModal = () => {
    handleClose()
    setFile([])
  }

  const onSubmit = () => {
    if (!file || file.length === 0) {
      toast.error(t('taskFiles.toasts.pleaseSelectFile'))
      return
    }

    const currentTaskId = taskId || selectedTaskId
    if (!currentTaskId) {
      toast.error('Please select a task')
      return
    }

    const fileData = {
      task: currentTaskId,
      file: file[0]
    }

    createFile(fileData, {
      onSuccess: () => {
        toast.success(t('taskFiles.toasts.fileCreatedSuccess'))
        handleCloseModal()
      },
      onError: () => {}
    })
  }

  const isFormValid = file && file.length > 0 && (taskId || selectedTaskId)

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
            <Typography variant='h4'>{t('taskFiles.form.add')}</Typography>
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
            <div className='flex flex-col gap-6'>
              <div>
                <Typography variant='body2' className='text-textSecondary mb-2'>
                  {t('taskFiles.form.uploadFile')}
                </Typography>
                <FileUploaderSingle
                  files={file}
                  setFiles={setFile}
                  resetFiles={() => setFile([])}
                  errorMessage=''
                  allowedExtensions={{ 'application/msword': ['.docx'], 'text/idml': ['.idml'] }}
                />
                {/* Task Selection */}
                {!taskId && (
                  <div className='mt-4'>
                    <SearchableMultiSelect<any>
                      options={useTasksOptions}
                      name='task'
                      returnAsArray={false}
                      returnAsString={false}
                      register={register}
                      setValue={setValue}
                      fieldError={errors.task}
                      labelKey='name'
                      value={watch('task') || undefined}
                      className='w-full'
                      label={t('taskFiles.form.task')}
                      multiple={false}
                      showAsterisk={true}
                      onChange={value => {
                        setSelectedTaskId(value as number)
                      }}
                    />
                  </div>
                )}
              </div>

              <div className='w-full flex justify-end gap-3'>
                <Button variant='outlined' onClick={handleCloseModal} disabled={isCreating}>
                  {t('taskFiles.form.cancel')}
                </Button>
                <Button onClick={onSubmit} variant='contained' disabled={!isFormValid || isCreating}>
                  {t('taskFiles.form.add')}
                </Button>
              </div>
            </div>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddFileModal
