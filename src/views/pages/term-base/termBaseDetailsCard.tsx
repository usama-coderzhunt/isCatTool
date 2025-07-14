import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { Button, Card, Typography } from '@mui/material'
import { useParams } from 'next/navigation'

import CircularLoader from '@/components/CircularLoader'
import { getDisplayDateTime } from '@/utils/utility/displayValue'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'
import { TermBaseTypes } from '@/types/termBaseTypes'

const TermBaseDetailsCard = ({
  termBaseDetails,
  isLoading
}: {
  termBaseDetails: TermBaseTypes
  isLoading: boolean
}) => {
  const isSuperUser = getDecryptedLocalStorage('isSuperUser')
  const userRole = getDecryptedLocalStorage('userRole')

  const { t } = useTranslation('global')
  const params = useParams()
  const currentLocale = params.lang as string

  return (
    <Card className='w-full max-w-full flex flex-col rounded-lg overflow-hidden shadow-lg'>
      {isLoading ? (
        <div className='w-full h-full flex items-center justify-center py-10'>
          <CircularLoader />
        </div>
      ) : !termBaseDetails ? (
        <div className='w-full h-full flex items-center justify-center py-10'>
          <Typography variant='h6'>{t('termBases.detailsCard.noDataFound')}</Typography>
        </div>
      ) : (
        <div className='px-6 py-4 w-full'>
          <div className='w-full flex flex-col'>
            <div className='grid grid-cols-2 gap-x-8'>
              {/* Left Column */}
              <div>
                {/* Name Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('termBases.detailsCard.name')}
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {termBaseDetails?.name}
                  </Typography>
                </div>

                {/* Source Language Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('termBases.detailsCard.sourceLanguage')}
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {termBaseDetails?.source_language_detail?.name}
                  </Typography>
                </div>

                {/* Created At Row */}
                {(isSuperUser || userRole === 'Admin') && (
                  <div className='flex items-center py-3 gap-x-4'>
                    <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                      {t('termBases.detailsCard.createdAt')}
                    </Typography>
                    <Typography color='text.secondary' className='flex-1'>
                      {getDisplayDateTime(termBaseDetails.created_at)}
                    </Typography>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div>
                {/* Target Language Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('termBases.detailsCard.targetLanguage')}
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {termBaseDetails?.target_language_detail?.name}
                  </Typography>
                </div>

                {/* Updated At Row */}
                {(isSuperUser || userRole === 'Admin') && (
                  <div className='flex items-center py-3 gap-x-4'>
                    <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                      {t('termBases.detailsCard.updatedAt')}
                    </Typography>
                    <Typography color='text.secondary' className='flex-1'>
                      {getDisplayDateTime(termBaseDetails.updated_at)}
                    </Typography>
                  </div>
                )}
              </div>
            </div>
            <div className='flex items-center py-3 gap-x-4 mt-5'>
              <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                {t('termBases.detailsCard.description')}
              </Typography>
              <Typography color='text.secondary' className='flex-1'>
                {termBaseDetails?.description?.length && termBaseDetails?.description?.length > 0
                  ? termBaseDetails?.description
                  : '-'}
              </Typography>
            </div>
          </div>

          <div className='w-full flex items-center justify-start mt-10'>
            <Link href={`/${currentLocale}/apps/term-bases`}>
              <Button
                variant='outlined'
                color='inherit'
                className='min-w-fit inline-flex items-center justify-center p-2 rounded-full'
              >
                <i className='tabler-arrow-left'></i>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  )
}

export default TermBaseDetailsCard
