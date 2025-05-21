'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Grid from '@mui/material/Grid2'
import { useClientHooks } from '@/services/useClientHook'
import CommonTable from '@/views/apps/commonTable/ClientTable'
import { MRT_SortingState } from 'material-react-table'
import { getOrderingParam } from '@/utils/utility/sortingFn'

const AcademyDashboard = () => {
  const pathName = usePathname()
  const { useFetchClientTransactions } = useClientHooks()
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<MRT_SortingState>([])



  const { data, isLoading } = useFetchClientTransactions(
    pagination.pageSize,
    pagination.pageIndex + 1,
    globalFilter,
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
