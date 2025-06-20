import { FC, ReactElement, useState } from 'react'
import { Button, IconButton, Modal, Typography, Box, Fade, Backdrop } from '@mui/material'
import CustomTextField from '@/@core/components/mui/TextField'
import { modalStyles } from '@/utils/constants/modalsStyles'
import { useTranslation } from 'react-i18next'

interface AddNoteModalProps {
  open: boolean
  handleClose: () => void
  onAddNote: (note: string) => void
  setActiveNote: (note: string) => void
  activeNote: string
}

const AddNoteModal: FC<AddNoteModalProps> = ({
  open,
  handleClose,
  onAddNote,
  setActiveNote,
  activeNote = ''
}): ReactElement => {
  const { t } = useTranslation()

  const handleModalClose = () => {
    handleClose()
    setActiveNote('')
  }

  const handleSubmit = () => {
    onAddNote(activeNote)
    setActiveNote(activeNote)
    handleModalClose()
  }

  return (
    <Modal
      aria-labelledby='transition-modal-title'
      aria-describedby='transition-modal-description'
      open={open}
      onClose={handleModalClose}
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
            <Typography variant='h4'>{t('addNoteModal.title')}</Typography>
            <Button
              onClick={handleModalClose}
              variant='outlined'
              className='min-w-fit w-[32px] h-[32px] border-none m-0 !p-0 rounded-full bg-transparent hover:bg-primary hover:text-white flex items-center justify-center'
            >
              <i className='tabler-x w-[18px] h-[18px]'></i>
            </Button>
          </div>

          <div className='flex flex-col gap-6'>
            <CustomTextField
              fullWidth
              multiline
              rows={6}
              value={activeNote}
              onChange={e => setActiveNote(e.target.value)}
              placeholder={t('addNoteModal.enterNote')}
            />

            <div className='w-full flex justify-end gap-3'>
              <Button
                variant='outlined'
                color='primary'
                onClick={handleModalClose}
                sx={{
                  width: 'max-content',
                  padding: '0.5rem 1rem'
                }}
              >
                {t('addNoteModal.cancel')}
              </Button>
              <Button
                variant='contained'
                color='primary'
                onClick={handleSubmit}
                sx={{
                  width: 'max-content',
                  padding: '0.5rem 1rem'
                }}
              >
                {t('addNoteModal.btnText')}
              </Button>
            </div>
          </div>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AddNoteModal
