import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ImageUploader from '@/components/common/ImageUploader'

import CustomTextField from '@/@core/components/mui/TextField'

interface StatusConfModalProps {
  title: string
  userName: string
  newStatus: boolean | null
  message?: string
  open: boolean
  handleClose: () => void
  handleStatusChange: (notes: string, manualPaymentProof?: File | null) => void
  notes?: string
  setNotes?: (notes: string) => void
  showImageUpload?: boolean
  isShowAddNotesField?: boolean
  initialNotes?: string
  initialImage?: string
}

const StatusConfModal = ({
  title,
  userName,
  newStatus,
  message,
  open,
  handleClose,
  handleStatusChange,
  notes = '',
  setNotes,
  showImageUpload = false,
  isShowAddNotesField = true,
  initialNotes = '',
  initialImage = ''
}: StatusConfModalProps) => {
  const { t } = useTranslation('global')
  const maxLength = 200
  const [manualPaymentProof, setManualPaymentProof] = useState<File | null>(null)
  const AllowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']

  useEffect(() => {
    if (open && initialNotes) {
      setNotes?.(initialNotes)
    }
  }, [open, initialNotes, setNotes])

  const handleCloseModal = () => {
    handleClose()
    setNotes?.('')
    setManualPaymentProof(null)
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
          {isShowAddNotesField && (
            <CustomTextField
              fullWidth
              multiline
              rows={3}
              value={notes}
              onChange={e => setNotes?.(e.target.value.slice(0, maxLength))}
              label={t('modal.confirmation.status.addNotes')}
              helperText={`${notes?.length}/${maxLength}`}
            />
          )}
          {showImageUpload && (
            <div className='w-full'>
              <ImageUploader
                value={initialImage ? initialImage : manualPaymentProof}
                onChange={setManualPaymentProof}
                label={t('modal.confirmation.status.manualPaymentProof')}
                maxSize={10 * 1024 * 1024}
                allowedExtensions={AllowedExtensions}
              />
            </div>
          )}
          {/* <Typography className='text-center'>
            {message || t('modal.confirmation.status.message', { name: userName, status: newStatus })}
          </Typography> */}
          {message && <Typography className='text-center'>{message}</Typography>}
        </div>
        <div className='w-full flex items-center justify-start mt-4'></div>
      </DialogContent>
      <DialogActions className='dialog-actions-dense'>
        <Button variant='outlined' onClick={handleCloseModal} className='flex items-center gap-2'>
          {t('modal.confirmation.status.cancel')}
        </Button>
        <Button
          variant='contained'
          onClick={() => {
            handleStatusChange(notes || '', manualPaymentProof)
          }}
          className='flex items-center gap-2'
        >
          {t('modal.confirmation.status.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default StatusConfModal
