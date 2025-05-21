'use client'

import { Dispatch, FC, ReactElement, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Button, Chip, IconButton, Typography, useColorScheme } from '@mui/material'
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

interface OrdersTableProps {
    ordersData: OrdersTypes[]
    totalRecords: number
    pagination: { pageSize: number; pageIndex: number }
    setPagination: Dispatch<SetStateAction<{ pageIndex: number; pageSize: number }>>;
    isLoading: boolean;
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

    return <CustomTextField label={t('orders.table.search')} {...props} value={value} onChange={(e) => setValue(e.target.value)} />
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
    setSorting
}): ReactElement => {
    const { t } = useTranslation('global')
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

    const handleCancelClick = (order: OrdersTypes) => {
        setSelectedOrder(order)
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
                notes: (isSuperUser === false && userRole !== 'Admin') ? 'Order Cancelled by User' : undefined
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
                status: 'completed'
            },
            {
                onSuccess: () => {
                    handleCloseCompleteModal()
                    toast.success(t('orders.table.complete_success'))
                }
            }
        )
    }

    const handlePayNowClick = (order: OrdersTypes) => {
        setSelectedOrder(order)
        setPaymentMethodModalOpen(true)
    }

    const handleClosePaymentMethodModal = () => {
        setPaymentMethodModalOpen(false)
        setSelectedOrder(null)
    }

    const handleOrderStatusDisplay = (status: string) => {
        const statusMap: Record<string, { label: string, color: 'success' | 'error' | 'warning' | 'info' | 'default' }> = {
            pending: { label: t('orders.table.statuses.pending'), color: 'warning' },
            confirmed: { label: t('orders.table.statuses.confirmed'), color: 'success' },
            cancelled: { label: t('orders.table.statuses.cancelled'), color: 'error' },
            completed: { label: t('orders.table.statuses.completed'), color: 'success' },
            refunded: { label: t('orders.table.statuses.refunded'), color: 'error' },
            cancellation_requested: { label: t('orders.table.statuses.cancellation_requested'), color: 'info' },
            upgraded: { label: t('orders.table.statuses.upgraded'), color: 'success' },
        }

        const config = statusMap[status] || { label: '-', color: 'default' }

        return (
            <Chip
                label={config.label}
                color={config.color}
                size='small'
                variant='tonal'
            />
        )
    }
    const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('coupons')

    const columns = useMemo<MRT_ColumnDef<OrdersTypes, any>[]>(() => [
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
            accessorKey: 'status',
            header: t('orders.table.status'),
            Cell: ({ cell }: { cell: MRT_Cell<OrdersTypes> }) => (
                <Typography className='font-medium truncate' color='text.primary'>
                    {handleOrderStatusDisplay(cell.getValue() as string)}
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
        },
        {
            id: 'actions',
            header: t('table.actions'),
            Cell: ({ row }: { row: MRT_Row<OrdersTypes> }) => (
                <div className='flex items-center gap-2'>
                    {row.original.status === 'pending' && (
                        <IconButton
                            color='primary'
                            onClick={() => handleCancelClick(row.original)}
                            size='small'
                        >
                            <i className='tabler-edit text-textSecondary' />
                        </IconButton>
                    )}
                    {hasPermissions(userPermissions, ['change_order']) && row.original.status === 'pending' && (
                        <IconButton
                            color='primary'
                            onClick={() => handleCompleteClick(row.original)}
                            size='small'
                        >
                            <i className='tabler-check text-textSecondary' />
                        </IconButton>
                    )}
                </div>
            ),
        },
    ], [t, userPermissions])

    return (
        <div className='w-full flex flex-col gap-y-8'>
            <div className='w-full flex items-center justify-between gap-x-2'>
                <Typography variant='h3'>{t('orders.table.title')}</Typography>
                {hasPermissions(userPermissions, ['add_order']) && (
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={handleAddOrderClick}
                        sx={{ padding: '0.5rem 1rem' }}
                    >
                        {t('orders.table.createOrder')}
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
                            <DebouncedInput
                                value={globalFilter ?? ''}
                                onChange={(value) => setGlobalFilter(String(value))}
                                placeholder={t('orders.table.search')}
                            />
                        </div>
                    )}
                />
            </div>

            {/* Add Order Modal */}
            <AddOrderModal
                open={addOrderModalOpen}
                handleClose={handleCloseAddOrderModal}
                title="Create Order"
            />
            {/* Cancel Modal */}
            <StatusConfModal
                open={orderCancelModalOpen}
                handleClose={handleCloseCancelModal}
                handleStatusChange={handleCancelConfirm}
                title={t('orders.table.cancel_confirmation')}
                userName={selectedOrder?.order_number || ''}
                newStatus={true}
                message={`${t('orders.table.cancel_confirmation_message')} ${selectedOrder?.order_number}?`}
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
        </div>
    )
}

export default OrdersTable
