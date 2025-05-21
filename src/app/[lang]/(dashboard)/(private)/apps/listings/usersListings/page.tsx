'use client'

import { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid2'
import { useUserManagementHooks } from '@/services/useUserManagementHooks'
import UsersTable from '@/views/apps/commonTable/UsersTable'
import { MRT_SortingState } from 'material-react-table'
import { getOrderingParam } from '@/utils/utility/sortingFn'

const UsersListings = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<MRT_SortingState>([])

  const { useUsers } = useUserManagementHooks()
  const { data: usersData, isLoading } = useUsers(
    pagination.pageSize,
    pagination.pageIndex + 1,
    getOrderingParam(sorting),
    globalFilter
  )


  return (
    <Grid container spacing={0}>
      <Grid sx={{ width: '100%' }}>
        <UsersTable
          usersData={usersData?.results ?? []}
          totalRecords={usersData?.count ?? 0}
          pagination={pagination}
          setPagination={setPagination}
          isLoading={isLoading}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          sorting={sorting}
          setSorting={setSorting}
        />
      </Grid>
    </Grid>
  )
}

export default UsersListings
