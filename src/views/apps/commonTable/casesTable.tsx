'use client'

import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Button, Chip, IconButton, MenuItem, Switch, Tooltip, Typography, useColorScheme } from '@mui/material'
import { MaterialReactTable, MRT_Cell, MRT_ColumnDef, MRT_Row, MRT_SortingState } from 'material-react-table'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import { CaseTypes } from '@/types/cases'
import AddCasesModal from '@/components/create-edit-cases'
import { useCasesHooks } from '@/services/useCases'
import { toast } from 'react-toastify'
import CustomTextField from '@/@core/components/mui/TextField'
import { InvoiceType } from '@/types/apps/invoiceTypes'
import CaseDetailsCard from '@/views/pages/cases/caseDetailsCard'
import { useTranslation } from 'react-i18next'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { useTableState } from '@/hooks/useTableState'
import StatusConfModal from '@/components/statusConfirmationModal'
import { exportCasesToCSV } from './tableExport'

interface CasesTableProps {
  casesData: CaseTypes[]
  totalRecords: number
  pagination: { pageSize: number; pageIndex: number }
  setPagination: Dispatch<SetStateAction<{ pageIndex: number; pageSize: number }>>
  isLoading: boolean
  setGlobalFilter: (value: string) => void
  globalFilter: string
  sorting: MRT_SortingState
  setSorting: (updater: MRT_SortingState | ((prev: MRT_SortingState) => MRT_SortingState)) => void
  clientId?: number
  setCaseStatus: Dispatch<SetStateAction<string | null>>
  caseStatus: string | null
  isClientActive?: boolean
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
      label={t('cases.table.search')}
      {...props}
      value={value}
      onChange={e => setValue(e.target.value)}
      shrinkLabel={false}
    />
  )
}

const CasesTable: FC<CasesTableProps> = ({
  casesData,
  totalRecords,
  pagination,
  setPagination,
  isLoading,
  setGlobalFilter,
  globalFilter,
  sorting,
  setSorting,
  clientId,
  setCaseStatus,
  caseStatus,
  isClientActive
}) => {
  const { t, i18n } = useTranslation('global')
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const userPermissions = useAuthStore(state => state.userPermissions)
  const { mode: themeMode } = useColorScheme()
  //States
  const [isDelModalOpen, setIsDelModalOpen] = useState(false)
  const [openAddCasesModal, setOpenAddCasesModal] = useState(false)
  const [data, setData] = useState<CaseTypes[]>([])
  const [selectedData, setSelectedData] = useState<CaseTypes | null>(null)
  const [mode, setMode] = useState<string | null>(null)
  const [caseId, setCaseId] = useState<number | null>(null)
  const [delName, setDelName] = useState<string>('')
  const [selectedClients, setSelectedClients] = useState<any>(null)
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)
  const [caseStatusChange, setCaseStatusChange] = useState<{
    caseId: number
    newStatus: boolean
    userName: string
  } | null>(null)
  const [caseStatusChangeModalOpen, setCaseStatusChangeModalOpen] = useState(false)

  // hooks
  const { useDeleteCase, useDeleteCaseBulk, useEditCase } = useCasesHooks()
  const { mutate: deleteCase } = useDeleteCase()
  const { mutate: deleteCaseBulk } = useDeleteCaseBulk()
  const { mutate: editCase } = useEditCase()

  useEffect(() => {
    setData(casesData)
  }, [[casesData]])

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  const handleCloseDeleteModal = () => {
    setIsDelModalOpen(false)
  }

  const handleDeleteCase = () => {
    if (caseId === null) return
    deleteCase(caseId, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((totalRecords - 1) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        toast.success(t('cases.table.toasts.caseDeletedSuccess'))
        setData(prevData => prevData?.filter(delCaseId => delCaseId.id !== caseId))
        setIsDelModalOpen(false)
      }
    })
  }

  const handleDeleteCaseBulk = (ids: number[]) => {
    if (!ids.length === null) return
    deleteCaseBulk(ids, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((totalRecords - ids.length) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        setIsDelModalOpen(false)
        setRowSelection({})
        toast.success(t('cases.table.toasts.caseDeletedBulkSuccess'))
      }
    })
    setMultiple(false)
  }

  const handleCaseStatusChange = (event: React.ChangeEvent<HTMLInputElement>, caseId: number, userName: string) => {
    const newStatus = event.target.checked
    setCaseStatusChange({ caseId, newStatus, userName })
    setCaseStatusChangeModalOpen(true)
  }

  const handleCaseStatusConfirm = () => {
    if (!caseStatusChange) return
    const { caseId, newStatus } = caseStatusChange

    // Only handle status change
    setData(prevData => prevData.map(client => (client.id === clientId ? { ...client, is_active: newStatus } : client)))

    editCase(
      { id: caseId, closed: newStatus },
      {
        onSuccess: () => {
          setCaseStatusChangeModalOpen(false)
          setCaseStatusChange(null)
          toast.success(t('cases.table.toasts.caseStatusUpdatedSuccess'))
        }
      }
    )

    setCaseStatusChangeModalOpen(false)
    setCaseStatusChange(null)
  }

  const handleCloseAddCasesModal = () => setOpenAddCasesModal(false)

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('cases')

  const columns = useMemo<MRT_ColumnDef<CaseTypes, any>[]>(
    () => [
      {
        accessorKey: 'title',
        header: t('cases.table.title'),
        Cell: ({ cell }: { cell: MRT_Cell<CaseTypes> }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'summary',
        header: t('cases.table.summary'),
        Cell: ({ cell }: { cell: MRT_Cell<CaseTypes> }) => (
          <Typography
            className='font-medium'
            color='text.primary'
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'normal',
              lineHeight: '1.2em'
            }}
          >
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'cost_amount',
        header: t('cases.table.costAmount'),
        Cell: ({ cell }: { cell: MRT_Cell<CaseTypes> }) => (
          <Typography className='font-medium' color='text.primary'>
            ${getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'closed',
        header: t('cases.table.closed'),
        Cell: ({ cell }: { cell: MRT_Cell<CaseTypes> }) => (
          <Chip
            label={cell.getValue() ? t('cases.table.caseClosed') : t('cases.table.caseOpen')}
            color={cell.getValue() ? 'success' : 'error'}
            size='small'
            variant='tonal'
          />
        )
      },
      {
        accessorKey: 'created_at',
        header: t('cases.table.createdAt'),
        Cell: ({ cell }: { cell: MRT_Cell<CaseTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'updated_at',
        header: t('cases.table.updatedAt'),
        Cell: ({ cell }: { cell: MRT_Cell<CaseTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'actions',
        header: t('cases.table.actions'),
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }: { row: MRT_Row<CaseTypes> }) => (
          <div className='flex items-center'>
            {hasPermissions(userPermissions, ['change_case']) && (
              <Switch
                checked={row.original.closed}
                onChange={event => handleCaseStatusChange(event, row.original.id, row.original.title)}
                inputProps={{ 'aria-label': 'controlled' }}
                color='success'
              />
            )}
            {hasPermissions(userPermissions, ['delete_case']) && (
              <IconButton
                onClick={() => {
                  setCaseId(row.original.id)
                  setDelName(row.original.title)
                  setIsDelModalOpen(true)
                }}
              >
                <i className='tabler-trash text-textSecondary' />
              </IconButton>
            )}
            {hasPermissions(userPermissions, ['change_case']) && !row.original.closed && (
              <IconButton
                onClick={() => {
                  setMode('edit')
                  setSelectedData(row.original)
                  setSelectedClients(row.original.clients)
                  setOpenAddCasesModal(true)
                }}
              >
                <i className='tabler-edit text-textSecondary' />
              </IconButton>
            )}
            <IconButton
              onClick={() => {
                router.push(`/${currentLocale}/dashboard/case/${row.original.id}`)
              }}
            >
              <i className='tabler-eye text-textSecondary' />
            </IconButton>
          </div>
        )
      }
    ],
    [t]
  )

  return (
    <div className='flex flex-col gap-y-8'>
      <div className='flex items-center justify-between'>
        <Typography variant='h3'>{t('cases.title')}</Typography>
        <div className='flex flex-row gap-2'>
          {hasPermissions(userPermissions, ['delete_case']) && Object.keys(rowSelection).length ? (
            <Button
              variant='contained'
              color='error'
              onClick={() => {
                setMultiple(true)
                setIsDelModalOpen(true)
                setDelName('')
              }}
              sx={{ padding: '0.5rem 1rem' }}
            >
              {t('cases.deletebulkcases')}
            </Button>
          ) : (
            <></>
          )}
          {pathname?.includes('/apps/cases')
            ? hasPermissions(userPermissions, ['add_case']) && (
                <Button
                  variant='contained'
                  color='primary'
                  onClick={() => {
                    setOpenAddCasesModal(true)
                    setMode('create')
                  }}
                  sx={{ padding: '0.5rem 1rem' }}
                >
                  {t('cases.addCase')}
                </Button>
              )
            : hasPermissions(userPermissions, ['add_case']) && (
                <Tooltip
                  title={!isClientActive ? t('cases.table.inactiveClientCreateMessage') : ''}
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
                      variant='contained'
                      color='primary'
                      disabled={!isClientActive}
                      onClick={() => {
                        setOpenAddCasesModal(true)
                        setMode('create')
                      }}
                      sx={{ padding: '0.5rem 1rem' }}
                    >
                      {t('cases.addCase')}
                    </Button>
                  </span>
                </Tooltip>
              )}
        </div>
      </div>
      <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
        <MaterialReactTable
          columns={columns}
          data={data}
          manualPagination={true}
          manualSorting={true}
          rowCount={totalRecords}
          enableExpanding
          enableRowSelection
          positionToolbarAlertBanner='none'
          onRowSelectionChange={setRowSelection}
          getRowId={row => String(row.id)}
          enableGlobalFilter={false}
          enableColumnFilters={true}
          enableSorting={data && data?.length > 1 ? true : false}
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
          renderDetailPanel={({ row }) => <CaseDetailsCard row={row.original} userPermissions={userPermissions} />}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          renderTopToolbarCustomActions={() => (
            <div className='flex items-center gap-3'>
              <DebouncedInput value={globalFilter ?? ''} onChange={value => setGlobalFilter(String(value))} />
              <CustomTextField
                select
                id='select-status'
                value={caseStatus || ''}
                onChange={e => setCaseStatus(e.target.value || null)}
                className='max-sm:is-full sm:is-[130px]'
                slotProps={{
                  select: { displayEmpty: true }
                }}
              >
                <MenuItem value=''>{t('cases.table.allStatus')}</MenuItem>
                <MenuItem value='true'>{t('cases.table.closed')}</MenuItem>
                <MenuItem value='false'>{t('cases.table.open')}</MenuItem>
              </CustomTextField>
              <IconButton
                onClick={() => {
                  const filteredData = data.filter(caseItem => {
                    // Apply status filter
                    if (caseStatus === 'true' && !caseItem.closed) return false
                    if (caseStatus === 'false' && caseItem.closed) return false

                    // Apply search filter if exists
                    if (globalFilter) {
                      return caseItem.title.toLowerCase().includes(globalFilter.toLowerCase())
                    }

                    return true
                  })
                  exportCasesToCSV(filteredData)
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
          localization={{
            noRecordsToDisplay: t('cases.table.noData'),
            rowsPerPage: t('table.rowsPerPage'),
            of: t('table.of'),
            search: t('cases.table.search')
          }}
        />
      </div>
      <AddCasesModal
        open={openAddCasesModal}
        handleClose={handleCloseAddCasesModal}
        mode={mode}
        caseData={selectedData}
        selectedClients={selectedClients}
        clientId={clientId}
      />
      <StatusConfModal
        open={caseStatusChangeModalOpen}
        handleClose={() => {
          setCaseStatusChangeModalOpen(false)
          setCaseStatusChange(null)
        }}
        isShowAddNotesField={false}
        handleStatusChange={handleCaseStatusConfirm}
        title={t('clientTable.confirmStatusChange')}
        userName={caseStatusChange?.userName || ''}
        newStatus={caseStatusChange?.newStatus || false}
        message={`${t('modal.confirmation.status.message')} ${caseStatusChange?.userName} - ${caseStatusChange?.newStatus ? t('clientTable.active') : t('clientTable.inactive')}`}
      />
      <DeleteConfModal
        open={isDelModalOpen}
        title={t('cases.delete.title')}
        deleteValue={delName}
        handleClose={handleCloseDeleteModal}
        handleDelete={() =>
          multiple ? handleDeleteCaseBulk(Object.keys(rowSelection).map(key => Number(key))) : handleDeleteCase()
        }
      />
    </div>
  )
}

export default CasesTable
