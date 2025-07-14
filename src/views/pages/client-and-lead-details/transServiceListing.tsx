'use client'
import { useState } from 'react'
import { useTranslation } from 'next-i18next'

import { Button, Tooltip, Typography } from '@mui/material'

import TransServicesTable from './transServicesTable'
import AddTransServiceModal from './addTransServicesModal'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { SortingState } from '@tanstack/react-table'

const TransServicesListing = ({ clientId, isClientActive }: { clientId: number; isClientActive: boolean }) => {
  const { t } = useTranslation('global')
  const userPermissions = useAuthStore(state => state.userPermissions)

  //States
  const [open, setOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('create')
  const [serviceID, setServiceID] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)

  const handleOpen = (mode: 'view' | 'create' | 'edit', service?: any) => {
    setModalMode(mode)
    setSelectedService(service ?? null)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedService(null)
  }

  return (
    <div className='w-full'>
      <div className='w-full'>
        <div className='flex items-center gap-4 mb-4 justify-between gap-x-4'>
          <Typography variant='h3' className='font-medium'>
            {t('services.transServicesTitle')}
          </Typography>
          <div className='flex flex-row gap-2'>
            {hasPermissions(userPermissions, ['delete_transservice']) && Object.keys(rowSelection).length ? (
              <Button
                variant='contained'
                color='error'
                className='shadow-2xl'
                onClick={() => {
                  setMultiple(true)
                  setOpenDeleteModal(true)
                }}
              >
                {t('services.deltransservicebulk')}
              </Button>
            ) : (
              <></>
            )}
            {hasPermissions(userPermissions, ['add_transservice']) && (
              <Tooltip
                title={!isClientActive ? t('services.table.inactiveClientCreateMessage') : ''}
                placement='top'
                arrow
                slotProps={{
                  tooltip: {
                    className: '!bg-backgroundPaper !text-textPrimary !text-center'
                  }
                }}
              >
                <span>
                  <Button
                    variant='contained'
                    color='primary'
                    className='shadow-2xl'
                    onClick={() => handleOpen('create')}
                    disabled={!isClientActive}
                  >
                    {t('services.addNew')}
                  </Button>
                </span>
              </Tooltip>
            )}
          </div>
        </div>
        <div className='mt-8'>
          <TransServicesTable
            handleOpen={handleOpen}
            setServiceID={setServiceID}
            clientId={clientId}
            userPermissions={userPermissions}
            sorting={sorting}
            setSorting={setSorting}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            multiple={multiple}
            setMultiple={setMultiple}
            setOpenDeleteModal={setOpenDeleteModal}
            openDeleteModal={openDeleteModal}
            isClientActive={isClientActive}
          />
        </div>
      </div>
      <AddTransServiceModal
        open={open}
        handleClose={handleClose}
        handleOpen={handleOpen}
        serviceData={selectedService}
        serviceID={serviceID}
        mode={modalMode}
        title={
          modalMode === 'create'
            ? t('services.addNew')
            : modalMode === 'edit'
              ? t('services.editService')
              : t('services.serviceDetails')
        }
        clientId={clientId}
      />
    </div>
  )
}

export default TransServicesListing
