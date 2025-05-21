'use client'
import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import { Button, Typography } from '@mui/material'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import AddServicePlanModal from './addServicePlan'
import PlansCard from './plansCard'
import { ServiceTypes } from '@/types/services'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import { useServicesHooks } from '@/services/useServicesHooks'
import { toast } from 'react-toastify'
import PlanTypeToggle from '@/components/common/PlanTypeToggle'
import { usePaymentsHooks } from '@/services/usePaymentsHooks'

const ServicesPlansListing = ({ serviceId, serviceData }: { serviceId: number; serviceData: ServiceTypes }) => {
  const { t } = useTranslation('global')
  const userPermissions = useAuthStore(state => state.userPermissions)

  //States
  const [open, setOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('create')
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [delName, setDelName] = useState<string>('')
  const [servicePlanId, setServicePlanId] = useState<number | null>(null)
  const [planType, setPlanType] = useState<'monthly' | 'yearly'>('monthly')
  const userId = localStorage.getItem('userID')
  const { getActiveServicePlans } = usePaymentsHooks()
  const { data: activePlanIdsRes } = getActiveServicePlans(userId ? Number(userId) : null, serviceId)
  const activePlan = activePlanIdsRes?.data?.[0]

  // hooks
  const { useDeleteServicePlan } = useServicesHooks()
  const { mutate: deleteServicePlan } = useDeleteServicePlan()

  const handleOpen = (service?: any) => {
    setModalMode('create')
    setSelectedService(service ?? null)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedService(null)
  }

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false)
    setServicePlanId(null)
    setDelName('')
  }

  const handleDeleteServicePlan = () => {
    if (servicePlanId === null) return
    deleteServicePlan(servicePlanId, {
      onSuccess: () => {
        toast.success(t('services.servicePlans.deleteSuccess'))
        setOpenDeleteModal(false)
      }
    })
  }

  return (
    <div className='w-full'>
      <div className='w-full'>
        <div className='flex items-center gap-4 mb-4 justify-between gap-x-4'>
          <Typography variant='h3' className='font-medium'>
            {t('services.servicePlans.title')}
          </Typography>
          <PlanTypeToggle value={planType} onChange={setPlanType} />
          {hasPermissions(userPermissions, ['add_transservice']) && (
            <Button variant='contained' color='primary' className='shadow-2xl' onClick={handleOpen}>
              {t('services.servicePlans.addNewPlan')}
            </Button>
          )}
        </div>
        <div className='mt-8 flex flex-col gap-5'>
          <PlansCard
            serviceData={serviceData}
            setOpen={setOpen}
            setModalMode={setModalMode}
            setSelectedService={setSelectedService}
            setServicePlanId={setServicePlanId}
            setDelName={setDelName}
            setOpenDeleteModal={setOpenDeleteModal}
            planType={planType}
            isPlanActive={activePlan?.subscription_status}
            activePlanId={activePlan?.service_plan_id}
            subscriptionId={activePlan?.subscription_id}
            activePlanProvider={activePlan?.provider}
            activePlanBillingCycle={activePlan?.billing_cycle}
            nextBillingDate={activePlan?.next_billing_date}
          />
        </div>
      </div>
      {serviceData && (
        <AddServicePlanModal
          open={open}
          handleClose={handleClose}
          handleOpen={handleOpen}
          servicePlanData={selectedService}
          mode={modalMode}
          title={modalMode === 'create' ? t('services.servicePlans.addNewPlan') : t('services.servicePlans.editPlan')}
          serviceId={serviceId}
          parentServiceFeatures={serviceData.features_list || {}}
          parentServiceLimits={serviceData.limit_list || {}}
        />
      )}

      <DeleteConfModal
        open={openDeleteModal}
        title={t('services.servicePlans.deletePlan')}
        deleteValue={`${delName} Plan`}
        handleClose={handleCloseDeleteModal}
        handleDelete={handleDeleteServicePlan}
      />
    </div>
  )
}

export default ServicesPlansListing
