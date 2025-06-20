'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button, Chip, IconButton, Switch, Typography } from '@mui/material'
import { useRouter, useParams } from 'next/navigation'
import { useStaffHooks } from '@/services/useStaffHooks'
import StaffTable from '@/views/apps/commonTable/StaffTable'
import StaffDialog from '@/views/pages/staff/StaffDialog'
import DeleteConfirmationModal from '@/components/deleteConfirmationModal'
import StatusConfModal from '@/components/statusConfirmationModal'
import type { StaffPosition } from '@/types/apps/staffTypes'
import { MRT_Cell, MRT_ColumnDef, MRT_Row, MRT_SortingState } from 'material-react-table'
import { Staff } from '@/types/staffTypes'
import Grid from '@mui/material/Grid2'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import { useTranslation } from 'next-i18next'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import { toast } from 'react-toastify'
import { usePaginatedSearch } from '@/utils/usePaginatedSearch'

const StaffListings = () => {
  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const userPermissions = useAuthStore(state => state.userPermissions)
  const [globalFilter, setGlobalFilter] = useState('')
  const { pagination, setPagination, appliedSearch } = usePaginatedSearch({
    initialPageSize: 5,
    globalFilter
  })
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null)
  const [delName, setDelName] = useState<string>('')
  const [isUpdate, setIsUpdate] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    clientId: number
    newStatus: boolean
    userName: string
  } | null>(null)

  const { useStaffMembers, useDeleteStaffMember, useStaffPositions, useDeleteStaffMemberBulk, useUpdateStaffStatus } =
    useStaffHooks()
  const { data: staffData, isLoading } = useStaffMembers(
    pagination.pageSize,
    pagination.pageIndex + 1,
    appliedSearch,
    getOrderingParam(sorting)
  )

  const deleteStaff = useDeleteStaffMember()
  const deleteStaffBulk = useDeleteStaffMemberBulk()
  const updateStaffStatus = useUpdateStaffStatus()
  const { data: positions } = useStaffPositions()

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  const handleClose = () => {
    setOpen(false)
    setSelectedStaff(null)
    setIsUpdate(false)
  }

  const handleDelete = (id: number, name: string) => {
    setSelectedStaff(id)
    setDelName(name)
    setDeleteModalOpen(true)
  }

  const handleDeleteBulk = (ids: number[]) => {
    if (!ids.length === null) return
    deleteStaffBulk.mutate(ids, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((staffData?.data?.count - ids.length) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        toast.success(t('staffTable.staffDeleted'))
        setDeleteModalOpen(false)
        setRowSelection({})
      }
    })
    setMultiple(false)
  }

  const confirmDelete = () => {
    if (selectedStaff) {
      deleteStaff.mutate(selectedStaff)
      setDeleteModalOpen(false)
    }
  }

  const handleActiveStatusChange = (event: React.ChangeEvent<HTMLInputElement>, staffId: number, userName: string) => {
    const newStatus = event.target.checked
    setPendingStatusChange({ clientId: staffId, newStatus, userName })
    setStatusModalOpen(true)
  }

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      updateStaffStatus.mutate(
        { id: pendingStatusChange.clientId, is_active: pendingStatusChange.newStatus },
        {
          onSuccess: () => {
            toast.success(t('staffTable.staffStatusUpdated'))
            setStatusModalOpen(false)
            setPendingStatusChange(null)
          },
          onError: () => {
            toast.error(t('staffTable.staffStatusUpdateFailed'))
            setStatusModalOpen(false)
            setPendingStatusChange(null)
          }
        }
      )
    }
  }

  const columns = useMemo<MRT_ColumnDef<Staff, any>[]>(
    () => [
      {
        accessorKey: 'first_name',
        header: t('staffTable.firstName'),
        enableSorting: true,
        Cell: ({ cell }: { cell: MRT_Cell<Staff> }) => {
          return getDisplayValue(cell.getValue())
        }
      },
      {
        accessorKey: 'last_name',
        header: t('staffTable.lastName'),
        enableSorting: true,
        Cell: ({ cell }: { cell: MRT_Cell<Staff> }) => {
          return getDisplayValue(cell.getValue())
        }
      },
      {
        accessorKey: 'email',
        header: t('staffTable.email'),
        enableSorting: true,
        Cell: ({ cell }: { cell: MRT_Cell<Staff> }) => {
          return getDisplayValue(cell.getValue())
        }
      },
      {
        accessorKey: 'phone_number',
        header: t('staffTable.phone'),
        flex: 1,
        Cell: ({ cell }: { cell: MRT_Cell<Staff> }) => {
          return <span dir='ltr'>{getDisplayValue(cell.getValue())}</span>
        }
      },
      {
        accessorKey: 'position',
        header: t('staffTable.position'),
        Cell: ({ cell }: { cell: MRT_Cell<Staff> }) => {
          const position = cell.getValue()
          const positionName = positions?.results?.find((p: StaffPosition) => p.id === position)?.name
          return positionName || t('staffTable.noPosition')
        }
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        Cell: ({ cell }: { cell: MRT_Cell<Staff> }) => {
          const isActive = cell.getValue()
          return (
            <Chip
              label={isActive ? t('staffTable.active') : t('staffTable.inactive')}
              color={isActive ? 'success' : 'error'}
              size='small'
              variant='tonal'
            />
          )
        }
      },
      {
        accessorKey: 'created_at',
        header: t('staffTable.createdAt'),
        Cell: ({ cell }: { cell: MRT_Cell<Staff> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'updated_at',
        header: t('staffTable.updatedAt'),
        Cell: ({ cell }: { cell: MRT_Cell<Staff> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'actions',
        header: t('staffTable.actions'),
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }: { row: MRT_Row<Staff> }) => (
          <div className='flex items-center gap-2'>
            {hasPermissions(userPermissions, ['change_transclient']) && (
              <Switch
                checked={row.original.is_active}
                onChange={event => handleActiveStatusChange(event, row.original.id, row.original.first_name)}
                inputProps={{ 'aria-label': 'controlled' }}
                color='success'
              />
            )}
            {hasPermissions(userPermissions, ['view_staff']) && (
              <IconButton
                onClick={() => router.push(`/${currentLocale}/dashboard/staff/${row.original.id}`)}
                title={t('common.view')}
              >
                <i className='tabler-eye text-xl' />
              </IconButton>
            )}
            {hasPermissions(userPermissions, ['view_staff']) && row.original.user && (
              <IconButton
                onClick={() => {
                  if (!row.original.user) {
                    toast.error(t('staffTable.toasts.staffMemberHasNoAssociatedUserId'))
                    return
                  }
                  router.push(`/${currentLocale}/dashboard/user/${row.original.user}`)
                }}
              >
                <i className='tabler-external-link text-xl' />
              </IconButton>
            )}
            {hasPermissions(userPermissions, ['change_staff']) && (
              <IconButton
                onClick={() => {
                  setSelectedStaff(row.original.id)
                  setIsUpdate(true)
                  setOpen(true)
                }}
                title={t('common.edit')}
              >
                <i className='tabler-edit text-xl' />
              </IconButton>
            )}
            {hasPermissions(userPermissions, ['delete_staff']) && (
              <IconButton
                onClick={() => handleDelete(row.original.id, `${row.original.first_name} ${row.original.last_name}`)}
                title={t('common.delete')}
              >
                <i className='tabler-trash text-xl' />
              </IconButton>
            )}
          </div>
        )
      }
    ],
    [positions, handleDelete, router, t]
  )

  return (
    <div className='flex flex-col gap-y-8'>
      <div className='flex justify-between items-center'>
        <Typography variant='h3'>{t('staffTable.title')}</Typography>
        <div className='flex flex-row gap-2'>
          {hasPermissions(userPermissions, ['delete_staff']) && Object.keys(rowSelection).length ? (
            <Button
              variant='contained'
              color='error'
              onClick={() => {
                setMultiple(true)
                setDeleteModalOpen(true)
                setDelName('')
              }}
            >
              {t('staffTable.deleteStaff')}
            </Button>
          ) : (
            <></>
          )}

          {hasPermissions(userPermissions, ['add_staff']) && (
            <Button
              variant='contained'
              onClick={() => setOpen(true)}
              className='bg-primary hover:bg-primaryDark'
              startIcon={<i className='tabler-plus text-lg' />}
            >
              {t('staffTable.createStaff')}
            </Button>
          )}
        </div>
      </div>
      <Grid sx={{ width: '100%' }}>
        <StaffTable
          rows={staffData?.data?.results || []}
          columns={columns}
          rowCount={staffData?.data?.count || 0}
          pagination={pagination}
          setPagination={setPagination}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          isLoading={isLoading}
          sorting={sorting}
          setSorting={setSorting}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </Grid>

      <StaffDialog
        open={open}
        onClose={handleClose}
        initialData={staffData?.data?.results.find((staff: Staff) => staff.id === selectedStaff)}
        isUpdate={isUpdate}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        handleClose={() => setDeleteModalOpen(false)}
        deleteValue={delName}
        message={`${t('staffTable.deleteMessage')} ${delName}?`}
        title={t('staffTable.deleteStaff')}
        handleDelete={() =>
          multiple ? handleDeleteBulk(Object.keys(rowSelection).map(key => Number(key))) : confirmDelete()
        }
      />

      <StatusConfModal
        open={statusModalOpen}
        handleClose={() => {
          setStatusModalOpen(false)
          setPendingStatusChange(null)
        }}
        handleStatusChange={confirmStatusChange}
        title={t('modal.confirmation.status.title')}
        userName={pendingStatusChange?.userName || ''}
        newStatus={pendingStatusChange?.newStatus || false}
        message={t('modal.confirmation.status.message')}
      />
    </div>
  )
}

export default StaffListings
