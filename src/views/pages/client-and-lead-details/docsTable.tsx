'use client'

// React Imports
import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'

// MUI Imports
import { Button, Typography, IconButton, useColorScheme } from '@mui/material'
import { MaterialReactTable, MRT_Cell, MRT_Row, MRT_SortingState, MRT_RowSelectionState } from 'material-react-table'

// Hooks & Services
import { useDocsHooks } from '@/services/useDocsHooks'
import ViewDocumentModal from './viewDocumentModal'
import { formatDate } from '@/utils/utility/formateDate'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import { hasPermissions } from '@/utils/permissionUtils'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import { toast } from 'react-toastify'
import { TranslationService } from './transServicesTable'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import CustomTextField from '@/@core/components/mui/TextField'
import { LawyerClientTypes } from '@/types/lawyerClients'
import { CreateDocumentInput } from '@/types/documentTypes'
import { useTableState } from '@/hooks/useTableState'
import { usePaginatedSearch } from '@/utils/usePaginatedSearch'
import { exportDocumentsToCSV } from '@/views/apps/commonTable/tableExport'

export type TableDataType = {
  id: number
  document_type: number
  note: string
  expiration_date: string | number | Date
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
  clients: number[]
  cases: number[]
}

interface DocsTableProps {
  userPermissions: { codename: string }[]
  selectedClientData: LawyerClientTypes
  rowSelection: MRT_RowSelectionState
  setRowSelection: (updater: MRT_RowSelectionState | ((old: MRT_RowSelectionState) => MRT_RowSelectionState)) => void
  setMultiple: (multiple: boolean) => void
  multiple: boolean
  openDeleteModal: boolean
  setOpenDeleteModal: (open: boolean) => void
  setMode: (mode: 'edit' | 'create') => void
  setOpenEditModalOpen: (open: boolean) => void
  setSelectedDocumentData: (data: CreateDocumentInput) => void
  setDocumentId: (id: number) => void
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
    <CustomTextField label={t('common.search')} {...props} value={value} onChange={e => setValue(e.target.value)} />
  )
}

const DocsTable: React.FC<DocsTableProps> = ({
  userPermissions,
  selectedClientData,
  rowSelection,
  setRowSelection,
  multiple,
  setMultiple,
  openDeleteModal,
  setOpenDeleteModal,
  setMode,
  setOpenEditModalOpen,
  setSelectedDocumentData,
  setDocumentId
}: DocsTableProps) => {
  const { t } = useTranslation('global')
  const { mode: themeMode } = useColorScheme()

  // States
  const [open, setOpen] = useState(false)
  const [delName, setDelName] = useState<string>('')
  const [docId, setDocId] = useState<number | null>(null)
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const { pagination, setPagination, appliedSearch } = usePaginatedSearch({
    initialPageSize: 5,
    globalFilter
  })

  const { getDocs, useDeleteDocument, useBulkDeleteDocuments } = useDocsHooks()
  const { mutate: deleteDocument } = useDeleteDocument()
  const { mutate: bulkDeleteDocuments } = useBulkDeleteDocuments()
  const { data: docsData, isLoading } = getDocs(
    pagination.pageSize,
    pagination.pageIndex + 1,
    getOrderingParam(sorting),
    appliedSearch,
    selectedClientData?.id
  )
  const data = docsData?.data?.results ?? []

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleDeleteDocument = () => {
    if (docId === null) return
    deleteDocument(docId, {
      onSuccess: () => {
        toast.success(t('documents.documentDeleted'))
        setOpenDeleteModal(false)
      }
    })
  }

  const handleBulkDeleteDocuments = (ids: number[]) => {
    if (!ids.length === null) return
    bulkDeleteDocuments(ids, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((docsData?.data?.count - ids.length) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        toast.success(t('documents.documentsBulkDeleted'))
        setOpenDeleteModal(false)
        setRowSelection({})
      }
    })
    setMultiple(false)
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('docs')

  const columns = [
    {
      accessorKey: 'name',
      header: t('documents.table.name'),
      Cell: ({ cell }: { cell: MRT_Cell<TableDataType> }) => getDisplayValue(cell.getValue())
    },
    {
      accessorKey: 'note',
      header: t('documents.table.note'),
      Cell: ({ cell }: { cell: MRT_Cell<TableDataType> }) => getDisplayValue(cell.getValue())
    },
    {
      accessorKey: 'expiration_date',
      header: t('documents.table.expirationDate'),
      Cell: ({ cell }: { cell: MRT_Cell<TableDataType> }) => formatDate(cell.getValue())
    },
    {
      accessorKey: 'created_at',
      header: t('documents.table.createdAt'),
      Cell: ({ cell }: { cell: MRT_Cell<TableDataType> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'updated_at',
      header: t('documents.table.updatedAt'),
      Cell: ({ cell }: { cell: MRT_Cell<TableDataType> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'actions',
      header: t('documents.table.actions'),
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }: { row: MRT_Row<TableDataType> }) => (
        <div className='flex items-center'>
          {hasPermissions(userPermissions, ['view_document']) && (
            <Button
              variant='outlined'
              className='min-w-fit inline-flex items-center justify-center p-2 rounded-full bg-transparent hover:bg-[#e1def514] border-none'
              onClick={() => {
                setDocId(row.original.id)
                handleOpen()
              }}
            >
              <i className='tabler-eye text-textSecondary w-[22px] h-[22px]' />
            </Button>
          )}
          {hasPermissions(userPermissions, ['change_document']) && (
            <IconButton
              onClick={() => {
                setOpenEditModalOpen(true)
                setMode('edit')
                setSelectedDocumentData({
                  ...row.original,
                  document_type: row.original.document_type?.toString() || null
                })
                setDocumentId(row.original.id)
              }}
            >
              <i className='tabler-edit text-textSecondary' />
            </IconButton>
          )}
          {hasPermissions(userPermissions, ['delete_document']) && (
            <IconButton
              onClick={() => {
                setDocId(row.original.id)
                setDelName(row.original.note)
                setOpenDeleteModal(true)
              }}
            >
              <i className='tabler-trash text-textSecondary' />
            </IconButton>
          )}
        </div>
      )
    }
  ]

  return (
    <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
      <MaterialReactTable
        columns={columns}
        data={data}
        manualPagination={true}
        manualSorting={true}
        rowCount={docsData?.data?.count || 0}
        enableGlobalFilter={false}
        enableColumnFilters={true}
        enableSorting={data && data?.length > 1 ? true : false}
        enableRowSelection
        positionToolbarAlertBanner='none'
        onRowSelectionChange={setRowSelection}
        getRowId={row => String(row.id)}
        state={{
          pagination,
          isLoading,
          sorting,
          rowSelection,
          columnVisibility: tableState.columnVisibility,
          density: tableState.density,
          isFullScreen: tableState.isFullScreen
        }}
        onSortingChange={setSorting}
        onPaginationChange={setPagination}
        muiPaginationProps={{
          getItemAriaLabel: type => t(`table.pagination.${type}`)
        }}
        onColumnVisibilityChange={updateColumnVisibility}
        onDensityChange={updateDensity}
        onIsFullScreenChange={updateFullScreen}
        renderTopToolbarCustomActions={() => (
          <div className='flex items-center gap-3'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder={t('common.search')}
            />
            <IconButton onClick={() => exportDocumentsToCSV(data)} title={t('table.export')}>
              <i className='tabler-file-download text-[28px] cursor-pointer' />
            </IconButton>
            {Object.keys(rowSelection).length > 0 && (
              <div className='flex items-center gap-3'>
                <Typography variant='body2' color='text.secondary'>
                  {Object.keys(rowSelection).length} {t('table.recordsSelected')} {t('table.of')}{' '}
                  {docsData?.data?.count}
                </Typography>
                <Button variant='outlined' onClick={() => setRowSelection({})}>
                  {t('table.clearSelection')}
                </Button>
              </div>
            )}
          </div>
        )}
        localization={{
          noRecordsToDisplay: t('table.noData'),
          rowsPerPage: t('table.rowsPerPage'),
          of: t('table.of')
        }}
      />
      {docId && (
        <ViewDocumentModal open={open} handleClose={handleClose} title={t('documents.table.view')} docId={docId} />
      )}
      <DeleteConfModal
        title={t('documents.deleteConfirmationModal.title')}
        deleteValue={multiple ? '' : delName}
        open={openDeleteModal}
        handleClose={() => setOpenDeleteModal(false)}
        handleDelete={() =>
          multiple
            ? handleBulkDeleteDocuments(Object.keys(rowSelection).map(key => Number(key)))
            : handleDeleteDocument()
        }
      />
    </div>
  )
}

export default DocsTable
