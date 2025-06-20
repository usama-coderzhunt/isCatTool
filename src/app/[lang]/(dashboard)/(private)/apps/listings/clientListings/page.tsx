'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Grid from '@mui/material/Grid2'
import { useClientHooks } from '@/services/useClientHook'
import CommonTable from '@/views/apps/commonTable/ClientTable'
import { MRT_SortingState } from 'material-react-table'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import { usePaginatedSearch } from '@/utils/usePaginatedSearch'

const AcademyDashboard = () => {
  const pathName = usePathname()
  const { useFetchClientTransactions } = useClientHooks()
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const { pagination, setPagination, appliedSearch } = usePaginatedSearch({
    initialPageSize: 10,
    globalFilter
  })

  const { data, isLoading } = useFetchClientTransactions(
    pagination.pageSize,
    pagination.pageIndex + 1,
    appliedSearch,
    pathName.includes('/clients') ? 'client' : 'lead',
    getOrderingParam(sorting)
  )

  return (
    <Grid container spacing={0}>
      <Grid sx={{ width: '100%' }}>
        <CommonTable
          clientsData={data?.data?.results ?? []}
          totalRecords={data?.data?.count ?? 0}
          pagination={pagination}
          setPagination={setPagination}
          setGlobalFilter={setGlobalFilter}
          globalFilter={globalFilter}
          isLoading={isLoading}
          sorting={sorting}
          setSorting={setSorting}
        />
      </Grid>
    </Grid>
  )
}

export default AcademyDashboard
