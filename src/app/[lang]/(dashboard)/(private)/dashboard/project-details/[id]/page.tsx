'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslation } from 'next-i18next'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { Typography } from '@mui/material'
import { useProjectsHooks } from '@/services/useProjectsHooks'
import ProjectDetailsCard from '@/views/pages/projects/projectDetailsCard'
import TasksListing from '@/views/pages/projects/Tasks/tasksListings'

const ProjectDetailsPage = () => {
  const params = useParams()
  const userPermissions = useAuthStore(state => state.userPermissions)
  const [projectId, setProjectId] = useState<number | undefined>(undefined)
  const { t, i18n } = useTranslation('global')
  const currentLocale = params?.lang as string

  const { getProjectById } = useProjectsHooks()

  useEffect(() => {
    setProjectId(Number(params?.id))
  }, [params?.id])

  const { data: projectDetails, isLoading } = getProjectById(Number(projectId))

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale])

  return (
    <div className='w-full flex flex-col gap-y-10'>
      {projectId && (
        <>
          <Typography variant='h3'>{t('projects.projectDetailsTitle')}</Typography>
          {hasPermissions(userPermissions, ['view_project']) && (
            <ProjectDetailsCard projectDetails={projectDetails?.data} isLoading={isLoading} />
          )}
          {hasPermissions(userPermissions, ['view_task']) && <TasksListing projectId={projectId} />}
        </>
      )}
    </div>
  )
}

export default ProjectDetailsPage
