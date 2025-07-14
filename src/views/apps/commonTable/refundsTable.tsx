'use client'

import { Dispatch, FC, ReactElement, SetStateAction, useEffect, useState, useMemo } from 'react'
import { Chip, IconButton, Tooltip, Typography, useColorScheme } from '@mui/material'
import { MaterialReactTable, MRT_Cell, MRT_ColumnDef, MRT_SortingState, MRT_Row } from 'material-react-table'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import { useTranslation } from 'react-i18next'
import { useTableState } from '@/hooks/useTableState'
import { RefundsTypes } from '@/types/refundsTypes'
import CustomTextField from '@/@core/components/mui/TextField'
import { exportRefundsToCSV } from './tableExport'
import RefundDetailsCard from '@/views/pages/refunds/refundDetailsCard'
import AddNoteModal from '@/components/AddNoteModal'
import { usePaymentsHooks } from '@/services/usePaymentsHooks'
import { toast } from 'react-toastify'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'

interface RefundsTableProps {
  refundsData: RefundsTypes[]
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
      label={t('common.search')}
      {...props}
      value={value}
      onChange={e => setValue(e.target.value)}
      shrinkLabel={false}
    />
  )
}

const RefundsTable: FC<RefundsTableProps> = ({
  refundsData,
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

  // Add states for notes modal
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [activeNote, setActiveNote] = useState('')
  const [selectedRefundForNote, setSelectedRefundForNote] = useState<RefundsTypes | null>(null)

  const isSuperUser = getDecryptedLocalStorage('isSuperUser')
  const userRole = getDecryptedLocalStorage('userRole')

  const { useAddNoteToRefund } = usePaymentsHooks()
  const addNoteMutation = useAddNoteToRefund()

  const handleNoteClick = (refund: RefundsTypes) => {
    setSelectedRefundForNote(refund)
    setActiveNote(refund.notes || '')
    setNoteModalOpen(true)
  }

  const handleCloseNoteModal = () => {
    setNoteModalOpen(false)
    setSelectedRefundForNote(null)
  }

  const handleAddNote = (note: string) => {
    if (!selectedRefundForNote) return
    addNoteMutation.mutate(
      {
        id: selectedRefundForNote.id,
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

  const handleStatusDisplay = (status: string): JSX.Element => {
    const { t } = useTranslation('global')
    const statusConfig: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'info' | 'default' }> =
      {
        pending: {
          label: t('refunds.table.pending'),
          color: 'warning'
        },
        processing: {
          label: t('refunds.table.processing'),
          color: 'info'
        },
        completed: {
          label: t('refunds.table.completed'),
          color: 'success'
        },
        failed: {
          label: t('refunds.table.failed'),
          color: 'error'
        },
        cancelled: {
          label: t('refunds.table.cancelled'),
          color: 'error'
        },
        partially_refunded: {
          label: t('refunds.table.partially_refunded'),
          color: 'warning'
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

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('refunds')

  const columns = useMemo<MRT_ColumnDef<RefundsTypes, any>[]>(() => {
    const baseColumns: MRT_ColumnDef<RefundsTypes, any>[] = [
      {
        accessorKey: 'refund_reference_id',
        header: t('refunds.table.refundReferenceId'),
        Cell: ({ cell }: { cell: MRT_Cell<RefundsTypes> }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'amount',
        header: t('refunds.table.amount'),
        Cell: ({ cell }: { cell: MRT_Cell<RefundsTypes> }) => (
          <Typography className='font-medium' color='text.primary'>
            ${getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'reason',
        header: t('refunds.table.reason'),
        Cell: ({ cell }: { cell: MRT_Cell<RefundsTypes> }) => (
          <Typography
            className='font-medium'
            color='text.primary'
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'normal',
              lineHeight: '1.2em'
            }}
          >
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'status',
        header: t('refunds.table.status'),
        Cell: ({ cell }: { cell: MRT_Cell<RefundsTypes> }) => handleStatusDisplay(cell.getValue() as string)
      },
      {
        accessorKey: 'created_at',
        header: t('refunds.table.createdAt'),
        Cell: ({ cell }: { cell: MRT_Cell<RefundsTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'updated_at',
        header: t('refunds.table.updatedAt'),
        Cell: ({ cell }: { cell: MRT_Cell<RefundsTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      }
    ]

    if (isSuperUser || userRole === 'Admin') {
      baseColumns.splice(3, 0, {
        accessorKey: 'notes',
        header: t('refunds.table.notes'),
        Cell: ({ cell }: { cell: MRT_Cell<RefundsTypes> }) => {
          const notes = getDisplayValue(cell.getValue())
          return (
            <Tooltip title={notes} arrow>
              <Typography className='truncate max-w-[200px] w-full'>{notes}</Typography>
            </Tooltip>
          )
        }
      })

      const actionsColumn: MRT_ColumnDef<RefundsTypes, any> = {
        accessorKey: 'actions',
        header: t('refunds.table.actions'),
        Cell: ({ cell }: { cell: MRT_Cell<RefundsTypes> }) => (
          <div className='flex items-center gap-2'>
            <IconButton color='primary' onClick={() => handleNoteClick(cell.row.original)} size='small'>
              <i className='tabler-note text-textSecondary' />
            </IconButton>
          </div>
        )
      }
      baseColumns.push(actionsColumn)
    }

    return baseColumns
  }, [t, isSuperUser, userRole])

  return (
    <div className='flex flex-col gap-y-8'>
      <div className='flex items-center justify-between'>
        <Typography variant='h3'>{t('refunds.table.title')}</Typography>
      </div>

      <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
        <MaterialReactTable
          columns={columns}
          data={refundsData}
          manualPagination={true}
          rowCount={totalRecords}
          enableGlobalFilter={false}
          enableColumnFilters={true}
          enableSorting={refundsData && refundsData?.length > 1 ? true : false}
          manualSorting={true}
          enableExpanding
          renderDetailPanel={({ row }) => <RefundDetailsCard row={row.original} />}
          state={{
            pagination,
            isLoading,
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
          muiPaginationProps={{
            getItemAriaLabel: type => t(`table.pagination.${type}`)
          }}
          localization={{
            noRecordsToDisplay: t('refunds.table.noData'),
            rowsPerPage: t('refunds.table.rowsPerPage'),
            of: t('refunds.table.of')
          }}
          renderTopToolbarCustomActions={() => (
            <div className='flex items-center gap-3'>
              <DebouncedInput value={globalFilter ?? ''} onChange={value => setGlobalFilter(String(value))} />
              <IconButton onClick={() => exportRefundsToCSV(refundsData)} title={t('table.export')}>
                <i className='tabler-file-download text-[28px] cursor-pointer' />
              </IconButton>
            </div>
          )}
        />
      </div>
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

export default RefundsTable
