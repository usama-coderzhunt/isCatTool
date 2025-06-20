import { FC } from 'react'
import { Modal, IconButton, Typography, Box, Fade, Backdrop, Button } from '@mui/material'
import { modalStyles } from '@/utils/constants/modalsStyles'
import { useTranslation } from 'next-i18next'

interface ImagePreviewModalProps {
  open: boolean
  onClose: () => void
  imageUrl: string
}

const ImagePreviewModal: FC<ImagePreviewModalProps> = ({ open, onClose, imageUrl }) => {
  const { t } = useTranslation('global')
  return (
    <Modal
      aria-labelledby='image-preview-modal-title'
      aria-describedby='image-preview-modal-description'
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500
        }
      }}
    >
      <Fade in={open}>
        <Box sx={{ ...modalStyles, width: '80%', maxWidth: '90%', maxHeight: '90vh' }}>
          {/* Header */}
          <div className='flex gap-x-2 justify-between items-center mb-6'>
            <Typography variant='h4'>{t('common.manualPaymentProofModalTitle')}</Typography>
            <Button
              onClick={onClose}
              variant='outlined'
              className='min-w-fit w-[32px] h-[32px] border-none m-0 !p-0 rounded-full bg-transparent hover:bg-primary hover:text-white flex items-center justify-center'
            >
              <i className='tabler-x w-[18px] h-[18px]'></i>
            </Button>
          </div>

          {/* Image Container */}
          <div className='relative w-full h-[calc(90vh-120px)] overflow-hidden rounded-lg'>
            <img src={imageUrl} alt='Manual Payment Proof' className='w-full h-full object-contain' />
          </div>
        </Box>
      </Fade>
    </Modal>
  )
}

export default ImagePreviewModal
