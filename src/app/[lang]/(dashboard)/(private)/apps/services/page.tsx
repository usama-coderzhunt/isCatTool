'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTranslation } from 'next-i18next'
import { Button, Card, Typography } from '@mui/material'
import ServicesTable, { type Service } from '@/views/pages/services/servicesTable'
import AddServiceModal from '@/views/pages/services/addServiceModal'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'

const Services = () => {
  const [open, setOpen] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('create')
  const [serviceID, setServiceID] = useState<number | null>(null)
  const userPermissions = useAuthStore(state => state.userPermissions)
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

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
    <>
      <div className='py-4 w-full'>
        <div className='flex items-center gap-4 mb-4 justify-between'>
          <Typography variant='h3' className='font-semibold'>
            {t('services.servicesTitle')}
          </Typography>
          <div className='flex flex-row gap-2'>
            {hasPermissions(userPermissions, ['delete_servicesection']) && Object.keys(rowSelection).length ? (
              <Button
                variant='contained'
                color='error'
                sx={{ padding: '0.5rem 1rem' }}
                onClick={() => {
                  setMultiple(true)
                  setOpenDeleteModal(true)
                }}
              >
                {t('services.delservicebulk')}
              </Button>
            ) : (
              <></>
            )}
            {hasPermissions(userPermissions, ['add_servicesection']) && (
              <Button
                variant='contained'
                color='primary'
                sx={{ padding: '0.5rem 1rem' }}
                onClick={() => handleOpen('create')}
              >
                {t('services.addNew')}
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className='mt-8'>
        <ServicesTable
          handleOpen={handleOpen}
          setServiceID={setServiceID}
          userPermissions={userPermissions}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          multiple={multiple}
          setMultiple={setMultiple}
          setOpenDeleteModal={setOpenDeleteModal}
          openDeleteModal={openDeleteModal}
        />
      </div>
      <AddServiceModal
        open={open}
        handleClose={handleClose}
        serviceData={selectedService}
        serviceID={serviceID}
        mode={modalMode}
        title={
          modalMode === 'create'
            ? t('services.addNew')
            : modalMode === 'edit'
              ? t('services.updateService')
              : t('services.serviceDetails')
        }
      />
    </>
  )
}

export default Services
