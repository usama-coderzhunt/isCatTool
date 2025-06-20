import { Card, Typography, Box, Avatar } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import CircularLoader from '@/components/CircularLoader'
import { UserType } from '@/types/userTypes'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'

interface UserDetailsCardProps {
  userData: UserType | null
  isLoading?: boolean
}

const UserDetailsCard = ({ userData, isLoading }: UserDetailsCardProps) => {
  const { t } = useTranslation('global')
  const theme = useTheme()

  if (isLoading) return <CircularLoader />
  if (!userData) return null

  return (
    <Card
      sx={{
        maxWidth: 378,
        width: '100%',
        borderRadius: '6px',
        boxShadow: 6,
        overflow: 'hidden',
        mb: 4,
        background: theme.palette.background.paper
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        <Avatar
          sx={{ bgcolor: theme.palette.primary.dark, color: theme.palette.primary.contrastText, width: 36, height: 36 }}
        >
          <PersonIcon />
        </Avatar>
        <Typography variant='subtitle1' className='text-white' fontWeight={700}>
          {t('orders.orderDetailsPage.userDetails.title', { defaultValue: 'User Details' })}
        </Typography>
      </Box>
      <Box px={3} py={2.5}>
        <Box
          display='flex'
          alignItems='center'
          gap={1.5}
          mb={2}
          sx={{ background: theme.palette.action.hover, borderRadius: 2, p: 1.2 }}
        >
          <PersonIcon color='primary' />
          <Box>
            <Typography variant='caption' color='text.primary'>
              {t('orders.orderDetailsPage.userDetails.username')}
            </Typography>
            <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
              {userData?.username}
            </Typography>
          </Box>
        </Box>
        <Box
          display='flex'
          alignItems='center'
          gap={1.5}
          sx={{ background: theme.palette.action.hover, borderRadius: 2, p: 1.2 }}
        >
          <EmailIcon color='primary' />
          <Box>
            <Typography variant='caption' color='text.primary'>
              {t('orders.orderDetailsPage.userDetails.email')}
            </Typography>
            <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
              {userData?.email}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  )
}

export default UserDetailsCard
