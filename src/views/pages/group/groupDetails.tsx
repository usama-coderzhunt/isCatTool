'use client'

import { Card, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import CircularLoader from '@/components/CircularLoader'

interface GroupDetailsProps {
  groupDetails: { id: number; name: string } | undefined
  isLoading: boolean
}

const GroupDetails = ({ groupDetails: group, isLoading }: GroupDetailsProps) => {
  const { t } = useTranslation('global')

  return (
    <div className='w-full flex flex-col gap-y-10'>
      <Typography variant='h4' className='font-semibold'>
        {t('groups.details')}
      </Typography>
      <Card className='w-full max-w-full flex flex-col rounded-lg overflow-hidden shadow-lg'>
        {isLoading ? (
          <div className='flex justify-center items-center py-10'>
            <CircularLoader />
          </div>
        ) : (
          <div className='px-6 py-4 w-full'>
            <div className='w-full flex flex-col'>
              {/* ID Row */}
              <div className='flex items-center py-3 gap-x-4'>
                <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                  {t('groups.id')}:
                </Typography>
                <Typography color='text.secondary' className='flex-1 '>
                  {group?.id || '-'}
                </Typography>
              </div>

              {/* Name Row */}
              <div className='flex items-center py-3 gap-x-4'>
                <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                  {t('groups.name')}:
                </Typography>
                <Typography color='text.secondary' className='flex-1 break-all'>
                  {group?.name || '-'}
                </Typography>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default GroupDetails
