'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Grid from '@mui/material/Grid2'
import { useTranslation } from 'react-i18next'
import { MRT_SortingState } from 'material-react-table'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import { usePaginatedSearch } from '@/utils/usePaginatedSearch'
import { useServicesHooks } from '@/services/useServicesHooks'
import ServiceCategoryTable from '@/views/apps/commonTable/serviceCategoryTable'

const ServiceCategoryListings = () => {
  const { getCategories } = useServicesHooks()
  const { lang } = useParams() as { lang: string }
  const currentLocale = Array.isArray(lang) ? lang[0] : lang
  const { i18n } = useTranslation()
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const { pagination, setPagination, appliedSearch } = usePaginatedSearch({
    initialPageSize: 5,
    globalFilter
  })

  const { data: serviceCategoryData, isLoading } = getCategories(
    pagination.pageSize,
    pagination.pageIndex + 1,
    getOrderingParam(sorting),
    appliedSearch
  )

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  return (
    <Grid container spacing={0}>
      <Grid sx={{ width: '100%' }}>
        <ServiceCategoryTable
          categoryData={serviceCategoryData?.data?.results ?? []}
          totalRecords={serviceCategoryData?.data?.count ?? 0}
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

export default ServiceCategoryListings
