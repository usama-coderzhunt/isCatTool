'use client'

import { Dispatch, FC, ReactElement, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Button, IconButton, Typography, useColorScheme } from '@mui/material'
import { MaterialReactTable, MRT_Cell, MRT_ColumnDef, MRT_Row, MRT_SortingState } from 'material-react-table'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import CustomTextField from '@/@core/components/mui/TextField'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useTableState } from '@/hooks/useTableState'
import { hasPermissions } from '@/utils/permissionUtils'

import { useAuthStore } from '@/store/useAuthStore'
import { exportTranslationMemoryToCSV } from '@/views/apps/commonTable/tableExport'
import { TranslationMemoryTypes } from '@/types/translationMemoryTypes'
import { useTranslationMemoryHooks } from '@/services/useTranslationMemoryHooks'
import AddTranslationMemoryModal from './addTranslationMemoryModal'
import { useParams, useRouter } from 'next/navigation'

interface TranslationMemoryTableProps {
  translationMemoryData: TranslationMemoryTypes[]
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

const TranslationMemoryTable: FC<TranslationMemoryTableProps> = ({
  translationMemoryData,
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
  const { lang } = useParams()
  const router = useRouter()
  const { mode: themeMode } = useColorScheme()
  const currentLocale = Array.isArray(lang) ? lang[0] : lang
  const userPermissions = useAuthStore(state => state.userPermissions)

  //States
  const [openAddModal, setOpenAddModal] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedTranslationMemory, setSelectedTranslationMemory] = useState<TranslationMemoryTypes | null>(null)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)

  // Api Call
  const { useDeleteTranslationMemory, useBulkDeleteTranslationMemory } = useTranslationMemoryHooks()
  const deleteTranslationMemory = useDeleteTranslationMemory()
  const bulkDeleteTranslationMemory = useBulkDeleteTranslationMemory()

  const handleOpenAddModal = (mode: 'create' | 'edit', translationMemory?: TranslationMemoryTypes) => {
    setMode(mode)
    setSelectedTranslationMemory(translationMemory ?? null)
    setOpenAddModal(true)
  }

  const handleCloseAddModal = () => {
    setOpenAddModal(false)
    setSelectedTranslationMemory(null)
    setMode('create')
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setMultiple(false)
    setSelectedTranslationMemory(null)
  }

  const handleDeleteClick = (translationMemory: TranslationMemoryTypes) => {
    setSelectedTranslationMemory(translationMemory)
    setDeleteModalOpen(true)
  }

  const handleBulkDelete = (ids: number[]) => {
    if (!ids.length === null) return
    bulkDeleteTranslationMemory.mutate(ids, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((totalRecords - ids.length) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        toast.success(t('translationMemories.toasts.translationMemoryDeletedBulkSuccess'))
        setDeleteModalOpen(false)
        setRowSelection({})
        setMultiple(false)
      }
    })
  }

  const handleEditClick = (translationMemory: TranslationMemoryTypes) => {
    setSelectedTranslationMemory(translationMemory)
    setMode('edit')
    setOpenAddModal(true)
  }

  const handleDelete = () => {
    if (!selectedTranslationMemory) return
    deleteTranslationMemory.mutate(selectedTranslationMemory.id, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((totalRecords - 1) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        toast.success(t('translationMemories.toasts.translationMemoryDeletedSuccess'))
        handleCloseDeleteModal()
      }
    })
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('translationMemory')

  const columns = useMemo<MRT_ColumnDef<TranslationMemoryTypes, any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('translationMemories.table.name'),
        Cell: ({ cell }: { cell: MRT_Cell<TranslationMemoryTypes> }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'description',
        header: t('translationMemories.table.description'),
        Cell: ({ cell }: { cell: MRT_Cell<TranslationMemoryTypes> }) => (
          <Typography
            className='font-medium'
            color='text.primary'
            sx={{
              maxWidth: '200px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.5em'
            }}
          >
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'source_language_detail.name',
        header: t('translationMemories.table.sourceLanguage'),
        Cell: ({ cell }: { cell: MRT_Cell<TranslationMemoryTypes> }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'target_language_detail.name',
        header: t('translationMemories.table.targetLanguage'),
        Cell: ({ cell }: { cell: MRT_Cell<TranslationMemoryTypes> }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'created_at',
        header: t('translationMemories.table.createdAt'),
        Cell: ({ cell }: { cell: MRT_Cell<TranslationMemoryTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'updated_at',
        header: t('translationMemories.table.updatedAt'),
        Cell: ({ cell }: { cell: MRT_Cell<TranslationMemoryTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'actions',
        header: t('translationMemories.table.actions'),
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }: { row: MRT_Row<TranslationMemoryTypes> }) => (
          <div className='flex items-center'>
            {hasPermissions(userPermissions, ['delete_translationmemory']) && (
              <IconButton
                onClick={() => {
                  handleDeleteClick(row.original)
                }}
              >
                <i className='tabler-trash text-textSecondary' />
              </IconButton>
            )}
            {hasPermissions(userPermissions, ['change_translationmemory']) && (
              <IconButton
                onClick={() => {
                  handleEditClick(row.original)
                }}
              >
                <i className='tabler-edit text-textSecondary' />
              </IconButton>
            )}
            {hasPermissions(userPermissions, ['view_translationmemory']) && (
              <IconButton
                onClick={() => {
                  router.push(`/${currentLocale}/dashboard/translation-memory-details/${row.original.id}`)
                }}
              >
                <i className='tabler-eye text-textSecondary' />
              </IconButton>
            )}
          </div>
        )
      }
    ],
    [t]
  )

  return (
    <div className='flex flex-col gap-y-8'>
      <div className='flex items-center justify-between'>
        <Typography variant='h3'>{t('translationMemories.title')}</Typography>
        <div className='flex flex-row gap-2'>
          {hasPermissions(userPermissions, ['delete_translationmemory']) && Object.keys(rowSelection).length ? (
            <Button
              variant='contained'
              color='error'
              onClick={() => {
                setMultiple(true)
                setDeleteModalOpen(true)
              }}
              sx={{ padding: '0.5rem 1rem' }}
            >
              {t('translationMemories.bulkDeleteBtnText')}
            </Button>
          ) : (
            <></>
          )}
          {hasPermissions(userPermissions, ['add_translationmemory']) && (
            <Button
              variant='contained'
              color='primary'
              onClick={() => {
                setMode('create')
                setOpenAddModal(true)
              }}
              sx={{ padding: '0.5rem 1rem' }}
            >
              {t('translationMemories.addBtnText')}
            </Button>
          )}
        </div>
      </div>

      <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
        <MaterialReactTable
          columns={columns}
          data={translationMemoryData}
          manualPagination={true}
          rowCount={totalRecords}
          enableGlobalFilter={false}
          enableColumnFilters={true}
          enableSorting={translationMemoryData && translationMemoryData?.length > 1 ? true : false}
          manualSorting={true}
          onGlobalFilterChange={setGlobalFilter}
          enableRowSelection={hasPermissions(userPermissions, ['delete_translationmemory'])}
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
          onSortingChange={setSorting}
          onPaginationChange={setPagination}
          muiPaginationProps={{
            getItemAriaLabel: type => t(`table.pagination.${type}`)
          }}
          localization={{
            noRecordsToDisplay: t('translationMemories.table.noData'),
            rowsPerPage: t('table.rowsPerPage'),
            of: t('table.of'),
            search: t('common.search')
          }}
          renderTopToolbarCustomActions={() => (
            <div className='flex items-center gap-3'>
              <DebouncedInput value={globalFilter ?? ''} onChange={value => setGlobalFilter(String(value))} />
              <IconButton onClick={() => exportTranslationMemoryToCSV(translationMemoryData)} title={t('table.export')}>
                <i className='tabler-file-download text-[28px] cursor-pointer' />
              </IconButton>
              {Object.keys(rowSelection).length > 0 && (
                <div className='flex items-center gap-3'>
                  <Typography variant='body2' color='text.secondary'>
                    {Object.keys(rowSelection).length} {t('table.recordsSelected')} {t('table.of')} {totalRecords}
                  </Typography>
                  <Button
                    variant='outlined'
                    onClick={() => {
                      setRowSelection({})
                      setMultiple(false)
                    }}
                  >
                    {t('table.clearSelection')}
                  </Button>
                </div>
              )}
            </div>
          )}
        />
      </div>
      <DeleteConfModal
        open={deleteModalOpen}
        title={`${multiple ? t('translationMemories.deleteModal.deleteTranslationMemories') : t('translationMemories.deleteModal.deleteTranslationMemory')}`}
        message={`${multiple ? t('translationMemories.deleteModal.bulkDeleteConfirmationMessage') : t('translationMemories.deleteModal.message', { name: selectedTranslationMemory?.name })}`}
        handleClose={handleCloseDeleteModal}
        handleDelete={() =>
          multiple ? handleBulkDelete(Object.keys(rowSelection).map(key => Number(key))) : handleDelete()
        }
      />
      <AddTranslationMemoryModal
        open={openAddModal}
        handleClose={handleCloseAddModal}
        mode={mode}
        translationMemoryData={selectedTranslationMemory}
        title={`${mode === 'create' ? t('translationMemories.form.addTitle') : t('translationMemories.form.updateTitle')}`}
        handleOpen={handleOpenAddModal}
      />
    </div>
  )
}

export default TranslationMemoryTable
