'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Grid from '@mui/material/Grid2'
import { useTranslation } from 'react-i18next'
import { MRT_SortingState } from 'material-react-table'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import { useTransactionsHooks } from '@/services/useTransactionsHooks'
import TransactionsTable from '@/views/apps/commonTable/transactionsTable'
import { usePaginatedSearch } from '@/utils/usePaginatedSearch'

const TransactionsListings = () => {
  const { lang } = useParams()
  const currentLocale = Array.isArray(lang) ? lang[0] : lang
  const { i18n } = useTranslation()
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const { pagination, setPagination, appliedSearch } = usePaginatedSearch({
    initialPageSize: 5,
    globalFilter
  })

  const { getTransactions } = useTransactionsHooks()
  const { data: transactionsData, isLoading } = getTransactions(
    pagination.pageSize,
    pagination.pageIndex + 1,
    appliedSearch,
    getOrderingParam(sorting)
  )

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  return (
    <Grid container spacing={0}>
      <Grid sx={{ width: '100%' }}>
        <TransactionsTable
          transactionsData={transactionsData?.data?.results ?? []}
          totalRecords={transactionsData?.data?.count ?? 0}
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

export default TransactionsListings
