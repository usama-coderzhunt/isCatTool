import { useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'next-i18next'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import { useForm } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'

import { useUserHooks } from '@/services/useUserHooks'
import Recaptcha from '@/components/Recaptcha'
import { useRecaptchaStore } from '@/store/recaptchaStore'

interface ResetPasswordDialogProps {
  open: boolean
  onClose: () => void
}

interface ResetPasswordFormData {
  current_password: string
  password: string
}

const ResetPasswordDialog = ({ open, onClose }: ResetPasswordDialogProps) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const { recaptchaToken } = useRecaptchaStore()
  const { t } = useTranslation('global')

  const { useLoggedInUserResetPassword } = useUserHooks()
  const { mutate: resetPassword, isLoading } = useLoggedInUserResetPassword()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ResetPasswordFormData>({
    mode: 'onSubmit'
  })

  const onSubmit: SubmitHandler<ResetPasswordFormData> = data => {
    if (!recaptchaToken && process.env.NEXT_PUBLIC_ENV !== 'development') {
      return
    }

    resetPassword(data, {
      onSuccess: () => {
        reset()
        onClose()
      }
    })
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>{t('auth.resetPassword.title')}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <div className='flex flex-col gap-4 mbs-4'>
            <TextField
              label={t('auth.resetPassword.currentPassword')}
              type={showCurrentPassword ? 'text' : 'password'}
              error={!!errors.current_password}
              helperText={errors.current_password?.message}
              fullWidth
              {...register('current_password')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge='end'>
                      <i className={showCurrentPassword ? 'tabler-eye-off' : 'tabler-eye'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              label={t('auth.resetPassword.newPassword')}
              type={showNewPassword ? 'text' : 'password'}
              error={!!errors.password}
              helperText={errors.password?.message}
              fullWidth
              {...register('password')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge='end'>
                      <i className={showNewPassword ? 'tabler-eye-off' : 'tabler-eye'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <div className='flex justify-center'>
              <Recaptcha />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='secondary'>
            {t('common.cancel')}
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={(!recaptchaToken && process.env.NEXT_PUBLIC_ENV !== 'development') || isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : t('auth.resetPassword.submit')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ResetPasswordDialog
