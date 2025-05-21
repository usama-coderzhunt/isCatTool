'use client'

import { Dispatch, FC, ReactElement, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Button, Chip, IconButton, Typography, useColorScheme } from '@mui/material'
import { MaterialReactTable, MRT_Cell, MRT_ColumnDef, MRT_Row, MRT_SortingState } from 'material-react-table'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import CustomTextField from '@/@core/components/mui/TextField'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { CouponsTypes } from '@/types/coupons'
import AddCouponModal from '@/components/create-edit-coupons'
import { useCouponsHooks } from '@/services/useCouponsHooks'
import { useTableState } from '@/hooks/useTableState'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'

interface CouponsTableProps {
  couponsData: CouponsTypes[]
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
      label={t('coupons.table.search')}
      {...props}
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  )
}

const CouponsTable: FC<CouponsTableProps> = ({
  couponsData,
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
  const [selectedCoupon, setSelectedCoupon] = useState<CouponsTypes | null>(null)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)

  // Api Call
  const { useDeleteCoupon, useDeleteCouponBulk } = useCouponsHooks()
  const deleteCoupon = useDeleteCoupon()
  const bulkDeleteCoupon = useDeleteCouponBulk()

  // Get user roles
  const isSuperUser = getDecryptedLocalStorage('isSuperUser')
  const userRole = getDecryptedLocalStorage('userRole')

  const handleCloseAddModal = () => {
    setOpenAddModal(false)
    setSelectedCoupon(null)
    setMode('create')
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setSelectedCoupon(null)
  }

  const handleDeleteClick = (coupon: CouponsTypes) => {
    setSelectedCoupon(coupon)
    setDeleteModalOpen(true)
  }

  const handleDeleteClickBulk = (ids: number[]) => {
    if (!ids.length === null) return
    bulkDeleteCoupon.mutate(ids, {
      onSuccess: () => {
        toast.success('Coupons deleted successfully')
        setDeleteModalOpen(false)
        setRowSelection({})
        setMultiple(false)
      }
    })
  }

  const handleEditClick = (coupon: CouponsTypes) => {
    setSelectedCoupon(coupon)
    setMode('edit')
    setOpenAddModal(true)
  }

  const handleDelete = () => {
    if (!selectedCoupon) return
    deleteCoupon.mutate(selectedCoupon.id, {
      onSuccess: () => {
        toast.success('Coupon deleted successfully')
        handleCloseDeleteModal()
      }
    })
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('coupons')

  const columns = useMemo<MRT_ColumnDef<CouponsTypes, any>[]>(() => {
    const baseColumns: MRT_ColumnDef<CouponsTypes, any>[] = [
      {
        accessorKey: 'description',
        header: t('coupons.table.description'),
        Cell: ({ cell }: { cell: MRT_Cell<CouponsTypes> }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'code',
        header: t('coupons.table.code'),
        Cell: ({ cell }: { cell: MRT_Cell<CouponsTypes> }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'discount_type',
        header: t('coupons.table.discount_type'),
        Cell: ({ cell }: { cell: MRT_Cell<CouponsTypes> }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'discount_value',
        header: t('coupons.table.discount_value'),
        Cell: ({ cell }: { cell: MRT_Cell<CouponsTypes> }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      }
    ]

    // Add sensitive columns only for SuperUser or Admin
    if (isSuperUser || userRole === 'Admin') {
      const sensitiveColumns: MRT_ColumnDef<CouponsTypes, any>[] = [
        {
          accessorKey: 'valid_from',
          header: t('coupons.table.valid_from'),
          Cell: ({ cell }: { cell: MRT_Cell<CouponsTypes> }) => (
            <Typography className='font-medium' color='text.primary'>
              {getDisplayDateTime(cell.getValue())}
            </Typography>
          )
        },
        {
          accessorKey: 'valid_until',
          header: t('coupons.table.valid_until'),
          Cell: ({ cell }: { cell: MRT_Cell<CouponsTypes> }) => (
            <Typography className='font-medium' color='text.primary'>
              {getDisplayDateTime(cell.getValue())}
            </Typography>
          )
        },
        {
          accessorKey: 'created_at',
          header: t('coupons.table.created_at'),
          Cell: ({ cell }: { cell: MRT_Cell<CouponsTypes> }) => (
            <Typography className='font-medium truncate' color='text.primary'>
              {getDisplayDateTime(cell.getValue())}
            </Typography>
          )
        },
        {
          accessorKey: 'updated_at',
          header: t('coupons.table.updated_at'),
          Cell: ({ cell }: { cell: MRT_Cell<CouponsTypes> }) => (
            <Typography className='font-medium truncate' color='text.primary'>
              {getDisplayDateTime(cell.getValue())}
            </Typography>
          )
        },
        {
          accessorKey: 'is_active',
          header: t('coupons.table.is_active'),
          Cell: ({ cell }: { cell: MRT_Cell<CouponsTypes> }) => (
            <Chip
              label={cell.getValue() ? t('coupons.table.active') : t('coupons.table.expired')}
              color={cell.getValue() ? 'success' : 'error'}
              size='small'
              variant='tonal'
            />
          )
        }
      ]
      baseColumns.push(...sensitiveColumns)
    }
    if (isSuperUser || userRole === 'Admin') {
      baseColumns.push({
        accessorKey: 'actions',
        header: t('coupons.table.actions'),
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }: { row: MRT_Row<CouponsTypes> }) => (
          <div className='flex items-center gap-1'>
            <IconButton onClick={() => handleDeleteClick(row.original)} disabled={deleteCoupon.isPending}>
              <i className='tabler-trash text-xl' />
            </IconButton>
            <IconButton onClick={() => handleEditClick(row.original)}>
              <i className='tabler-edit text-xl' />
            </IconButton>
          </div>
        )
      })
    }

    return baseColumns
  }, [deleteCoupon.isPending, t])

  return (
    <div className='flex flex-col gap-y-8'>
      <div className='flex items-center justify-between'>
        <Typography variant='h3'>{t('coupons.table.title')}</Typography>
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
              {t('coupons.table.delete_coupons')}
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
              {t('coupons.table.add_coupon')}
            </Button>
          )}
        </div>
      </div>

      <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
        <MaterialReactTable
          columns={columns}
          data={couponsData}
          manualPagination={true}
          rowCount={totalRecords}
          enableGlobalFilter={false}
          enableColumnFilters={true}
          enableSorting={couponsData && couponsData?.length > 1 ? true : false}
          manualSorting={true}
          onGlobalFilterChange={setGlobalFilter}
          enableRowSelection={isSuperUser || userRole === 'Admin'}
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
            noRecordsToDisplay: t('documents.types.noData'),
            rowsPerPage: t('table.rowsPerPage'),
            of: t('table.of'),
            search: t('documents.types.search')
          }}
          renderTopToolbarCustomActions={() => (
            <div className='flex items-center gap-3'>
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                placeholder={t('documents.types.search')}
              />
            </div>
          )}
        />
      </div>
      <DeleteConfModal
        open={deleteModalOpen}
        title={t('coupons.table.delete_coupon')}
        deleteValue={selectedCoupon?.code}
        handleClose={handleCloseDeleteModal}
        handleDelete={() =>
          multiple ? handleDeleteClickBulk(Object.keys(rowSelection).map(key => Number(key))) : handleDelete()
        }
      />
      <AddCouponModal open={openAddModal} handleClose={handleCloseAddModal} mode={mode} couponData={selectedCoupon} />
    </div>
  )
}

export default CouponsTable
