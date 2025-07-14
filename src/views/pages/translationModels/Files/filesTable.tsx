'use client'

import { SetStateAction, useEffect, useState, Dispatch } from 'react'
import { MaterialReactTable, MRT_Cell, MRT_Row, MRT_SortingState } from 'material-react-table'
import { Button, Typography, useColorScheme, IconButton } from '@mui/material'
import { getDisplayDateTime } from '@/utils/utility/displayValue'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from 'next-i18next'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import { toast } from 'react-toastify'
import { useTableState } from '@/hooks/useTableState'
import { usePaginatedSearch } from '@/utils/usePaginatedSearch'
import { exportFilesToCSV } from '@/views/apps/commonTable/tableExport'
import { FilesTypes } from '@/types/filesTypes'
import { useProjectsHooks } from '@/services/useProjectsHooks'

interface FilesTableProps {
  handleOpen: (mode: 'create' | 'edit', entry?: FilesTypes) => void
  taskId?: number
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

const FilesTable: React.FC<FilesTableProps> = ({
  handleOpen,
  taskId,
  rowSelection,
  setRowSelection,
  multiple,
  setMultiple,
  deleteModalOpen,
  setDeleteModalOpen
}) => {
  const { mode: themeMode } = useColorScheme()
  const { t } = useTranslation('global')
  const [data, setData] = useState<FilesTypes[]>([])
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null)
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [sorting, setSorting] = useState<MRT_SortingState>([])

  const { pagination, setPagination, appliedSearch } = usePaginatedSearch({
    initialPageSize: 5,
    globalFilter
  })

  const { getFiles, useDeleteFile, useBulkDeleteFile } = useProjectsHooks()
  const { data: entryData, isLoading } = getFiles(
    taskId,
    pagination.pageSize,
    pagination.pageIndex + 1,
    appliedSearch,
    getOrderingParam(sorting)
  )

  const { mutate: deleteFile } = useDeleteFile()
  const { mutate: bulkDeleteFiles } = useBulkDeleteFile()

  useEffect(() => {
    setData(entryData?.data?.results ?? [])
  }, [entryData])

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setMultiple(false)
  }

  const handleDeleteFile = () => {
    if (selectedFileId === null) return
    deleteFile(selectedFileId, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((entryData?.data?.count - 1) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        setData(prevData => prevData?.filter(delTaskId => delTaskId.id !== selectedFileId))
        toast.success(t('taskFiles.toasts.fileDeletedSuccess'))
        setDeleteModalOpen(false)
      }
    })
  }

  const handleBulkDeleteFiles = (ids: number[]) => {
    if (!ids.length === null) return
    bulkDeleteFiles(ids, {
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
        toast.success(t('taskFiles.toasts.fileDeletedBulkSuccess'))
      }
    })
    setMultiple(false)
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('files')

  const columns = [
    {
      accessorKey: 'task',
      header: t('taskFiles.table.task'),
      Cell: ({ cell }: { cell: MRT_Cell<FilesTypes> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {cell.getValue() as number}
        </Typography>
      )
    },
    {
      accessorKey: 'created_at',
      header: t('taskFiles.table.createdAt'),
      Cell: ({ cell }: { cell: MRT_Cell<FilesTypes> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'updated_at',
      header: t('taskFiles.table.updatedAt'),
      Cell: ({ cell }: { cell: MRT_Cell<FilesTypes> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'actions',
      header: t('taskFiles.table.actions'),
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }: { row: MRT_Row<FilesTypes> }) => {
        const fileId = row.original.id
        return (
          <div className='flex items-center'>
            <Button
              variant='outlined'
              className='min-w-fit inline-flex items-center justify-center p-2 rounded-full bg-transparent hover:bg-[#e1def514] border-none'
              onClick={() => {
                setDeleteModalOpen(true)
                setSelectedFileId(fileId)
              }}
            >
              <i className='tabler-trash text-textSecondary' />
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
            <IconButton onClick={() => exportFilesToCSV(data)} title={t('table.export')}>
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
          noRecordsToDisplay: t('taskFiles.table.noData'),
          rowsPerPage: t('table.rowsPerPage'),
          of: t('table.of')
        }}
        onSortingChange={setSorting}
      />
      <DeleteConfModal
        title={multiple ? t('taskFiles.deleteModal.deleteFiles') : t('taskFiles.deleteModal.deleteFile')}
        message={
          multiple ? t('taskFiles.deleteModal.bulkDeleteConfirmationMessage') : t('taskFiles.deleteModal.message')
        }
        open={deleteModalOpen}
        handleClose={handleCloseDeleteModal}
        handleDelete={() =>
          multiple ? handleBulkDeleteFiles(Object.keys(rowSelection).map(key => Number(key))) : handleDeleteFile()
        }
      />
    </div>
  )
}

export default FilesTable
