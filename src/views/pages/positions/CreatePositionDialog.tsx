'use client'

import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogTitle, TextField, Button } from '@mui/material'
import { useStaffHooks } from '@/services/useStaffHooks'
import { useTranslation } from 'next-i18next'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import CustomTextField from '@/@core/components/mui/TextField'
import { toast } from 'react-toastify'

interface CreatePositionDialogProps {
  open: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  positionData?: { id: number; name: string } | null
}

interface FormData {
  name: string
}

const CreatePositionDialog = ({ open, onClose, mode, positionData }: CreatePositionDialogProps) => {
  const { useCreateStaffPosition, useUpdateStaffPosition } = useStaffHooks()
  const createPosition = useCreateStaffPosition()
  const updatePosition = useUpdateStaffPosition()

  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      name: ''
    }
  })

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  // Set form values when editing
  useEffect(() => {
    if (mode === 'edit' && positionData) {
      setValue('name', positionData.name)
    } else if (mode === 'create') {
      reset()
    }
  }, [positionData, mode, setValue, reset])

  const onSubmit = async (data: FormData) => {
    if (mode === 'create') {
      await createPosition.mutateAsync(data, {
        onSuccess: () => {
          toast.success(t('positionsTable.toasts.positionCreatedSuccess'))
          handleCloseModal()
        }
      })
    } else if (mode === 'edit' && positionData?.id) {
      await updatePosition.mutateAsync(
        { id: positionData.id, ...data },
        {
          onSuccess: () => {
            toast.success(t('positionsTable.toasts.positionUpdatedSuccess'))
            handleCloseModal()
          }
        }
      )
    }
    handleCloseModal()
  }

  const handleCloseModal = () => {
    onClose()
    reset()
  }

  return (
    <Dialog open={open} onClose={handleCloseModal} maxWidth='xs' fullWidth>
      <DialogTitle>
        {mode === 'create' ? t('positionsTable.addPosition') : t('positionsTable.updatePosition')}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} className='mt-4 flex flex-col gap-5'>
          <CustomTextField
            label={t('positionsTable.positionName')}
            fullWidth
            {...register('name', { required: t('validation.required') })}
            error={!!errors.name}
            helperText={errors.name?.message}
            showAsterisk={true}
          />

          <div className='flex justify-end gap-4 mt-4'>
            <Button onClick={handleCloseModal}>{t('common.cancel')}</Button>
            <Button type='submit' variant='contained' className='bg-primary hover:bg-primaryDark'>
              {mode === 'create' ? t('positionsTable.addPosition') : t('positionsTable.updatePosition')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreatePositionDialog
