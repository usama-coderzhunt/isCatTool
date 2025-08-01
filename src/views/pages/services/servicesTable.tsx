'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'next-i18next'
import { MaterialReactTable, MRT_SortingState, type MRT_Cell, type MRT_Row } from 'material-react-table'
import { Button, IconButton, Typography, useColorScheme } from '@mui/material'
import { useServicesHooks } from '@/services/useServicesHooks'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import ServiceDetailsCard from './serviceDetailsCard'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import { hasPermissions } from '@/utils/permissionUtils'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import CustomTextField from '@/@core/components/mui/TextField'
import { useTableState } from '@/hooks/useTableState'
import { toast } from 'react-toastify'
import { usePaginatedSearch } from '@/utils/usePaginatedSearch'
import { exportServicesToCSV } from '@/views/apps/commonTable/tableExport'

export type Service = {
  id: number
  created_at: string
  updated_at: string
  name: string
  slug: string
  description: string | null
  service_type: string
  price: string
  price_before_discount: string | null
  billing_cycle: string | null
  trial_period_days: number | null
  features: Record<string, any>
  additional_info: {
    badge_text: string | null
    badge_color: string | null
    additional_information: string | null
  }
  is_active: boolean
  created_by: number
  updated_by: number | null
  categories: number[]
}

interface ServicesTableProps {
  handleOpen: (mode: 'view' | 'create' | 'edit', service?: Service) => void
  setServiceID: (id: number) => void
  userPermissions: { codename: string }[]
  rowSelection: any
  setRowSelection: any
  setMultiple: any
  multiple: boolean
  openDeleteModal: boolean
  setOpenDeleteModal: any
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
}) => {
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
  }, [value])

  return (
    <CustomTextField
      label={t('groups.search')}
      {...props}
      value={value}
      onChange={e => setValue(e.target.value)}
      shrinkLabel={false}
    />
  )
}

const ServicesTable: React.FC<ServicesTableProps> = ({
  handleOpen,
  setServiceID,
  userPermissions,
  rowSelection,
  setRowSelection,
  multiple,
  setMultiple,
  openDeleteModal,
  setOpenDeleteModal
}) => {
  const { mode: themeMode } = useColorScheme()
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState('')
  const [delName, setDelName] = useState('')
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null)
  const { pagination, setPagination, appliedSearch } = usePaginatedSearch({
    initialPageSize: 5,
    globalFilter
  })

  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  const { getServices, useDeleteService, useDeleteServiceBulk } = useServicesHooks()
  const { data: servicesData, isLoading } = getServices(
    pagination.pageSize,
    pagination.pageIndex + 1,
    getOrderingParam(sorting),
    appliedSearch
  )

  const { mutate: deleteService } = useDeleteService()
  const { mutate: deleteServiceBulk } = useDeleteServiceBulk()

  const handleDeleteService = () => {
    if (serviceToDelete !== null) {
      deleteService(serviceToDelete, {
        onSuccess: () => {
          const newTotalPages = Math.ceil((servicesData?.data?.count - 1) / pagination.pageSize)
          if (pagination.pageIndex >= newTotalPages) {
            setPagination(prev => ({
              ...prev,
              pageIndex: Math.max(0, newTotalPages - 1)
            }))
          }
          toast.success(t('services.toasts.serviceDeletedSuccess'))
          setOpenDeleteModal(false)
          setServiceToDelete(null)
        }
      })
    }
  }

  const handleDeleteServiceBulk = (ids: number[]) => {
    if (!ids.length === null) return
    deleteServiceBulk(ids, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((servicesData?.data?.count || 0) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        toast.success(t('services.toasts.serviceDeletedBulkSuccess'))
        setMultiple(false)
        setOpenDeleteModal(false)
        setRowSelection({})
      }
    })
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('services')

  const data = servicesData?.data?.results ?? []
  const totalCount = servicesData?.data?.count ?? 0

  const columns = [
    {
      accessorKey: 'name',
      header: t('services.name'),
      Cell: ({ cell }: { cell: MRT_Cell<Service> }) => getDisplayValue(cell.getValue())
    },
    {
      accessorKey: 'short_description',
      header: t('services.shortDescription'),
      Cell: ({ cell }: { cell: MRT_Cell<Service> }) => {
        const shortDescription = cell.getValue() as string
        return (
          <div className='truncate max-w-[200px]'>
            {shortDescription ? shortDescription.replace(/<[^>]*>/g, '') : '-'}
          </div>
        )
      }
    },
    {
      accessorKey: 'created_at',
      header: t('services.createdAt'),
      Cell: ({ cell }: { cell: MRT_Cell<Service> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'updated_at',
      header: t('services.updatedAt'),
      Cell: ({ cell }: { cell: MRT_Cell<Service> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'actions',
      header: t('services.actions'),
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }: { row: MRT_Row<Service> }) => {
        const serviceId = row.original.id
        const serviceName = row.original.name
        return (
          <div className='flex items-center gap-2'>
            {hasPermissions(userPermissions, ['change_servicesection']) && (
              <IconButton
                onClick={() => {
                  handleOpen('edit', row.original)
                  setServiceID(serviceId)
                }}
              >
                <i className='tabler-edit text-textSecondary' />
              </IconButton>
            )}
            {hasPermissions(userPermissions, ['delete_servicesection']) && (
              <IconButton
                onClick={() => {
                  setDelName(serviceName)
                  setServiceToDelete(serviceId)
                  setOpenDeleteModal(true)
                }}
              >
                <i className='tabler-trash text-textSecondary' />
              </IconButton>
            )}
            <IconButton onClick={() => router.push(`/${currentLocale}/dashboard/service/${row.original.slug}`)}>
              <i className='tabler-eye text-textSecondary' />
            </IconButton>
          </div>
        )
      }
    }
  ]

  const renderDetailPanel = ({ row }: { row: MRT_Row<Service> }) => {
    return <ServiceDetailsCard row={row.original} />
  }

  return (
    <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
      <MaterialReactTable
        columns={columns}
        data={data}
        enableGlobalFilter={false}
        enableColumnFilters={true}
        manualPagination
        manualSorting={true}
        enableSorting={data && data?.length > 1 ? true : false}
        onSortingChange={setSorting}
        rowCount={totalCount}
        renderDetailPanel={renderDetailPanel}
        enableExpanding
        enableRowSelection
        positionToolbarAlertBanner='none'
        onRowSelectionChange={setRowSelection}
        getRowId={row => String(row.id)}
        state={{
          isLoading,
          pagination,
          sorting,
          globalFilter,
          rowSelection,
          columnVisibility: tableState.columnVisibility,
          density: tableState.density,
          isFullScreen: tableState.isFullScreen
        }}
        onPaginationChange={setPagination}
        onColumnVisibilityChange={updateColumnVisibility}
        onDensityChange={updateDensity}
        onIsFullScreenChange={updateFullScreen}
        displayColumnDefOptions={{
          'mrt-row-expand': {
            size: 50,
            enableResizing: false
          }
        }}
        localization={{
          noRecordsToDisplay: t('table.noData'),
          rowsPerPage: t('table.rowsPerPage'),
          of: t('table.of')
        }}
        renderTopToolbarCustomActions={() => (
          <div className='flex items-center gap-3'>
            <DebouncedInput value={globalFilter ?? ''} onChange={value => setGlobalFilter(String(value))} />
            <IconButton onClick={() => exportServicesToCSV(data)} title={t('table.export')}>
              <i className='tabler-file-download text-[28px] cursor-pointer' />
            </IconButton>
            {Object.keys(rowSelection).length > 0 && (
              <div className='flex items-center gap-3'>
                <Typography variant='body2' color='text.secondary'>
                  {Object.keys(rowSelection).length} {t('table.recordsSelected')} {t('table.of')} {totalCount}
                </Typography>
                <Button variant='outlined' onClick={() => setRowSelection({})}>
                  {t('table.clearSelection')}
                </Button>
              </div>
            )}
          </div>
        )}
      />
      <DeleteConfModal
        title={t('services.confirmDelete')}
        deleteValue={multiple ? '' : delName}
        open={openDeleteModal}
        handleClose={() => setOpenDeleteModal(false)}
        handleDelete={() =>
          multiple ? handleDeleteServiceBulk(Object.keys(rowSelection).map(key => Number(key))) : handleDeleteService()
        }
      />
    </div>
  )
}

export default ServicesTable
