'use client'

import { useEffect, useState } from 'react'

import { useTranslation } from 'next-i18next'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { useBlogHooks } from '@/services/useBlogHooks'
import { BlogPostsTable } from './BlogPostsTable'

const BlogPage = () => {
  const { t } = useTranslation('common')

  const [hasMounted, setHasMounted] = useState(false)

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    _refresh: 0
  })

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: ''
  })

  const { useFetchPosts, useFetchCategories } = useBlogHooks()

  const { data: postsData, isLoading } = useFetchPosts(pagination.pageSize, pagination.pageIndex + 1, {
    search: filters.search,
    status: filters.status,
    category: filters.category
  })

  const { data: categoriesData } = useFetchCategories()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <div>{t('common.loading')}</div>
  }

  const refreshData = () => {
    // This will trigger a refetch
    const timestamp = new Date().getTime()

    setPagination({ ...pagination, _refresh: timestamp })
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          {t('Blog Posts')}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <BlogPostsTable
          posts={postsData?.results || []}
          categories={categoriesData?.results || []}
          totalCount={postsData?.count || 0}
          isLoading={isLoading}
          pagination={pagination}
          setPagination={setPagination as (pagination: { pageIndex: number; pageSize: number }) => void}
          filters={filters}
          setFilters={setFilters}
          refreshData={refreshData}
        />
      </Grid>
    </Grid>
  )
}

export default BlogPage
