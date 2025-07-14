'use client'
import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'

import { Button, Typography } from '@mui/material'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { useParams } from 'next/navigation'

import { FilesTypes } from '@/types/filesTypes'
import FilesTable from './filesTable'
import AddFileModal from './addFileModal'
import SplitTaskModal from '../../projects/Tasks/splitTaskModal'

const FilesListing = ({ taskId }: { taskId?: number | undefined }) => {
  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const userPermissions = useAuthStore(state => state.userPermissions)

  const [open, setOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FilesTypes | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [splitTaskModalOpen, setSplitTaskModalOpen] = useState(false)

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale])

  const handleOpen = (mode: 'create' | 'edit', file?: FilesTypes) => {
    setModalMode(mode)
    setSelectedFile(file ?? null)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedFile(null)
  }

  return (
    <div className='w-full'>
      <div className='w-full'>
        <div className='flex items-center gap-4 mb-4 justify-between'>
          <Typography variant='h3' className='font-medium'>
            {t('taskFiles.title')}
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
                {t('taskFiles.bulkDeleteBtnText')}
              </Button>
            ) : undefined}

            {hasPermissions(userPermissions, ['add_task']) && (
              <Button variant='contained' color='primary' className='shadow-2xl' onClick={() => handleOpen('create')}>
                {t('taskFiles.addBtnText')}
              </Button>
            )}
            <Button
              variant='contained'
              color='primary'
              className='shadow-2xl'
              onClick={() => setSplitTaskModalOpen(true)}
            >
              {t('tasks.splitTaskModal.splitTask')}
            </Button>
          </div>
        </div>

        <div className='mt-8'>
          <FilesTable
            handleOpen={handleOpen}
            taskId={taskId}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            multiple={multiple}
            setMultiple={setMultiple}
            deleteModalOpen={deleteModalOpen}
            setDeleteModalOpen={setDeleteModalOpen}
          />
        </div>
      </div>
      <AddFileModal open={open} handleClose={handleClose} taskId={taskId} />
      <SplitTaskModal
        open={splitTaskModalOpen}
        handleClose={setSplitTaskModalOpen}
        title={t('tasks.splitTaskModal.splitTask')}
        taskId={taskId}
      />
    </div>
  )
}

export default FilesListing
