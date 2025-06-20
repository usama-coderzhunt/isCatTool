'use client'

import { useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { useTranslation } from 'react-i18next'
import { Typography } from '@mui/material'

import type { MRT_SortingState } from 'material-react-table'

import OrderDetails from '@/views/pages/orders/orderDetails'
import CouponDetailsCard from '@/views/pages/orders/components/CouponDetailsCard'
import { useOrdersHooks } from '@/services/useOrdersHooks'
import { useUserManagementHooks } from '@/services/useUserManagementHooks'
import { useCouponsHooks } from '@/services/useCouponsHooks'
import { useServicesHooks } from '@/services/useServicesHooks'
import type { UserType } from '@/types/userTypes'
import PlansCard from '@/views/pages/services/plansCard'
import type { ServiceTypes } from '@/types/services'
import { usePaymentsHooks } from '@/services/usePaymentsHooks'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'
import UserDetailsCard from '@/views/pages/orders/components/UserDetailsCard'
import TransactionsTable from '@/views/apps/commonTable/transactionsTable'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import { useTransactionsHooks } from '@/services/useTransactionsHooks'
import SubscriptionsTable from '@/views/apps/commonTable/subscriptionsTable'
import { useSubscriptionHooks } from '@/services/useSubscriptionHooks'
import InvoicesTable from '@/views/apps/commonTable/invoicesTable'
import { usePaginatedSearch } from '@/utils/usePaginatedSearch'

const OrderDetailsPage = () => {
  const params = useParams() as { lang: string; id: string }

  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')
  const router = useRouter()

  // states
  const [open, setOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('create')
  const [selectedService, setSelectedService] = useState<ServiceTypes | null>(null)
  const [servicePlanId, setServicePlanId] = useState<number | null>(null)
  const [delName, setDelName] = useState<string>('')
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [planType, setPlanType] = useState<'monthly' | 'yearly'>('monthly')
  const [orderId, setOrderId] = useState<number | null>(null)
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [sortingSubscriptions, setSortingSubscriptions] = useState<MRT_SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [globalFilterSubscriptions, setGlobalFilterSubscriptions] = useState('')

  useEffect(() => {
    setOrderId(Number(params.id))
  }, [params?.id])

  // hooks
  const { useUserInfo } = useUserManagementHooks()
  const { getOrderById } = useOrdersHooks()
  const { getServicePlanById } = useServicesHooks()
  const { getActiveServicePlans, getInvoicesByOrderId } = usePaymentsHooks()
  const { getTransactionsByOrderId } = useTransactionsHooks()
  const { getSubscriptionsByOrderId } = useSubscriptionHooks()

  const { data: orderData, isLoading } = getOrderById(Number(orderId))
  const { data: userData } = useUserInfo(orderData?.created_by)
  const { data: servicePlanData } = getServicePlanById(orderData?.service_plan || 0)
  const userId = getDecryptedLocalStorage('userID')

  const { data: activePlanIdsRes } = getActiveServicePlans(
    userId ? Number(userId) : null,
    servicePlanData?.data?.service
  )

  const [paginationTransactions, setPaginationTransactions] = useState({
    pageIndex: 0,
    pageSize: 5
  })

  const [paginationSubscriptions, setPaginationSubscriptions] = useState({
    pageIndex: 0,
    pageSize: 5
  })

  const { pagination, setPagination, appliedSearch } = usePaginatedSearch({
    initialPageSize: 5,
    globalFilter
  })

  const { data: transactionsData, isLoading: isTransactionsLoading } = getTransactionsByOrderId(
    paginationTransactions.pageSize,
    paginationTransactions.pageIndex + 1,
    globalFilter,
    getOrderingParam(sorting),
    Number(orderId)
  )

  const { data: subscriptionsData, isLoading: isSubscriptionsLoading } = getSubscriptionsByOrderId(
    paginationSubscriptions.pageSize,
    paginationSubscriptions.pageIndex + 1,
    globalFilterSubscriptions,
    getOrderingParam(sortingSubscriptions),
    Number(orderId)
  )

  const activePlan = activePlanIdsRes?.data?.[0]

  const { data: invoicesData, isLoading: isInvoicesLoading } = getInvoicesByOrderId(
    pagination.pageSize,
    pagination.pageIndex + 1,
    appliedSearch,
    getOrderingParam(sorting),
    Number(orderId)
  )

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  const handleNavigation = () => {
    router.push(`/${currentLocale}/apps/orders`)
  }

  // Create a service data structure that matches what PlansCard expects
  const formattedServiceData = servicePlanData?.data
    ? {
        id: servicePlanData?.data?.service,
        name: servicePlanData?.data?.service_name || '',
        plans: [servicePlanData?.data],
        features_list: servicePlanData?.data?.features_list || {},
        limit_list: servicePlanData?.data?.limits_list || {}
      }
    : null

  return (
    <>
      <Typography variant='h3' className='mb-6'>
        {t('orders.orderDetailsCard.title')}
      </Typography>
      <div className='w-full flex flex-col gap-y-10'>
        <OrderDetails
          orderDetails={orderData}
          isLoading={isLoading}
          handleBtnClick={handleNavigation}
          userData={userData as UserType}
        />
        <div className='w-full grid grid-cols-12 gap-6'>
          <div className='col-span-8'>
            <TransactionsTable
              transactionsData={transactionsData?.data?.results || []}
              totalRecords={transactionsData?.data?.count ?? 0}
              pagination={paginationTransactions}
              setPagination={setPaginationTransactions}
              setGlobalFilter={setGlobalFilter}
              globalFilter={globalFilter}
              isLoading={isTransactionsLoading}
              sorting={sorting}
              setSorting={setSorting}
            />

            <div className='w-full mt-8'>
              <SubscriptionsTable
                subscriptionsData={subscriptionsData?.data?.results || []}
                totalRecords={subscriptionsData?.data?.count ?? 0}
                pagination={paginationSubscriptions}
                setPagination={setPaginationSubscriptions}
                setGlobalFilter={setGlobalFilterSubscriptions}
                globalFilter={globalFilterSubscriptions}
                isLoading={isSubscriptionsLoading}
                sorting={sortingSubscriptions}
                setSorting={setSortingSubscriptions}
              />
            </div>
            <div className='w-full mt-8'>
              <InvoicesTable
                invoicesData={invoicesData?.data?.results || []}
                totalRecords={invoicesData?.data?.count ?? 0}
                pagination={pagination}
                setPagination={setPagination}
                setGlobalFilter={setGlobalFilter}
                globalFilter={globalFilter}
                isLoading={isInvoicesLoading}
                sorting={sorting}
                setSorting={setSorting}
              />
            </div>
          </div>
          <div className='col-span-4'>
            {userData && (
              <div className='mt-[72px]'>
                <UserDetailsCard userData={userData} isLoading={isLoading} />
              </div>
            )}
            {servicePlanData?.data && (
              <>
                <div className='w-full mt-8 flex flex-col gap-5'>
                  <Typography variant='h4' className=''>
                    {t('orders.orderDetailsPage.servicePlanDetails.title')}
                  </Typography>
                  <PlansCard
                    serviceData={formattedServiceData as ServiceTypes}
                    disabledEdit={true}
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
                    isSinglePlan={true}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderDetailsPage
