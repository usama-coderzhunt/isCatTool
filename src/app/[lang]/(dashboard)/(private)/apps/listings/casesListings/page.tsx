'use client'

import { useLayoutEffect, useState } from 'react'
import Grid from '@mui/material/Grid2'
import CasesTable from '@/views/apps/commonTable/casesTable'
import { useCasesHooks } from '@/services/useCases'
import { MRT_SortingState } from 'material-react-table'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import { useParams } from 'next/navigation'
import { usePaginatedSearch } from '@/utils/usePaginatedSearch'

const CasesListings = ({ isClientActive }: { isClientActive?: boolean }) => {
  const { getCases } = useCasesHooks()
  const params = useParams()
  const [clientId, setClientId] = useState<number>()
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [caseStatus, setCaseStatus] = useState<string | null>(null)
  const { pagination, setPagination, appliedSearch } = usePaginatedSearch({
    initialPageSize: 5,
    globalFilter
  })

  useLayoutEffect(() => {
    setClientId(Number(params.id))
  }, [params.id])

  const { data: casesData, isLoading } = getCases(
    pagination.pageSize,
    pagination.pageIndex + 1,
    appliedSearch,
    getOrderingParam(sorting),
    clientId ? clientId : undefined,
    caseStatus ? caseStatus : undefined
  )

  return (
    <Grid container spacing={0}>
      <Grid sx={{ width: '100%' }}>
        <CasesTable
          casesData={casesData?.data?.results || []}
          totalRecords={casesData?.data?.count || 0}
          pagination={pagination}
          setPagination={setPagination}
          setGlobalFilter={setGlobalFilter}
          globalFilter={globalFilter}
          isLoading={isLoading}
          sorting={sorting}
          setSorting={setSorting}
          clientId={clientId}
          setCaseStatus={setCaseStatus}
          caseStatus={caseStatus}
          isClientActive={isClientActive}
        />
      </Grid>
    </Grid>
  )
}

export default CasesListings
