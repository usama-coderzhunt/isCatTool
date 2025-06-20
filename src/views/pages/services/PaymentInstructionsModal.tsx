import { Dialog, DialogTitle, IconButton, DialogContent, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

interface PaymentInstructionsModalProps {
  open: boolean
  onClose: () => void
  instructions?: string
  additionalDetails?: string
}

const PaymentInstructionsModal: React.FC<PaymentInstructionsModalProps> = ({
  open,
  onClose,
  instructions,
  additionalDetails
}) => {
  const { t } = useTranslation('global')
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '1rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle className='bg-primary text-white py-6 px-8 text-2xl font-semibold flex justify-between items-center'>
        {t('paymentInstructionsModal.title')}
        <IconButton onClick={onClose} className='text-white hover:text-gray-200'>
          <i className='tabler-x size-6' />
        </IconButton>
      </DialogTitle>
      <DialogContent className='p-8'>
        {instructions && (
          <div className='mb-6'>
            <Typography variant='h6' className='text-primary mb-2'>
              {t('paymentInstructionsModal.instructions')}
            </Typography>
            <Typography variant='body1' className='p-4 bg-backgroundDefault rounded-lg'>
              {instructions}
            </Typography>
          </div>
        )}
        {additionalDetails && (
          <div>
            <Typography variant='h6' className='text-primary mb-2'>
              {t('paymentInstructionsModal.additionalDetails')}
            </Typography>
            <Typography variant='body1' className='p-4 bg-backgroundDefault rounded-lg'>
              {additionalDetails}
            </Typography>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default PaymentInstructionsModal
