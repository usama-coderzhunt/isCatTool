'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Grid from '@mui/material/Grid2'
import { useTranslation } from 'react-i18next'
import { MRT_SortingState } from 'material-react-table'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import OrdersTable from '@/views/apps/commonTable/ordersTable'
import { useOrdersHooks } from '@/services/useOrdersHooks'
const OrdersListings = () => {
    const { lang } = useParams()
    const currentLocale = Array.isArray(lang) ? lang[0] : lang
    const { i18n } = useTranslation()
    const [sorting, setSorting] = useState<MRT_SortingState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    });

    const { getOrders } = useOrdersHooks()
    const { data: ordersData, isLoading } = getOrders(
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
                <OrdersTable
                    ordersData={ordersData?.data?.results ?? []}
                    totalRecords={ordersData?.data?.count ?? 0}
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

export default OrdersListings
