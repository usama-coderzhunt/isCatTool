'use client'

import { Box, Button, Fade, Typography } from '@mui/material'
import Modal from '@mui/material/Modal'
import { useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useParams } from 'next/navigation'
import { modalStyles } from '@/utils/constants/modalsStyles'

interface ExportDataConfModalProps {
  open: boolean
  handleClose: () => void
  title: string
  handleExport?: void | (() => void)
  message?: string
}

const ExportDataConfModal = ({ open, handleClose, title, handleExport, message }: ExportDataConfModalProps) => {
  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  const handleCloseModal = () => {
    handleClose()
  }

  return (
    <Modal open={open} onClose={handleCloseModal} className='!outline-none'>
      <Fade in={open}>
        <Box sx={{ ...modalStyles, width: 450 }}>
          <div className='flex gap-x-2 justify-end items-center absolute top-3 right-3'>
            <Button
              onClick={handleCloseModal}
              variant='outlined'
              className='min-w-fit w-[32px] h-[32px] border-none m-0 !p-0 rounded-full bg-primaryLighter hover:bg-primary hover:text-white flex items-center justify-center'
            >
              <i className='tabler-x w-[18px] h-[18px]'></i>
            </Button>
          </div>
          <div className='flex flex-col items-center gap-y-2 w-full h-full overflow-x-hidden mt-4'>
            <div className='w-[64px] h-[64px] flex items-center justify-center rounded-full bg-primaryLighter'>
              <i className='tabler-file-download w-[32px] h-[32px] text-primary'></i>
            </div>
            <Typography variant='h5'>{title}</Typography>
            <Typography variant='body2' className='mb-4'>
              {message}
            </Typography>

            <div className='w-full flex items-end justify-center gap-x-3'>
              <Button onClick={handleCloseModal} variant='outlined' className='w-fit'>
                {t('exportDataConfModal.cancelBtnText')}
              </Button>

              <Button
                onClick={() => {
                  handleExport?.()
                }}
                variant='contained'
                className='w-fit'
              >
                {t('exportDataConfModal.exportBtnText')}
              </Button>
            </div>
          </div>
        </Box>
      </Fade>
    </Modal>
  )
}

export default ExportDataConfModal
