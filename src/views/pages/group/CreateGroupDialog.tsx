'use client'

import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogTitle, Button } from '@mui/material'
import { useUserManagementHooks } from '@/services/useUserManagementHooks'
import Recaptcha from '@/components/Recaptcha'
import { useRecaptchaStore } from '@/store/recaptchaStore'
import { useTranslation } from 'react-i18next'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import CustomTextField from '@/@core/components/mui/TextField'
import { GroupType } from '@/types/userTypes'

interface CreateGroupDialogProps {
  open: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  groupData?: GroupType | null
}

interface FormData {
  name: string
}

const CreateGroupDialog = ({ open, onClose, mode, groupData }: CreateGroupDialogProps) => {
  // store
  // const { recaptchaToken, setRecaptchaToken } = useRecaptchaStore()

  const { useCreateGroup, useUpdateGroup } = useUserManagementHooks()
  const createGroup = useCreateGroup()
  const updateGroup = useUpdateGroup()

  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue
  } = useForm<FormData>()

  useEffect(() => {
    if (mode === 'edit' && groupData) {
      setValue('name', groupData.name)
    } else if (mode === 'create') {
      reset()
    }
  }, [groupData, mode, setValue, reset])

  const handleCloseModal = () => {
    onClose()
    reset()
    // setRecaptchaToken(null)
  }

  const onSubmit = (data: FormData) => {
    if (mode === 'edit' && groupData) {
      updateGroup.mutate({ id: groupData.id, data: { name: data.name } }, {
        onSuccess: () => {
          handleCloseModal()
        }
      })
    } else {
      createGroup.mutate(data, {
        onSuccess: () => {
          handleCloseModal()
        }
      })
    }
  }

  return (
    <Dialog open={open} onClose={handleCloseModal} maxWidth='sm' fullWidth>
      <DialogTitle>{t('groupDialog.createGroupDialogTitle')}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} className='mt-4 flex flex-col gap-5'>
          <CustomTextField
            label={t('groupDialog.createGroupDialogFieldLab')}
            fullWidth
            {...register('name', { required: t('groupDialog.createGroupDialogFieldLabRequired') })}
            error={!!errors.name}
            helperText={errors.name?.message}
            showAsterisk={true}
          />

          {/* Recaptcha */}
          {/* <Recaptcha /> */}

          <div className='flex justify-end gap-4 mt-4'>
            <Button onClick={handleCloseModal}>{t('groupDialog.createGroupDialogCancel')}</Button>
            <Button
              type='submit'
              variant='contained'
              className='bg-primary hover:bg-primaryDark'
            // disabled={createGroup.isLoading || process.env.NEXT_PUBLIC_ENV === 'development' ? false : !recaptchaToken}
            >
              {t('groupDialog.createGroupDialogCreate')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateGroupDialog
