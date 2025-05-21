'use client'

import { useParams } from 'next/navigation'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import CardMedia from '@mui/material/CardMedia'
import Chip from '@mui/material/Chip'
import { format } from 'date-fns'

import { useBlogHooks } from '@/services/useBlogHooks'

const BlogPostDetail = () => {
  const params = useParams()
  const slug = params.slug as string

  // Use the dedicated hook for fetching post by slug
  const { useFetchPostDetail, useFetchCategories, useFetchTags } = useBlogHooks()

  // This will automatically handle authentication through axiosInstance
  const { data: post, isLoading, isError } = useFetchPostDetail(slug)
  const { data: categoriesData } = useFetchCategories()
  const { data: tagsData } = useFetchTags()

  if (isLoading) {
    return (
      <Card>
        <Skeleton variant='rectangular' height={300} />
        <CardContent>
          <Skeleton variant='text' height={60} />
          <Skeleton variant='text' height={20} width='40%' />
          <Box sx={{ mt: 4 }}>
            <Skeleton variant='text' height={20} />
            <Skeleton variant='text' height={20} />
            <Skeleton variant='text' height={20} />
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (isError || !post) {
    return (
      <Card>
        <CardContent>
          <Typography variant='h5'>Post not found or you don't have permission to view it</Typography>
        </CardContent>
      </Card>
    )
  }

  const category = categoriesData?.results.find(c => c.id === post.category)
  const postTags = tagsData?.results.filter(t => post.tags.includes(t.id))

  return (
    <Card>
      {post.featured_image && (
        <CardMedia
          component='img'
          height='300'
          image={`${process.env.NEXT_PUBLIC_BASE_URL}${post.featured_image}`}
          alt={post.title}
        />
      )}
      <CardContent>
        <Typography variant='h4' gutterBottom>
          {post.title}
        </Typography>
        <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant='body2' color='text.secondary'>
            Published: {format(new Date(post.published_at), 'MMMM dd, yyyy')}
          </Typography>
          {category && <Chip label={category.name} size='small' color='primary' />}
          {postTags?.map(tag => <Chip key={tag.id} label={tag.name} size='small' variant='outlined' />)}
        </Box>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </CardContent>
    </Card>
  )
}

export default BlogPostDetail
