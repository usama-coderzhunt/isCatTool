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
import { ServiceCategory } from '@/types/serviceCategoryTypes'
import { useServicesHooks } from '@/services/useServicesHooks'
import { useTranslation } from 'react-i18next'

// Form Schema
const serviceCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional()
})

type ServiceCategoryFormData = z.infer<typeof serviceCategorySchema>

interface AddServiceCategoryModalProps {
  open: boolean
  handleClose: React.Dispatch<React.SetStateAction<boolean>>
  categoryData?: ServiceCategory | null
  mode: 'create' | 'edit'
}

const AddServiceCategoryModal: React.FC<AddServiceCategoryModalProps> = ({ open, handleClose, categoryData, mode }) => {
  const { t } = useTranslation('global')
  // hooks
  const { useCreateServiceCategory, useEditServiceCategory } = useServicesHooks()
  const { mutate: createCategory } = useCreateServiceCategory()
  const { mutate: editCategory } = useEditServiceCategory()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<ServiceCategoryFormData>({
    resolver: zodResolver(serviceCategorySchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      description: ''
    }
  })

  React.useEffect(() => {
    if (mode === 'edit' && categoryData) {
      setValue('name', categoryData.name)
      setValue('description', categoryData.description || '')
    } else if (mode === 'create') {
      reset()
    }
  }, [categoryData, mode, setValue, reset])

  const onSubmit: SubmitHandler<ServiceCategoryFormData> = data => {
    const formData = new FormData()
    formData.append('name', data.name)
    if (data.description) {
      formData.append('description', data.description)
    }

    if (mode === 'create') {
      createCategory(formData, {
        onSuccess: () => {
          toast.success(t('serviceCategories.toasts.categoryCreatedSuccess'))
          handleCloseModal()
        }
      })
    } else if (mode === 'edit' && categoryData?.id) {
      editCategory(
        {
          id: categoryData.id,
          data: formData
        },
        {
          onSuccess: () => {
            toast.success(t('serviceCategories.toasts.categoryUpdatedSuccess'))
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
              {mode === 'create' ? t('serviceCategories.addCategory') : t('serviceCategories.updateCategory')}
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
                  label={t('serviceCategories.form.name')}
                  type='text'
                  {...register('name')}
                  defaultValue={categoryData?.name || ''}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  showAsterisk={true}
                />
              </div>

              {/* Description */}
              <div>
                <CustomTextField
                  fullWidth
                  label={t('serviceCategories.form.description')}
                  multiline
                  rows={4}
                  {...register('description')}
                  defaultValue={categoryData?.description || ''}
                  error={!!errors.description}
                  helperText={errors.description?.message}
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
                {mode === 'create' ? t('serviceCategories.addCategory') : t('serviceCategories.updateCategory')}
              </Button>
            </div>
          </form>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddServiceCategoryModal
