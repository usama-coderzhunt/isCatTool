'use client'

import { useEffect, useState } from 'react'
import { MaterialReactTable, MRT_Cell, MRT_Row, MRT_SortingState } from 'material-react-table'
import { Button, IconButton, Typography, useColorScheme, Tooltip } from '@mui/material'
import { useServicesHooks } from '@/services/useServicesHooks'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import { useTranslation } from 'next-i18next'
import { hasPermissions } from '@/utils/permissionUtils'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import CustomTextField from '@/@core/components/mui/TextField'
import { toast } from 'react-toastify'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import { useTableState } from '@/hooks/useTableState'
import { usePaginatedSearch } from '@/utils/usePaginatedSearch'

export type TranslationService = {
  id: number
  created_at: string
  updated_at: string
  order_date: string | null
  communication_platform: string | null
  translation_type: string
  marketing_funnel: string
  reason_of_refuse: string | null
  source_language: string | null
  target_language: string | null
  priority: string
  cost: number | null
  created_by: number
  updated_by: number | null
  trans_client: number
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
      label={t('services.table.search')}
      {...props}
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  )
}
interface TransServicesTableProps {
  handleOpen: (mode: 'view' | 'create' | 'edit', service?: TranslationService) => void
  setServiceID: (id: string) => void
  clientId: number
  userPermissions: { codename: string }[]
  sorting: MRT_SortingState
  setSorting: (updater: MRT_SortingState | ((prev: MRT_SortingState) => MRT_SortingState)) => void
  rowSelection: any
  setRowSelection: any
  setMultiple: any
  multiple: boolean
  openDeleteModal: boolean
  setOpenDeleteModal: any
  isClientActive: boolean
}

const TransServicesTable: React.FC<TransServicesTableProps> = ({
  handleOpen,
  setServiceID,
  clientId,
  userPermissions,
  sorting,
  setSorting,
  rowSelection,
  setRowSelection,
  multiple,
  setMultiple,
  openDeleteModal,
  setOpenDeleteModal,
  isClientActive
}) => {
  const { t } = useTranslation('global')
  const { mode: themeMode } = useColorScheme()

  //States
  const [globalFilter, setGlobalFilter] = useState('')
  const [transServiceId, setTransServiceId] = useState<number | null>(null)
  const [delName, setDelName] = useState<string>('')

  const { pagination, setPagination, appliedSearch } = usePaginatedSearch({
    initialPageSize: 5,
    globalFilter
  })

  const { getTransServices, useDeleteTransService, useDeleteTransServiceBulk } = useServicesHooks()
  const { data: servicesData, isLoading } = getTransServices(
    clientId,
    pagination.pageSize,
    pagination.pageIndex + 1,
    getOrderingParam(sorting),
    appliedSearch
  )

  const data = servicesData?.data?.results ?? []
  const deleteTransServiceMutation = useDeleteTransService()
  const deleteTransServiceMutationBulk = useDeleteTransServiceBulk()

  const handleDeleteTransService = () => {
    if (transServiceId === null) return
    deleteTransServiceMutation.mutate(transServiceId, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((servicesData?.data?.count - 1) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        toast.success(t('services.toasts.transServiceDeletedSuccess'))
        setOpenDeleteModal(false)
      }
    })
  }
  const handleDeleteTransServicesBulk = (ids: number[]) => {
    if (!ids.length === null) return
    deleteTransServiceMutationBulk.mutate(ids, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((servicesData?.data?.count - ids.length) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        setOpenDeleteModal(false)
        setRowSelection({})
        toast.success(t('services.toasts.transServiceDeletedBulkSuccess'))
      }
    })
    setMultiple(false)
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('transServices')

  const columns = [
    {
      accessorKey: 'translation_type',
      header: t('services.table.translationType'),
      Cell: ({ cell }: { cell: MRT_Cell<TranslationService> }) => getDisplayValue(cell.getValue())
    },
    {
      accessorKey: 'marketing_funnel',
      header: t('services.table.marketingFunnel'),
      Cell: ({ cell }: { cell: MRT_Cell<TranslationService> }) => getDisplayValue(cell.getValue())
    },
    {
      accessorKey: 'communication_platform',
      header: t('services.table.communicationPlatform'),
      Cell: ({ cell }: { cell: MRT_Cell<TranslationService> }) => getDisplayValue(cell.getValue())
    },
    {
      accessorKey: 'source_language',
      header: t('services.table.sourceLanguage'),
      Cell: ({ cell }: { cell: MRT_Cell<TranslationService> }) => getDisplayValue(cell.getValue())
    },
    {
      accessorKey: 'target_language',
      header: t('services.table.targetLanguage'),
      Cell: ({ cell }: { cell: MRT_Cell<TranslationService> }) => getDisplayValue(cell.getValue())
    },
    {
      accessorKey: 'priority',
      header: t('services.table.priority'),
      Cell: ({ cell }: { cell: MRT_Cell<TranslationService> }) => getDisplayValue(cell.getValue())
    },
    {
      accessorKey: 'cost',
      header: t('services.table.cost'),
      Cell: ({ cell }: { cell: MRT_Cell<TranslationService> }) => getDisplayValue(cell.getValue())
    },
    {
      accessorKey: 'created_at',
      header: t('services.table.createdAt'),
      Cell: ({ cell }: { cell: MRT_Cell<TranslationService> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'updated_at',
      header: t('services.table.updatedAt'),
      Cell: ({ cell }: { cell: MRT_Cell<TranslationService> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'actions',
      header: t('services.table.actions'),
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }: { row: MRT_Row<TranslationService> }) => {
        const serviceId = row.original.id
        return (
          <div className='flex items-center'>
            {hasPermissions(userPermissions, ['change_transservice']) && (
              <Tooltip
                title={!isClientActive ? t('services.table.inactiveClientEditMessage') : ''}
                placement='top'
                arrow
                slotProps={{
                  tooltip: {
                    className: '!bg-backgroundPaper !text-textPrimary !text-center'
                  }
                }}
              >
                <span>
                  <Button
                    variant='outlined'
                    disabled={!isClientActive}
                    className='min-w-fit inline-flex items-center justify-center p-2 rounded-full bg-transparent hover:bg-[#e1def514] border-none'
                    onClick={() => {
                      handleOpen('edit', row.original), setServiceID(serviceId.toString())
                    }}
                  >
                    <i className='tabler-edit text-textSecondary w-[22px] h-[22px]' />
                  </Button>
                </span>
              </Tooltip>
            )}
            {hasPermissions(userPermissions, ['view_transservice']) && (
              <Button
                variant='outlined'
                className='min-w-fit inline-flex items-center justify-center p-2 rounded-full bg-transparent hover:bg-[#e1def514] border-none'
                onClick={() => handleOpen('view', row.original)}
              >
                <i className='tabler-eye text-textSecondary w-[22px] h-[22px]' />
              </Button>
            )}
            {hasPermissions(userPermissions, ['delete_transservice']) && (
              <IconButton
                onClick={() => {
                  setTransServiceId(row.original.id)
                  setDelName(row.original.translation_type)
                  setOpenDeleteModal(true)
                }}
              >
                <i className='tabler-trash text-textSecondary' />
              </IconButton>
            )}
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
        rowCount={servicesData?.data?.count || 0}
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
          sorting,
          globalFilter,
          rowSelection,
          columnVisibility: tableState.columnVisibility,
          density: tableState.density,
          isFullScreen: tableState.isFullScreen
        }}
        onColumnVisibilityChange={updateColumnVisibility}
        onDensityChange={updateDensity}
        onIsFullScreenChange={updateFullScreen}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        muiPaginationProps={{
          getItemAriaLabel: type => t(`table.pagination.${type}`)
        }}
        renderTopToolbarCustomActions={() => (
          <div className='flex items-center gap-3'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder={t('services.table.serviceSearchPlaceholder')}
            />
            {Object.keys(rowSelection).length > 0 && (
              <div className='flex items-center gap-3'>
                <Typography variant='body2' color='text.secondary'>
                  {Object.keys(rowSelection).length} {t('table.recordsSelected')} {t('table.of')}{' '}
                  {servicesData?.data?.count}
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
      <DeleteConfModal
        title={'Confirm Delete'}
        deleteValue={multiple ? '' : delName}
        open={openDeleteModal}
        handleClose={() => setOpenDeleteModal(false)}
        handleDelete={() =>
          multiple
            ? handleDeleteTransServicesBulk(Object.keys(rowSelection).map(key => Number(key)))
            : handleDeleteTransService()
        }
      />
    </div>
  )
}

export default TransServicesTable
