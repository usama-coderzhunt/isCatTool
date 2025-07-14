'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslation } from 'next-i18next'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { Button, Typography } from '@mui/material'
import { useTermBaseHooks } from '@/services/useTermBaseHooks'
import TermBaseDetailsCard from '@/views/pages/term-base/termBaseDetailsCard'
import TermBaseEntriesListing from '@/views/pages/term-base/entries/termBaseEntriesListinng'
import ExportDataConfModal from '@/components/exportDataConfirmationModal'
import ImportTermBaseModal from '@/views/pages/term-base/importTermBaseModal'

const TermBaseDetailsPage = () => {
  const params = useParams()
  const userPermissions = useAuthStore(state => state.userPermissions)
  const [termBaseId, setTermBaseId] = useState<number | undefined>(undefined)
  const [openExportDataConfModal, setOpenExportDataConfModal] = useState(false)
  const [openImportModal, setOpenImportModal] = useState(false)

  const { t, i18n } = useTranslation('global')
  const currentLocale = params?.lang as string

  const { getTermBaseById, useExportTermBase } = useTermBaseHooks()
  const { mutate: exportTermBase } = useExportTermBase()

  const handleExportTermBase = () => {
    exportTermBase(termBaseId ?? 0, {
      onSuccess: () => setOpenExportDataConfModal(false)
    })
  }

  useEffect(() => {
    setTermBaseId(Number(params?.id))
  }, [params?.id])

  const { data: termBaseDetails, isLoading } = getTermBaseById(Number(termBaseId))

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale])

  return (
    <div className='w-full flex flex-col gap-y-10'>
      {termBaseId && (
        <>
          <div className='w-full flex flex-wrap items-center justify-between gap-3'>
            <Typography variant='h3'>{t('termBases.detailsPageTitle')}</Typography>
            <div className='flex flex-wrap items-center gap-3'>
              {hasPermissions(userPermissions, ['export_tb']) && (
                <Button variant='contained' color='primary' onClick={() => setOpenExportDataConfModal(true)}>
                  {t('termBases.exportBtnText')}
                </Button>
              )}
              {hasPermissions(userPermissions, ['import_tb']) && (
                <Button variant='contained' color='primary' onClick={() => setOpenImportModal(true)}>
                  {t('termBases.importBtnText')}
                </Button>
              )}
            </div>
          </div>
          {hasPermissions(userPermissions, ['view_termbase']) && (
            <TermBaseDetailsCard termBaseDetails={termBaseDetails} isLoading={isLoading} />
          )}
          {hasPermissions(userPermissions, ['view_termbaseentry']) && (
            <TermBaseEntriesListing termBaseId={termBaseId} />
          )}
        </>
      )}
      <ImportTermBaseModal
        open={openImportModal}
        handleClose={() => setOpenImportModal(false)}
        termBaseId={termBaseId ?? 0}
      />
      <ExportDataConfModal
        open={openExportDataConfModal}
        handleClose={() => setOpenExportDataConfModal(false)}
        handleExport={handleExportTermBase}
        title={t('termBases.exportModal.title')}
        message={t('termBases.exportModal.message')}
      />
    </div>
  )
}

export default TermBaseDetailsPage
