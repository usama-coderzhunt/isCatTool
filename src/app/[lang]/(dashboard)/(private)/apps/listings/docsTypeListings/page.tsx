'use client'

import { useState, useEffect } from 'react'
import { usePathname, useParams } from 'next/navigation'
import Grid from '@mui/material/Grid2'
import { useDocsHooks } from '@/services/useDocsHooks'
import DocsTypeTable from '@/views/apps/commonTable/docsTypeTable'
import { useTranslation } from 'react-i18next'
import { MRT_SortingState } from 'material-react-table'
import { getOrderingParam } from '@/utils/utility/sortingFn'

const DocsTypeListings = () => {
    const { getDocsType } = useDocsHooks()
    const { lang } = useParams() as { lang: string }
    const currentLocale = Array.isArray(lang) ? lang[0] : lang
    const { i18n } = useTranslation()
    const [sorting, setSorting] = useState<MRT_SortingState>([])

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    });
    const [globalFilter, setGlobalFilter] = useState('')

    const { data: docsTypeData, isLoading } = getDocsType(
        pagination.pageSize,
        pagination.pageIndex + 1,
        globalFilter,
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
                <DocsTypeTable
                    docsTypeData={docsTypeData?.data?.results ?? []}
                    totalRecords={docsTypeData?.data?.count ?? 0}
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

export default DocsTypeListings
