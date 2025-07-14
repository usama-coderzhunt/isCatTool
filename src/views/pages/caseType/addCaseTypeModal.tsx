import * as React from 'react'

import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'

import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from 'react-i18next'
import { modalStyles } from '@/utils/constants/modalsStyles'
import { useCasesHooks } from '@/services/useCases'
import { CaseTypes } from '@/types/cases'
import { toast } from 'react-toastify'

interface AddCaseTypeModalProps {
  open: boolean
  handleClose: () => void
  mode: 'create' | 'edit'
  caseTypeData?: CaseTypes | null
}

const AddCaseTypeModal = ({ open, handleClose, mode, caseTypeData }: AddCaseTypeModalProps) => {
  // Api Call
  const { useCreateCaseType, useUpdateCaseType } = useCasesHooks()
  const { mutate: createCaseType } = useCreateCaseType()
  const { mutate: updateCaseType } = useUpdateCaseType(caseTypeData?.id ?? null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue
  } = useForm<CaseTypes>({
    mode: 'onSubmit'
  })

  const { t } = useTranslation('global')

  React.useEffect(() => {
    if (mode === 'edit' && caseTypeData) {
      setValue('name', caseTypeData.name)
    } else if (mode === 'create') {
      reset()
    }
  }, [caseTypeData, mode, setValue, reset])

  const onSubmit: SubmitHandler<CaseTypes> = async (data: CaseTypes) => {
    if (mode === 'edit' && caseTypeData) {
      updateCaseType(data.name, {
        onSuccess: () => {
          toast.success(t('caseTypes.toastMessages.updated'))
          handleCloseModal()
        }
      })
    } else {
      createCaseType(data.name, {
        onSuccess: () => {
          toast.success(t('caseTypes.toastMessages.created'))
          handleCloseModal()
        }
      })
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
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
            <Typography variant='h4'>
              {mode === 'create' ? t('caseTypes.addCaseTypeModal.title') : t('caseTypes.addCaseTypeModal.update')}
            </Typography>
            <Button
              onClick={handleCloseModal}
              variant='outlined'
              className='min-w-fit w-[32px] h-[32px] border-none m-0 !p-0 rounded-full bg-primaryLighter hover:bg-primary hover:text-white flex items-center justify-center'
            >
              <i className='tabler-x w-[18px] h-[18px]'></i>
            </Button>
          </div>
          <Box>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
              <CustomTextField
                autoFocus
                fullWidth
                id='name'
                label={t('caseTypes.fields.name')}
                type='text'
                {...register('name', { required: t('caseTypes.fields.required') })}
                error={!!errors.name}
                helperText={errors.name?.message}
                showAsterisk={true}
                sx={{
                  '& .MuiInputLabel-root': {
                    backgroundColor: 'background.paper',
                    px: 1
                  }
                }}
                onBlur={e => {
                  if (!e.target.value.trim()) {
                    setValue('name', '', { shouldValidate: true })
                  }
                }}
              />

              <div className='w-full flex justify-end'>
                <Button
                  variant='contained'
                  sx={{
                    width: 'max-content',
                    padding: '0.5rem 1rem'
                  }}
                  type='submit'
                >
                  {mode === 'create' ? t('caseTypes.addCaseTypeModal.add') : t('caseTypes.addCaseTypeModal.update')}
                </Button>
              </div>
            </form>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddCaseTypeModal
