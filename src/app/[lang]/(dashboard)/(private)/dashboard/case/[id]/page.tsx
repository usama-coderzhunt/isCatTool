'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslation } from 'next-i18next'

import CaseDetails from '@/views/pages/cases/caseDetails'
import { useCasesHooks } from '@/services/useCases'
import CaseTodoItemsListing from '@/views/pages/cases/caseTodoItemsListing'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { Typography } from '@mui/material'
import CaseClientListing from '@/views/pages/case-flow/caseClientListing'
import CaseStaffListing from '@/views/pages/case-flow/caseStaffListing'
import CaseTypeListing from '@/views/pages/case-flow/caseTypeListing'

const LawyerClientDetailsPage = () => {
  const params = useParams()
  const userPermissions = useAuthStore(state => state.userPermissions)
  const [caseId, setCaseId] = useState<number>()
  const { getCaseById } = useCasesHooks()
  const { t, i18n } = useTranslation('global')
  const currentLocale = params?.lang as string

  useEffect(() => {
    setCaseId(Number(params?.id))
  }, [params?.id])

  const { data: caseDetails, isLoading } = getCaseById(Number(caseId))
  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale])

  return (
    <div className='w-full flex flex-col gap-y-10'>
      {caseId && (
        <>
          <Typography variant='h3'>{t('cases.details.title')}</Typography>
          {hasPermissions(userPermissions, ['view_case']) && (
            <CaseDetails caseDetails={caseDetails} isLoading={isLoading} />
          )}
          {hasPermissions(userPermissions, ['view_todoitem']) && (
            <CaseTodoItemsListing caseId={caseId} isFilterEnabled={false} />
          )}

          <div className='flex flex-col gap-y-4'>
            <Typography variant='h4' className='font-semibold'>
              {t('cases.details.clientsListing')}
            </Typography>
            <CaseClientListing clientIds={caseDetails?.clients || []} />
          </div>

          <div className='flex flex-col gap-y-4'>
            <Typography variant='h4' className='font-semibold'>
              {t('cases.details.staffListing')}
            </Typography>
            <CaseStaffListing staffIds={caseDetails?.staffs || []} />
          </div>

          <div className='flex flex-col gap-y-4'>
            <Typography variant='h4' className='font-semibold'>
              {t('cases.details.caseTypeListing')}
            </Typography>
            <CaseTypeListing typeIds={caseDetails?.types || []} />
          </div>
        </>
      )}
    </div>
  )
}

export default LawyerClientDetailsPage
