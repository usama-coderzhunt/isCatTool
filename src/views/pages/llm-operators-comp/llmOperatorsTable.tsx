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
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'
import { useLlmOperatorsHooks } from '@/services/useLlmOperatorsHooks'
import { useAuthStore } from '@/store/useAuthStore'
import { LLMOperatorTypes } from '@/types/llmOperatorTypes'
import AddLlmOperatorModal from './addLlmOperatorModal'
import { exportLlmOperatorsToCSV } from '@/views/apps/commonTable/tableExport'

interface LLMOperatorsTableProps {
  llmOperatorsData: LLMOperatorTypes[]
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

const LLMOperatorsTable: FC<LLMOperatorsTableProps> = ({
  llmOperatorsData,
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

  //States
  const [openAddModal, setOpenAddModal] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedLlmOperator, setSelectedLlmOperator] = useState<LLMOperatorTypes | null>(null)
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create')
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)

  // Api Call
  const { useDeleteLlmOperator, useBulkDeleteLlmOperator } = useLlmOperatorsHooks()
  const deleteLlmOperator = useDeleteLlmOperator()
  const bulkDeleteLlmOperator = useBulkDeleteLlmOperator()

  // Get user roles
  const isSuperUser = getDecryptedLocalStorage('isSuperUser')
  const userRole = getDecryptedLocalStorage('userRole')

  const handleCloseAddModal = () => {
    setOpenAddModal(false)
    setSelectedLlmOperator(null)
    setMode('create')
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setMultiple(false)
    setSelectedLlmOperator(null)
  }

  const handleDeleteClick = (llmOperator: LLMOperatorTypes) => {
    setSelectedLlmOperator(llmOperator)
    setDeleteModalOpen(true)
  }

  const handleBulkDelete = (ids: number[]) => {
    if (!ids.length === null) return
    bulkDeleteLlmOperator.mutate(ids, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((totalRecords - ids.length) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        toast.success(t('llmOperators.toasts.llmOperatorDeletedBulkSuccess'))
        setDeleteModalOpen(false)
        setRowSelection({})
        setMultiple(false)
      }
    })
  }

  const handleEditClick = (llmOperator: LLMOperatorTypes) => {
    setSelectedLlmOperator(llmOperator)
    setMode('edit')
    setOpenAddModal(true)
  }

  const handleViewClick = (llmOperator: LLMOperatorTypes) => {
    setSelectedLlmOperator(llmOperator)
    setMode('view')
    setOpenAddModal(true)
  }

  const handleDelete = () => {
    if (!selectedLlmOperator) return
    deleteLlmOperator.mutate(selectedLlmOperator.id, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((totalRecords - 1) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        toast.success(t('llmOperators.toasts.llmOperatorDeletedSuccess'))
        handleCloseDeleteModal()
      }
    })
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('llmOperators')

  const columns = useMemo<MRT_ColumnDef<LLMOperatorTypes, any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('llmOperators.table.name'),
        Cell: ({ cell }: { cell: MRT_Cell<LLMOperatorTypes> }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'description',
        header: t('llmOperators.table.description'),
        Cell: ({ cell }: { cell: MRT_Cell<LLMOperatorTypes> }) => (
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
        accessorKey: 'created_at',
        header: t('llmOperators.table.createdAt'),
        Cell: ({ cell }: { cell: MRT_Cell<LLMOperatorTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'updated_at',
        header: t('llmOperators.table.updatedAt'),
        Cell: ({ cell }: { cell: MRT_Cell<LLMOperatorTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'actions',
        header: t('llmOperators.table.actions'),
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }: { row: MRT_Row<LLMOperatorTypes> }) => (
          <div className='flex items-center'>
            {(isSuperUser || userRole === 'Admin') && (
              <IconButton
                onClick={() => {
                  handleDeleteClick(row.original)
                }}
              >
                <i className='tabler-trash text-textSecondary' />
              </IconButton>
            )}
            {(isSuperUser || userRole === 'Admin') && (
              <IconButton
                onClick={() => {
                  handleEditClick(row.original)
                }}
              >
                <i className='tabler-edit text-textSecondary' />
              </IconButton>
            )}
            {(isSuperUser || userRole === 'Admin') && (
              <IconButton onClick={() => handleViewClick(row.original)}>
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
        <Typography variant='h3'>{t('llmOperators.title')}</Typography>
        <div className='flex flex-row gap-2'>
          {(isSuperUser || userRole === 'Admin') && Object.keys(rowSelection).length ? (
            <Button
              variant='contained'
              color='error'
              onClick={() => {
                setMultiple(true)
                setDeleteModalOpen(true)
              }}
              sx={{ padding: '0.5rem 1rem' }}
            >
              {t('llmOperators.deleteBulk')}
            </Button>
          ) : (
            <></>
          )}
          {(isSuperUser || userRole === 'Admin') && (
            <Button
              variant='contained'
              color='primary'
              onClick={() => {
                setMode('create')
                setOpenAddModal(true)
              }}
              sx={{ padding: '0.5rem 1rem' }}
            >
              {t('llmOperators.add')}
            </Button>
          )}
        </div>
      </div>

      <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
        <MaterialReactTable
          columns={columns}
          data={llmOperatorsData}
          manualPagination={true}
          rowCount={totalRecords}
          enableGlobalFilter={false}
          enableColumnFilters={true}
          enableSorting={llmOperatorsData && llmOperatorsData?.length > 1 ? true : false}
          manualSorting={true}
          onGlobalFilterChange={setGlobalFilter}
          enableRowSelection={isSuperUser || userRole === 'Admin'}
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
            noRecordsToDisplay: t('llmOperators.table.noData'),
            rowsPerPage: t('table.rowsPerPage'),
            of: t('table.of'),
            search: t('common.search')
          }}
          renderTopToolbarCustomActions={() => (
            <div className='flex items-center gap-3'>
              <DebouncedInput value={globalFilter ?? ''} onChange={value => setGlobalFilter(String(value))} />
              <IconButton onClick={() => exportLlmOperatorsToCSV(llmOperatorsData)} title={t('table.export')}>
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
        title={`${multiple ? t('llmOperators.deleteBulk') : t('llmOperators.deleteModal.deleteLlmOperator')}`}
        message={`${multiple ? t('llmOperators.deleteModal.deleteLlmOperatorsMessage') : t('llmOperators.deleteModal.deleteLlmOperatorMessage', { name: selectedLlmOperator?.name })}`}
        handleClose={handleCloseDeleteModal}
        handleDelete={() =>
          multiple ? handleBulkDelete(Object.keys(rowSelection).map(key => Number(key))) : handleDelete()
        }
      />
      <AddLlmOperatorModal
        open={openAddModal}
        handleClose={handleCloseAddModal}
        mode={mode}
        llmOperatorData={selectedLlmOperator}
        llmOperatorID={selectedLlmOperator?.id}
        title={`${mode === 'create' ? t('llmOperators.add') : mode === 'edit' ? t('llmOperators.update') : t('llmOperators.view')}`}
      />
    </div>
  )
}

export default LLMOperatorsTable
