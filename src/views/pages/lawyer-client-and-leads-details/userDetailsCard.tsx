'use client'

import { usePathname, useRouter, useParams } from 'next/navigation'
import { useState } from 'react'
import { Button, Card, Chip, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useAuthStore } from '@/store/useAuthStore'
import { hasPermissions } from '@/utils/permissionUtils'
import { useLawyerClientsHooks } from '@/services/lawyerClients'
import StatusConfModal from '@/components/statusConfirmationModal'

const LawyerClientDetailsCard = ({ row }: { row: any }) => {
  const userPermissions = useAuthStore(state => state.userPermissions)
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { useEditLawyerClient } = useLawyerClientsHooks()
  const { mutate: editLawyerClient } = useEditLawyerClient()
  const { t } = useTranslation('global')

  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [promotionModalOpen, setPromotionModalOpen] = useState(false)

  const handlePromoteToClient = () => {
    setPromotionModalOpen(true)
  }

  const handlePromotionConfirm = () => {
    editLawyerClient(
      { id: Number(row.id), client_type: 'client' },
      {
        onSuccess: () => {
          setPromotionModalOpen(false)
          toast.success(t('lawyerClients.details.lawyerLeadStatusUpdatedSuccess'))
        }
      }
    )
  }

  return (
    <>
      <Card className='w-full max-w-full flex flex-col rounded-lg overflow-hidden shadow-lg'>
        <div className='px-6 py-4 w-full'>
          <div className='w-full flex flex-col'>
            <div className='grid grid-cols-2 gap-x-8'>
              {/* Left Column */}
              <div>
                {/* Full Name Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('lawyerClients.details.fullName')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {[row.first_name, row.middle_name, row.last_name].filter(Boolean).join(' ') || '-'}
                  </Typography>
                </div>

                {/* Status Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('lawyerClients.details.status')}:
                  </Typography>
                  <Chip
                    label={row.is_active ? t('lawyerClients.table.active') : t('lawyerClients.table.inactive')}
                    color={row.is_active ? 'success' : 'error'}
                    size='small'
                    variant='tonal'
                  />
                </div>

                {/* Email Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('lawyerClients.details.email')}:
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
                    {t('lawyerClients.details.phone')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    <span dir='ltr'>{row.phone_number?.length ? row.phone_number : '-'}</span>
                  </Typography>
                </div>

                {/* Date of Birth Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('lawyerClients.details.dateOfBirth')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {row.date_of_birth?.length ? row.date_of_birth : '-'}
                  </Typography>
                </div>

                {/* Country Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('lawyerClients.details.country')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {row.customer_country?.length ? row.customer_country : '-'}
                  </Typography>
                </div>
              </div>
            </div>
            <div className='flex items-center justify-end gap-4 mt-4'>
              {pathname?.includes('lawyer-clients') && hasPermissions(userPermissions, ['view_lawyerclient']) ? (
                <Button
                  sx={{
                    width: 'max-content',
                    padding: '0.5rem 1rem'
                  }}
                  variant='contained'
                  color='primary'
                  onClick={() => router.push(`/${currentLocale}/dashboard/lawyer-client/${row.id}`)}
                >
                  {t('lawyerClients.details.openDetailedView')}
                </Button>
              ) : !pathname?.includes('lawyer-clients') && hasPermissions(userPermissions, ['change_lawyerclient']) ? (
                <Button
                  sx={{
                    width: 'max-content',
                    padding: '0.5rem 1rem'
                  }}
                  variant='contained'
                  color='primary'
                  onClick={handlePromoteToClient}
                >
                  {t('lawyerClients.details.promoteToClient')}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      {/* Status Confirmation Modals */}
      <StatusConfModal
        open={statusModalOpen}
        handleClose={() => setStatusModalOpen(false)}
        handleStatusChange={handlePromoteToClient}
        title='Confirm Promotion'
        userName={row.first_name}
        newStatus={true}
        isShowAddNotesField={false}
      />
      <StatusConfModal
        open={promotionModalOpen}
        handleClose={() => setPromotionModalOpen(false)}
        handleStatusChange={handlePromotionConfirm}
        title={t('modal.confirmation.promotion.title')}
        userName={row.first_name}
        newStatus={null}
        message={t('modal.confirmation.promotion.message', { name: row.first_name })}
        isShowAddNotesField={false}
      />
    </>
  )
}

export default LawyerClientDetailsCard
