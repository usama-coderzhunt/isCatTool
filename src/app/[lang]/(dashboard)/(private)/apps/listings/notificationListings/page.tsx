'use client'

import { useState } from 'react'
import Grid from '@mui/material/Grid2'
import NotificationsTable from '@/views/apps/commonTable/notificationsTable'
import { useNotificationHooks } from '@/services/useNotificationHooks'
import { MRT_SortingState } from 'material-react-table'
import { getOrderingParam } from '@/utils/utility/sortingFn'

const NotificationsPage = () => {
    const { getNotifications } = useNotificationHooks()
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    });
    const [globalFilter, setGlobalFilter] = useState('')
    const [sorting, setSorting] = useState<MRT_SortingState>([])

    const { data: notificationsData, isLoading } = getNotifications(
        pagination.pageSize,
        pagination.pageIndex + 1,
        globalFilter,
        getOrderingParam(sorting)
    )

    return (
        <Grid container spacing={0}>
            <Grid sx={{ width: '100%' }}>
                <NotificationsTable
                    notificationsData={notificationsData?.data?.results ?? []}
                    totalRecords={notificationsData?.data?.count ?? 0}
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

export default NotificationsPage
