'use client'
import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'

import { Button, Typography } from '@mui/material'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { useParams } from 'next/navigation'

import { TermBaseEntriesTypes } from '@/types/termBaseEntriesTypes'
import TermBaseEntriesTable from './termBaseEntriesTable'
import AddTermBaseEntryModal from './addTermBaseEntryModal'

const TermBaseEntriesListing = ({ termBaseId }: { termBaseId?: number | undefined }) => {
  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const userPermissions = useAuthStore(state => state.userPermissions)

  const [open, setOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TermBaseEntriesTypes | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale])

  const handleOpen = (mode: 'create' | 'edit', entry?: TermBaseEntriesTypes) => {
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
            {t('termBaseEntries.title')}
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
                {t('termBaseEntries.bulkDeleteBtnText')}
              </Button>
            ) : undefined}

            {hasPermissions(userPermissions, ['add_task']) && (
              <Button variant='contained' color='primary' className='shadow-2xl' onClick={() => handleOpen('create')}>
                {t('termBaseEntries.addBtnText')}
              </Button>
            )}
          </div>
        </div>

        <div className='mt-8'>
          <TermBaseEntriesTable
            handleOpen={handleOpen}
            termBaseId={termBaseId}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            multiple={multiple}
            setMultiple={setMultiple}
            deleteModalOpen={deleteModalOpen}
            setDeleteModalOpen={setDeleteModalOpen}
          />
        </div>
      </div>
      <AddTermBaseEntryModal
        open={open}
        handleClose={handleClose}
        handleOpen={handleOpen}
        termBaseId={termBaseId}
        entryData={selectedEntry}
        mode={modalMode}
        title={modalMode === 'create' ? t('termBaseEntries.form.add') : t('termBaseEntries.form.update')}
      />
    </div>
  )
}

export default TermBaseEntriesListing
