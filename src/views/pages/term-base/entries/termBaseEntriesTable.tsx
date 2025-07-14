'use client'

import { SetStateAction, useEffect, useState, Dispatch } from 'react'
import { MaterialReactTable, MRT_Cell, MRT_Row, MRT_SortingState } from 'material-react-table'
import { Button, Typography, useColorScheme, Tooltip, IconButton } from '@mui/material'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from 'next-i18next'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import { toast } from 'react-toastify'
import { useTableState } from '@/hooks/useTableState'
import { usePaginatedSearch } from '@/utils/usePaginatedSearch'
import { exportTermBaseEntriesToCSV } from '@/views/apps/commonTable/tableExport'
import { TermBaseEntriesTypes } from '@/types/termBaseEntriesTypes'
import { useTermBaseHooks } from '@/services/useTermBaseHooks'

interface TermBaseEntriesTableProps {
  handleOpen: (mode: 'create' | 'edit', entry?: TermBaseEntriesTypes) => void
  termBaseId?: number
  rowSelection: any
  setRowSelection: any
  multiple: boolean
  setMultiple: Dispatch<SetStateAction<boolean>>
  deleteModalOpen: boolean
  setDeleteModalOpen: Dispatch<SetStateAction<boolean>>
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

const TermBaseEntriesTable: React.FC<TermBaseEntriesTableProps> = ({
  handleOpen,
  termBaseId,
  rowSelection,
  setRowSelection,
  multiple,
  setMultiple,
  deleteModalOpen,
  setDeleteModalOpen
}) => {
  const { mode: themeMode } = useColorScheme()
  const { t } = useTranslation('global')
  const [data, setData] = useState<TermBaseEntriesTypes[]>([])
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null)
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [sorting, setSorting] = useState<MRT_SortingState>([])

  const { pagination, setPagination, appliedSearch } = usePaginatedSearch({
    initialPageSize: 5,
    globalFilter
  })

  const { getTermBaseEntries, useDeleteTermBaseEntry, useBulkDeleteTermBaseEntries } = useTermBaseHooks()
  const { data: entryData, isLoading } = getTermBaseEntries(
    termBaseId,
    pagination.pageSize,
    pagination.pageIndex + 1,
    appliedSearch,
    getOrderingParam(sorting)
  )

  const { mutate: deleteEntry } = useDeleteTermBaseEntry()
  const { mutate: bulkDeleteEntries } = useBulkDeleteTermBaseEntries()

  useEffect(() => {
    setData(entryData?.data?.results ?? [])
  }, [entryData])

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setMultiple(false)
  }

  const handleDeleteEntry = () => {
    if (selectedEntryId === null) return
    deleteEntry(selectedEntryId, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((entryData?.data?.count - 1) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        toast.success(t('termBaseEntries.toasts.entryDeletedSuccess'))
        setData(prevData => prevData?.filter(delTaskId => delTaskId.id !== selectedEntryId))
        setDeleteModalOpen(false)
      }
    })
  }

  const handleBulkDeleteEntries = (ids: number[]) => {
    if (!ids.length === null) return
    bulkDeleteEntries(ids, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((entryData?.data?.count || 0) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        setDeleteModalOpen(false)
        setRowSelection({})
        toast.success(t('termBaseEntries.toasts.entryDeletedBulkSuccess'))
      }
    })
    setMultiple(false)
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('termBaseEntries')

  const columns = [
    {
      accessorKey: 'original_term',
      header: t('termBaseEntries.table.originalTerm'),
      Cell: ({ cell }: { cell: MRT_Cell<TermBaseEntriesTypes> }) => {
        const originalTerm = getDisplayValue(cell.getValue())
        return (
          <Tooltip title={originalTerm} arrow>
            <Typography className='truncate max-w-[200px] w-full'>{originalTerm}</Typography>
          </Tooltip>
        )
      }
    },
    {
      accessorKey: 'translation',
      header: t('termBaseEntries.table.translation'),
      Cell: ({ cell }: { cell: MRT_Cell<TermBaseEntriesTypes> }) => {
        const translation = getDisplayValue(cell.getValue())
        return (
          <Tooltip title={translation} arrow>
            <Typography className='truncate max-w-[200px] w-full'>{translation}</Typography>
          </Tooltip>
        )
      }
    },
    {
      accessorKey: 'created_at',
      header: t('termBaseEntries.table.createdAt'),
      Cell: ({ cell }: { cell: MRT_Cell<TermBaseEntriesTypes> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'updated_at',
      header: t('termBaseEntries.table.updatedAt'),
      Cell: ({ cell }: { cell: MRT_Cell<TermBaseEntriesTypes> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'actions',
      header: t('termBaseEntries.table.actions'),
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }: { row: MRT_Row<TermBaseEntriesTypes> }) => {
        const entryId = row.original.id
        return (
          <div className='flex items-center'>
            <Button
              variant='outlined'
              className='min-w-fit inline-flex items-center justify-center p-2 rounded-full bg-transparent hover:bg-[#e1def514] border-none'
              onClick={() => {
                setDeleteModalOpen(true)
                setSelectedEntryId(entryId)
              }}
            >
              <i className='tabler-trash text-textSecondary' />
            </Button>
            <Button
              variant='outlined'
              className='min-w-fit inline-flex items-center justify-center p-2 rounded-full bg-transparent hover:bg-[#e1def514] border-none'
              onClick={() => {
                handleOpen('edit', row.original)
              }}
            >
              <i className='tabler-edit text-textSecondary w-[22px] h-[22px]' />
            </Button>
          </div>
        )
      }
    }
  ]

  return (
    <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
      <MaterialReactTable
        columns={columns}
        data={data}
        manualPagination={true}
        rowCount={entryData?.data?.count || 0}
        enableGlobalFilter={false}
        enableColumnFilters={true}
        enableSorting={data && data?.length > 1 ? true : false}
        manualSorting={true}
        enableRowSelection
        positionToolbarAlertBanner='none'
        onRowSelectionChange={setRowSelection}
        getRowId={row => String(row.id)}
        state={{
          pagination,
          isLoading,
          globalFilter,
          sorting,
          rowSelection,
          columnVisibility: tableState.columnVisibility,
          density: tableState.density,
          isFullScreen: tableState.isFullScreen
        }}
        onColumnVisibilityChange={updateColumnVisibility}
        onDensityChange={updateDensity}
        onIsFullScreenChange={updateFullScreen}
        onGlobalFilterChange={setGlobalFilter}
        onPaginationChange={setPagination}
        renderTopToolbarCustomActions={() => (
          <div className='flex items-center gap-3'>
            <DebouncedInput value={globalFilter ?? ''} onChange={value => setGlobalFilter(String(value))} />
            <IconButton onClick={() => exportTermBaseEntriesToCSV(data)} title={t('table.export')}>
              <i className='tabler-file-download text-[28px] cursor-pointer' />
            </IconButton>
            {Object.keys(rowSelection).length > 0 && (
              <div className='flex items-center gap-3'>
                <Typography variant='body2' color='text.secondary'>
                  {Object.keys(rowSelection).length} {t('table.recordsSelected')} {t('table.of')}{' '}
                  {entryData?.data?.count}
                </Typography>
                <Button
                  variant='outlined'
                  onClick={() => {
                    setRowSelection({}), setMultiple(false)
                  }}
                >
                  {t('table.clearSelection')}
                </Button>
              </div>
            )}
          </div>
        )}
        localization={{
          noRecordsToDisplay: t('termBaseEntries.table.noData'),
          rowsPerPage: t('table.rowsPerPage'),
          of: t('table.of')
        }}
        onSortingChange={setSorting}
      />
      <DeleteConfModal
        title={multiple ? t('termBaseEntries.deleteModal.deleteEntries') : t('termBaseEntries.deleteModal.deleteEntry')}
        message={
          multiple
            ? t('termBaseEntries.deleteModal.bulkDeleteConfirmationMessage')
            : t('termBaseEntries.deleteModal.message')
        }
        open={deleteModalOpen}
        handleClose={handleCloseDeleteModal}
        handleDelete={() =>
          multiple ? handleBulkDeleteEntries(Object.keys(rowSelection).map(key => Number(key))) : handleDeleteEntry()
        }
      />
    </div>
  )
}

export default TermBaseEntriesTable
