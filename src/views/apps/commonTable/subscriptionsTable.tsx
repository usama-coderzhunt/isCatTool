'use client'

import { Dispatch, FC, ReactElement, SetStateAction, useEffect, useMemo, useState } from 'react'
import { IconButton, Typography, useColorScheme, Chip } from '@mui/material'
import { MaterialReactTable, MRT_Cell, MRT_ColumnDef, MRT_Row, MRT_SortingState } from 'material-react-table'
import { getDisplayDateTime, getDisplayValue, getDisplayProvider } from '@/utils/utility/displayValue'
import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useTableState } from '@/hooks/useTableState'
import { useAuthStore } from '@/store/useAuthStore'
import { hasPermissions } from '@/utils/permissionUtils'
import { SubscriptionsTypes } from '@/types/subscriptions'
import { usePaymentsHooks } from '@/services/usePaymentsHooks'
import SubscriptionCancelModal from '@/views/pages/suscriptions/subscriptionCancelModal'
import TransactionRefundModal from '@/views/pages/transactions/transactionRefundModal'
import { useTransactionsHooks } from '@/services/useTransactionsHooks'
import { useStatusDisplay } from '@/utils/statusDisplay'

import { exportSubscriptionsToCSV } from './tableExport'

interface SubscriptionsTableProps {
  subscriptionsData: SubscriptionsTypes[]
  totalRecords: number
  pagination: { pageSize: number; pageIndex: number }
  setPagination: Dispatch<SetStateAction<{ pageIndex: number; pageSize: number }>>
  isLoading: boolean
  setGlobalFilter: (value: string) => void
  globalFilter: string
  sorting: MRT_SortingState
  setSorting: (updater: MRT_SortingState | ((prev: MRT_SortingState) => MRT_SortingState)) => void
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 1000,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.ComponentProps<typeof CustomTextField>, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)
  const { t } = useTranslation('global')

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, onChange])

  return (
    <CustomTextField
      label={t('orders.table.search')}
      {...props}
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  )
}

const SubscriptionsTable: FC<SubscriptionsTableProps> = ({
  subscriptionsData,
  totalRecords,
  pagination,
  setPagination,
  isLoading,
  setGlobalFilter,
  globalFilter,
  sorting,
  setSorting
}): ReactElement => {
  const { t } = useTranslation('global')
  const { mode: themeMode } = useColorScheme()
  const userPermissions = useAuthStore(state => state.userPermissions)
  const { handleStatusDisplay } = useStatusDisplay()

  //States
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionsTypes | null>(null)
  const [orderID, setOrderID] = useState<number | null>(null)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [refundModalOpen, setRefundModalOpen] = useState(false)

  //Hooks
  const { useCancelSubscription, useRefundSubscription, useRefundOneTimePaymentOrder } = usePaymentsHooks()
  const cancelSubscriptionMutation = useCancelSubscription()
  const refundSubscriptionMutation = useRefundSubscription()
  const refundMutation = useRefundOneTimePaymentOrder()

  const { getTransactionByOrder } = useTransactionsHooks()
  const { data: transactionsData } = getTransactionByOrder(orderID)

  const transactionRefId = transactionsData?.data?.results[0]?.reference_id
  const paypalCaptureId =
    transactionsData?.data?.results[0]?.payment_method === 'paypal'
      ? transactionsData?.data?.results[0]?.payment_details?.paypal_capture_id
      : null

  const handleCancelClick = (subscription: SubscriptionsTypes) => {
    setSelectedSubscription(subscription)
    setCancelModalOpen(true)
  }

  const handleCloseCancelModal = () => {
    setCancelModalOpen(false)
    setSelectedSubscription(null)
  }

  const handleCancelConfirm = (reason: string) => {
    if (!selectedSubscription) return
    cancelSubscriptionMutation.mutate(
      { id: selectedSubscription.id, reason },
      {
        onSuccess: () => {
          handleCloseCancelModal()
          toast.success(t('subscriptions.table.subscriptionCancelSuccess'))
        }
      }
    )
  }

  const handleRefundClick = (orderID: number) => {
    setOrderID(orderID)
    setRefundModalOpen(true)
  }

  const handleCloseRefundModal = () => {
    setRefundModalOpen(false)
    setSelectedSubscription(null)
    setOrderID(null)
  }

  const handleRefundConfirm = (data: { reason: string; amount?: string }) => {
    if (!transactionRefId) return

    const payload = {
      trx_reference_id: transactionRefId,
      reason: data.reason,
      paypal_capture_id: paypalCaptureId,
      ...(data.amount && { amount: data.amount })
    }

    refundMutation.mutate(payload, {
      onSuccess: () => {
        handleCloseRefundModal()
        toast.success(t('paymentsFeatureToasts.transactionRefundedSuccess'))
      }
    })
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('subscriptions')

  const columns = useMemo<MRT_ColumnDef<SubscriptionsTypes, any>[]>(
    () => [
      {
        accessorKey: 'billing_cycle',
        header: t('subscriptions.table.billing_cycle'),
        Cell: ({ cell }: { cell: MRT_Cell<SubscriptionsTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayValue(
              cell.getValue() === 'monthly'
                ? t('subscriptions.table.billing_cycle_monthly')
                : t('subscriptions.table.billing_cycle_yearly')
            )}
          </Typography>
        )
      },
      {
        accessorKey: 'provider',
        header: t('subscriptions.table.provider'),
        Cell: ({ cell }: { cell: MRT_Cell<SubscriptionsTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayProvider(cell.getValue() as string)}
          </Typography>
        )
      },
      {
        accessorKey: 'reference_id',
        header: t('subscriptions.table.reference_id'),
        Cell: ({ cell }: { cell: MRT_Cell<SubscriptionsTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayValue(cell.getValue() as string)}
          </Typography>
        )
      },
      {
        accessorKey: 'status',
        header: t('subscriptions.table.status'),
        Cell: ({ cell }: { cell: MRT_Cell<SubscriptionsTypes> }) => handleStatusDisplay(cell.getValue() as string)
      },
      {
        accessorKey: 'created_at',
        header: t('subscriptions.table.created_at'),
        Cell: ({ cell }: { cell: MRT_Cell<SubscriptionsTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime((cell.getValue() as string) ?? '-')}
          </Typography>
        )
      },
      {
        accessorKey: 'updated_at',
        header: t('subscriptions.table.updated_at'),
        Cell: ({ cell }: { cell: MRT_Cell<SubscriptionsTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        id: 'actions',
        header: t('subscriptions.table.actions'),
        Cell: ({ row }: { row: MRT_Row<SubscriptionsTypes> }) => {
          const status = row.original.status
          const canCancel = status === 'active' || status === 'trialing'

          return (
            <div className='flex items-center gap-2'>
              {canCancel && (
                <IconButton
                  disabled={row.original.cancel_at_period_end === true}
                  color='primary'
                  onClick={() => handleCancelClick(row.original)}
                  size='small'
                >
                  <i className='tabler-edit text-textSecondary' />
                </IconButton>
              )}
              {hasPermissions(userPermissions, ['change_subscription']) &&
                ['active', 'upgraded'].includes(row.original.status) && (
                  <IconButton color='primary' onClick={() => handleRefundClick(row.original.order)} size='small'>
                    <i className='tabler-credit-card-refund text-textSecondary' />
                  </IconButton>
                )}
            </div>
          )
        }
      }
    ],
    [t, userPermissions, handleStatusDisplay]
  )

  return (
    <div className='w-full flex flex-col gap-y-8'>
      <div className='w-full flex items-center justify-between'>
        <Typography variant='h3'>{t('subscriptions.table.title')}</Typography>
      </div>

      <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
        <MaterialReactTable
          columns={columns}
          data={subscriptionsData}
          manualPagination={true}
          rowCount={totalRecords}
          enableGlobalFilter={false}
          enableColumnFilters={true}
          enableSorting={subscriptionsData && subscriptionsData?.length > 1 ? true : false}
          manualSorting={true}
          onGlobalFilterChange={setGlobalFilter}
          getRowId={row => String(row.id)}
          state={{
            pagination,
            isLoading,
            globalFilter,
            sorting,
            columnVisibility: tableState.columnVisibility,
            density: tableState.density,
            isFullScreen: tableState.isFullScreen
          }}
          onColumnVisibilityChange={updateColumnVisibility}
          onDensityChange={updateDensity}
          onIsFullScreenChange={updateFullScreen}
          onSortingChange={setSorting}
          onPaginationChange={setPagination}
          localization={{
            noRecordsToDisplay: t('subscriptions.table.no_data'),
            rowsPerPage: t('table.rowsPerPage'),
            of: t('table.of'),
            search: t('subscriptions.table.search')
          }}
          renderTopToolbarCustomActions={() => (
            <div className='flex items-center gap-3'>
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                placeholder={t('subscriptions.table.search')}
              />
              <IconButton onClick={() => exportSubscriptionsToCSV(subscriptionsData)} title={t('table.export')}>
                <i className='tabler-file-download text-[28px] cursor-pointer' />
              </IconButton>
            </div>
          )}
        />
      </div>
      <SubscriptionCancelModal
        open={cancelModalOpen}
        onClose={handleCloseCancelModal}
        onConfirm={handleCancelConfirm}
        isLoading={cancelSubscriptionMutation.isLoading}
      />
      <TransactionRefundModal
        open={refundModalOpen}
        onClose={handleCloseRefundModal}
        onConfirm={handleRefundConfirm}
        isLoading={refundSubscriptionMutation.isLoading}
        title={t('subscriptions.subscriptionRefundModal.title')}
        message={t('subscriptions.subscriptionRefundModal.message')}
      />
    </div>
  )
}

export default SubscriptionsTable
