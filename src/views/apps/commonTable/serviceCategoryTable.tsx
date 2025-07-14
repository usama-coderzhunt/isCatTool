'use client'

import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Button, IconButton, Typography, useColorScheme } from '@mui/material'
import { MaterialReactTable, MRT_Cell, MRT_ColumnDef, MRT_Row, MRT_SortingState } from 'material-react-table'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import CustomTextField from '@/@core/components/mui/TextField'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/useAuthStore'
import { hasPermissions } from '@/utils/permissionUtils'
import { toast } from 'react-toastify'
import { useTableState } from '@/hooks/useTableState'
import { ServiceCategory } from '@/types/serviceCategoryTypes'
import { useServicesHooks } from '@/services/useServicesHooks'
import AddServiceCategoryModal from '@/views/pages/services/addServiceCategoryModal'
import { exportServiceCategoriesToCSV } from './tableExport'

interface ServiceCategoryTableProps {
  categoryData: ServiceCategory[]
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

const ServiceCategoryTable: FC<ServiceCategoryTableProps> = ({
  categoryData,
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
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)

  const { useDeleteServiceCategory, useBulkDeleteServiceCategory } = useServicesHooks()

  const { mutate: deleteCategory } = useDeleteServiceCategory()
  const { mutate: bulkDeleteCategory } = useBulkDeleteServiceCategory()

  const handleCloseAddModal = () => {
    setOpenAddModal(false)
    setSelectedCategory(null)
    setMode('create')
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setSelectedCategory(null)
    setMultiple(false)
  }

  const handleDeleteClick = (category: ServiceCategory) => {
    setSelectedCategory(category)
    setDeleteModalOpen(true)
  }

  const handleBulkDelete = (ids: number[]) => {
    if (!ids.length) return
    bulkDeleteCategory(ids, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((totalRecords - ids.length) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        toast.success(t('serviceCategories.toasts.categoryDeletedBulkSuccess'))
        setDeleteModalOpen(false)
        setRowSelection({})
        setMultiple(false)
      }
    })
  }

  const handleEditClick = (category: ServiceCategory) => {
    setSelectedCategory(category)
    setMode('edit')
    setOpenAddModal(true)
  }

  const handleDelete = () => {
    if (!selectedCategory) return
    deleteCategory(selectedCategory.id, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((totalRecords - 1) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        toast.success(t('serviceCategories.toasts.categoryDeletedSuccess'))
        handleCloseDeleteModal()
      }
    })
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('serviceCategory')

  const columns = useMemo<MRT_ColumnDef<ServiceCategory, any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('serviceCategories.table.name'),
        Cell: ({ cell }: { cell: MRT_Cell<ServiceCategory> }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'description',
        header: t('serviceCategories.table.description'),
        Cell: ({ cell }: { cell: MRT_Cell<ServiceCategory> }) => (
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
        header: t('serviceCategories.table.createdAt'),
        Cell: ({ cell }: { cell: MRT_Cell<ServiceCategory> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'updated_at',
        header: t('serviceCategories.table.updatedAt'),
        Cell: ({ cell }: { cell: MRT_Cell<ServiceCategory> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'actions',
        header: t('serviceCategories.table.actions'),
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }: { row: MRT_Row<ServiceCategory> }) => (
          <div className='flex items-center gap-1'>
            {hasPermissions(userPermissions, ['delete_category']) && (
              <IconButton onClick={() => handleDeleteClick(row.original)}>
                <i className='tabler-trash text-xl' />
              </IconButton>
            )}
            {hasPermissions(userPermissions, ['change_category']) && (
              <IconButton onClick={() => handleEditClick(row.original)}>
                <i className='tabler-edit text-xl' />
              </IconButton>
            )}
          </div>
        )
      }
    ],
    []
  )

  return (
    <div className='flex flex-col gap-y-8'>
      <div className='flex items-center justify-between'>
        <Typography variant='h3'>{t('serviceCategories.title')}</Typography>
        <div className='flex flex-row gap-2'>
          {Object.keys(rowSelection).length ? (
            <Button
              variant='contained'
              color='error'
              onClick={() => {
                setMultiple(true)
                setDeleteModalOpen(true)
              }}
              sx={{ padding: '0.5rem 1rem' }}
            >
              {t('serviceCategories.deleteCategories')}
            </Button>
          ) : (
            <></>
          )}
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              setMode('create')
              setOpenAddModal(true)
            }}
            sx={{ padding: '0.5rem 1rem' }}
          >
            {t('serviceCategories.addCategory')}
          </Button>
        </div>
      </div>
      <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
        <MaterialReactTable
          columns={columns}
          data={categoryData}
          manualPagination={true}
          rowCount={totalRecords}
          enableGlobalFilter={false}
          enableColumnFilters={true}
          enableSorting={categoryData && categoryData?.length > 1}
          manualSorting={true}
          onGlobalFilterChange={setGlobalFilter}
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
          onSortingChange={setSorting}
          onPaginationChange={setPagination}
          localization={{
            noRecordsToDisplay: t('serviceCategories.table.noRecordsToDisplay'),
            rowsPerPage: t('serviceCategories.table.rowsPerPage'),
            of: t('serviceCategories.table.of')
          }}
          onColumnVisibilityChange={updateColumnVisibility}
          onDensityChange={updateDensity}
          onIsFullScreenChange={updateFullScreen}
          renderTopToolbarCustomActions={() => (
            <div className='flex items-center gap-3'>
              <DebouncedInput value={globalFilter ?? ''} onChange={value => setGlobalFilter(String(value))} />
              <IconButton onClick={() => exportServiceCategoriesToCSV(categoryData)} title={t('table.export')}>
                <i className='tabler-file-download text-[28px] cursor-pointer' />
              </IconButton>
              {Object.keys(rowSelection).length > 0 && (
                <div className='flex items-center gap-3'>
                  <Typography variant='body2' color='text.secondary'>
                    {Object.keys(rowSelection).length} {t('table.recordsSelected')} {t('table.of')} {totalRecords}
                  </Typography>
                  <Button variant='outlined' onClick={() => setRowSelection({})}>
                    {t('table.clearSelection')}
                  </Button>
                </div>
              )}
            </div>
          )}
        />
      </div>

      <AddServiceCategoryModal
        open={openAddModal}
        handleClose={handleCloseAddModal}
        mode={mode}
        categoryData={selectedCategory}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfModal
        open={deleteModalOpen}
        handleClose={handleCloseDeleteModal}
        title={multiple ? t('serviceCategories.deleteCategories') : t('serviceCategories.deleteCategory')}
        message={
          multiple
            ? t('serviceCategories.bulkDeleteConfirm', { count: Object.keys(rowSelection).length })
            : t('serviceCategories.deleteConfirm', { name: selectedCategory?.name })
        }
        handleDelete={() =>
          multiple ? handleBulkDelete(Object.keys(rowSelection).map(key => Number(key))) : handleDelete()
        }
      />
    </div>
  )
}

export default ServiceCategoryTable
