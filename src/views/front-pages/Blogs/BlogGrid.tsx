import React from 'react'
import BlogCard from './BlogCard'
import { Skeleton, Card, CardContent, CardActions, Grid, Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { Post } from '@/types/blog'
import BlogSkeletonCard from './BlogSkeletonCard'
import LoadingIndicator from './LoadingIndicator'

interface BlogGridProps {
  blogs: Post[]
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void
  isLoading: boolean
}

const BlogGrid: React.FC<BlogGridProps> = ({ blogs, handleScroll, isLoading }) => {
  const { t } = useTranslation('global')

  return (
    <div
      className='mt-10 w-full py-4 sm:py-6 lg:py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center lg:max-w-[90%] overflow-y-auto blogs-container'
      onScroll={handleScroll}
    >
      {isLoading && blogs.length === 0 ? (
        // Display w-full flex flex-col mx-auto blogs-container overflow-auto px-4 justify-center items-centerloading skeletons when initially loading
        Array.from(new Array(6)).map((_, index) => <BlogSkeletonCard key={index} />)
      ) : blogs.length > 0 ? (
        // Display blog posts
        blogs.map((blog, index) => <BlogCard blog={blog} key={blog.id || index} />)
      ) : (
        // No posts found message
        <Box className='col-span-full text-center py-10'>
          <Typography variant='h6' color='text.secondary'>
            {t('blog.noPosts')}
          </Typography>
        </Box>
      )}

      {/* Loading indicator at bottom for infinite scroll */}
      {isLoading && blogs.length > 0 && <LoadingIndicator />}
    </div>
  )
}

export default BlogGrid
