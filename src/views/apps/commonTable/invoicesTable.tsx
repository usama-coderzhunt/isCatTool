'use client'

import { Dispatch, FC, ReactElement, SetStateAction, useEffect, useMemo, useState } from 'react'
import { IconButton, Tooltip, Typography, useColorScheme } from '@mui/material'
import { MaterialReactTable, MRT_Cell, MRT_ColumnDef, MRT_SortingState, MRT_Row } from 'material-react-table'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import { useTranslation } from 'react-i18next'
import { useTableState } from '@/hooks/useTableState'
import { exportInvoicesToCSV } from './tableExport'
import { InvoicesTypes } from '@/types/invoicesTypes'
import { handleStatusDisplay } from '@/utils/utility/displayInvoicesStatus'
import InvoiceDetailsCard from '@/views/pages/invoices/invoiceDetailsCard'
import AddNoteModal from '@/components/AddNoteModal'
import { usePaymentsHooks } from '@/services/usePaymentsHooks'
import { toast } from 'react-toastify'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'
import CustomTextField from '@/@core/components/mui/TextField'

interface InvoicesTableProps {
  invoicesData: InvoicesTypes[]
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

const InvoicesTable: FC<InvoicesTableProps> = ({
  invoicesData,
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
  const [selectedInvoiceForNote, setSelectedInvoiceForNote] = useState<InvoicesTypes | null>(null)

  const isSuperUser = getDecryptedLocalStorage('isSuperUser')
  const userRole = getDecryptedLocalStorage('userRole')

  const { useEditInvoice } = usePaymentsHooks()
  const editInvoiceMutation = useEditInvoice()

  const handleNoteClick = (invoice: InvoicesTypes) => {
    setSelectedInvoiceForNote(invoice)
    setActiveNote(invoice.notes || '')
    setNoteModalOpen(true)
  }

  const handleCloseNoteModal = () => {
    setNoteModalOpen(false)
    setSelectedInvoiceForNote(null)
  }

  const handleAddNote = (note: string) => {
    if (!selectedInvoiceForNote) return
    editInvoiceMutation.mutate(
      {
        id: selectedInvoiceForNote.id,
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

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('invoices')

  const columns = useMemo<MRT_ColumnDef<InvoicesTypes, any>[]>(() => {
    const baseColumns: MRT_ColumnDef<InvoicesTypes, any>[] = [
      {
        accessorKey: 'invoice_number',
        header: t('invoices.table.invoiceNumber'),
        Cell: ({ cell }: { cell: MRT_Cell<InvoicesTypes> }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'subtotal',
        header: t('invoices.table.subtotal'),
        Cell: ({ cell }: { cell: MRT_Cell<InvoicesTypes> }) => (
          <Typography className='font-medium' color='text.primary'>
            ${getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'status',
        header: t('invoices.table.status'),
        Cell: ({ cell }: { cell: MRT_Cell<InvoicesTypes> }) => handleStatusDisplay(cell.getValue() as string)
      },
      {
        accessorKey: 'created_at',
        header: t('invoices.table.createdAt'),
        Cell: ({ cell }: { cell: MRT_Cell<InvoicesTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'updated_at',
        header: t('invoices.table.updatedAt'),
        Cell: ({ cell }: { cell: MRT_Cell<InvoicesTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      }
    ]

    if (isSuperUser || userRole === 'Admin') {
      baseColumns.splice(2, 0, {
        accessorKey: 'notes',
        header: t('invoices.table.notes'),
        Cell: ({ cell }: { cell: MRT_Cell<InvoicesTypes> }) => {
          const notes = getDisplayValue(cell.getValue())
          return (
            <Tooltip title={notes} arrow>
              <Typography className='truncate max-w-[200px] w-full'>{notes}</Typography>
            </Tooltip>
          )
        }
      })

      const actionsColumn: MRT_ColumnDef<InvoicesTypes, any> = {
        accessorKey: 'actions',
        header: t('invoices.table.actions'),
        Cell: ({ cell }: { cell: MRT_Cell<InvoicesTypes> }) => (
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
        <Typography variant='h3'>{t('invoices.table.title')}</Typography>
      </div>

      <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
        <MaterialReactTable
          columns={columns}
          data={invoicesData}
          manualPagination={true}
          rowCount={totalRecords}
          enableGlobalFilter={false}
          enableColumnFilters={true}
          enableSorting={invoicesData && invoicesData?.length > 1 ? true : false}
          manualSorting={true}
          enableExpanding
          renderDetailPanel={({ row }) => <InvoiceDetailsCard row={row.original} />}
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
            noRecordsToDisplay: t('invoices.table.noData'),
            rowsPerPage: t('invoices.table.rowsPerPage'),
            of: t('invoices.table.of')
          }}
          renderTopToolbarCustomActions={() => (
            <div className='flex items-center gap-3'>
              <DebouncedInput value={globalFilter ?? ''} onChange={value => setGlobalFilter(String(value))} />
              <IconButton onClick={() => exportInvoicesToCSV(invoicesData)} title={t('table.export')}>
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

export default InvoicesTable
