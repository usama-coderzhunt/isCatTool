'use client'

import { Dispatch, FC, ReactElement, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Button, Chip, IconButton, MenuItem, Tooltip, Typography, useColorScheme } from '@mui/material'
import { MaterialReactTable, MRT_Cell, MRT_ColumnDef, MRT_Row, MRT_SortingState } from 'material-react-table'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useTableState } from '@/hooks/useTableState'
import { OrdersTypes } from '@/types/ordersTypes'
import { useOrdersHooks } from '@/services/useOrdersHooks'
import { useAuthStore } from '@/store/useAuthStore'
import { hasPermissions } from '@/utils/permissionUtils'
import StatusConfModal from '@/components/statusConfirmationModal'
import OrderDetailCard from '@/views/pages/orders/orderDetailCard'
import PaymentMethodModal from '@/views/pages/services/PaymentMethodModal'
import AddOrderModal from '@/views/pages/orders/addOrderModal'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'
import { useParams, useRouter } from 'next/navigation'
import { exportOrdersToCSV } from './tableExport'
import AddNoteModal from '@/components/AddNoteModal'

interface OrdersTableProps {
  ordersData: OrdersTypes[]
  totalRecords: number
  pagination: { pageSize: number; pageIndex: number }
  setPagination: Dispatch<SetStateAction<{ pageIndex: number; pageSize: number }>>
  isLoading: boolean
  setGlobalFilter: (value: string) => void
  globalFilter: string
  isSubscription: boolean | undefined
  setIsSubscription: (value: boolean | undefined) => void
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
      shrinkLabel={false}
    />
  )
}

const OrdersTable: FC<OrdersTableProps> = ({
  ordersData,
  totalRecords,
  pagination,
  setPagination,
  isLoading,
  setGlobalFilter,
  globalFilter,
  sorting,
  setSorting,
  isSubscription,
  setIsSubscription
}): ReactElement => {
  const { t, i18n } = useTranslation('global')
  const router = useRouter()
  const { mode: themeMode } = useColorScheme()
  const userPermissions = useAuthStore(state => state.userPermissions)
  const isSuperUser = getDecryptedLocalStorage('isSuperUser')
  const userRole = getDecryptedLocalStorage('userRole')

  //Hooks
  const { useEditOrder } = useOrdersHooks()
  const editOrderMutation = useEditOrder()

  //States
  const [selectedOrder, setSelectedOrder] = useState<OrdersTypes | null>(null)
  const [addOrderModalOpen, setAddOrderModalOpen] = useState(false)
  const [orderCancelModalOpen, setOrderCancelModalOpen] = useState(false)
  const [orderCompleteModalOpen, setOrderCompleteModalOpen] = useState(false)
  const [paymentMethodModalOpen, setPaymentMethodModalOpen] = useState(false)
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [activeNote, setActiveNote] = useState('')
  const [selectedOrderForNote, setSelectedOrderForNote] = useState<OrdersTypes | null>(null)
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  const handleCancelClick = (order: OrdersTypes) => {
    setSelectedOrder(order)
    setActiveNote(order.notes || '')
    setOrderCancelModalOpen(true)
  }

  const handleCloseCancelModal = () => {
    setOrderCancelModalOpen(false)
    setSelectedOrder(null)
  }

  const handleAddOrderClick = () => {
    setAddOrderModalOpen(true)
  }

  const handleCloseAddOrderModal = () => {
    setAddOrderModalOpen(false)
  }

  const handleCancelConfirm = () => {
    if (!selectedOrder) return
    editOrderMutation.mutate(
      {
        id: selectedOrder.id,
        status: 'cancelled',
        notes: isSuperUser === false && userRole !== 'Admin' ? 'Order cancelled by user' : activeNote
      },
      {
        onSuccess: () => {
          handleCloseCancelModal()
          toast.success(t('orders.table.cancel_success'))
        }
      }
    )
  }

  const handleCompleteClick = (order: OrdersTypes) => {
    setSelectedOrder(order)
    setOrderCompleteModalOpen(true)
  }

  const handleCloseCompleteModal = () => {
    setOrderCompleteModalOpen(false)
    setSelectedOrder(null)
  }

  const handleCompleteConfirm = () => {
    if (!selectedOrder) return
    editOrderMutation.mutate(
      {
        id: selectedOrder.id,
        status: 'completed',
        notes: activeNote
      },
      {
        onSuccess: () => {
          handleCloseCompleteModal()
          toast.success(t('orders.table.complete_success'))
        }
      }
    )
  }

  const handleClosePaymentMethodModal = () => {
    setPaymentMethodModalOpen(false)
    setSelectedOrder(null)
  }

  const handleNoteClick = (order: OrdersTypes) => {
    setSelectedOrderForNote(order)
    setActiveNote(order.notes || '')
    setNoteModalOpen(true)
  }

  const handleCloseNoteModal = () => {
    setNoteModalOpen(false)
    setSelectedOrderForNote(null)
  }

  const handleAddNote = (note: string) => {
    if (!selectedOrderForNote) return
    editOrderMutation.mutate(
      {
        id: selectedOrderForNote.id,
        notes: note
      },
      {
        onSuccess: () => {
          toast.success(t('addNoteModal.addNoteSuccess'))
          handleCloseNoteModal()
        }
      }
    )
  }

  const handleOrderStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; color: 'success' | 'error' | 'warning' | 'info' | 'default' }> = {
      pending: { label: t('orders.table.statuses.pending'), color: 'warning' },
      confirmed: { label: t('orders.table.statuses.confirmed'), color: 'success' },
      cancelled: { label: t('orders.table.statuses.cancelled'), color: 'error' },
      completed: { label: t('orders.table.statuses.completed'), color: 'success' },
      refunded: { label: t('orders.table.statuses.refunded'), color: 'error' },
      cancellation_requested: { label: t('orders.table.statuses.cancellation_requested'), color: 'info' },
      upgraded: { label: t('orders.table.statuses.upgraded'), color: 'success' }
    }

    const config = statusMap[status] || { label: '-', color: 'default' }

    return <Chip label={config.label} color={config.color} size='small' variant='tonal' />
  }
  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('coupons')

  const columns = useMemo<MRT_ColumnDef<OrdersTypes, any>[]>(() => {
    const baseColumns: MRT_ColumnDef<OrdersTypes, any>[] = [
      {
        accessorKey: 'order_number',
        header: t('orders.table.order_number'),
        Cell: ({ cell }: { cell: MRT_Cell<OrdersTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'amount',
        header: t('orders.table.amount'),
        Cell: ({ cell }: { cell: MRT_Cell<OrdersTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'coupon_code',
        header: t('orders.table.couponCode'),
        Cell: ({ cell }: { cell: MRT_Cell<OrdersTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'discount_amount',
        header: t('orders.table.discountAmount'),
        Cell: ({ cell }: { cell: MRT_Cell<OrdersTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'status',
        header: t('orders.table.status'),
        Cell: ({ cell }: { cell: MRT_Cell<OrdersTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {handleOrderStatusDisplay(cell.getValue() as string)}
          </Typography>
        )
      },
      {
        accessorKey: 'provider',
        header: t('orders.table.provider'),
        Cell: ({ cell }: { cell: MRT_Cell<OrdersTypes> }) => (
          <Typography className='font-medium capitalize' color='text.primary'>
            {getDisplayValue(cell.getValue() || 'Manual')}
          </Typography>
        )
      },
      {
        accessorKey: 'created_at',
        header: t('orders.table.created_at'),
        Cell: ({ cell }: { cell: MRT_Cell<OrdersTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'updated_at',
        header: t('orders.table.updated_at'),
        Cell: ({ cell }: { cell: MRT_Cell<OrdersTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      }
    ]
    if (isSuperUser || userRole === 'Admin') {
      baseColumns.splice(4, 0, {
        accessorKey: 'notes',
        header: t('orders.table.notes'),
        Cell: ({ cell }: { cell: MRT_Cell<OrdersTypes> }) => {
          const notes = getDisplayValue(cell.getValue())
          return (
            <Tooltip title={notes} arrow>
              <Typography className='truncate max-w-[200px] w-full'>{notes}</Typography>
            </Tooltip>
          )
        }
      })
    }
    baseColumns.push({
      id: 'actions',
      header: t('table.actions'),
      Cell: ({ row }: { row: MRT_Row<OrdersTypes> }) => (
        <div className='flex items-center gap-2'>
          {row.original.status === 'pending' && (
            <IconButton color='primary' onClick={() => handleCancelClick(row.original)} size='small'>
              <i className='tabler-edit text-textSecondary' />
            </IconButton>
          )}
          {hasPermissions(userPermissions, ['change_order']) &&
            row.original.status === 'pending' &&
            row.original.provider !== 'paypal' &&
            row.original.provider !== 'stripe' && (
              <IconButton color='primary' onClick={() => handleCompleteClick(row.original)} size='small'>
                <i className='tabler-check text-textSecondary' />
              </IconButton>
            )}
          {(isSuperUser || userRole === 'Admin') && (
            <IconButton color='primary' onClick={() => handleNoteClick(row.original)} size='small'>
              <i className='tabler-note text-textSecondary' />
            </IconButton>
          )}
          <IconButton onClick={() => router.push(`/${currentLocale}/dashboard/orders/${row.id}`)}>
            <i className='tabler-eye text-textSecondary' />
          </IconButton>
        </div>
      )
    })

    return baseColumns
  }, [t, userPermissions, isSuperUser, userRole])
  return (
    <div className='w-full flex flex-col gap-y-8'>
      <div className='w-full flex items-center justify-between gap-x-2'>
        <Typography variant='h3'>{t('orders.table.title')}</Typography>
        {hasPermissions(userPermissions, ['add_order']) && (
          <Button variant='contained' color='primary' onClick={handleAddOrderClick} sx={{ padding: '0.5rem 1rem' }}>
            {t('orders.table.addOrder')}
          </Button>
        )}
      </div>

      <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
        <MaterialReactTable
          columns={columns}
          data={ordersData}
          manualPagination={true}
          rowCount={totalRecords}
          enableGlobalFilter={false}
          enableColumnFilters={true}
          enableExpanding
          renderDetailPanel={({ row }) => <OrderDetailCard row={row.original} />}
          enableSorting={ordersData && ordersData?.length > 1 ? true : false}
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
            noRecordsToDisplay: t('orders.table.no_data'),
            rowsPerPage: t('table.rowsPerPage'),
            of: t('table.of'),
            search: t('documents.types.search')
          }}
          renderTopToolbarCustomActions={() => (
            <div className='flex items-center gap-3'>
              <DebouncedInput value={globalFilter ?? ''} onChange={value => setGlobalFilter(String(value))} />
              <CustomTextField
                select
                id='select-status'
                value={isSubscription === undefined ? '' : String(isSubscription)}
                onChange={e => setIsSubscription(e.target.value === '' ? undefined : e.target.value === 'true')}
                className='max-sm:is-full sm:is-[150px]'
                defaultValue=''
                slotProps={{
                  select: { displayEmpty: true }
                }}
              >
                <MenuItem value=''>{t('orders.table.allOrders')}</MenuItem>
                <MenuItem value='true'>{t('orders.table.subscriptionOrders')}</MenuItem>
                <MenuItem value='false'>{t('orders.table.oneTimeOrders')}</MenuItem>
              </CustomTextField>
              <IconButton onClick={() => exportOrdersToCSV(ordersData)} title={t('table.export')}>
                <i className='tabler-file-download text-[28px] cursor-pointer' />
              </IconButton>
            </div>
          )}
        />
      </div>

      {/* Add Order Modal */}
      <AddOrderModal open={addOrderModalOpen} handleClose={handleCloseAddOrderModal} title={t('orders.form.title')} />
      {/* Cancel Modal */}
      <StatusConfModal
        open={orderCancelModalOpen}
        handleClose={handleCloseCancelModal}
        handleStatusChange={handleCancelConfirm}
        title={t('orders.table.cancel_confirmation')}
        userName={selectedOrder?.order_number || ''}
        newStatus={true}
        isShowAddNotesField={isSuperUser || userRole === 'Admin' ? true : false}
        message={`${t('orders.table.cancel_confirmation_message')} ${selectedOrder?.order_number}?`}
        setNotes={setActiveNote}
        notes={activeNote}
      />
      {/* Complete Modal */}
      <StatusConfModal
        open={orderCompleteModalOpen}
        handleClose={handleCloseCompleteModal}
        handleStatusChange={handleCompleteConfirm}
        title={t('orders.table.complete_confirmation')}
        userName={selectedOrder?.order_number || ''}
        newStatus={true}
        message={`${t('orders.table.complete_confirmation_message')} ${selectedOrder?.order_number}?`}
        setNotes={setActiveNote}
        notes={activeNote}
      />
      {selectedOrder && (
        <PaymentMethodModal
          open={paymentMethodModalOpen}
          onClose={handleClosePaymentMethodModal}
          orderId={selectedOrder.id}
          isSubscription={selectedOrder.is_subscription}
          amount={selectedOrder.amount}
        />
      )}
      {/* Add Note Modal */}
      <AddNoteModal
        open={noteModalOpen}
        handleClose={handleCloseNoteModal}
        onAddNote={handleAddNote}
        setActiveNote={setActiveNote}
        activeNote={activeNote}
      />
    </div>
  )
}

export default OrdersTable
