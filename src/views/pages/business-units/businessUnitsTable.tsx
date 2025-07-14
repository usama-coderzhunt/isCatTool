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
import { hasPermissions } from '@/utils/permissionUtils'

import { useAuthStore } from '@/store/useAuthStore'
import { exportBusinessUnitsToCSV } from '@/views/apps/commonTable/tableExport'

import { BusinessUnitType } from '@/types/businessUnitTypes'
import { useBusinessUnitHooks } from '@/services/useBusinessUnitHooks'
import AddBusinessUnitModal from './addBusinessUnitModal'
import BusinessUnitDetailsCard from './businessUnitDetailsCard'

interface BusinessUnitsTableProps {
  businessUnitsData: BusinessUnitType[]
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

const BusinessUnitsTable: FC<BusinessUnitsTableProps> = ({
  businessUnitsData,
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
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<BusinessUnitType | null>(null)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)

  // Api Call
  const { useDeleteBusinessUnit, useBulkDeleteBusinessUnit } = useBusinessUnitHooks()
  const deleteBusinessUnit = useDeleteBusinessUnit()
  const bulkDeleteBusinessUnit = useBulkDeleteBusinessUnit()

  const handleCloseAddModal = () => {
    setOpenAddModal(false)
    setSelectedBusinessUnit(null)
    setMode('create')
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setMultiple(false)
    setSelectedBusinessUnit(null)
  }

  const handleDeleteClick = (businessUnit: BusinessUnitType) => {
    setSelectedBusinessUnit(businessUnit)
    setDeleteModalOpen(true)
  }

  const handleBulkDelete = (ids: string[]) => {
    if (!ids.length) return
    bulkDeleteBusinessUnit.mutate(ids, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((totalRecords - ids.length) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        toast.success(t('businessUnits.toasts.businessUnitDeletedBulkSuccess'))
        setDeleteModalOpen(false)
        setRowSelection({})
        setMultiple(false)
      }
    })
  }

  const handleEditClick = (businessUnit: BusinessUnitType) => {
    setSelectedBusinessUnit(businessUnit)
    setMode('edit')
    setOpenAddModal(true)
  }

  const handleDelete = () => {
    if (!selectedBusinessUnit) return
    deleteBusinessUnit.mutate(selectedBusinessUnit.id, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((totalRecords - 1) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        toast.success(t('businessUnits.toasts.businessUnitDeletedSuccess'))
        handleCloseDeleteModal()
      }
    })
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('businessUnit')

  const columns = useMemo<MRT_ColumnDef<BusinessUnitType, any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('businessUnits.table.name'),
        Cell: ({ cell }: { cell: MRT_Cell<BusinessUnitType> }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'description',
        header: t('businessUnits.table.description'),
        Cell: ({ cell }: { cell: MRT_Cell<BusinessUnitType> }) => {
          const description = getDisplayValue(cell.getValue())
          return (
            <Tooltip title={description} arrow>
              <Typography className='truncate max-w-[200px] w-full'>{description}</Typography>
            </Tooltip>
          )
        }
      },
      {
        accessorKey: 'notes',
        header: t('businessUnits.table.notes'),
        Cell: ({ cell }: { cell: MRT_Cell<BusinessUnitType> }) => {
          const notes = getDisplayValue(cell.getValue())
          return (
            <Tooltip title={notes} arrow>
              <Typography className='truncate max-w-[200px] w-full'>{notes}</Typography>
            </Tooltip>
          )
        }
      },
      {
        accessorKey: 'created_at',
        header: t('businessUnits.table.createdAt'),
        Cell: ({ cell }: { cell: MRT_Cell<BusinessUnitType> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'updated_at',
        header: t('businessUnits.table.updatedAt'),
        Cell: ({ cell }: { cell: MRT_Cell<BusinessUnitType> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'actions',
        header: t('businessUnits.table.actions'),
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }: { row: MRT_Row<BusinessUnitType> }) => (
          <div className='flex items-center'>
            {hasPermissions(userPermissions, ['adminAndSuperUserOnly']) && (
              <IconButton
                onClick={() => {
                  handleDeleteClick(row.original)
                }}
              >
                <i className='tabler-trash text-textSecondary' />
              </IconButton>
            )}
            {hasPermissions(userPermissions, ['adminAndSuperUserOnly']) && (
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
        <Typography variant='h3'>{t('businessUnits.title')}</Typography>
        <div className='flex flex-row gap-2'>
          {hasPermissions(userPermissions, ['adminAndSuperUserOnly']) && Object.keys(rowSelection).length ? (
            <Button
              variant='contained'
              color='error'
              onClick={() => {
                setMultiple(true)
                setDeleteModalOpen(true)
              }}
              sx={{ padding: '0.5rem 1rem' }}
            >
              {t('businessUnits.bulkDeleteBtnText')}
            </Button>
          ) : (
            <></>
          )}
          {hasPermissions(userPermissions, ['adminAndSuperUserOnly']) && (
            <Button
              variant='contained'
              color='primary'
              onClick={() => {
                setMode('create')
                setOpenAddModal(true)
              }}
              sx={{ padding: '0.5rem 1rem' }}
            >
              {t('businessUnits.addBtnText')}
            </Button>
          )}
        </div>
      </div>

      <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
        <MaterialReactTable
          columns={columns}
          data={businessUnitsData}
          manualPagination={true}
          rowCount={totalRecords}
          enableGlobalFilter={false}
          enableColumnFilters={true}
          enableSorting={businessUnitsData && businessUnitsData?.length > 1 ? true : false}
          manualSorting={true}
          enableExpanding
          renderDetailPanel={({ row }: { row: MRT_Row<BusinessUnitType> }) => (
            <BusinessUnitDetailsCard row={row.original} />
          )}
          onGlobalFilterChange={setGlobalFilter}
          enableRowSelection={hasPermissions(userPermissions, ['adminAndSuperUserOnly'])}
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
            noRecordsToDisplay: t('businessUnits.table.noData'),
            rowsPerPage: t('table.rowsPerPage'),
            of: t('table.of'),
            search: t('common.search')
          }}
          renderTopToolbarCustomActions={() => (
            <div className='flex items-center gap-3'>
              <DebouncedInput value={globalFilter ?? ''} onChange={value => setGlobalFilter(String(value))} />
              <IconButton onClick={() => exportBusinessUnitsToCSV(businessUnitsData)} title={t('table.export')}>
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
        title={`${multiple ? t('businessUnits.deleteModal.deleteBusinessUnits') : t('businessUnits.deleteModal.deleteBusinessUnit')}`}
        message={`${multiple ? t('businessUnits.deleteModal.bulkDeleteConfirmationMessage') : t('businessUnits.deleteModal.message', { name: selectedBusinessUnit?.name })}`}
        handleClose={handleCloseDeleteModal}
        handleDelete={() => (multiple ? handleBulkDelete(Object.keys(rowSelection)) : handleDelete())}
      />
      <AddBusinessUnitModal
        open={openAddModal}
        handleClose={handleCloseAddModal}
        mode={mode}
        businessUnitData={selectedBusinessUnit}
        businessUnitID={selectedBusinessUnit?.id}
        title={`${mode === 'create' ? t('businessUnits.form.add') : t('businessUnits.form.update')}`}
      />
    </div>
  )
}

export default BusinessUnitsTable
