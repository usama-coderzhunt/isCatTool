import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

// Goggle ReCaptcha
import Recaptcha from './Recaptcha'
import { useRecaptchaStore } from '@/store/recaptchaStore';

interface StatusConfModalProps {
  title: string
  userName: string
  newStatus: boolean | null
  message?: string
  open: boolean
  handleClose: () => void
  handleStatusChange: () => void
}

const StatusConfModal = ({ title, userName, newStatus, message, open, handleClose, handleStatusChange }: StatusConfModalProps) => {
  const { t } = useTranslation('global')
  // store
  // const { recaptchaToken, setRecaptchaToken } = useRecaptchaStore();

  const handleCloseModal = () => {
    handleClose()
    // setRecaptchaToken(null)
  }

  return (
    <Dialog open={open} onClose={handleCloseModal} maxWidth='xs' fullWidth>
      <div className='flex gap-x-2 justify-between items-center p-4'>
        <DialogTitle className='!p-0 flex items-center gap-3'>
          <i className={`tabler-alert-circle text-warning text-[28px]`} />
          {title}
        </DialogTitle>
        <Button
          onClick={handleCloseModal}
          variant='outlined'
          className='min-w-fit w-[32px] h-[32px] border-none m-0 !p-0 rounded-full bg-transparent hover:bg-primary hover:text-white flex items-center justify-center'
        >
          <i className='tabler-x w-[18px] h-[18px]'></i>
        </Button>
      </div>
      <DialogContent>
        <div className='flex flex-col gap-4'>
          <Typography className='text-center'>
            {message || t('modal.confirmation.status.message', { name: userName, status: newStatus })}
          </Typography>
        </div>
        <div className='w-full flex items-center justify-start mt-4'>

          {/* Recaptcha */}
          {/* <Recaptcha /> */}

        </div>
      </DialogContent>
      <DialogActions className='dialog-actions-dense'>
        <Button variant='outlined' onClick={handleCloseModal} className='flex items-center gap-2'>
          {t('modal.confirmation.status.cancel')}
        </Button>
        <Button
          variant='contained'
          onClick={() => { handleStatusChange?.(), {/*setRecaptchaToken(null)*/ } }}
          // disabled={process.env.NEXT_PUBLIC_ENV === 'development' ? false : !recaptchaToken}
          className='flex items-center gap-2'>
          {t('modal.confirmation.status.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default StatusConfModal 
