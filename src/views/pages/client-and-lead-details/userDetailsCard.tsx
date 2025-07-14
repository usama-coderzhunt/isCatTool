'use client'

import { usePathname, useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'

import { Button, Card, Chip, Typography } from '@mui/material'

import CustomAvatar from '@/@core/components/mui/Avatar'
import { useClientHooks } from '@/services/useClientHook'
import StatusConfModal from '@/components/statusConfirmationModal'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'react-toastify'

const UserDetailsCard = ({ row, isLeadOrClient }: { row: any; isLeadOrClient?: boolean }) => {
  const router = useRouter()
  const pathname = usePathname()
  const userPermissions = useAuthStore(state => state.userPermissions)
  const { useUpdateClient } = useClientHooks()
  const { mutate: editClient } = useUpdateClient()
  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  // Add state for modal
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [promotionModalOpen, setPromotionModalOpen] = useState(false)
  // Handle promotion confirmation
  const handlePromoteToClient = () => {
    setPromotionModalOpen(true)
  }

  const handlePromotionConfirm = () => {
    // Only update client type, don't change status
    editClient(
      { id: Number(row.id), client_type: 'client' },
      {
        onSuccess: () => {
          toast.success(t('clientTable.leadPromotedToClientSuccess'))
          setPromotionModalOpen(false)
        }
      }
    )
  }

  return (
    <>
      <Card className='w-full max-w-full flex flex-col md:flex-row rounded-lg overflow-hidden shadow-lg'>
        <div className='px-6 py-4 w-full'>
          <div className='w-full flex flex-col'>
            <div className='grid grid-cols-2 gap-x-8'>
              {/* Left Column */}
              <div>
                {/* Full Name Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('clientTable.fullName')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {[row.first_name, row.middle_name, row.last_name].filter(Boolean).join(' ')}
                  </Typography>
                </div>

                {/* Status Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('clientTable.status')}:
                  </Typography>
                  <Chip
                    label={row.is_active ? t('clientTable.active') : t('clientTable.inactive')}
                    color={row.is_active ? 'success' : 'error'}
                    size='small'
                    variant='tonal'
                  />
                </div>

                {/* Email Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('clientTable.email')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {row.email?.length ? row.email : '-'}
                  </Typography>
                </div>
              </div>

              {/* Right Column */}
              <div>
                {/* Phone Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('clientTable.phone')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    <span dir='ltr'>{row.phone_number?.length ? row.phone_number : '-'}</span>
                  </Typography>
                </div>

                {/* Date of Birth Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('clientTable.dateOfBirth')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {row.date_of_birth?.length ? row.date_of_birth : '-'}
                  </Typography>
                </div>

                {/* Country Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('clientTable.country')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {row.customer_country?.length ? row.customer_country : '-'}
                  </Typography>
                </div>
              </div>
            </div>
          </div>
          <div className='flex justify-end gap-4 mb-4 w-full'>
            {isLeadOrClient && (
              <div>
                {pathname?.includes('clients')
                  ? hasPermissions(userPermissions, ['view_transclient']) && (
                      <Button
                        sx={{
                          width: 'max-content',
                          padding: '0.5rem 1rem'
                        }}
                        variant='contained'
                        color='primary'
                        onClick={() => router.push(`/${currentLocale}/dashboard/client/${row.id}`)}
                      >
                        {t('clientTable.viewDetails')}
                      </Button>
                    )
                  : hasPermissions(userPermissions, ['change_transclient']) && (
                      <Button
                        sx={{
                          width: 'max-content',
                          padding: '0.5rem 1rem'
                        }}
                        variant='contained'
                        color='primary'
                        onClick={handlePromoteToClient}
                      >
                        {t('clientTable.promoteToClient')}
                      </Button>
                    )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Add Status Confirmation Modal */}
      <StatusConfModal
        open={statusModalOpen}
        handleClose={() => setStatusModalOpen(false)}
        handleStatusChange={handlePromoteToClient}
        title={t('clientTable.confirmStatusChange')}
        userName={row.first_name}
        newStatus={true}
        isShowAddNotesField={false}
      />
      <StatusConfModal
        open={promotionModalOpen}
        handleClose={() => setPromotionModalOpen(false)}
        handleStatusChange={handlePromotionConfirm}
        title={t('clientTable.promoteToClient')}
        userName={row.first_name}
        newStatus={null}
        isShowAddNotesField={false}
        message={`${t('clientTable.promoteMessage')} ${row.first_name}`}
      />
    </>
  )
}

export default UserDetailsCard
