'use client'

// React Imports
import type { Dispatch, FC, SetStateAction } from 'react'
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import { useRouter, useParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import { Button, IconButton, useColorScheme } from '@mui/material'

// Material React Table Imports
import { MaterialReactTable, MRT_Cell, MRT_SortingState, MRT_ColumnDef, MRT_Row } from 'material-react-table'

// Components Imports
import CustomTextField from '@core/components/mui/TextField'
import UserDetailsCard from '@/views/pages/client-and-lead-details/userDetailsCard'

// Type Imports
import { UserType } from '@/types/userTypes'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import { useTranslation } from 'next-i18next'

import { useUserManagementHooks } from '@/services/useUserManagementHooks'
import { toast } from 'react-toastify'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { useTableState } from '@/hooks/useTableState'
import { exportUsersToCSV } from './tableExport'

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
      label={t('table.search')}
      placeholder={t('table.search')}
      {...props}
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  )
}

interface UsersTableProps {
  usersData: UserType[]
  totalRecords: number
  pagination: { pageSize: number; pageIndex: number }
  setPagination: Dispatch<SetStateAction<{ pageIndex: number; pageSize: number }>>
  isLoading: boolean
  globalFilter: string
  setGlobalFilter: (value: string) => void
  sorting: MRT_SortingState
  setSorting: (updater: MRT_SortingState | ((prev: MRT_SortingState) => MRT_SortingState)) => void
}

const UsersTable: FC<UsersTableProps> = ({
  usersData,
  totalRecords,
  pagination,
  setPagination,
  isLoading,
  globalFilter,
  setGlobalFilter,
  sorting,
  setSorting
}) => {
  const router = useRouter()
  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { mode: themeMode } = useColorScheme()
  const userPermissions = useAuthStore(state => state.userPermissions)

  // State
  const [delName, setDelName] = useState<string>('')
  const [userId, setUserId] = useState<number | null>(null)
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)

  // Hooks
  const { useDeleteUser, useBulkDeleteUsers } = useUserManagementHooks()
  const { mutate: deleteUser } = useDeleteUser()
  const { mutate: bulkDeleteUsers } = useBulkDeleteUsers()

  const data = usersData ?? []

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  const handleDeleteUser = () => {
    if (userId === null) return
    deleteUser(userId, {
      onSuccess: () => {
        // Calculate new total pages after deletion
        const newTotalPages = Math.ceil((totalRecords - 1) / pagination.pageSize)
        // If current page is greater than new total pages, move to last page
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        toast.success(t('usersPage.toasts.userDeletedSuccess'))
        setOpenDeleteModal(false)
      }
    })
  }

  const handleBulkDeleteUsers = (ids: number[]) => {
    if (!ids.length === null) return
    bulkDeleteUsers(ids, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((totalRecords - ids.length) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        setOpenDeleteModal(false)
        setRowSelection({})
        toast.success(t('usersPage.toasts.userDeletedBulkSuccess'))
      }
    })
    setMultiple(false)
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('users')

  const columns = useMemo<MRT_ColumnDef<UserType, any>[]>(
    () => [
      {
        accessorKey: 'username',
        header: 'Username',
        Header: () => <span>{t('usersPage.username')}</span>,
        Cell: ({ cell }: { cell: MRT_Cell<UserType> }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'email',
        header: 'Email',
        Header: () => <span>{t('usersPage.email')}</span>,
        Cell: ({ cell }: { cell: MRT_Cell<UserType> }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'created_at',
        header: t('usersPage.createdAt'),
        Cell: ({ cell }: { cell: MRT_Cell<UserType> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'updated_at',
        header: t('usersPage.updatedAt'),
        Cell: ({ cell }: { cell: MRT_Cell<UserType> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'actions',
        header: t('usersPage.actions'),
        enableSorting: false,
        enableColumnFilter: false,
        Header: () => <span>{t('usersPage.actions')}</span>,
        Cell: ({ row }: { row: MRT_Row<UserType> }) => (
          <div className='flex items-center gap-x-2'>
            <IconButton
              onClick={() => router.push(`/${currentLocale}/dashboard/user/${row.original.id}`)}
              title={t('table.view')}
            >
              <i className='tabler-eye text-textSecondary w-[22px] h-[22px]' />
            </IconButton>
            {hasPermissions(userPermissions, ['delete_staff']) && (
              <IconButton
                onClick={() => {
                  setUserId(row.original.id)
                  setDelName(row.original.username)
                  setOpenDeleteModal(true)
                }}
              >
                <i className='tabler-trash text-textSecondary' />
              </IconButton>
            )}
          </div>
        )
      }
    ],
    [t, router]
  )

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex items-center justify-between gap-x-4'>
        <Typography variant='h3'>{t('usersPage.title')}</Typography>
        {hasPermissions(userPermissions, ['delete_staff']) && Object.keys(rowSelection).length ? (
          <Button
            variant='contained'
            color='error'
            className='shadow-2xl'
            onClick={() => {
              setMultiple(true)
              setOpenDeleteModal(true)
              setDelName('')
            }}
          >
            {t('usersPage.deleteUsers')}
          </Button>
        ) : null}
      </div>
      <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
        <MaterialReactTable
          columns={columns}
          data={data}
          manualPagination={true}
          rowCount={totalRecords}
          enableGlobalFilter={false}
          enableColumnFilters={true}
          enableSorting={data && data?.length > 1 ? true : false}
          manualSorting={true}
          enableRowSelection
          onRowSelectionChange={setRowSelection}
          getRowId={row => String(row.id)}
          positionToolbarAlertBanner='none'
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
          onPaginationChange={setPagination}
          onGlobalFilterChange={setGlobalFilter}
          localization={{
            noRecordsToDisplay: t('table.noRecords'),
            rowsPerPage: t('table.rowsPerPage'),
            of: t('table.of')
          }}
          onSortingChange={setSorting}
          onColumnVisibilityChange={updateColumnVisibility}
          onDensityChange={updateDensity}
          onIsFullScreenChange={updateFullScreen}
          renderTopToolbarCustomActions={() => (
            <div className='flex items-center gap-3'>
              <DebouncedInput value={globalFilter ?? ''} onChange={value => setGlobalFilter(String(value))} />
              <IconButton onClick={() => exportUsersToCSV(data)} title={t('table.export')}>
                <i className='tabler-file-download text-[28px] cursor-pointer' />
              </IconButton>
              {/* Custom Clear Selection Button */}
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
          renderDetailPanel={({ row }) => <UserDetailsCard row={row.original} />}
        />
      </div>
      <DeleteConfModal
        title={'Confirm Delete'}
        deleteValue={delName}
        open={openDeleteModal}
        handleClose={() => setOpenDeleteModal(false)}
        handleDelete={() =>
          multiple ? handleBulkDeleteUsers(Object.keys(rowSelection).map(key => Number(key))) : handleDeleteUser()
        }
      />
    </div>
  )
}

export default UsersTable
