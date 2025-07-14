'use client'

import { useEffect, useState } from 'react'

import { useParams, usePathname } from 'next/navigation'

import ClientDetails from '@/views/pages/client-and-lead-details/clientDetails'
import DocsListing from '@/views/pages/client-and-lead-details/docsListing'
import { useClientHooks } from '@/services/useClientHook'
import TransServicesListing from '@/views/pages/client-and-lead-details/transServiceListing'
import { useTranslation } from 'react-i18next'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { Typography } from '@mui/material'
const ClientAndLeadDetailsPage = () => {
  const pathname = usePathname()
  const [clientId, setClientId] = useState<number>()
  const userPermissions = useAuthStore(state => state.userPermissions)
  const { useFetchClientById } = useClientHooks()
  useEffect(() => {
    setClientId(Number(pathname?.split('/')[pathname?.split('/').length - 1]))
  }, [pathname])
  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  const { data: clientDetails, isLoading } = useFetchClientById(Number(clientId))
  return (
    <div className='w-full flex flex-col gap-y-10'>
      {clientId && (
        <>
          <Typography variant='h3'>{t('clientDetails.title')}</Typography>
          <ClientDetails clientDetails={clientDetails} isLoading={isLoading} />
          {clientDetails?.client_type === 'client' && (
            <>
              {hasPermissions(userPermissions, ['view_transservice']) && (
                <TransServicesListing clientId={clientId} isClientActive={clientDetails?.is_active} />
              )}
              {hasPermissions(userPermissions, ['view_document']) && (
                <DocsListing
                  userPermissions={userPermissions}
                  selectedClientData={clientDetails}
                  isClientActive={clientDetails?.is_active}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default ClientAndLeadDetailsPage
