import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { useParams } from 'next/navigation'

import { Button, Card, Chip, Typography } from '@mui/material'

import { Client } from '@/types/apps/TableDataTypes'
import CircularLoader from '@/components/CircularLoader'

const ClientDetails = ({ clientDetails, isLoading }: { clientDetails: Client, isLoading: boolean }) => {
  const { t } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params

  return (
    <Card className='w-full max-w-full flex flex-col rounded-lg overflow-hidden shadow-lg'>
      {isLoading ? (
        <div className='w-full h-full flex items-center justify-center py-10'>
          <CircularLoader />
        </div>
      ) : !clientDetails || Object.keys(clientDetails).length === 0 ? (
        <div className='w-full h-full flex items-center justify-center py-10'>
          <Typography variant='h6'>{t('clientDetails.dataNotFound')}</Typography>
        </div>
      ) : (
        <div className='px-6 py-4 w-full'>
          <div className='w-full flex flex-col'>
            <div className='grid grid-cols-2 gap-x-8'>
              {/* Left Column */}
              <div>
                {/* Full Name Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('clientDetails.fullName')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {[clientDetails.first_name, clientDetails.middle_name, clientDetails.last_name]
                      .filter(Boolean)
                      .join(' ')}
                  </Typography>
                </div>

                {/* First Name Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('clientDetails.firstName')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {clientDetails?.first_name?.length ? clientDetails?.first_name : '-'}
                  </Typography>
                </div>

                {/* Middle Name Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('clientDetails.middleName')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {clientDetails?.middle_name?.length ? clientDetails?.middle_name : '-'}
                  </Typography>
                </div>

                {/* Last Name Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('clientDetails.lastName')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {clientDetails?.last_name?.length ? clientDetails?.last_name : '-'}
                  </Typography>
                </div>

                {/* Email Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('clientDetails.email')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {clientDetails?.email?.length ? clientDetails?.email : '-'}
                  </Typography>
                </div>
              </div>

              {/* Right Column */}
              <div>
                {/* Phone Number Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('clientDetails.phoneNumber')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    <span dir="ltr">
                      {clientDetails?.phone_number?.length ? clientDetails?.phone_number : '-'}
                    </span>
                  </Typography>
                </div>

                {/* Status Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('clientDetails.status')}:
                  </Typography>
                  <Chip
                    label={clientDetails?.is_active ? t('clientDetails.active') : t('clientDetails.inactive')}
                    color={clientDetails?.is_active ? 'success' : 'error'}
                    size="small"
                    variant='tonal'
                  />
                </div>

                {/* Client Type Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('clientDetails.clientType')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1 capitalize'>
                    {clientDetails?.client_type?.length ? clientDetails?.client_type : '-'}
                  </Typography>
                </div>

                {/* Notes Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('clientDetails.notes')}:
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {clientDetails?.notes?.length ? clientDetails?.notes : '-'}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          <div className='w-full flex items-center justify-start mt-10'>
            <Link href={`/${currentLocale}/apps/clients`}>
              <Button variant='contained' color='primary' className='shadow-2xl'>
                {t('clientDetails.backToList')}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  )
}

export default ClientDetails
