'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { useTranslation } from 'next-i18next'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'

import { format } from 'date-fns'

import { toast } from 'react-toastify'

import type { Category, Post } from '@/services/useBlogHooks'

import axiosInstance from '@/utils/api/axiosInstance'

interface BlogPostsTableProps {
  posts: Post[]
  categories: Category[]
  totalCount: number
  isLoading: boolean
  pagination: {
    pageIndex: number
    pageSize: number
  }
  setPagination: (pagination: { pageIndex: number; pageSize: number }) => void
  filters: {
    search: string
    status: string
    category: string
  }
  setFilters: (filters: { search: string; status: string; category: string }) => void
  refreshData: () => void
}

export const BlogPostsTable = (props: BlogPostsTableProps) => {
  const { posts, categories, totalCount, isLoading, pagination, setPagination, filters, setFilters, refreshData } =
    props

  const { t } = useTranslation('global')
  const router = useRouter()

  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null)
  const [actionMenuPostId, setActionMenuPostId] = useState<number | null>(null)
  const [localPosts, setLocalPosts] = useState<Post[]>(posts)

  // Update local posts whenever props posts change
  useEffect(() => {
    setLocalPosts(posts)
  }, [posts])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPagination({ ...pagination, pageIndex: newPage })
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagination({
      pageIndex: 0,
      pageSize: parseInt(event.target.value, 10)
    })
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: event.target.value })
  }

  const handleStatusChange = (event: any) => {
    setFilters({ ...filters, status: event.target.value })
  }

  const handleCategoryChange = (event: any) => {
    setFilters({ ...filters, category: event.target.value })
  }

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedPosts(localPosts.map(post => post.slug))
    } else {
      setSelectedPosts([])
    }
  }

  // Update handleSelectPost to work with slugs
  const handleSelectPost = (postSlug: string) => {
    setSelectedPosts(prev => {
      if (prev.includes(postSlug)) {
        return prev.filter(slug => slug !== postSlug)
      } else {
        return [...prev, postSlug]
      }
    })
  }

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, postId: number) => {
    setActionMenuAnchor(event.currentTarget)
    setActionMenuPostId(postId)
  }

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null)
    setActionMenuPostId(null)
  }

  const handleEditPost = () => {
    if (actionMenuPostId) {
      const post = localPosts.find(p => p.id === actionMenuPostId)

      if (post) {
        router.push(`/apps/blog/edit/${post.slug}`)
      }
    }

    handleActionMenuClose()
  }

  const handleDeleteClick = () => {
    if (actionMenuPostId) {
      const post = localPosts.find(p => p.id === actionMenuPostId)

      if (post) {
        setPostToDelete(post.slug)
      }
    }

    setDeleteConfirmOpen(true)
    handleActionMenuClose()
  }

  const handleDeletePost = async () => {
    if (!postToDelete) return

    setIsDeleting(true)

    try {
      await axiosInstance.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blog/post/${postToDelete}/`)

      // Update local state for immediate UI feedback
      const postBeingDeleted = localPosts.find(p => p.slug === postToDelete)

      if (postBeingDeleted) {
        setLocalPosts(prev => prev.filter(p => p.slug !== postToDelete))

        // Remove from selected posts if it was selected
        setSelectedPosts(prev => prev.filter(id => id !== String(postBeingDeleted.id)))
      }

      toast.success(t('blog.postDeleted'))

      // Call the parent's refresh function
      refreshData()
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error(t('common.errorOccurred'))
    } finally {
      setIsDeleting(false)
      setDeleteConfirmOpen(false)
      setPostToDelete(null)
    }
  }

  const handleBulkDeleteClick = () => {
    if (selectedPosts.length > 0) {
      setBulkDeleteConfirmOpen(true)
    }
  }

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true)

    try {
      await axiosInstance.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blog/post/bulk_delete/`, {
        data: { slugs: selectedPosts }
      })

      // Update local state for immediate UI feedback
      setLocalPosts(prev => prev.filter(p => !selectedPosts.includes(p.slug)))

      toast.success(t('Posts Deleted'))
      setSelectedPosts([])

      // Call the parent's refresh function
      refreshData()
    } catch (error) {
      console.error('Error bulk deleting posts:', error)
      toast.error(t('common.errorOccurred'))
    } finally {
      setIsBulkDeleting(false)
      setBulkDeleteConfirmOpen(false)
    }
  }

  const handleCreatePost = () => {
    router.push('/apps/blog/create')
  }

  const getStatusColor = (status: string): 'success' | 'warning' | 'default' => {
    if (status === 'published') return 'success'
    if (status === 'draft') return 'warning'

    return 'default'
  }

  // Use localPosts for rendering instead of the posts from props
  const postsToDisplay = isLoading ? [] : localPosts

  return (
    <Card>
      <CardHeader
        title={t('Posts')}
        action={
          <Button variant='contained' color='primary' onClick={handleCreatePost}>
            {t('New Post')}
          </Button>
        }
      />
      <Box sx={{ p: 3, pb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size='small'
            placeholder={t('common.search')}
            value={filters.search}
            onChange={handleSearchChange}
            sx={{ width: '250px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='tabler-search' />
                </InputAdornment>
              )
            }}
          />

          <FormControl size='small' sx={{ width: '150px' }}>
            <InputLabel id='status-filter-label'>{t('Status')}</InputLabel>
            <Select
              labelId='status-filter-label'
              value={filters.status}
              label={t('Status')}
              onChange={handleStatusChange}
            >
              <MenuItem value=''>{t('All')}</MenuItem>
              <MenuItem value='published'>{t('Published')}</MenuItem>
              <MenuItem value='draft'>{t('Draft')}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size='small' sx={{ width: '200px' }}>
            <InputLabel id='category-filter-label'>{t('Category')}</InputLabel>
            <Select
              labelId='category-filter-label'
              value={filters.category}
              label={t('Category')}
              onChange={handleCategoryChange}
            >
              <MenuItem value=''>{t('All')}</MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedPosts.length > 0 && (
            <Button
              variant='outlined'
              color='error'
              onClick={handleBulkDeleteClick}
              startIcon={<i className='tabler-trash' />}
            >
              {t('common.delete')} ({selectedPosts.length})
            </Button>
          )}
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 300px)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding='checkbox'>
                <Checkbox
                  indeterminate={selectedPosts.length > 0 && selectedPosts.length < postsToDisplay.length}
                  checked={postsToDisplay.length > 0 && selectedPosts.length === postsToDisplay.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>{t('Title')}</TableCell>
              <TableCell>{t('Category')}</TableCell>
              <TableCell>{t('Status')}</TableCell>
              <TableCell>{t('PublishedAt')}</TableCell>
              <TableCell>{t('Views')}</TableCell>
              <TableCell align='right'>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align='center' sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : postsToDisplay.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align='center' sx={{ py: 3 }}>
                  {t('No Data')}
                </TableCell>
              </TableRow>
            ) : (
              postsToDisplay.map(post => {
                const category = categories.find(c => c.id === post.category)

                return (
                  <TableRow key={post.id} hover>
                    <TableCell padding='checkbox'>
                      <Checkbox
                        checked={selectedPosts.includes(post.slug)}
                        onChange={() => handleSelectPost(post.slug)}
                      />
                    </TableCell>
                    <TableCell>{post.title}</TableCell>
                    <TableCell>{category?.name || '-'}</TableCell>
                    <TableCell>
                      <Chip size='small' label={t(`${post.status}`)} color={getStatusColor(post.status)} />
                    </TableCell>
                    <TableCell>{post.published_at ? format(new Date(post.published_at), 'PP') : '-'}</TableCell>
                    <TableCell>{post.views}</TableCell>
                    <TableCell align='right'>
                      <IconButton size='small' onClick={e => handleActionMenuOpen(e, post.id)}>
                        <i className='tabler-dots-vertical' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component='div'
        count={totalCount}
        rowsPerPage={pagination.pageSize}
        page={pagination.pageIndex}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Action Menu */}
      <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={handleActionMenuClose}>
        <MenuItem onClick={handleEditPost}>
          <i className='tabler-edit mr-2' />
          {t('common.edit')}
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <i className='tabler-trash mr-2' />
          {t('common.delete')}
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>{t('common.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>{t('blog.deleteConfirmation')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>{t('common.cancel')}</Button>
          <Button color='error' onClick={handleDeletePost} disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={24} /> : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteConfirmOpen} onClose={() => setBulkDeleteConfirmOpen(false)}>
        <DialogTitle>{t('common.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>{t('blog.bulkDeleteConfirmation', { count: selectedPosts.length })}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteConfirmOpen(false)}>{t('common.cancel')}</Button>
          <Button color='error' onClick={handleBulkDelete} disabled={isBulkDeleting}>
            {isBulkDeleting ? <CircularProgress size={24} /> : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}
