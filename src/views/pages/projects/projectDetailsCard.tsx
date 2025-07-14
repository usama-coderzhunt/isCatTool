import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { Button, Card, Typography } from '@mui/material'
import { useParams } from 'next/navigation'

import CircularLoader from '@/components/CircularLoader'
import { ProjectTypes } from '@/types/projectsTypes'
import { getDisplayDateTime } from '@/utils/utility/displayValue'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'

const ProjectDetailsCard = ({ projectDetails, isLoading }: { projectDetails: ProjectTypes; isLoading: boolean }) => {
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
      ) : !projectDetails || Object.keys(projectDetails).length === 0 ? (
        <div className='w-full h-full flex items-center justify-center py-10'>
          <Typography variant='h6'>{t('projects.projectDetailsCard.noData')}</Typography>
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
                    {t('projects.projectDetailsCard.name')}
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {projectDetails?.name}
                  </Typography>
                </div>

                {/* Source Language Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('projects.projectDetailsCard.sourceLanguage')}
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {projectDetails?.source_language_detail?.name}
                  </Typography>
                </div>

                {/* Translation Subject Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('projects.projectDetailsCard.translationSubject')}
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {projectDetails?.translation_subject_detail?.name || '-'}
                  </Typography>
                </div>

                {/* Created At Row */}
                {(isSuperUser || userRole === 'Admin') && (
                  <div className='flex items-center py-3 gap-x-4'>
                    <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                      {t('projects.projectDetailsCard.createdAt')}
                    </Typography>
                    <Typography color='text.secondary' className='flex-1'>
                      {getDisplayDateTime(projectDetails.created_at)}
                    </Typography>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div>
                {/* Translation Model Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('projects.projectDetailsCard.translationModel')}
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {projectDetails?.translation_model_detail?.name}
                  </Typography>
                </div>
                {/* Target Language Row */}
                <div className='flex items-center py-3 gap-x-4'>
                  <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                    {t('projects.projectDetailsCard.targetLanguage')}
                  </Typography>
                  <Typography color='text.secondary' className='flex-1'>
                    {projectDetails?.target_language_detail?.name}
                  </Typography>
                </div>

                {/* Updated At Row */}
                {(isSuperUser || userRole === 'Admin') && (
                  <div className='flex items-center py-3 gap-x-4'>
                    <Typography variant='body1' color='text.primary' className='font-bold min-w-[120px]'>
                      {t('projects.projectDetailsCard.updatedAt')}
                    </Typography>
                    <Typography color='text.secondary' className='flex-1'>
                      {getDisplayDateTime(projectDetails.updated_at)}
                    </Typography>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='w-full flex items-center justify-start mt-10'>
            <Link href={`/${currentLocale}/apps/projects`}>
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

export default ProjectDetailsCard
