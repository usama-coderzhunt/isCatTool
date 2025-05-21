'use client'

import { Card, Checkbox, Typography, Button, useColorScheme } from '@mui/material'
import { useTranslation } from 'next-i18next'
import React, { useMemo, useState, useEffect } from 'react'
import { MaterialReactTable, MRT_SortingState, type MRT_ColumnDef } from 'material-react-table'
import { useUserManagementHooks } from '@/services/useUserManagementHooks'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import CustomTextField from '@/@core/components/mui/TextField'
import { useTableState } from '@/hooks/useTableState'

interface User {
  id: number
  username: string
  email: string
}

interface GroupUsersTableProps {
  groupId: number
  isLoading: boolean
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

  return <CustomTextField
    label={t('groupUsers.search')}
    placeholder={t('groupUsers.search')}
    {...props}
    value={value}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
  />
}

const GroupUsersTable = ({ groupId, isLoading }: GroupUsersTableProps) => {
  const [globalFilter, setGlobalFilter] = useState('')
  const { t } = useTranslation('global')
  const { mode: themeMode } = useColorScheme()
  const loggedInUser = localStorage.getItem('logedInUserId')
  const { useUsers, useGroupUsers, useUpdateGroupUsers } = useUserManagementHooks()
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const updateGroupUsers = useUpdateGroupUsers(groupId)

  // Fetch all users and group users
  const { data: allUsers, isLoading: loadingUsers } = useUsers(100, 1, getOrderingParam(sorting), globalFilter)
  const { data: groupUsers, isLoading: loadingGroupUsers, refetch: refetchGroupUsers } = useGroupUsers(groupId)
  const [checkedUsers, setCheckedUsers] = useState<Set<number>>(new Set())
  const [page, setPage] = useState(0)


  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Initialize checked users when group users data is loaded
  useEffect(() => {
    if (groupUsers) {
      const groupUserIds = new Set(groupUsers.map(user => user.id));
      setCheckedUsers(groupUserIds);
    }
  }, [groupUsers]);


  const handleUserToggle = (userId: number) => {
    setCheckedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  const handleUpdate = () => {
    if (!groupId || !updateGroupUsers.mutate) return;

    updateGroupUsers.mutate({
      users: Array.from(checkedUsers)
    }, {
      onSuccess: () => {
        refetchGroupUsers();
      }
    });
  };

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('groupUsers')

  const columns = useMemo<MRT_ColumnDef<User>[]>(() => [
    {
      accessorKey: 'select',
      header: t('groupUsers.select'),
      Header: () => (
        <Checkbox
          checked={(allUsers?.results?.length ?? 0) > 0 && allUsers?.results?.every(user => checkedUsers.has(user.id))}
          indeterminate={
            allUsers?.results?.some(user => checkedUsers.has(user.id)) &&
            !allUsers?.results?.every(user => checkedUsers.has(user.id))
          }
          onChange={() => {
            if (allUsers?.results) {
              const allChecked = allUsers.results.every(user => checkedUsers.has(user.id))
              setCheckedUsers(prev => {
                const newSet = new Set(prev)
                allUsers.results.forEach(user => {
                  if (allChecked) {
                    newSet.delete(user.id)
                  } else {
                    newSet.add(user.id)
                  }
                })
                return newSet
              })
            }
          }}
        />
      ),
      Cell: ({ row }) => (
        <Checkbox
          checked={checkedUsers.has(row.original.id)}
          onChange={() => handleUserToggle(row.original.id)}
          disabled={row.original.id === Number(loggedInUser)}
        />
      ),
      size: 50,
      enableSorting: false
    },
    {
      accessorKey: 'username',
      header: t('groupUsers.username'),
    },
    {
      accessorKey: 'email',
      header: t('groupUsers.email'),
    }
  ], [checkedUsers, allUsers?.results, t])

  return (
    <div className='flex flex-col gap-y-8'>
      <div className='flex justify-between items-center'>
        <Typography variant='h3'>{t('groupUsers.title')}</Typography>
      </div>
      <Card className={`${themeMode === 'light' ? 'customColor' : ''}`}>
        <MaterialReactTable
          columns={columns}
          data={allUsers?.results || []}
          enableColumnActions={false}
          enableColumnFilters={true}
          enableGlobalFilter={false}
          enableSorting={allUsers && allUsers?.results?.length > 1 ? true : false}
          manualSorting={true}
          muiTableContainerProps={{ sx: { maxHeight: '500px' } }}
          state={{
            pagination: {
              pageIndex: page,
              pageSize: rowsPerPage,
            },
            sorting,
            globalFilter: globalFilter,
            columnVisibility: tableState.columnVisibility,
            density: tableState.density,
            isFullScreen: tableState.isFullScreen
          }}
          onColumnVisibilityChange={updateColumnVisibility}
          onDensityChange={updateDensity}
          onIsFullScreenChange={updateFullScreen}
          renderTopToolbarCustomActions={() => (
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={(value) => setGlobalFilter(String(value))}
            />
          )}
          onPaginationChange={(updater: any) => {
            const { pageIndex, pageSize } = updater(
              { pageIndex: page, pageSize: rowsPerPage }
            )
            setPage(pageIndex)
            setRowsPerPage(pageSize)
          }}
          onSortingChange={setSorting}
          localization={{
            noRecordsToDisplay: t('groupUsers.noData'),
            rowsPerPage: t('table.rowsPerPage'),
            of: t('table.of'),
          }}
          renderBottomToolbarCustomActions={() => (
            <div className='pl-4'>
              <Button
                variant='contained'
                onClick={handleUpdate}
                className='bg-primary hover:bg-primaryDark'
                startIcon={<i className='tabler-device-floppy text-lg' />}
              >
                {t('groupUsers.updateUsers')}
              </Button>
            </div>
          )}
        />
      </Card>
    </div>
  )
}

export default GroupUsersTable 
