'use client'

// React Imports
import type { FC } from 'react'
import { useState, useEffect, useMemo, Dispatch, SetStateAction } from 'react'


// Next Imports
import { usePathname, useParams } from 'next/navigation'
import { useTranslation } from 'next-i18next'

// MUI Imports
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import { Button, IconButton, Switch, Chip } from '@mui/material'
import { useColorScheme } from '@mui/material/styles'

// Material React Table Import
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_Cell,
  MRT_Row,
  MRT_SortingState
} from 'material-react-table'

// Custom / Local Imports
import CustomTextField from '@core/components/mui/TextField'
import UserDetailsCard from '@/views/pages/client-and-lead-details/userDetailsCard'
import AddClientModal from '@/components/dialogs/edit-user-info'
import { exportClientsToCSV } from './exportCsv'
import { useClientHooks } from '@/services/useClientHook'
import { useTableState } from '@/hooks/useTableState'

// Type Imports
import type { InvoiceType } from '@/types/apps/invoiceTypes'
import type { Client } from '@/types/apps/TableDataTypes'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import StatusConfModal from '@/components/statusConfirmationModal'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'react-toastify'


interface CommonTableProps {
  clientsData: Client[]
  totalRecords: number
  pagination: { pageSize: number; pageIndex: number }
  setPagination: Dispatch<SetStateAction<{ pageIndex: number; pageSize: number }>>;
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

  return <CustomTextField label={t('clientTable.search')} {...props} value={value} onChange={(e) => setValue(e.target.value)} />
}

const CommonTable: FC<CommonTableProps> = ({
  clientsData,
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
  const userPermissions = useAuthStore(state => state.userPermissions)
  const { useDeleteClient, useUpdateClient, useDeleteClientBulk } = useClientHooks()
  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { mode: themeMode } = useColorScheme()

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState(
    pathName?.includes('/clients') ? 'clients' : 'leads'
  )

  // Actions
  const deleteClientMutation = useDeleteClient()
  const deleteClientMutationBulk = useDeleteClientBulk()
  const updateClientMutation = useUpdateClient()

  // Local states
  const [data, setData] = useState<Client[]>([])
  const [status, setStatus] = useState<InvoiceType['invoiceStatus']>('')
  const [showViewModal, setShowViewModal] = useState(false)
  const [mode, setMode] = useState<'edit' | 'create'>('create')
  const [selectedData, setSelectedData] = useState<Client | null>(null)
  const [delName, setDelName] = useState<string>('')
  const [open, setOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [clientId, setClientId] = useState<number | null>(null)
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    clientId: number
    newStatus: boolean
    userName: string
  } | null>(null)
  const [promotionModalOpen, setPromotionModalOpen] = useState(false)
  const [pendingPromotion, setPendingPromotion] = useState<{
    clientId: number
    userName: string
  } | null>(null)

  // Update local data when clientsData changes
  useEffect(() => {
    setData(clientsData)
  }, [clientsData])

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  const handleDeleteClient = () => {
    if (clientId === null) return
    deleteClientMutation.mutate(clientId, {
      onSuccess: () => {
        setData((prevData) => prevData?.filter((client) => client.id !== clientId))
        setOpen(false)
      }
    })
  }

  const handleBulkDelete = (ids: number[]) => {
    if (!ids.length === null) return
    deleteClientMutationBulk.mutate(ids, {
      onSuccess: () => {
        setOpen(false)
        setRowSelection({})
        toast.success(`${pathName?.includes('/clients') ? 'Clients' : 'Leads'} deleted successfully`)
      }
    })
    setMultiple(false)
  }

  const handleActiveStatusChange = (event: React.ChangeEvent<HTMLInputElement>, clientId: number, userName: string) => {
    const newStatus = event.target.checked
    setPendingStatusChange({ clientId, newStatus, userName })
    setStatusModalOpen(true)
  }

  const handleStatusConfirm = () => {
    if (!pendingStatusChange) return
    const { clientId, newStatus } = pendingStatusChange

    // Only handle status change
    setData((prevData) =>
      prevData.map((client) => (client.id === clientId ? { ...client, is_active: newStatus } : client))
    )

    updateClientMutation.mutate({ id: clientId, is_active: newStatus })

    setStatusModalOpen(false)
    setPendingStatusChange(null)
  }

  const handlePromoteToClient = (clientId: number, userName: string) => {
    setPendingPromotion({ clientId, userName })
    setPromotionModalOpen(true)
  }

  const handlePromotionConfirm = () => {
    if (!pendingPromotion) return

    // Only update client type, don't change status
    updateClientMutation.mutate(
      { id: Number(pendingPromotion.clientId), client_type: 'client' },
      {
        onSuccess: () => {
          setPromotionModalOpen(false)
          setPendingPromotion(null)
        }
      }
    )
  }

  const columns = useMemo<MRT_ColumnDef<Client, any>[]>(() => [
    {
      accessorKey: 'first_name',
      header: 'Name',
      Header: () => <span>{t('clientTable.name')}</span>,
      Cell: ({ row }: { row: MRT_Row<Client> }) => (
        <div className='flex items-center gap-4'>
          <div className='flex flex-col'>
            <Typography className='font-medium hover:text-primary truncate' color='text.primary'>
              {getDisplayValue([row.original.first_name, row.original.middle_name, row.original.last_name].filter(Boolean).join(' '))}
            </Typography>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'email',
      header: 'Email',
      Header: () => <span>{t('clientTable.email')}</span>,
      Cell: ({ cell }: { cell: MRT_Cell<Client> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayValue(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'date_of_birth',
      header: 'Date of Birth',
      Header: () => <span>{t('clientTable.dateOfBirth')}</span>,
      Cell: ({ cell }: { cell: MRT_Cell<Client> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayValue(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'customer_country',
      header: 'Country',
      Header: () => <span>{t('clientTable.country')}</span>,
      Cell: ({ cell }: { cell: MRT_Cell<Client> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayValue(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      Header: () => <span>{t('clientTable.status')}</span>,
      Cell: ({ cell }: { cell: MRT_Cell<Client> }) => {
        const isActive = cell.getValue()
        return (
          <Chip
            label={isActive ? t('clientTable.active') : t('clientTable.inactive')}
            color={isActive ? 'success' : 'error'}
            size="small"
            variant='tonal'
          />
        )
      }
    },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      Header: () => <span>{t('clientTable.createdAt')}</span>,
      Cell: ({ cell }: { cell: MRT_Cell<Client> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'updated_at',
      header: 'Updated At',
      Header: () => <span>{t('clientTable.updatedAt')}</span>,
      Cell: ({ cell }: { cell: MRT_Cell<Client> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'actions',
      Header: () => <span>{t('clientTable.action')}</span>, header: 'Action',
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }: { row: MRT_Row<Client> }) => (
        <div className='flex items-center'>
          {hasPermissions(userPermissions, ['change_transclient']) && (
            <Switch
              checked={row.original.is_active}
              onChange={(event) => handleActiveStatusChange(event, row.original.id, row.original.first_name)}
              inputProps={{ 'aria-label': 'controlled' }}
              color='success'
            />
          )}
          {hasPermissions(userPermissions, ['delete_transclient']) && (
            <IconButton
              onClick={() => {
                setClientId(row.original.id)
                setDelName(row.original.first_name)
                setOpen(true)
              }}
            >
              <i className='tabler-trash text-textSecondary' />
            </IconButton>)}
          {hasPermissions(userPermissions, ['change_transclient']) && (
            <IconButton
              onClick={() => {
                setMode('edit')
                setSelectedData(row.original)
                setShowViewModal(true)
              }}
            >
              <i className='tabler-edit text-textSecondary' />
            </IconButton>)}
          {hasPermissions(userPermissions, ['change_transclient']) && (
            pathName?.includes('lead') && (
              <IconButton
                onClick={() => handlePromoteToClient(row.original.id, row.original.first_name)}
              >
                <i className='tabler-upload text-textSecondary' />
              </IconButton>
            )
          )}
        </div>
      ),
    }
  ], [t])

  const filteredData = useMemo(() => {
    if (status === '') return data
    return data.filter((client) => (status === 'Active' ? client.is_active : !client.is_active))
  }, [status, data])

  return (
    <div className='flex flex-col gap-8'>
      {/* Header and Create Button */}
      <div className='flex items-center justify-between'>
        <Typography variant='h3'>
          {pathName?.includes('/clients') ? t('clientTable.clients') : t('clientTable.leads')}
        </Typography>
        <div className='flex flex-row gap-2'>
          {hasPermissions(userPermissions, ['delete_transclient']) && Object.keys(rowSelection).length ? (
            <Button
              variant='contained'
              color='error'
              onClick={() => {
                setMultiple(true)
                setOpen(true)
                setDelName('')
              }}
              sx={{ padding: '0.5rem 1rem' }}
            >
              {t(pathName?.includes('/clients') ? 'clientTable.delBtnlabelBulk' : 'clientTable.delBtnLeadlabelBulk')}
            </Button>
          ) : (
            <></>
          )}
          {hasPermissions(userPermissions, ['add_transclient']) && (
            <Button
              variant='contained'
              color='primary'
              onClick={() => {
                setMode('create')
                setShowViewModal(true)
              }}
              sx={{ padding: '0.5rem 1rem' }}
            >
              {t(pathName?.includes('/clients') ? 'clientTable.createClient' : 'clientTable.createLead')}
            </Button>
          )}
        </div>
      </div>
      <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
        <MaterialReactTable
          columns={columns}
          data={filteredData}
          manualPagination={true}
          manualSorting={true}
          rowCount={totalRecords}
          enableGlobalFilter={false}
          enableColumnFilters={true}
          enableExpanding
          enableRowSelection
          onRowSelectionChange={setRowSelection}
          getRowId={row => String(row.id)}
          enableSorting={filteredData && filteredData?.length > 1 ? true : false}
          renderDetailPanel={({ row }) => <UserDetailsCard row={row.original} isLeadOrClient={true} />}
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
          onColumnVisibilityChange={updateColumnVisibility}
          onDensityChange={updateDensity}
          onIsFullScreenChange={updateFullScreen}
          localization={{
            noRecordsToDisplay: t('table.noRecords'),
            rowsPerPage: t('table.rowsPerPage'),
            of: t('table.of'),
          }}
          renderTopToolbarCustomActions={() => (
            <div className='flex items-center gap-3'>
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={(value) => setGlobalFilter(String(value))}
                placeholder={pathName?.includes('/clients') ? t('clientTable.search') : t('clientTable.search')}
              />
              <CustomTextField
                select
                id='select-status'
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className='max-sm:is-full sm:is-[130px]'
                slotProps={{
                  select: { displayEmpty: true }
                }}
              >
                <MenuItem value=''>{t('clientTable.allStatus')}</MenuItem>
                <MenuItem value='Active'>{t('clientTable.active')}</MenuItem>
                <MenuItem value='Inactive'>{t('clientTable.inactive')}</MenuItem>
              </CustomTextField>
              <IconButton onClick={() => exportClientsToCSV(data)}>
                <i className='tabler-file-download text-[28px] cursor-pointer' />
              </IconButton>
            </div>
          )}
        />
      </div>
      {/* Modal for Create / Edit */}
      <AddClientModal
        open={showViewModal}
        handleClose={setShowViewModal}
        title={
          pathName?.includes('/clients')
            ? `Client ${mode.charAt(0).toUpperCase() + mode.slice(1)}`
            : `Lead ${mode.charAt(0).toUpperCase() + mode.slice(1)}`
        }
        mode={mode}
        clientData={mode === 'edit' ? selectedData : null}
        entity={pathName?.includes('/clients') ? 'client' : 'lead'}
      />
      {/* Modal for Delete */}
      <DeleteConfModal
        title={t('lawyerClients.table.confirmDelete')}
        deleteValue={delName}
        open={open}
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
        title={t('clientTable.confirmStatusChange')}
        userName={pendingStatusChange?.userName || ''}
        newStatus={pendingStatusChange?.newStatus || false}
        message={`${t('modal.confirmation.status.message')} ${pendingStatusChange?.userName} - ${pendingStatusChange?.newStatus ? t('clientTable.active') : t('clientTable.inactive')}`}
      />
      {/* Modal for Promote Lead to Client */}
      <StatusConfModal
        open={promotionModalOpen}
        handleClose={() => {
          setPromotionModalOpen(false)
          setPendingPromotion(null)
        }}
        handleStatusChange={handlePromotionConfirm}
        title={t('clientTable.promoteToClient')}
        userName={pendingPromotion?.userName || ''}
        newStatus={true}
        message={`${t('modal.confirmation.promotion.message')} ${pendingPromotion?.userName} ${t('clientTable.toClient')}`}
      />
    </div>
  )
}

export default CommonTable
