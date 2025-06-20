'use client'

import { useState } from 'react'
import { useStaffHooks } from '@/services/useStaffHooks'
import PositionsTable from '@/views/apps/commonTable/PositionsTable'
import Grid from '@mui/material/Grid2'
import { MRT_SortingState } from 'material-react-table'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import { usePaginatedSearch } from '@/utils/usePaginatedSearch'

const PositionsListings = () => {
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const { pagination, setPagination, appliedSearch } = usePaginatedSearch({
    initialPageSize: 5,
    globalFilter
  })

  const { useStaffPositions, useDeleteStaffPosition, useDeleteStaffPositionBulk } = useStaffHooks()
  const { data: positionsData, isLoading } = useStaffPositions(
    pagination.pageSize,
    pagination.pageIndex + 1,
    getOrderingParam(sorting),
    appliedSearch
  )
  const deletePosition = useDeleteStaffPosition()
  const deletePositionBulk = useDeleteStaffPositionBulk()

  return (
    <Grid container spacing={0}>
      <Grid sx={{ width: '100%' }}>
        <PositionsTable
          positionsData={positionsData?.results || []}
          totalRecords={positionsData?.count || 0}
          pagination={pagination}
          setPagination={setPagination}
          isLoading={isLoading}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          deletePosition={deletePosition}
          sorting={sorting}
          setSorting={setSorting}
          deletePositionBulk={deletePositionBulk}
        />
      </Grid>
    </Grid>
  )
}

export default PositionsListings
