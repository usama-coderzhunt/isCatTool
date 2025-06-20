'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Grid from '@mui/material/Grid2'
import { useTranslation } from 'react-i18next'
import { MRT_SortingState } from 'material-react-table'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import { usePaginatedSearch } from '@/utils/usePaginatedSearch'
import { usePaymentsHooks } from '@/services/usePaymentsHooks'
import InvoicesTable from '@/views/apps/commonTable/invoicesTable'

const InvoicesListings = () => {
  const { lang } = useParams() as { lang: string }
  const currentLocale = Array.isArray(lang) ? lang[0] : lang
  const { i18n } = useTranslation()

  //states
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const { pagination, setPagination, appliedSearch } = usePaginatedSearch({
    initialPageSize: 5,
    globalFilter
  })

  //hooks
  const { getInvoices } = usePaymentsHooks()
  const { data: invoicesData, isLoading } = getInvoices(
    pagination.pageSize,
    pagination.pageIndex + 1,
    appliedSearch?.trim() || undefined,
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
        <InvoicesTable
          invoicesData={invoicesData?.data?.results ?? []}
          totalRecords={invoicesData?.data?.count ?? 0}
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

export default InvoicesListings
