'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslation } from 'next-i18next'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { Button, Typography } from '@mui/material'
import TranslationMemoryDetailsCard from '@/views/pages/translation-memory/traslationMemoryDetailsCard'
import { useTranslationMemoryHooks } from '@/services/useTranslationMemoryHooks'
import EntriesListing from '@/views/pages/translation-memory/entries/entriesListing'
import ExportDataConfModal from '@/components/exportDataConfirmationModal'
import ImportTranslationMemoryModal from '@/views/pages/translation-memory/importTranslationMemoryModal'

const TranslationMemoryDetailsPage = () => {
  const params = useParams()
  const userPermissions = useAuthStore(state => state.userPermissions)
  const [translationMemoryId, setTranslationMemoryId] = useState<number | undefined>(undefined)
  const [openExportDataConfModal, setOpenExportDataConfModal] = useState(false)
  const [openImportModal, setOpenImportModal] = useState(false)
  const { t, i18n } = useTranslation('global')
  const currentLocale = params?.lang as string

  const { useExportTranslationMemory, getTranslationMemoryById } = useTranslationMemoryHooks()
  const { mutate: exportTranslationMemory } = useExportTranslationMemory()

  const handleExportTranslationMemory = () => {
    exportTranslationMemory(translationMemoryId ?? 0, {
      onSuccess: () => setOpenExportDataConfModal(false)
    })
  }

  useEffect(() => {
    setTranslationMemoryId(Number(params?.id))
  }, [params?.id])

  const { data: translationMemoryDetails, isLoading } = getTranslationMemoryById(Number(translationMemoryId))

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale])

  return (
    <div className='w-full flex flex-col gap-y-10'>
      {translationMemoryId && (
        <>
          <div className='w-full flex flex-wrap items-center justify-between gap-3'>
            <Typography variant='h3'>{t('translationMemories.detailsPageTitle')}</Typography>
            <div className='flex flex-wrap items-center gap-3'>
              <div></div>
              {hasPermissions(userPermissions, ['export_tm']) && (
                <Button variant='contained' color='primary' onClick={() => setOpenExportDataConfModal(true)}>
                  {t('translationMemories.exportBtnText')}
                </Button>
              )}
              {hasPermissions(userPermissions, ['import_tm']) && (
                <Button variant='contained' color='primary' onClick={() => setOpenImportModal(true)}>
                  {t('translationMemories.importBtnText')}
                </Button>
              )}
            </div>
          </div>
          {hasPermissions(userPermissions, ['view_translationmemory']) && (
            <TranslationMemoryDetailsCard translationMemoryDetails={translationMemoryDetails} isLoading={isLoading} />
          )}
          {hasPermissions(userPermissions, ['view_translationmemoryentry']) && (
            <EntriesListing translationMemoryId={translationMemoryId} />
          )}
        </>
      )}

      <ImportTranslationMemoryModal
        open={openImportModal}
        handleClose={() => setOpenImportModal(false)}
        translationMemoryId={translationMemoryId ?? 0}
      />
      <ExportDataConfModal
        open={openExportDataConfModal}
        handleClose={() => setOpenExportDataConfModal(false)}
        handleExport={handleExportTranslationMemory}
        title={t('translationMemories.exportModal.title')}
        message={t('translationMemories.exportModal.message')}
      />
    </div>
  )
}

export default TranslationMemoryDetailsPage
