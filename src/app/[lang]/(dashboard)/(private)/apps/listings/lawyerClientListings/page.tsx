'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Grid from '@mui/material/Grid2'
import LawyerClientTable from '@/views/apps/commonTable/lawyerClientTable'
import { useLawyerClientsHooks } from '@/services/lawyerClients'
import { MRT_SortingState } from 'material-react-table'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import { usePaginatedSearch } from '@/utils/usePaginatedSearch'

const LawyerClientListings = () => {
  const pathName = usePathname()
  const { getLawyerClients } = useLawyerClientsHooks()
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const { pagination, setPagination, appliedSearch } = usePaginatedSearch({
    initialPageSize: 5,
    globalFilter
  })

  const { data: lawyerClientsData, isLoading } = getLawyerClients(
    pagination.pageSize,
    pagination.pageIndex + 1,
    appliedSearch,
    pathName.includes('/lawyer-clients') ? 'client' : 'lead',
    getOrderingParam(sorting)
  )
  return (
    <Grid container spacing={0}>
      <Grid sx={{ width: '100%' }}>
        <LawyerClientTable
          lawyerClientsData={lawyerClientsData?.data?.results ?? []}
          totalRecords={lawyerClientsData?.data?.count ?? 0}
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

export default LawyerClientListings
