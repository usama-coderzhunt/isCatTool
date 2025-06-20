import { Modal, Typography, IconButton, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
  checkoutUrl: string
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ open, onClose, checkoutUrl }) => {
  const theme = useTheme()
  const { t } = useTranslation('global')

  const handleOpenCheckout = () => {
    const width = 600
    const height = 800
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2

    const newWindow = window.open(
      checkoutUrl,
      'checkout',
      `height=${height},width=${width},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    )
    if (newWindow) {
      newWindow.focus()
    }
    onClose()
  }

  // Theme-based colors
  const bgColor = theme.palette.background.paper
  const textColor = theme.palette.text.primary
  const secondaryText = theme.palette.text.secondary
  const primaryColor = theme.palette.primary.main
  const infoBg = theme.palette.mode === 'dark' ? 'bg-blue-900/40' : 'bg-blue-50'

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby='secure-checkout-title'
      aria-describedby='secure-checkout-description'
      className='flex items-center justify-center z-[1300]'
    >
      <div
        className={`relative w-full max-w-lg mx-auto rounded-3xl shadow-2xl p-0 outline-none`}
        style={{ background: bgColor, color: textColor }}
      >
        {/* Header */}
        <div
          className='flex justify-between items-center px-8 py-8 rounded-t-3xl border-b'
          style={{ background: primaryColor }}
        >
          <Typography id='secure-checkout-title' variant='h4' className='font-bold tracking-wide text-white'>
            {t('stripeCheckOutModal.title')}
          </Typography>
          <IconButton
            onClick={onClose}
            className='text-white hover:bg-white/10 transition-all duration-200 hover:scale-110'
            size='large'
          >
            <i className='tabler-x text-2xl' />
          </IconButton>
        </div>
        {/* Content */}
        <div className='px-8 py-10 text-center'>
          <div className='mb-6 flex flex-col items-center'>
            <i className='tabler-shield-check text-5xl mb-4' style={{ color: primaryColor }} />
            <Typography variant='h6' className='font-semibold mb-2' style={{ color: textColor }}>
              {t('stripeCheckOutModal.gatewayTitle')}
            </Typography>
            <Typography
              id='secure-checkout-description'
              variant='body1'
              className='mb-4 leading-relaxed'
              style={{ color: secondaryText }}
            >
              {t('stripeCheckOutModal.redirectDescription')}
            </Typography>
          </div>
          <div className={`rounded-xl p-4 mb-8 flex items-start gap-2 ${infoBg}`}>
            <i className='tabler-clock text-xl mt-0.5' style={{ color: primaryColor }} />
            <Typography variant='body2' className='text-sm leading-relaxed' style={{ color: secondaryText }}>
              {t('stripeCheckOutModal.activationTime')}
            </Typography>
          </div>
          <div className={`rounded-xl p-4 mb-8 flex items-start gap-2 ${infoBg}`}>
            <i className='tabler-info-circle text-xl mt-0.5' style={{ color: primaryColor }} />
            <Typography variant='body2' className='text-sm leading-relaxed' style={{ color: secondaryText }}>
              {t('stripeCheckOutModal.infoBox')}
            </Typography>
          </div>
          <Button
            variant='contained'
            onClick={handleOpenCheckout}
            className='w-full py-4 rounded-xl normal-case text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2'
            style={{ background: primaryColor, color: '#fff' }}
          >
            <i className='tabler-lock-check mr-2 text-xl' />
            {t('stripeCheckOutModal.button')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default CheckoutModal
