import { useState } from 'react'
import Link from 'next/link'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import CardActionArea from '@mui/material/CardActionArea'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Pagination from '@mui/material/Pagination'
import SearchIcon from '@mui/icons-material/Search'
import { format } from 'date-fns'
import { Post, Category, Tag } from '@/services/useBlogHooks'

interface BlogPostListProps {
  posts: Post[]
  categories: Category[]
  tags: Tag[]
  totalCount: number
  isLoading: boolean
  pagination: {
    pageIndex: number
    pageSize: number
  }
  setPagination: (pagination: { pageIndex: number; pageSize: number }) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

const BlogPostList = (props: BlogPostListProps) => {
  const { posts, categories, tags, totalCount, isLoading, pagination, setPagination, searchQuery, setSearchQuery } =
    props

  const [categoryFilter, setCategoryFilter] = useState<number | ''>('')
  const [tagFilter, setTagFilter] = useState<number | ''>('')

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setPagination({ ...pagination, pageIndex: page - 1 })
  }

  const pageCount = Math.ceil(totalCount / pagination.pageSize)

  return (
    <Card>
      <CardHeader title='Blog Posts' />
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 5, gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size='small'
            placeholder='Search posts...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon fontSize='small' />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: '200px' }}
          />

          <FormControl size='small' sx={{ minWidth: '200px' }}>
            <InputLabel>Category</InputLabel>
            <Select value={categoryFilter} label='Category' onChange={e => setCategoryFilter(e.target.value as number)}>
              <MenuItem value=''>All Categories</MenuItem>
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size='small' sx={{ minWidth: '200px' }}>
            <InputLabel>Tag</InputLabel>
            <Select value={tagFilter} label='Tag' onChange={e => setTagFilter(e.target.value as number)}>
              <MenuItem value=''>All Tags</MenuItem>
              {tags.map(tag => (
                <MenuItem key={tag.id} value={tag.id}>
                  {tag.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : posts.length === 0 ? (
          <Typography>No posts found</Typography>
        ) : (
          <Grid container spacing={4}>
            {posts.map(post => {
              const category = categories.find(c => c.id === post.category)
              const postTags = tags.filter(t => post.tags.includes(t.id))

              return (
                <Grid item xs={12} md={6} key={post.id}>
                  <Card>
                    <CardActionArea component={Link} href={`/blog/${post.slug}`}>
                      {post.featured_image && (
                        <CardMedia
                          component='img'
                          height='200'
                          image={`${process.env.NEXT_PUBLIC_BASE_URL}${post.featured_image}`}
                          alt={post.title}
                        />
                      )}
                      <CardContent>
                        <Typography variant='h6' gutterBottom>
                          {post.title}
                        </Typography>
                        <Typography variant='body2' color='text.secondary' gutterBottom>
                          {format(new Date(post.published_at), 'MMMM dd, yyyy')}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {category && <Chip label={category.name} size='small' color='primary' />}
                          {postTags.map(tag => (
                            <Chip key={tag.id} label={tag.name} size='small' variant='outlined' />
                          ))}
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}

        {totalCount > pagination.pageSize && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Pagination count={pageCount} page={pagination.pageIndex + 1} onChange={handlePageChange} color='primary' />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default BlogPostList
