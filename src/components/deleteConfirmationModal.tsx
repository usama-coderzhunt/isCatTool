'use client'

import { Box, Button, Fade, Typography } from '@mui/material'
import Modal from '@mui/material/Modal'
import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useParams } from 'next/navigation'

// Goggle ReCaptcha
import Recaptcha from './Recaptcha'
import { useRecaptchaStore } from '@/store/recaptchaStore'
import { modalStyles } from '@/utils/constants/modalsStyles'

interface DeleteConfModalProps {
  open: boolean
  handleClose: () => void
  title: string
  deleteValue?: string
  handleDelete?: void | (() => void)
  message?: string
}

const DeleteConfModal = ({ open, handleClose, title, deleteValue, handleDelete, message }: DeleteConfModalProps) => {
  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  // const { recaptchaToken, setRecaptchaToken } = useRecaptchaStore()

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  const handleCloseModal = () => {
    handleClose()
    // setRecaptchaToken(null)
  }

  return (
    <Modal open={open} onClose={handleCloseModal} className='!outline-none'>
      <Fade in={open}>
        <Box sx={{ ...modalStyles, width: 450 }}>
          <div className='flex gap-x-2 justify-end items-center absolute top-3 right-3'>
            {/* <Typography variant='h5'>{title}</Typography> */}
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
              <i className='tabler-trash w-[32px] h-[32px] text-primary'></i>
            </div>
            <Typography variant='h5'>{title || t('documents.types.delete.title')}</Typography>
            <Typography variant='body2' className='mb-4 text-center'>
              {message || t('documents.types.delete.message', { name: deleteValue })}
            </Typography>

            {/* Recaptcha */}
            {/* <Recaptcha /> */}

            <div className='w-full flex items-end justify-center gap-x-3'>
              <Button onClick={handleCloseModal} variant='outlined' className='w-fit'>
                {t('common.cancel')}
              </Button>

              <Button
                onClick={() => {
                  handleDelete?.(),
                    {
                      /*setRecaptchaToken(null)*/
                    }
                }}
                variant='contained'
                className='w-fit'
                // disabled={process.env.NEXT_PUBLIC_ENV === 'development' ? false : !recaptchaToken}
              >
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </Box>
      </Fade>
    </Modal>
  )
}

export default DeleteConfModal
