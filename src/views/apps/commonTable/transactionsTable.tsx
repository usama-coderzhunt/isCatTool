'use client'

import { Dispatch, FC, ReactElement, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Chip, IconButton, Tooltip, Typography, useColorScheme } from '@mui/material'
import { MaterialReactTable, MRT_Cell, MRT_ColumnDef, MRT_Row, MRT_SortingState } from 'material-react-table'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useTableState } from '@/hooks/useTableState'
import { useAuthStore } from '@/store/useAuthStore'
import { hasPermissions } from '@/utils/permissionUtils'
import { usePaymentsHooks } from '@/services/usePaymentsHooks'
import { TransactionsTypes } from '@/types/transactionsTypes'
import TransactionRefundModal from '@/views/pages/transactions/transactionRefundModal'
import { useTransactionsHooks } from '@/services/useTransactionsHooks'
import StatusConfModal from '@/components/statusConfirmationModal'
import { useParams, useRouter } from 'next/navigation'
import { i18n } from 'next-i18next'
import { exportTransactionsToCSV } from './tableExport'
import AddNoteModal from '@/components/AddNoteModal'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'
import ImagePreviewModal from '@/views/pages/transactions/ImagePreviewModal'

interface TransactionsTableProps {
  transactionsData: TransactionsTypes[]
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
      label={t('transactions.table.search')}
      {...props}
      value={value}
      onChange={e => setValue(e.target.value)}
      shrinkLabel={false}
    />
  )
}

const TransactionsTable: FC<TransactionsTableProps> = ({
  transactionsData,
  totalRecords,
  pagination,
  setPagination,
  isLoading,
  setGlobalFilter,
  globalFilter,
  sorting,
  setSorting
}): ReactElement => {
  const { t, i18n } = useTranslation('global')
  const { mode: themeMode } = useColorScheme()
  const userPermissions = useAuthStore(state => state.userPermissions)
  const router = useRouter()
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const isSuperUser = getDecryptedLocalStorage('isSuperUser')
  const userRole = getDecryptedLocalStorage('userRole')

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  //States
  const [orderID, setOrderID] = useState<number | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionsTypes | null>(null)
  const [transactionCompleteModalOpen, setTransactionCompleteModalOpen] = useState(false)
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [previewImageModalOpen, setPreviewImageModalOpen] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('')

  const { useRefundOneTimePaymentOrder } = usePaymentsHooks()
  const refundMutation = useRefundOneTimePaymentOrder()
  const { getTransactionByOrder, useUpdateTransaction } = useTransactionsHooks()
  const { data: transaction } = getTransactionByOrder(orderID)
  const editTransactionMutation = useUpdateTransaction()

  const paypalCaptureId =
    transaction?.data?.results[0]?.payment_method === 'paypal'
      ? transaction?.data?.results[0]?.payment_details?.paypal_capture_id
      : null

  const handleRefundClick = (transaction: TransactionsTypes) => {
    setSelectedTransaction(transaction)
    setRefundModalOpen(true)
  }

  const handleCloseRefundModal = () => {
    setRefundModalOpen(false)
    setSelectedTransaction(null)
    setOrderID(null)
  }

  const handleRefundConfirm = (data: { reason: string; amount?: string }) => {
    if (!selectedTransaction?.reference_id) return

    const payload = {
      trx_reference_id: selectedTransaction.reference_id,
      reason: data.reason,
      ...(paypalCaptureId && { paypal_capture_id: paypalCaptureId }),
      ...(data.amount && { amount: data.amount })
    }

    refundMutation.mutate(payload, {
      onSuccess: () => {
        handleCloseRefundModal()
        toast.success(t('transactions.table.transactionRefundedSuccess'))
      }
    })
  }

  const handleCompleteClick = (transaction: TransactionsTypes) => {
    setSelectedTransaction(transaction)
    setTransactionCompleteModalOpen(true)
  }

  const handleCloseTransactionCompleteModal = () => {
    setTransactionCompleteModalOpen(false)
    setSelectedTransaction(null)
  }

  const handleCompleteConfirm = (notes: string, manualPaymentProof?: File | null) => {
    if (!selectedTransaction) return
    const payload: any = {
      id: selectedTransaction.id,
      notes: notes,
      manual_payment_proof: manualPaymentProof || undefined
    }
    if (selectedTransaction.status === 'initiated' && selectedTransaction.payment_method === 'manual') {
      payload.status = 'completed'
    }
    editTransactionMutation.mutate(payload, {
      onSuccess: () => {
        handleCloseTransactionCompleteModal()
        setNotes('')
        toast.success(t('transactions.table.complete_success'))
      }
    })
  }

  const handleStatusDisplay = (status: string) => {
    const statusConfig: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'info' | 'default' }> =
      {
        initiated: {
          label: t('transactions.table.statuses.initiated'),
          color: 'info'
        },
        processing: {
          label: t('transactions.table.statuses.processing'),
          color: 'info'
        },
        completed: {
          label: t('transactions.table.statuses.completed'),
          color: 'success'
        },
        failed: {
          label: t('transactions.table.statuses.failed'),
          color: 'error'
        },
        refunded: {
          label: t('transactions.table.statuses.refunded'),
          color: 'error'
        },
        partially_refunded: {
          label: t('transactions.table.statuses.partially_refunded'),
          color: 'warning'
        },
        cancelled: {
          label: t('transactions.table.statuses.cancelled'),
          color: 'error'
        }
      }
    const config = statusConfig[status] || { label: '-', color: 'default' }
    return (
      <Chip
        label={config.label}
        color={config.color}
        size='small'
        variant='tonal'
        className={`${config.label === '-' ? 'w-[58.22]' : ''}`}
      />
    )
  }

  const paymentMethodMap: Record<string, string> = {
    paypal: 'transactions.table.paymentMethods.paypal',
    stripe: 'transactions.table.paymentMethods.stripe',
    manual: 'transactions.table.paymentMethods.manual'
  }

  const handlePaymentMethodDisplay = (paymentMethod: string) => {
    const key = paymentMethodMap[paymentMethod]
    return key ? t(key) : '-'
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('transactions')

  const columns = useMemo<MRT_ColumnDef<TransactionsTypes, any>[]>(() => {
    const baseColumns: MRT_ColumnDef<TransactionsTypes, any>[] = [
      {
        accessorKey: 'reference_id',
        header: t('transactions.table.referenceId'),
        Cell: ({ cell }: { cell: MRT_Cell<TransactionsTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {cell.getValue() as string}
          </Typography>
        )
      },
      {
        accessorKey: 'amount',
        header: t('transactions.table.amount'),
        Cell: ({ cell }: { cell: MRT_Cell<TransactionsTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {cell.getValue() as string}
          </Typography>
        )
      },
      {
        accessorKey: 'payment_method',
        header: t('transactions.table.paymentMethod'),
        Cell: ({ cell }: { cell: MRT_Cell<TransactionsTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {handlePaymentMethodDisplay(cell.getValue() as string)}
          </Typography>
        )
      },
      {
        accessorKey: 'payment_details.provider',
        header: t('transactions.table.provider'),
        Cell: ({ cell }: { cell: MRT_Cell<TransactionsTypes> }) => {
          const value = cell.getValue()
          return (
            <Typography className='font-medium truncate' color='text.primary'>
              {value ? `Manual - ${getDisplayValue(value)}` : '-'}
            </Typography>
          )
        }
      },
      {
        accessorKey: 'status',
        header: t('transactions.table.status'),
        Cell: ({ cell }: { cell: MRT_Cell<TransactionsTypes> }) => handleStatusDisplay(cell.getValue() as string)
      },
      {
        accessorKey: 'created_at',
        header: t('transactions.table.createdAt'),
        Cell: ({ cell }: { cell: MRT_Cell<TransactionsTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime((cell.getValue() as string) ?? '-')}
          </Typography>
        )
      },
      {
        accessorKey: 'updated_at',
        header: t('transactions.table.updatedAt'),
        Cell: ({ cell }: { cell: MRT_Cell<TransactionsTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        id: 'actions',
        header: t('transactions.table.actions'),
        Cell: ({ row }: { row: MRT_Row<TransactionsTypes> }) => {
          return (
            <div className='flex items-center gap-2'>
              {hasPermissions(userPermissions, ['change_transaction']) &&
                ['completed', 'partially_refunded', 'disputed'].includes(row.original.status) &&
                Number(row.original.amount) > 0 && (
                  <IconButton
                    color='primary'
                    onClick={() => {
                      handleRefundClick(row.original), setOrderID(row.original.order)
                    }}
                    size='small'
                  >
                    <i className='tabler-credit-card-refund text-textSecondary' />
                  </IconButton>
                )}
              {hasPermissions(userPermissions, ['change_transaction']) && (
                <IconButton color='primary' onClick={() => handleCompleteClick(row.original)} size='small'>
                  <i className='tabler-edit text-textSecondary' />
                </IconButton>
              )}
              {(isSuperUser || userRole === 'Admin') && (
                <IconButton onClick={() => router.push(`/${currentLocale}/dashboard/transaction-details/${row.id}`)}>
                  <i className='tabler-eye text-textSecondary' />
                </IconButton>
              )}

              {row.original.manual_payment_proof && (
                <IconButton
                  color='primary'
                  onClick={() => handleImagePreview(row.original.manual_payment_proof as string)}
                  size='small'
                  title={t('transactions.table.previewProof')}
                >
                  <i className='tabler-photo text-textSecondary' />
                </IconButton>
              )}
            </div>
          )
        }
      }
    ]

    // Only show notes column for admin or super user
    if (isSuperUser || userRole === 'Admin') {
      baseColumns.splice(4, 0, {
        accessorKey: 'notes',
        header: t('transactions.table.note'),
        Cell: ({ cell }: { cell: MRT_Cell<TransactionsTypes> }) => {
          const notes = getDisplayValue(cell.getValue())
          return (
            <Tooltip title={notes} arrow>
              <Typography className='truncate max-w-[200px] w-full'>{notes}</Typography>
            </Tooltip>
          )
        }
      })
    }

    return baseColumns
  }, [t, userPermissions, isSuperUser, userRole])

  const handleImagePreview = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl)
    setPreviewImageModalOpen(true)
  }

  const handleCloseImagePreview = () => {
    setPreviewImageModalOpen(false)
    setSelectedImageUrl('')
  }

  return (
    <div className='w-full flex flex-col gap-y-8'>
      <div className='w-full flex items-center justify-between'>
        <Typography variant='h3'>{t('transactions.table.title')}</Typography>
      </div>

      <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
        <MaterialReactTable
          columns={columns}
          data={transactionsData}
          manualPagination={true}
          rowCount={totalRecords}
          enableGlobalFilter={false}
          enableColumnFilters={true}
          enableSorting={transactionsData && transactionsData?.length > 1 ? true : false}
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
            noRecordsToDisplay: t('transactions.table.noData'),
            rowsPerPage: t('table.rowsPerPage'),
            of: t('table.of'),
            search: t('transactions.table.search')
          }}
          renderTopToolbarCustomActions={() => (
            <div className='flex items-center gap-3'>
              <DebouncedInput value={globalFilter ?? ''} onChange={value => setGlobalFilter(String(value))} />
              <IconButton onClick={() => exportTransactionsToCSV(transactionsData)} title={t('table.export')}>
                <i className='tabler-file-download text-[28px] cursor-pointer' />
              </IconButton>
            </div>
          )}
        />
      </div>
      <TransactionRefundModal
        open={refundModalOpen}
        onClose={handleCloseRefundModal}
        onConfirm={handleRefundConfirm}
        isLoading={refundMutation.isLoading}
        title={t('transactions.transactionRefundModal.title')}
        message={t('transactions.transactionRefundModal.message')}
      />

      {/* Complete Modal */}
      <StatusConfModal
        open={transactionCompleteModalOpen}
        handleClose={handleCloseTransactionCompleteModal}
        showImageUpload={selectedTransaction?.payment_method === 'manual' ? true : false}
        handleStatusChange={handleCompleteConfirm}
        notes={notes}
        setNotes={setNotes}
        initialNotes={selectedTransaction?.notes || ''}
        initialImage={
          typeof selectedTransaction?.manual_payment_proof === 'string' ? selectedTransaction.manual_payment_proof : ''
        }
        title={
          selectedTransaction?.payment_method === 'manual'
            ? t('transactions.table.confirmManualPayment')
            : t('transactions.table.addNote')
        }
        userName={selectedTransaction?.reference_id || ''}
        newStatus={true}
        message={
          selectedTransaction?.status === 'initiated' && selectedTransaction?.payment_method === 'manual'
            ? `${t('transactions.table.complete_confirmation_message')} ${selectedTransaction?.reference_id}?`
            : undefined
        }
      />
      {/* Add Image Preview Modal */}
      <ImagePreviewModal open={previewImageModalOpen} onClose={handleCloseImagePreview} imageUrl={selectedImageUrl} />
    </div>
  )
}

export default TransactionsTable
