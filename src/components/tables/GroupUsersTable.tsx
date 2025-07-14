'use client'

import { Card, Checkbox, Typography, Button, useColorScheme, Tooltip } from '@mui/material'
import { useTranslation } from 'next-i18next'
import React, { useMemo, useState, useEffect } from 'react'
import { MaterialReactTable, MRT_SortingState, type MRT_ColumnDef } from 'material-react-table'
import { useUserManagementHooks } from '@/services/useUserManagementHooks'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import CustomTextField from '@/@core/components/mui/TextField'
import { useTableState } from '@/hooks/useTableState'
import { usePaginatedSearch } from '@/utils/usePaginatedSearch'

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

  return (
    <CustomTextField
      label={t('groupUsers.search')}
      shrinkLabel={false}
      {...props}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
    />
  )
}

const GroupUsersTable = ({ groupId, isLoading }: GroupUsersTableProps) => {
  const [globalFilter, setGlobalFilter] = useState('')
  const [globalFilterRight, setGlobalFilterRight] = useState('')
  const { t } = useTranslation('global')
  const { mode: themeMode } = useColorScheme()
  const loggedInUser = localStorage.getItem('logedInUserId')
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [sortingRight, setSortingRight] = useState<MRT_SortingState>([])
  const { pagination, setPagination, appliedSearch } = usePaginatedSearch({
    initialPageSize: 10,
    globalFilter
  })
  const [paginationLeft, setPaginationLeft] = useState({
    pageIndex: 0,
    pageSize: 5
  })
  const [paginationRight, setPaginationRight] = useState({
    pageIndex: 0,
    pageSize: 5
  })

  const { useUsers, useGroupUsers, useUpdateGroupUsers } = useUserManagementHooks()
  const updateGroupUsers = useUpdateGroupUsers(groupId)

  // Fetch more users to ensure we have enough after filtering
  const fetchSize = Math.max(50, (pagination.pageSize || 10) * 3) // Fetch 3x more to account for filtering
  const { data: allUsers, isLoading: loadingUsers } = useUsers(
    fetchSize,
    1, // Always fetch from page 1 to get a large pool
    appliedSearch,
    getOrderingParam(sorting)
  )
  const { data: groupUsers, isLoading: loadingGroupUsers, refetch: refetchGroupUsers } = useGroupUsers(groupId)
  const [checkedLeftUsers, setCheckedLeftUsers] = useState<Set<number>>(new Set())
  const [checkedRightUsers, setCheckedRightUsers] = useState<Set<number>>(new Set())

  // Initialize checked users when group users data is loaded
  useEffect(() => {
    if (groupUsers) {
      // Remove auto-checking - users should not be checked by default
      setCheckedLeftUsers(new Set())
      setCheckedRightUsers(new Set())
    }
  }, [groupUsers])

  // Filter users not in group for left table - get all filtered users
  const allUsersNotInGroup = useMemo(() => {
    if (!allUsers?.data?.results || !groupUsers) return []
    const groupUserIds = new Set(groupUsers.map((user: User) => user.id))
    return allUsers.data.results.filter((user: User) => !groupUserIds.has(user.id))
  }, [allUsers?.data?.results, groupUsers])

  // Paginated users not in group for left table
  const paginatedUsersNotInGroup = useMemo(() => {
    if (!allUsersNotInGroup) return []
    const startIndex = paginationLeft.pageIndex * paginationLeft.pageSize
    const endIndex = startIndex + paginationLeft.pageSize
    return allUsersNotInGroup.slice(startIndex, endIndex)
  }, [allUsersNotInGroup, paginationLeft])

  // Filter group users based on search (right table)
  const filteredGroupUsers = useMemo(() => {
    if (!groupUsers) return []
    if (!globalFilterRight) return groupUsers

    const searchTerm = globalFilterRight.toLowerCase()
    return groupUsers.filter(
      (user: User) => user.username.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm)
    )
  }, [groupUsers, globalFilterRight])

  // Sort filtered group users (right table)
  const sortedAndFilteredGroupUsers = useMemo(() => {
    if (!filteredGroupUsers) return []
    if (!sortingRight || sortingRight.length === 0) return filteredGroupUsers

    const sorted = [...filteredGroupUsers].sort((a, b) => {
      for (const sort of sortingRight) {
        const { id: columnId, desc } = sort
        let aValue = a[columnId as keyof User] || ''
        let bValue = b[columnId as keyof User] || ''

        // Convert to strings for comparison
        aValue = String(aValue).toLowerCase()
        bValue = String(bValue).toLowerCase()

        if (aValue < bValue) return desc ? 1 : -1
        if (aValue > bValue) return desc ? -1 : 1
      }
      return 0
    })

    return sorted
  }, [filteredGroupUsers, sortingRight])

  // Paginated group users for right table (after filtering and sorting)
  const paginatedGroupUsers = useMemo(() => {
    if (!sortedAndFilteredGroupUsers) return []
    const startIndex = paginationRight.pageIndex * paginationRight.pageSize
    const endIndex = startIndex + paginationRight.pageSize
    return sortedAndFilteredGroupUsers.slice(startIndex, endIndex)
  }, [sortedAndFilteredGroupUsers, paginationRight])

  const handleAddUsers = () => {
    if (!groupId || !updateGroupUsers.mutate) return

    // Get currently checked users that are not in group
    const usersToAdd = Array.from(checkedLeftUsers)

    if (usersToAdd.length === 0) return

    // Combine existing group users with new users
    const existingGroupUserIds = groupUsers?.map(user => user.id) || []
    const allUserIds = [...existingGroupUserIds, ...usersToAdd]

    updateGroupUsers.mutate(
      {
        users: allUserIds
      },
      {
        onSuccess: () => {
          refetchGroupUsers()
          setCheckedLeftUsers(new Set()) // Clear left selections after successful add
          // Reset pagination to first page to see newly added users
          setPaginationRight({ pageIndex: 0, pageSize: paginationRight.pageSize })
          // Reset search filter
          setGlobalFilterRight('')
          // Adjust left table pagination if current page becomes empty
          const newFilteredCount = (allUsers?.data?.count ?? 0) - allUserIds.length
          const maxLeftPages = Math.ceil(newFilteredCount / paginationLeft.pageSize)
          if (paginationLeft.pageIndex >= maxLeftPages && maxLeftPages > 0) {
            setPaginationLeft({ ...paginationLeft, pageIndex: maxLeftPages - 1 })
          }
        }
      }
    )
  }

  const handleRemoveUsers = () => {
    if (!groupId || !updateGroupUsers.mutate) return

    // Get currently checked users that are in group
    const usersToRemove = Array.from(checkedRightUsers)

    if (usersToRemove.length === 0) return

    // Remove selected users from group
    const remainingUsers = groupUsers?.filter(user => !usersToRemove.includes(user.id)).map(user => user.id) || []

    updateGroupUsers.mutate(
      {
        users: remainingUsers
      },
      {
        onSuccess: () => {
          refetchGroupUsers()
          setCheckedRightUsers(new Set()) // Clear right selections after successful remove

          // Calculate new pagination after removal
          const newTotalUsers = remainingUsers.length
          const currentPageSize = paginationRight.pageSize

          // Apply search filter to get accurate filtered count
          let filteredCount = newTotalUsers
          if (globalFilterRight) {
            const searchTerm = globalFilterRight.toLowerCase()
            const filtered = remainingUsers.filter(userId => {
              const user = groupUsers?.find(u => u.id === userId)
              return (
                user &&
                (user.username.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm))
              )
            })
            filteredCount = filtered.length
          }

          const maxPages = Math.ceil(filteredCount / currentPageSize)

          // If current page is beyond available pages, go to last available page
          if (paginationRight.pageIndex >= maxPages && maxPages > 0) {
            setPaginationRight({ ...paginationRight, pageIndex: maxPages - 1 })
          } else if (filteredCount === 0) {
            // If no users left after filtering, reset to first page
            setPaginationRight({ ...paginationRight, pageIndex: 0 })
          }
          // If current page still has users, stay on current page
        }
      }
    )
  }

  const handleSingleUserAdd = (userId: number) => {
    if (!groupId || !updateGroupUsers.mutate) return

    const existingGroupUserIds = groupUsers?.map(user => user.id) || []
    const allUserIds = [...existingGroupUserIds, userId]

    updateGroupUsers.mutate(
      {
        users: allUserIds
      },
      {
        onSuccess: () => {
          refetchGroupUsers()
          // Reset pagination to first page to see newly added user
          setPaginationRight({ pageIndex: 0, pageSize: paginationRight.pageSize })
        }
      }
    )
  }

  const handleSingleUserRemove = (userId: number) => {
    if (!groupId || !updateGroupUsers.mutate) return

    const remainingUsers = groupUsers?.filter(user => user.id !== userId).map(user => user.id) || []

    updateGroupUsers.mutate(
      {
        users: remainingUsers
      },
      {
        onSuccess: () => {
          refetchGroupUsers()

          // Calculate new pagination after single user removal
          const newTotalUsers = remainingUsers.length
          const currentPageSize = paginationRight.pageSize
          const maxPages = Math.ceil(newTotalUsers / currentPageSize)

          // Check if current page will be empty after removal
          const currentPageStartIndex = paginationRight.pageIndex * currentPageSize
          const usersOnCurrentPage = newTotalUsers - currentPageStartIndex

          if (usersOnCurrentPage <= 0 && paginationRight.pageIndex > 0) {
            // Current page will be empty, go to previous page
            setPaginationRight({ ...paginationRight, pageIndex: paginationRight.pageIndex - 1 })
          } else if (newTotalUsers === 0) {
            // If no users left, reset to first page
            setPaginationRight({ ...paginationRight, pageIndex: 0 })
          }
          // Otherwise stay on current page
        }
      }
    )
  }

  // Check if there are users selected that are not in group (for Add button)
  const hasUsersToAdd = checkedLeftUsers.size > 0

  // Check if there are users selected that are in group (for Remove button)
  const hasUsersToRemove = checkedRightUsers.size > 0

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('groupUsers')

  // Columns for left table (users not in group)
  const columnsLeft = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'username',
        header: t('groupUsers.username'),
        Cell: ({ row }) => (
          <Tooltip title={row.original.username} arrow>
            <span
              style={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {row.original.username}
            </span>
          </Tooltip>
        ),
        size: 250,
        minSize: 250,
        maxSize: 250,
        enableResizing: false
      },
      {
        accessorKey: 'email',
        header: t('groupUsers.email'),
        Cell: ({ row }) => (
          <Tooltip title={row.original.email} arrow>
            <span
              style={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {row.original.email}
            </span>
          </Tooltip>
        ),
        size: 350,
        minSize: 350,
        maxSize: 350,
        enableResizing: false
      },
      {
        accessorKey: 'actions',
        header: t('common.actions'),
        Cell: ({ row }) => (
          <Tooltip title={t('groupUsers.addUserTooltip', { username: row.original.username })} arrow>
            <Button
              size='small'
              color='primary'
              onClick={() => handleSingleUserAdd(row.original.id)}
              disabled={row.original.id === Number(loggedInUser)}
              className='min-w-0 p-2'
            >
              <i className='tabler-circle-plus text-lg' />
            </Button>
          </Tooltip>
        ),
        size: 150,
        minSize: 150,
        maxSize: 150,
        enableSorting: false,
        enableColumnFilter: false,
        enableResizing: false
      }
    ],
    [paginatedUsersNotInGroup, t, loggedInUser, handleSingleUserAdd]
  )

  // Columns for right table (users in group)
  const columnsRight = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'username',
        header: t('groupUsers.username'),
        Cell: ({ row }) => (
          <Tooltip title={row.original.username} arrow>
            <span
              style={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {row.original.username}
            </span>
          </Tooltip>
        ),
        size: 250,
        minSize: 250,
        maxSize: 250,
        enableResizing: false
      },
      {
        accessorKey: 'email',
        header: t('groupUsers.email'),
        Cell: ({ row }) => (
          <Tooltip title={row.original.email} arrow>
            <span
              style={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {row.original.email}
            </span>
          </Tooltip>
        ),
        size: 350,
        minSize: 350,
        maxSize: 350,
        enableResizing: false
      },
      {
        accessorKey: 'actions',
        header: t('common.actions'),
        Cell: ({ row }) => (
          <Tooltip title={t('groupUsers.removeUserTooltip', { username: row.original.username })} arrow>
            <Button
              size='small'
              color='error'
              onClick={() => handleSingleUserRemove(row.original.id)}
              disabled={row.original.id === Number(loggedInUser)}
              className='min-w-0 p-2'
            >
              <i className='tabler-circle-minus text-lg' />
            </Button>
          </Tooltip>
        ),
        size: 150,
        minSize: 150,
        maxSize: 150,
        enableSorting: false,
        enableColumnFilter: false,
        enableResizing: false
      }
    ],
    [groupUsers, t, loggedInUser, handleSingleUserRemove]
  )

  return (
    <div className='flex flex-col gap-y-8'>
      {/* Two tables side by side */}
      <div className='flex flex-col lg:flex-row gap-6 w-full'>
        {/* Left Table - Users NOT in Group */}
        <div className='flex-1 w-full lg:w-[49%]'>
          <div className='flex justify-between items-center mb-4 mt-4'>
            <Typography variant='h3' className='font-medium'>
              {t('groupUsers.usersNotInGroup')}
            </Typography>
            {hasUsersToAdd && (
              <Button
                variant='contained'
                onClick={handleAddUsers}
                className='bg-primary hover:bg-primaryDark'
                startIcon={<i className='tabler-user-plus text-lg' />}
              >
                {t('groupUsers.addSelectedUsers')}
              </Button>
            )}
          </div>
          <Card className={`${themeMode === 'light' ? 'customColor' : ''} mt-2`}>
            <MaterialReactTable
              columns={columnsLeft}
              data={(paginatedUsersNotInGroup || []).filter(Boolean)}
              manualPagination={true}
              manualSorting={true}
              rowCount={(allUsers?.data?.count ?? 0) - (groupUsers?.length ?? 0)}
              enableGlobalFilter={false}
              enableColumnFilters={true}
              enableSorting={paginatedUsersNotInGroup && paginatedUsersNotInGroup?.length > 1 ? true : false}
              enableColumnResizing={false}
              enableHiding={false}
              enableRowSelection={true}
              enableSelectAll={true}
              enableToolbarInternalActions={false}
              positionToolbarAlertBanner='none'
              enableBatchRowSelection={false}
              defaultColumn={{
                minSize: 60,
                maxSize: 400
              }}
              muiTableContainerProps={{
                sx: {
                  maxWidth: '100%',
                  overflowX: 'auto'
                }
              }}
              muiTableHeadProps={{
                sx: {
                  position: 'sticky',
                  top: 0,
                  zIndex: 1
                }
              }}
              muiTableHeadCellProps={{
                sx: {
                  backgroundColor: 'background.paper',
                  zIndex: 1
                }
              }}
              getRowId={row => row?.id?.toString() || `${Math.random()}`}
              onRowSelectionChange={updater => {
                const newSelection =
                  typeof updater === 'function'
                    ? updater(Object.fromEntries(Array.from(checkedLeftUsers).map(id => [id, true])))
                    : updater

                const selectedIds = Object.keys(newSelection)
                  .filter(key => newSelection[key])
                  .map(Number)
                setCheckedLeftUsers(new Set(selectedIds))
              }}
              state={{
                pagination: paginationLeft,
                sorting,
                globalFilter,
                isLoading: loadingUsers,
                columnVisibility: tableState.columnVisibility,
                density: tableState.density,
                isFullScreen: tableState.isFullScreen,
                rowSelection: Object.fromEntries(Array.from(checkedLeftUsers).map(id => [id, true]))
              }}
              onPaginationChange={setPaginationLeft}
              onSortingChange={setSorting}
              onColumnVisibilityChange={updateColumnVisibility}
              onDensityChange={updateDensity}
              onIsFullScreenChange={updateFullScreen}
              localization={{
                noRecordsToDisplay: t('groupUsers.noData'),
                rowsPerPage: t('table.rowsPerPage'),
                of: t('table.of')
              }}
              renderTopToolbarCustomActions={() => (
                <div className='flex items-center gap-3 w-full'>
                  <DebouncedInput value={globalFilter ?? ''} onChange={value => setGlobalFilter(String(value))} />
                  {checkedLeftUsers.size > 0 && (
                    <div className='flex items-center gap-3'>
                      <Typography variant='body2' color='text.secondary'>
                        {checkedLeftUsers.size} {t('table.recordsSelected')}
                      </Typography>
                      <Button variant='outlined' onClick={() => setCheckedLeftUsers(new Set())}>
                        {t('table.clearSelection')}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            />
          </Card>
        </div>

        {/* Right Table - Users IN Group */}
        <div className='flex-1 w-full lg:w-[49%]'>
          <div className='flex justify-between items-center mb-4 mt-4'>
            <Typography variant='h3' className='font-medium'>
              {t('groupUsers.usersInGroup')}
            </Typography>
            {hasUsersToRemove && (
              <Button
                variant='contained'
                onClick={handleRemoveUsers}
                className='bg-primary hover:bg-primaryDark'
                startIcon={<i className='tabler-user-minus text-lg' />}
              >
                {t('groupUsers.removeSelectedUsers')}
              </Button>
            )}
          </div>
          <Card className={`${themeMode === 'light' ? 'customColor' : ''} mt-2`}>
            <MaterialReactTable
              columns={columnsRight}
              data={(paginatedGroupUsers || []).filter(Boolean)}
              manualPagination={true}
              manualSorting={true}
              rowCount={sortedAndFilteredGroupUsers?.length ?? 0}
              enableGlobalFilter={false}
              enableColumnFilters={true}
              enableSorting={groupUsers && groupUsers?.length > 1 ? true : false}
              enableColumnResizing={false}
              enableHiding={false}
              enableRowSelection={true}
              enableSelectAll={true}
              enableToolbarInternalActions={false}
              positionToolbarAlertBanner='none'
              enableBatchRowSelection={false}
              defaultColumn={{
                minSize: 60,
                maxSize: 400
              }}
              muiTableContainerProps={{
                sx: {
                  maxWidth: '100%',
                  overflowX: 'auto'
                }
              }}
              muiTableHeadProps={{
                sx: {
                  position: 'sticky',
                  top: 0,
                  zIndex: 1
                }
              }}
              muiTableHeadCellProps={{
                sx: {
                  backgroundColor: 'background.paper',
                  zIndex: 1
                }
              }}
              getRowId={row => row?.id?.toString() || `${Math.random()}`}
              onRowSelectionChange={updater => {
                const newSelection =
                  typeof updater === 'function'
                    ? updater(Object.fromEntries(Array.from(checkedRightUsers).map(id => [id, true])))
                    : updater

                const selectedIds = Object.keys(newSelection)
                  .filter(key => newSelection[key])
                  .map(Number)
                setCheckedRightUsers(new Set(selectedIds))
              }}
              state={{
                pagination: paginationRight,
                sorting: sortingRight,
                globalFilter: globalFilterRight,
                isLoading: loadingGroupUsers,
                columnVisibility: tableState.columnVisibility,
                density: tableState.density,
                isFullScreen: tableState.isFullScreen,
                rowSelection: Object.fromEntries(Array.from(checkedRightUsers).map(id => [id, true]))
              }}
              onPaginationChange={setPaginationRight}
              onSortingChange={setSortingRight}
              onColumnVisibilityChange={updateColumnVisibility}
              onDensityChange={updateDensity}
              onIsFullScreenChange={updateFullScreen}
              localization={{
                noRecordsToDisplay: t('groupUsers.noData'),
                rowsPerPage: t('table.rowsPerPage'),
                of: t('table.of')
              }}
              renderTopToolbarCustomActions={() => (
                <div className='flex  gap-3 w-full '>
                  <DebouncedInput
                    value={globalFilterRight ?? ''}
                    onChange={value => setGlobalFilterRight(String(value))}
                  />
                  {checkedRightUsers.size > 0 && (
                    <div className='flex items-center gap-3'>
                      <Typography variant='body2' color='text.secondary'>
                        {checkedRightUsers.size} {t('table.recordsSelected')}
                      </Typography>
                      <Button variant='outlined' onClick={() => setCheckedRightUsers(new Set())}>
                        {t('table.clearSelection')}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default GroupUsersTable
