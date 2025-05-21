
import { useState } from 'react'
import { useTranslation } from 'next-i18next'

import { Button, Typography } from '@mui/material'

import DocsTable from './docsTable'
import AddDocsModal from './addDocsModal'
import { hasPermissions } from '@/utils/permissionUtils'
import { usePathname } from 'next/navigation'
import { LawyerClientTypes } from '@/types/lawyerClients'
import { CreateDocumentInput } from '@/types/documentTypes'

const DocsListing = ({ userPermissions, selectedClientData }: { userPermissions: { codename: string }[], selectedClientData: LawyerClientTypes }) => {
  const { t } = useTranslation('global')
  const pathname = usePathname()
  // State to control the modal visibility
  const [open, setOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [selectedDocumentData, setSelectedDocumentData] = useState<CreateDocumentInput>()
  const [docId, setDocId] = useState<number>()

  // Handlers to open and close the modal
  const handleOpen = () => {
    setOpen(true)
    setMode('create')
  }
  const handleClose = () => setOpen(false)

  return (
    <div className='flex flex-col gap-y-8'>
      {pathname?.includes('/apps/documents') &&
        <div className='flex items-center justify-between'>
          <Typography variant='h3' className='font-semibold'>
            {t('documents.title')}
          </Typography>
          <div className='flex gap-x-2'>
            {hasPermissions(userPermissions, ['delete_document']) && Object.keys(rowSelection).length ? (
              <Button
                variant='contained'
                color='error'
                className='shadow-2xl'
                onClick={() => {
                  setMultiple(true)
                  setOpenDeleteModal(true)
                }}
              >
                Delete Documents
              </Button>
            ) : (
              undefined
            )}
            {hasPermissions(userPermissions, ['add_document']) && (
              <div>
                <Button variant='contained' color='primary' className='shadow-2xl' onClick={handleOpen}>
                  {t('documents.uploadNew')}
                </Button>
              </div>
            )}
          </div>
        </div>
      }
      <div className='w-full'>
        <div className='w-full'>
          {!pathname?.includes('/apps/documents') &&
            <div className='flex items-center gap-4 mb-4 justify-between'>
              <Typography variant='h3' className='font-medium'>
                {t('documents.title')}
              </Typography>
              <div className='flex gap-x-2'>
                {hasPermissions(userPermissions, ['delete_document']) && Object.keys(rowSelection).length ? (
                  <Button
                    variant='contained'
                    color='error'
                    className='shadow-2xl'
                    onClick={() => {
                      setMultiple(true)
                      setOpenDeleteModal(true)
                    }}
                  >
                    Delete Documents
                  </Button>
                ) : (
                  undefined
                )}
                {hasPermissions(userPermissions, ['add_document']) && (
                  <div>
                    <Button variant='contained' color='primary' className='shadow-2xl' onClick={handleOpen}>
                      {t('documents.uploadNew')}
                    </Button>
                  </div>
                )}
              </div>
            </div>}
          <div className={`${!pathname?.includes('/apps/documents') && 'mt-8'}`}>
            <DocsTable
              userPermissions={userPermissions}
              setOpenDeleteModal={setOpenDeleteModal}
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
              multiple={multiple}
              setMultiple={setMultiple}
              openDeleteModal={openDeleteModal}
              selectedClientData={selectedClientData}
              setMode={setMode}
              setOpenEditModalOpen={setOpen}
              setSelectedDocumentData={setSelectedDocumentData}
              setDocumentId={setDocId}
            />
          </div>
        </div>
      </div>
      <AddDocsModal open={open} handleClose={handleClose} handleOpen={handleOpen} title={mode === 'create' ? t('documents.addNew') : t('documents.edit')} selectedClientData={selectedClientData} mode={mode} selectedDocumentData={selectedDocumentData} docId={docId} />
    </div>
  )
}

export default DocsListing
