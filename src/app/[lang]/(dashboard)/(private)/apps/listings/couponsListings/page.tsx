'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Grid from '@mui/material/Grid2'
import { useTranslation } from 'react-i18next'
import { MRT_SortingState } from 'material-react-table'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import CouponsTable from '@/views/apps/commonTable/couponsTable'
import { useCouponsHooks } from '@/services/useCouponsHooks'
const CouponsListings = () => {
    const { lang } = useParams()
    const currentLocale = Array.isArray(lang) ? lang[0] : lang
    const { i18n } = useTranslation()
    const [sorting, setSorting] = useState<MRT_SortingState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    });

    const { getCoupons } = useCouponsHooks()
    const { data: couponsData, isLoading } = getCoupons(
        pagination.pageSize,
        pagination.pageIndex + 1,
        globalFilter,
        getOrderingParam(sorting),
    )

    useEffect(() => {
        if (currentLocale && i18n) {
            i18n.changeLanguage(currentLocale)
        }
    }, [currentLocale, i18n])

    return (
        <Grid container spacing={0}>
            <Grid sx={{ width: '100%' }}>
                <CouponsTable
                    couponsData={couponsData?.data?.results ?? []}
                    totalRecords={couponsData?.data?.count ?? 0}
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

export default CouponsListings
