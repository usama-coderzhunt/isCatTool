'use client'

import { Dispatch, FC, ReactElement, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Button, IconButton, Tooltip, Typography, useColorScheme } from '@mui/material'
import { MaterialReactTable, MRT_Cell, MRT_ColumnDef, MRT_Row, MRT_SortingState } from 'material-react-table'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import CustomTextField from '@/@core/components/mui/TextField'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useTableState } from '@/hooks/useTableState'
import { useAuthStore } from '@/store/useAuthStore'
import { exportTranslationSubjectsToCSV } from '@/views/apps/commonTable/tableExport'
import { TranslationSubjectsTypes } from '@/types/translationSubjectsTypes'
import { useTranslationSubjectsHooks } from '@/services/useTranslationSubjectsHooks'
import { hasPermissions } from '@/utils/permissionUtils'
import AddTranslationSubjectModal from './addTranslationSubjectModal'

interface TranslationSubjectsTableProps {
  translationSubjectsData: TranslationSubjectsTypes[]
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

const TranslationSubjectsTable: FC<TranslationSubjectsTableProps> = ({
  translationSubjectsData,
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

  //States
  const [openAddModal, setOpenAddModal] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedTranslationSubject, setSelectedTranslationSubject] = useState<TranslationSubjectsTypes | null>(null)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)

  // Api Call
  const { useDeleteTranslationSubject, useBulkDeleteTranslationSubjects } = useTranslationSubjectsHooks()
  const deleteTranslationSubject = useDeleteTranslationSubject()
  const bulkDeleteTranslationSubjects = useBulkDeleteTranslationSubjects()

  const handleOpenAddModal = (mode: 'create' | 'edit', translationSubject?: TranslationSubjectsTypes) => {
    setMode(mode)
    setSelectedTranslationSubject(translationSubject ?? null)
    setOpenAddModal(true)
  }

  const handleCloseAddModal = () => {
    setOpenAddModal(false)
    setSelectedTranslationSubject(null)
    setMode('create')
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setMultiple(false)
    setSelectedTranslationSubject(null)
  }

  const handleDeleteClick = (translationSubject: TranslationSubjectsTypes) => {
    setSelectedTranslationSubject(translationSubject)
    setDeleteModalOpen(true)
  }

  const handleBulkDelete = (ids: number[]) => {
    if (!ids.length === null) return
    bulkDeleteTranslationSubjects.mutate(ids, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((totalRecords - ids.length) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        toast.success(t('translationSubjects.toasts.translationSubjectDeletedBulkSuccess'))
        setDeleteModalOpen(false)
        setRowSelection({})
        setMultiple(false)
      }
    })
  }

  const handleEditClick = (translationSubject: TranslationSubjectsTypes) => {
    setSelectedTranslationSubject(translationSubject)
    setMode('edit')
    setOpenAddModal(true)
  }

  const handleDelete = () => {
    if (!selectedTranslationSubject) return
    deleteTranslationSubject.mutate(selectedTranslationSubject.id, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((totalRecords - 1) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        toast.success(t('translationSubjects.toasts.translationSubjectDeletedSuccess'))
        handleCloseDeleteModal()
      }
    })
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('translationSubjects')

  const columns = useMemo<MRT_ColumnDef<TranslationSubjectsTypes, any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('translationSubjects.table.name'),
        Cell: ({ cell }: { cell: MRT_Cell<TranslationSubjectsTypes> }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'description',
        header: t('translationSubjects.table.description'),
        Cell: ({ cell }: { cell: MRT_Cell<TranslationSubjectsTypes> }) => {
          const description = getDisplayValue(cell.getValue())
          return (
            <Tooltip title={description} arrow>
              <Typography className='truncate max-w-[200px] w-full'>{description}</Typography>
            </Tooltip>
          )
        }
      },
      {
        accessorKey: 'created_at',
        header: t('translationSubjects.table.createdAt'),
        Cell: ({ cell }: { cell: MRT_Cell<TranslationSubjectsTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'updated_at',
        header: t('translationSubjects.table.updatedAt'),
        Cell: ({ cell }: { cell: MRT_Cell<TranslationSubjectsTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'actions',
        header: t('translationSubjects.table.actions'),
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }: { row: MRT_Row<TranslationSubjectsTypes> }) => (
          <div className='flex items-center'>
            {hasPermissions(userPermissions, ['delete_translationsubject']) && (
              <IconButton
                onClick={() => {
                  handleDeleteClick(row.original)
                }}
              >
                <i className='tabler-trash text-textSecondary' />
              </IconButton>
            )}
            {hasPermissions(userPermissions, ['change_translationsubject']) && (
              <IconButton
                onClick={() => {
                  handleEditClick(row.original)
                }}
              >
                <i className='tabler-edit text-textSecondary' />
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
        <Typography variant='h3'>{t('translationSubjects.title')}</Typography>
        <div className='flex flex-row gap-2'>
          {hasPermissions(userPermissions, ['delete_translationsubject']) && Object.keys(rowSelection).length ? (
            <Button
              variant='contained'
              color='error'
              onClick={() => {
                setMultiple(true)
                setDeleteModalOpen(true)
              }}
              sx={{ padding: '0.5rem 1rem' }}
            >
              {t('translationSubjects.bulkDeleteBtnText')}
            </Button>
          ) : (
            <></>
          )}
          {hasPermissions(userPermissions, ['add_translationsubject']) && (
            <Button
              variant='contained'
              color='primary'
              onClick={() => {
                setMode('create')
                setOpenAddModal(true)
              }}
              sx={{ padding: '0.5rem 1rem' }}
            >
              {t('translationSubjects.addBtnText')}
            </Button>
          )}
        </div>
      </div>

      <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
        <MaterialReactTable
          columns={columns}
          data={translationSubjectsData}
          manualPagination={true}
          rowCount={totalRecords}
          enableGlobalFilter={false}
          enableColumnFilters={true}
          enableSorting={translationSubjectsData && translationSubjectsData?.length > 1 ? true : false}
          manualSorting={true}
          onGlobalFilterChange={setGlobalFilter}
          enableRowSelection={hasPermissions(userPermissions, ['delete_translationsubject'])}
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
            noRecordsToDisplay: t('translationSubjects.table.noData'),
            rowsPerPage: t('table.rowsPerPage'),
            of: t('table.of'),
            search: t('common.search')
          }}
          renderTopToolbarCustomActions={() => (
            <div className='flex items-center gap-3'>
              <DebouncedInput value={globalFilter ?? ''} onChange={value => setGlobalFilter(String(value))} />
              <IconButton
                onClick={() => exportTranslationSubjectsToCSV(translationSubjectsData)}
                title={t('table.export')}
              >
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
        title={`${multiple ? t('translationSubjects.deleteModal.deleteTranslationSubjects') : t('translationSubjects.deleteModal.deleteTranslationSubject')}`}
        message={`${multiple ? t('translationSubjects.deleteModal.bulkDeleteConfirmationMessage') : t('translationSubjects.deleteModal.message', { name: selectedTranslationSubject?.name })}`}
        handleClose={handleCloseDeleteModal}
        handleDelete={() =>
          multiple ? handleBulkDelete(Object.keys(rowSelection).map(key => Number(key))) : handleDelete()
        }
      />
      <AddTranslationSubjectModal
        open={openAddModal}
        handleClose={handleCloseAddModal}
        mode={mode}
        translationSubjectData={selectedTranslationSubject}
        title={`${mode === 'create' ? t('translationSubjects.form.add') : t('translationSubjects.form.update')}`}
        handleOpen={handleOpenAddModal}
      />
    </div>
  )
}

export default TranslationSubjectsTable
