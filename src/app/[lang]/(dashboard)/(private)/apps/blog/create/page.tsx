'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import OutlinedInput from '@mui/material/OutlinedInput'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { styled } from '@mui/material/styles'

import type { Post } from '@/services/useBlogHooks'
import { useBlogHooks } from '@/services/useBlogHooks'

// Styled component for file upload
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
})

const CreatePostPage = () => {
  const router = useRouter()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [postData, setPostData] = useState<Partial<Post>>({
    title: '',
    slug: '',
    content: '',
    status: 'draft',
    category: undefined,
    tags: []
  })

  const { useCreatePost, useFetchCategories, useFetchTags } = useBlogHooks()
  const { data: categoriesData, isLoading: categoriesLoading } = useFetchCategories()
  const { data: tagsData, isLoading: tagsLoading } = useFetchTags()
  const createPostMutation = useCreatePost()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setPostData({ ...postData, [name]: value })
  }

  const handleCategoryChange = (e: any) => {
    setPostData({ ...postData, category: e.target.value })
  }

  const handleTagsChange = (e: any) => {
    const { value } = e.target

    setPostData({ ...postData, tags: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()

      // Add all post data to FormData
      Object.entries(postData).forEach(([key, value]) => {
        if (key === 'tags' && Array.isArray(value)) {
          value.forEach(tagId => {
            formData.append('tags', tagId.toString())
          })
        } else if (value !== undefined && key !== 'featured_image') {
          formData.append(key, value?.toString() || '')
        }
      })

      // Add image file if selected
      if (imageFile) {
        formData.append('featured_image', imageFile)
      }

      await createPostMutation.mutateAsync(formData)
      router.push(`/apps/blog`)
    } catch (error) {
      console.error('Failed to create blog post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTitleBlur = () => {
    if (postData.title && !postData.slug) {
      const slug = postData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      setPostData({ ...postData, slug })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader title='Create New Blog Post' />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Title'
                name='title'
                value={postData.title}
                onChange={handleChange}
                onBlur={handleTitleBlur}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Slug'
                name='slug'
                value={postData.slug}
                onChange={handleChange}
                required
                helperText='URL-friendly version of the title'
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant='body2'>Featured Image</Typography>
                <Button component='label' variant='outlined' startIcon={<CloudUploadIcon />}>
                  Upload Image
                  <VisuallyHiddenInput type='file' accept='image/*' onChange={handleImageChange} />
                </Button>
                {imageFile && (
                  <Box mt={2}>
                    <Chip label={imageFile.name} variant='outlined' onDelete={() => setImageFile(null)} />
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={postData.category || ''}
                  onChange={handleCategoryChange}
                  label='Category'
                  disabled={categoriesLoading}
                  required
                >
                  {categoriesData?.results.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name='status'
                  value={postData.status || 'draft'}
                  onChange={e => setPostData({ ...postData, status: e.target.value as 'draft' | 'published' })}
                  label='Status'
                >
                  <MenuItem value='draft'>Draft</MenuItem>
                  <MenuItem value='published'>Published</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id='tags-label'>Tags</InputLabel>
                <Select
                  labelId='tags-label'
                  multiple
                  value={postData.tags || []}
                  onChange={handleTagsChange}
                  input={<OutlinedInput id='select-multiple-tags' label='Tags' />}
                  disabled={tagsLoading}
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(tagId => {
                        const tag = tagsData?.results.find(t => t.id === tagId)

                        return tag ? <Chip key={tagId} label={tag.name} size='small' /> : null
                      })}
                    </Box>
                  )}
                >
                  {tagsData?.results.map(tag => (
                    <MenuItem key={tag.id} value={tag.id}>
                      {tag.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={10}
                label='Content'
                name='content'
                value={postData.content}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Button variant='outlined' onClick={() => router.push('/apps/blog')} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type='submit' variant='contained' disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Create Post'}
          </Button>
        </CardActions>
      </Card>
    </form>
  )
}

export default CreatePostPage
