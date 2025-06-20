'use client'

// React Imports
import type { FC } from 'react'
import { useState, useEffect, useMemo, Dispatch, SetStateAction } from 'react'

// Next Imports
import { usePathname, useParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import { Button, Chip, IconButton, Switch, useColorScheme } from '@mui/material'

// Material React Table Import
import { MaterialReactTable, MRT_SortingState, MRT_ColumnDef, MRT_Cell, MRT_Row } from 'material-react-table'

// Custom / Local Imports
import CustomTextField from '@core/components/mui/TextField'

// Type Imports
import type { InvoiceType } from '@/types/apps/invoiceTypes'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import StatusConfModal from '@/components/statusConfirmationModal'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import { LawyerClientTypes } from '@/types/lawyerClients'
import { useLawyerClientsHooks } from '@/services/lawyerClients'
import { exportLawyerClientsToCSV } from './exportLawyerClientCsv'
import AddLawyerClientModal from '@/components/create-edit-lawyer-clients'
import { toast } from 'react-toastify'
import LawyerClientDetailsCard from '@/views/pages/lawyer-client-and-leads-details/userDetailsCard'
import { useTranslation } from 'react-i18next'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { useTableState } from '@/hooks/useTableState'

interface LawyerClientTableProps {
  lawyerClientsData: LawyerClientTypes[]
  totalRecords: number
  pagination: { pageSize: number; pageIndex: number }
  setPagination: Dispatch<SetStateAction<{ pageIndex: number; pageSize: number }>>
  globalFilter: string
  setGlobalFilter: (value: string) => void
  isLoading: boolean
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
      label={t('lawyerClients.table.search')}
      {...props}
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  )
}

const LawyerClientTable: FC<LawyerClientTableProps> = ({
  lawyerClientsData,
  totalRecords,
  pagination,
  setPagination,
  globalFilter,
  setGlobalFilter,
  isLoading,
  sorting,
  setSorting
}) => {
  const pathName = usePathname()
  const { useEditLawyerClient, useDeleteLawyerClient, useDeleteLawyerClientBulk } = useLawyerClientsHooks()
  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const userPermissions = useAuthStore(state => state.userPermissions)
  const { mode: themeMode } = useColorScheme()
  // Actions
  const updateEditLawyerClient = useEditLawyerClient()
  const deleteLawyerClient = useDeleteLawyerClient()
  const deleteLawyerClientBulk = useDeleteLawyerClientBulk()

  // Local states
  const [data, setData] = useState<LawyerClientTypes[]>([])
  const [status, setStatus] = useState<InvoiceType['invoiceStatus']>('')
  const [showViewModal, setShowViewModal] = useState(false)
  const [mode, setMode] = useState<'edit' | 'create'>('create')
  const [selectedData, setSelectedData] = useState<LawyerClientTypes | null>(null)
  const [delName, setDelName] = useState<string>('')
  const [open, setOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [lawyerClientId, setLawyerClientId] = useState<number | null>(null)
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    lawyerClientId: number
    newStatus: boolean
    userName: string
  } | null>(null)
  const [promotionModalOpen, setPromotionModalOpen] = useState(false)
  const [pendingPromotion, setPendingPromotion] = useState<{
    lawyerClientId: number
    userName: string
  } | null>(null)

  // Update local data when lawyerClientsData changes
  useEffect(() => {
    setData(lawyerClientsData)
  }, [lawyerClientsData])

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  const handleDeleteClient = () => {
    if (lawyerClientId === null) return
    deleteLawyerClient.mutate(lawyerClientId, {
      onSuccess: () => {
        toast.success(`${pathName?.includes('/lawyer-clients') ? 'Client' : 'Lead'} deleted successfully`)
        setData(prevData => prevData?.filter(lawyerClient => lawyerClient.id !== lawyerClientId))
        setOpen(false)
      }
    })
  }

  const handleBulkDelete = (ids: number[]) => {
    if (!ids.length === null) return
    deleteLawyerClientBulk.mutate(ids, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((totalRecords - ids.length) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        setOpen(false)
        setRowSelection({})
        toast.success(`${pathName?.includes('/lawyer-clients') ? 'Clients' : 'Leads'} deleted successfully`)
      }
    })
    setMultiple(false)
  }

  const handleActiveStatusChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    lawyerClientId: number,
    userName: string
  ) => {
    const newStatus = event.target.checked
    setPendingStatusChange({ lawyerClientId, newStatus, userName })
    setStatusModalOpen(true)
  }

  const handlePromoteToClient = (lawyerClientId: number, userName: string) => {
    setPendingPromotion({ lawyerClientId, userName })
    setPromotionModalOpen(true)
  }

  const handlePromotionConfirm = () => {
    if (!pendingPromotion) return

    updateEditLawyerClient.mutate(
      { id: Number(pendingPromotion.lawyerClientId), client_type: 'client' },
      {
        onSuccess: () => {
          toast.success(`${pendingPromotion?.userName} promoted to client`)
          setPromotionModalOpen(false)
          setPendingPromotion(null)
        }
      }
    )
  }

  const handleStatusConfirm = () => {
    if (!pendingStatusChange) return
    const { lawyerClientId, newStatus } = pendingStatusChange

    // Only handle status change
    setData(prevData =>
      prevData.map(lawyerClient =>
        lawyerClient.id === lawyerClientId ? { ...lawyerClient, is_active: newStatus } : lawyerClient
      )
    )

    updateEditLawyerClient.mutate(
      { id: lawyerClientId, is_active: newStatus },
      {
        onSuccess: () => {
          toast.success(`${pendingStatusChange?.userName}'s status changed to ${newStatus ? 'Active' : 'Inactive'}`)
          setStatusModalOpen(false)
          setPendingStatusChange(null)
        }
      }
    )
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState(
    pathName?.includes('/lawyer-clients') ? 'lawyerClients' : 'lawyerLeads'
  )

  const columns = useMemo<MRT_ColumnDef<LawyerClientTypes, any>[]>(
    () => [
      {
        accessorKey: 'first_name',
        header: t('lawyerClients.table.name'),
        Cell: ({ row }: { row: MRT_Row<LawyerClientTypes> }) => (
          <div className='flex items-center gap-4'>
            <div className='flex flex-col'>
              <Typography className='font-medium hover:text-primary truncate' color='text.primary'>
                {getDisplayValue(
                  [row.original.first_name, row.original.middle_name, row.original.last_name].filter(Boolean).join(' ')
                )}
              </Typography>
            </div>
          </div>
        )
      },
      {
        accessorKey: 'email',
        header: t('lawyerClients.table.email'),
        Cell: ({ cell }: { cell: MRT_Cell<LawyerClientTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'date_of_birth',
        header: t('lawyerClients.table.dateOfBirth'),
        Cell: ({ cell }: { cell: MRT_Cell<LawyerClientTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'is_active',
        header: t('lawyerClients.table.status'),
        Cell: ({ cell }: { cell: MRT_Cell<LawyerClientTypes> }) => (
          <Chip
            label={cell.getValue() ? t('lawyerClients.table.active') : t('lawyerClients.table.inactive')}
            color={cell.getValue() ? 'success' : 'error'}
            size='small'
            variant='tonal'
          />
        )
      },
      {
        accessorKey: 'created_at',
        header: t('lawyerClients.table.createdAt'),
        Cell: ({ cell }: { cell: MRT_Cell<LawyerClientTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'updated_at',
        header: t('lawyerClients.table.updatedAt'),
        Cell: ({ cell }: { cell: MRT_Cell<LawyerClientTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'actions',
        header: t('lawyerClients.table.actions'),
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }: { row: MRT_Row<LawyerClientTypes> }) => (
          <div className='flex items-center'>
            {hasPermissions(userPermissions, ['change_lawyerclient']) && (
              <Switch
                checked={row.original.is_active}
                onChange={event => handleActiveStatusChange(event, row.original.id, row.original.first_name)}
                inputProps={{ 'aria-label': 'controlled' }}
                color='success'
              />
            )}
            {hasPermissions(userPermissions, ['delete_lawyerclient']) && (
              <IconButton
                onClick={() => {
                  setLawyerClientId(row.original.id)
                  setDelName(row.original.first_name)
                  setOpen(true)
                }}
              >
                <i className='tabler-trash text-textSecondary' />
              </IconButton>
            )}
            {hasPermissions(userPermissions, ['change_lawyerclient']) && (
              <IconButton
                onClick={() => {
                  setMode('edit')
                  setSelectedData(row.original)
                  setShowViewModal(true)
                }}
              >
                <i className='tabler-edit text-textSecondary' />
              </IconButton>
            )}
            {pathName?.includes('lead') && hasPermissions(userPermissions, ['change_lawyerclient']) && (
              <IconButton onClick={() => handlePromoteToClient(row.original.id, row.original.first_name)}>
                <i className='tabler-upload text-textSecondary' />
              </IconButton>
            )}
          </div>
        )
      }
    ],
    [t]
  )

  const filteredData = useMemo(() => {
    if (status === '') return data
    return data.filter(client => (status === 'Active' ? client.is_active : !client.is_active))
  }, [status, data])

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex items-center justify-between'>
        <Typography variant='h3'>
          {pathName?.includes('/lawyer-clients') ? t('lawyerClients.title') : t('lawyerClients.leads')}
        </Typography>
        <div className='flex flex-row gap-2'>
          {hasPermissions(userPermissions, ['delete_lawyerclient']) && Object.keys(rowSelection).length ? (
            <Button
              variant='contained'
              color='error'
              onClick={() => {
                setMultiple(true)
                setOpen(true)
              }}
              sx={{ padding: '0.5rem 1rem' }}
            >
              {pathName?.includes('/lawyer-clients') ? t('lawyerClients.delete') : t('lawyerClients.deleteLead')}
            </Button>
          ) : (
            <></>
          )}
          {hasPermissions(userPermissions, ['add_lawyerclient']) && (
            <Button
              variant='contained'
              color='primary'
              onClick={() => {
                setMode('create')
                setShowViewModal(true)
              }}
              sx={{ padding: '0.5rem 1rem' }}
            >
              {pathName?.includes('/lawyer-clients') ? t('lawyerClients.create') : t('lawyerClients.createLead')}
            </Button>
          )}
        </div>
      </div>
      <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
        <MaterialReactTable
          columns={columns}
          data={filteredData}
          manualPagination={true}
          rowCount={totalRecords}
          enableGlobalFilter={false}
          enableColumnFilters={true}
          enableExpanding
          enableRowSelection
          positionToolbarAlertBanner='none'
          onRowSelectionChange={setRowSelection}
          getRowId={row => String(row.id)}
          enableSorting={filteredData && filteredData?.length > 1 ? true : false}
          manualSorting={true}
          renderDetailPanel={({ row }) => <LawyerClientDetailsCard row={row.original} />}
          state={{
            pagination,
            globalFilter,
            isLoading,
            sorting,
            rowSelection,
            columnVisibility: tableState.columnVisibility,
            density: tableState.density,
            isFullScreen: tableState.isFullScreen
          }}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          muiPaginationProps={{
            getItemAriaLabel: type => t(`table.pagination.${type}`)
          }}
          onColumnVisibilityChange={updateColumnVisibility}
          onDensityChange={updateDensity}
          onIsFullScreenChange={updateFullScreen}
          localization={{
            noRecordsToDisplay: t('table.noData'),
            rowsPerPage: t('table.rowsPerPage'),
            of: t('table.of'),
            search: t('table.search')
          }}
          renderTopToolbarCustomActions={() => (
            <div className='flex items-center gap-3'>
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                placeholder={
                  pathName?.includes('/lawyer-clients')
                    ? t('lawyerClients.table.search')
                    : t('lawyerClients.table.search')
                }
              />
              <CustomTextField
                select
                id='select-status'
                value={status}
                onChange={e => setStatus(e.target.value)}
                className='max-sm:is-full sm:is-[130px]'
                slotProps={{
                  select: { displayEmpty: true }
                }}
              >
                <MenuItem value=''>{t('lawyerClients.table.allStatus')}</MenuItem>
                <MenuItem value='Active'>{t('lawyerClients.table.active')}</MenuItem>
                <MenuItem value='Inactive'>{t('lawyerClients.table.inactive')}</MenuItem>
              </CustomTextField>
              <IconButton
                onClick={() => {
                  const filteredData = data.filter(client => {
                    // Apply status filter
                    if (status === 'Active' && !client.is_active) return false
                    if (status === 'Inactive' && client.is_active) return false

                    // Apply search filter if exists
                    if (globalFilter) {
                      const searchStr = [client.first_name, client.middle_name, client.last_name, client.email]
                        .filter(Boolean)
                        .join(' ')
                        .toLowerCase()
                      return searchStr.includes(globalFilter.toLowerCase())
                    }

                    return true
                  })
                  exportLawyerClientsToCSV(filteredData)
                }}
                title={t('table.export')}
              >
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
      {/* Modal for Lawyer Client Create / Edit */}
      <AddLawyerClientModal
        open={showViewModal}
        handleClose={setShowViewModal}
        title={
          pathName?.includes('/lawyer-clients')
            ? t(`lawyerClients.modes.${mode}`) + '  ' + t('lawyerClients.title')
            : t(`lawyerClients.modes.${mode}`) + '  ' + t('lawyerClients.leads')
        }
        mode={mode}
        lawyerClientData={mode === 'edit' ? selectedData : null}
        entity={pathName?.includes('/lawyer-clients') ? 'client' : 'lead'}
      />

      {/* Modal for Delete */}
      <DeleteConfModal
        open={open}
        title={t('lawyerClients.table.confirmDelete')}
        deleteValue={multiple ? '' : delName}
        handleClose={() => setOpen(false)}
        handleDelete={() =>
          multiple ? handleBulkDelete(Object.keys(rowSelection).map(key => Number(key))) : handleDeleteClient()
        }
      />

      {/* Modal for Update Status */}
      <StatusConfModal
        open={statusModalOpen}
        handleClose={() => {
          setStatusModalOpen(false)
          setPendingStatusChange(null)
        }}
        handleStatusChange={handleStatusConfirm}
        title={t('lawyerClients.table.confirmStatusChange')}
        userName={pendingStatusChange?.userName || ''}
        newStatus={pendingStatusChange?.newStatus || false}
        message={t('lawyerClients.table.statusChangeMessage', {
          name: pendingStatusChange?.userName,
          status: pendingStatusChange?.newStatus ? t('lawyerClients.table.active') : t('lawyerClients.table.inactive')
        })}
      />

      {/* Modal for Promote Lawyer Lead to Client */}
      <StatusConfModal
        open={promotionModalOpen}
        handleClose={() => {
          setPromotionModalOpen(false)
          setPendingPromotion(null)
        }}
        handleStatusChange={handlePromotionConfirm}
        title={t('lawyerClients.table.promoteToClient')}
        userName={pendingPromotion?.userName || ''}
        newStatus={null}
        message={t('lawyerClients.table.promotionMessage', {
          name: pendingPromotion?.userName
        })}
      />
    </div>
  )
}

export default LawyerClientTable
