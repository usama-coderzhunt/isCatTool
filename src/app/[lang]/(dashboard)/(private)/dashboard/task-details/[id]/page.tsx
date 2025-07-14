'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslation } from 'next-i18next'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { Typography } from '@mui/material'
import TaskDetailsCard from '@/views/pages/projects/Tasks/taskDetailsCard'
import { useProjectsHooks } from '@/services/useProjectsHooks'
import FilesListing from '@/views/pages/translationModels/Files/filesListing'

const TranslationMemoryDetailsPage = () => {
  const params = useParams()
  const userPermissions = useAuthStore(state => state.userPermissions)
  const [taskId, setTaskId] = useState<number | undefined>(undefined)
  const { t, i18n } = useTranslation('global')
  const currentLocale = params?.lang as string

  const { getTaskById } = useProjectsHooks()
  const { data: taskDetails, isLoading } = getTaskById(Number(taskId))

  useEffect(() => {
    setTaskId(Number(params?.id))
  }, [params?.id])

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale])

  return (
    <div className='w-full flex flex-col gap-y-10'>
      {taskId && (
        <>
          <Typography variant='h3'>{t('tasks.detailsPageTitle')}</Typography>
          {hasPermissions(userPermissions, ['view_task']) && (
            <TaskDetailsCard taskDetails={taskDetails} isLoading={isLoading} />
          )}
          {hasPermissions(userPermissions, ['view_file']) && <FilesListing taskId={taskId} />}
        </>
      )}
    </div>
  )
}

export default TranslationMemoryDetailsPage
