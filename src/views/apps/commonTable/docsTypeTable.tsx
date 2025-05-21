'use client'

import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Button, IconButton, Typography, useColorScheme } from '@mui/material'
import { MaterialReactTable, MRT_Cell, MRT_ColumnDef, MRT_Row, MRT_SortingState } from 'material-react-table'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import CustomTextField from '@/@core/components/mui/TextField'
import { DocumentType } from '@/types/documentTypes'
import AddDocTypesModal from '@/views/pages/client-and-lead-details/addDocTypesModal'
import { useDocsHooks } from '@/services/useDocsHooks'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/useAuthStore'
import { hasPermissions } from '@/utils/permissionUtils'
import { toast } from 'react-toastify'
import { useTableState } from '@/hooks/useTableState'

interface CasesTableProps {
  docsTypeData: DocumentType[]
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

  return <CustomTextField label={t('documents.types.search')} {...props} value={value} onChange={(e) => setValue(e.target.value)} />
}

const DocsTypeTable: FC<CasesTableProps> = ({
  docsTypeData,
  totalRecords,
  pagination,
  setPagination,
  isLoading,
  setGlobalFilter,
  globalFilter,
  sorting,
  setSorting
}) => {
  const { t } = useTranslation('global')
  const userPermissions = useAuthStore(state => state.userPermissions)
  const { mode: themeMode } = useColorScheme()
  //States
  const [openAddModal, setOpenAddModal] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)

  // Api Call
  const { deleteDocType, deleteDocTypeBulk } = useDocsHooks()
  const deleteDocTypeMutation = deleteDocType(selectedDocType?.id ?? null)
  const deleteDocTypeMutationBulk = deleteDocTypeBulk()

  const handleCloseAddModal = () => {
    setOpenAddModal(false)
    setSelectedDocType(null)
    setMode('create')
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setSelectedDocType(null)
  }

  const handleDeleteClick = (docType: DocumentType) => {
    setSelectedDocType(docType)
    setDeleteModalOpen(true)
  }

  const handleDeleteClickBulk = (ids: number[]) => {
    if (!ids.length === null) return
    deleteDocTypeMutationBulk.mutate(ids, {
      onSuccess: () => {
        setDeleteModalOpen(false)
        setRowSelection({})
        setMultiple(false)
      }
    })
  }

  const handleEditClick = (docType: DocumentType) => {
    setSelectedDocType(docType)
    setMode('edit')
    setOpenAddModal(true)
  }

  const handleDelete = () => {
    if (!selectedDocType) return
    deleteDocTypeMutation.mutate(undefined, {
      onSuccess: () => {
        handleCloseDeleteModal()
      }
    })
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('docsType')

  const columns = useMemo<MRT_ColumnDef<DocumentType, any>[]>(() => [
    {
      accessorKey: 'name',
      header: t('documents.types.name'),

      Cell: ({ cell }: { cell: MRT_Cell<DocumentType> }) => (
        <Typography className="font-medium" color="text.primary">
          {getDisplayValue(cell.getValue())}
        </Typography>
      ),
    },
    {
      accessorKey: 'created_at',
      header: t('documents.types.created'),
      Cell: ({ cell }: { cell: MRT_Cell<DocumentType> }) => (
        <Typography className="font-medium truncate" color="text.primary">
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      ),
    },
    {
      accessorKey: 'updated_at',
      header: t('documents.types.updated'),
      Cell: ({ cell }: { cell: MRT_Cell<DocumentType> }) => (
        <Typography className="font-medium truncate" color="text.primary">
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      ),
    },
    {
      accessorKey: 'actions',
      header: t('documents.types.actions'),
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }: { row: MRT_Row<DocumentType> }) => (
        <div className='flex items-center gap-1'>
          {hasPermissions(userPermissions, ['delete_documenttype']) && (
            <IconButton
              onClick={() => handleDeleteClick(row.original)}
              disabled={deleteDocTypeMutation.isPending}
            >
              <i className='tabler-trash text-xl' />
            </IconButton>
          )}
          {hasPermissions(userPermissions, ['change_documenttype']) && (
            <IconButton onClick={() => handleEditClick(row.original)}>
              <i className='tabler-edit text-xl' />
            </IconButton>
          )}
        </div>
      ),
    }
  ], [deleteDocTypeMutation.isPending, t])

  return (
    <div className='flex flex-col gap-y-8'>
      <div className='flex items-center justify-between'>
        <Typography variant='h3'>{t('documents.types.title')}</Typography>
        <div className='flex flex-row gap-2'>
          {hasPermissions(userPermissions, ['delete_documenttype']) && Object.keys(rowSelection).length ? (
            <Button
              variant='contained'
              color='error'
              onClick={() => {
                setMultiple(true)
                setDeleteModalOpen(true)
              }}
              sx={{ padding: '0.5rem 1rem' }}
            >
              {t('documents.types.deletedocsBulk')}
            </Button>
          ) : (
            <></>
          )}
          {hasPermissions(userPermissions, ['add_documenttype']) && (
            <Button
              variant='contained'
              color='primary'
              onClick={() => {
                setMode('create')
                setOpenAddModal(true)
              }}
              sx={{ padding: '0.5rem 1rem' }}
            >
              {t('documents.types.create')}
            </Button>
          )}
        </div>
      </div>

      <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
        <MaterialReactTable
          columns={columns}
          data={docsTypeData}
          manualPagination={true}
          rowCount={totalRecords}
          enableGlobalFilter={false}
          enableColumnFilters={true}
          enableSorting={docsTypeData && docsTypeData?.length > 1 ? true : false}
          manualSorting={true}
          onGlobalFilterChange={setGlobalFilter}
          enableRowSelection
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
          onSortingChange={setSorting}
          onPaginationChange={setPagination}
          muiPaginationProps={{
            getItemAriaLabel: (type) => t(`table.pagination.${type}`)
          }}
          localization={{
            noRecordsToDisplay: t('documents.types.noData'),
            rowsPerPage: t('table.rowsPerPage'),
            of: t('table.of'),
            search: t('documents.types.search')
          }}
          onColumnVisibilityChange={updateColumnVisibility}
          onDensityChange={updateDensity}
          onIsFullScreenChange={updateFullScreen}
          renderTopToolbarCustomActions={() => (
            <div className='flex items-center gap-3'>
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={(value) => setGlobalFilter(String(value))}
                placeholder={t('documents.types.search')}
              />
            </div>
          )}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfModal
        open={deleteModalOpen}
        handleClose={handleCloseDeleteModal}
        title={t('documents.types.delete.title')}
        deleteValue={selectedDocType?.name}
        handleDelete={() =>
          multiple ? handleDeleteClickBulk(Object.keys(rowSelection).map(key => Number(key))) : handleDelete()
        }
      />

      <AddDocTypesModal
        open={openAddModal}
        handleClose={handleCloseAddModal}
        title={mode === 'create' ? t('documents.types.create') : t('documents.types.edit')}
        mode={mode}
        docTypeData={selectedDocType}
      />
    </div>
  )
}

export default DocsTypeTable
