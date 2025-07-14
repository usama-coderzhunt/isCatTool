'use client'
import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'

import { Button, Typography } from '@mui/material'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { useParams } from 'next/navigation'

import EntriesTable from './entriesTable'
import { TranslationMemoryEntriesTypes } from '@/types/traslationMemoryEnntriesTypes'
import AddEntryModal from './addEntryModal'

const EntriesListing = ({ translationMemoryId }: { translationMemoryId?: number | undefined }) => {
  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const userPermissions = useAuthStore(state => state.userPermissions)

  const [open, setOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TranslationMemoryEntriesTypes | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale])

  const handleOpen = (mode: 'create' | 'edit', entry?: TranslationMemoryEntriesTypes) => {
    setModalMode(mode)
    setSelectedEntry(entry ?? null)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedEntry(null)
  }

  return (
    <div className='w-full'>
      <div className='w-full'>
        <div className='flex items-center gap-4 mb-4 justify-between'>
          <Typography variant='h3' className='font-medium'>
            {t('translationMemoryEntries.title')}
          </Typography>
          <div className='flex flex-row gap-2'>
            {hasPermissions(userPermissions, ['delete_task']) && Object.keys(rowSelection).length ? (
              <Button
                variant='contained'
                color='error'
                onClick={() => {
                  setMultiple(true)
                  setDeleteModalOpen(true)
                }}
              >
                {t('translationMemoryEntries.bulkDeleteBtnText')}
              </Button>
            ) : undefined}

            {hasPermissions(userPermissions, ['add_task']) && (
              <Button variant='contained' color='primary' className='shadow-2xl' onClick={() => handleOpen('create')}>
                {t('translationMemoryEntries.addBtnText')}
              </Button>
            )}
          </div>
        </div>

        <div className='mt-8'>
          <EntriesTable
            handleOpen={handleOpen}
            translationMemoryId={translationMemoryId}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            multiple={multiple}
            setMultiple={setMultiple}
            deleteModalOpen={deleteModalOpen}
            setDeleteModalOpen={setDeleteModalOpen}
          />
        </div>
      </div>
      <AddEntryModal
        open={open}
        handleClose={handleClose}
        handleOpen={handleOpen}
        translationMemoryId={translationMemoryId}
        entryData={selectedEntry}
        mode={modalMode}
        title={
          modalMode === 'create'
            ? t('translationMemoryEntries.form.addTitle')
            : t('translationMemoryEntries.form.updateTitle')
        }
      />
    </div>
  )
}

export default EntriesListing
