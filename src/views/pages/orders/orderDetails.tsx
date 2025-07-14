import { useTranslation } from 'next-i18next'
import { useTheme } from '@mui/material/styles'

import { Button, Card, Chip, Typography, Grid, Box } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import CancelIcon from '@mui/icons-material/Cancel'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import DiscountIcon from '@mui/icons-material/Discount'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import EventIcon from '@mui/icons-material/Event'
import UpdateIcon from '@mui/icons-material/Update'
import NotesIcon from '@mui/icons-material/Notes'

import CircularLoader from '@/components/CircularLoader'
import { getDisplayDateTime } from '@/utils/utility/displayValue'
import { OrdersTypes } from '@/types/ordersTypes'
import { UserType } from '@/types/userTypes'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'

const OrderDetails = ({
  orderDetails,
  isLoading,
  handleBtnClick,
  userData
}: {
  orderDetails: OrdersTypes
  isLoading: boolean
  handleBtnClick: any
  userData: UserType
}) => {
  const { t } = useTranslation('global')
  const theme = useTheme()
  const isSuperUser = getDecryptedLocalStorage('isSuperUser')
  const userRole = getDecryptedLocalStorage('userRole')

  const handleOrderStatusDisplay = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; color: 'success' | 'error' | 'warning' | 'info' | 'default'; icon: JSX.Element }
    > = {
      pending: {
        label: t('orders.table.statuses.pending'),
        color: 'warning',
        icon: <HourglassEmptyIcon fontSize='small' />
      },
      confirmed: {
        label: t('orders.table.statuses.confirmed'),
        color: 'success',
        icon: <CheckCircleIcon fontSize='small' />
      },
      cancelled: { label: t('orders.table.statuses.cancelled'), color: 'error', icon: <CancelIcon fontSize='small' /> },
      completed: {
        label: t('orders.table.statuses.completed'),
        color: 'success',
        icon: <CheckCircleIcon fontSize='small' />
      },
      refunded: { label: t('orders.table.statuses.refunded'), color: 'error', icon: <CancelIcon fontSize='small' /> },
      cancellation_requested: {
        label: t('orders.table.statuses.cancellation_requested'),
        color: 'info',
        icon: <HourglassEmptyIcon fontSize='small' />
      },
      upgraded: {
        label: t('orders.table.statuses.upgraded'),
        color: 'success',
        icon: <CheckCircleIcon fontSize='small' />
      }
    }
    const config = statusMap[status] || { label: '-', color: 'default', icon: <HourglassEmptyIcon fontSize='small' /> }
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size='small'
        variant='filled'
        sx={{ fontWeight: 600 }}
      />
    )
  }

  return (
    <Box className='w-full flex justify-center items-center'>
      <Card className='shadow-xl max-w-full w-full mx-auto p-0 rounded-[6px] overflow-hidden bg-backgroundPaper'>
        {isLoading ? (
          <Box className='w-full h-full flex items-center justify-center py-10'>
            <CircularLoader />
          </Box>
        ) : !orderDetails ? (
          <Box className='w-full h-full flex items-center justify-center py-10'>
            <Typography variant='h6'>{t('orders.orderDetailsPage.noOrderDataFound')}</Typography>
          </Box>
        ) : (
          <>
            {/* Header */}
            <Box
              sx={{
                // background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                px: theme.spacing(3),
                py: theme.spacing(2.5),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTopLeftRadius: theme.spacing(3),
                borderTopRightRadius: theme.spacing(3),
                boxShadow: 2
              }}
            >
              <Box display='flex' alignItems='center' gap={1}>
                <ConfirmationNumberIcon fontSize='medium' />
                <Typography variant='h6' className='text-white font-bold tracking-[1px]'>
                  {orderDetails.order_number}
                </Typography>
              </Box>
              {handleOrderStatusDisplay(orderDetails.status)}
            </Box>

            {/* Details Grid */}
            <Box px={theme.spacing(3)} py={theme.spacing(2.5)}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box
                    display='flex'
                    alignItems='center'
                    gap={1}
                    sx={{ background: theme.palette.action.hover, borderRadius: 2, p: 1.2 }}
                  >
                    <MonetizationOnIcon color='primary' />
                    <Box>
                      <Typography variant='caption' color='text.primary'>
                        {t('orders.orderDetailsPage.amount')}
                      </Typography>
                      <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
                        {orderDetails.currency_code} {orderDetails.amount}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    display='flex'
                    alignItems='center'
                    gap={1}
                    sx={{ background: theme.palette.action.hover, borderRadius: 2, p: 1.2 }}
                  >
                    <DiscountIcon color='secondary' />
                    <Box>
                      <Typography variant='caption' color='text.primary'>
                        {t('orders.orderDetailsPage.discountAmount')}
                      </Typography>
                      <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
                        {orderDetails.currency_code} {orderDetails.discount_amount || '0.00'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    display='flex'
                    alignItems='center'
                    gap={1}
                    sx={{ background: theme.palette.action.hover, borderRadius: 2, p: 1.2 }}
                  >
                    <DiscountIcon color='action' />
                    <Box>
                      <Typography variant='caption' color='text.primary'>
                        {t('orders.orderDetailsPage.couponCode')}
                      </Typography>
                      <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
                        {orderDetails.coupon_code || t('orders.orderDetailsPage.noCouponApplied')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    display='flex'
                    alignItems='center'
                    gap={1}
                    sx={{ background: theme.palette.action.hover, borderRadius: 2, p: 1.2 }}
                  >
                    <MonetizationOnIcon color='success' />
                    <Box>
                      <Typography variant='caption' color='text.primary'>
                        {t('orders.orderDetailsPage.orderType')}
                      </Typography>
                      <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
                        {orderDetails.is_subscription
                          ? t('orders.orderDetailsPage.subscription')
                          : t('orders.orderDetailsPage.oneTime')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    display='flex'
                    alignItems='center'
                    gap={1}
                    sx={{ background: theme.palette.action.hover, borderRadius: 2, p: 1.2 }}
                  >
                    <EventIcon color='info' />
                    <Box>
                      <Typography variant='caption' color='text.primary'>
                        {t('orders.orderDetailsPage.createdAt')}
                      </Typography>
                      <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
                        {getDisplayDateTime(orderDetails.created_at)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    display='flex'
                    alignItems='center'
                    gap={1}
                    sx={{ background: theme.palette.action.hover, borderRadius: 2, p: 1.2 }}
                  >
                    <UpdateIcon color='warning' />
                    <Box>
                      <Typography variant='caption' color='text.primary'>
                        {t('orders.orderDetailsPage.updatedAt')}
                      </Typography>
                      <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
                        {getDisplayDateTime(orderDetails.updated_at)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* Notes Section */}
              {(isSuperUser || userRole === 'Admin') && orderDetails.notes && (
                <Box
                  mt={3}
                  display='flex'
                  alignItems='flex-start'
                  gap={1}
                  sx={{ background: theme.palette.action.selected, borderRadius: 2, p: 1.5 }}
                >
                  <NotesIcon color='action' sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant='caption' color='text.primary' fontWeight={600}>
                      {t('orders.orderDetailsPage.notes')}
                    </Typography>
                    <Typography variant='body2' className='whitespace-pre-line' sx={{ mt: 0.5 }} color='text.primary'>
                      {orderDetails.notes}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Divider */}
              <Box mt={3} mb={2} sx={{ borderBottom: `1px solid ${theme.palette.divider}` }} />

              {/* Back Button */}
              <Box mt={2} display='flex' justifyContent='flex-start'>
                <Button
                  onClick={handleBtnClick}
                  variant='outlined'
                  color='inherit'
                  className='min-w-fit inline-flex items-center justify-center p-2 rounded-full'
                >
                  <i className='tabler-arrow-left'></i>{' '}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Card>
    </Box>
  )
}

export default OrderDetails
