'use client'

import { useState } from 'react'

import { useTranslation } from 'next-i18next'

// MUI Components
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { format } from 'date-fns'

// Hooks and services
import { Tag, useBlogHooks } from '@/services/useBlogHooks'

const TagsPage = () => {
  const { t } = useTranslation('common')

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [currentTag, setCurrentTag] = useState<Partial<Tag>>({ name: '', slug: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<number | null>(null)
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null)
  const [actionMenuTagId, setActionMenuTagId] = useState<number | null>(null)

  // Hooks from useBlogHooks
  const { useFetchTags, useCreateTag, useUpdateTag, useDeleteTag, useBulkDeleteTags } = useBlogHooks()

  const { data: tagsData, isLoading } = useFetchTags(pagination.pageSize, pagination.pageIndex + 1, {
    search: searchQuery
  })

  const createTag = useCreateTag()
  const updateTag = useUpdateTag()
  const deleteTag = useDeleteTag()
  const bulkDeleteTags = useBulkDeleteTags()

  // Table handlers
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
    setSearchQuery(event.target.value)
  }

  // Selection handlers
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked && tagsData?.results) {
      setSelectedTags(tagsData.results.map(tag => tag.id))
    } else {
      setSelectedTags([])
    }
  }

  const handleSelectTag = (tagId: number) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId)
      } else {
        return [...prev, tagId]
      }
    })
  }

  // Dialog handlers
  const handleOpenCreateDialog = () => {
    setCurrentTag({ name: '', slug: '' })
    setIsEditing(false)
    setIsDialogOpen(true)
  }

  const handleOpenEditDialog = (tag: Tag) => {
    setCurrentTag({ ...tag })
    setIsEditing(true)
    setIsDialogOpen(true)
    handleActionMenuClose()
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
  }

  // Form handlers
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setCurrentTag({ ...currentTag, [name]: value })
  }

  // Auto-generate slug from name
  const handleNameBlur = () => {
    if (currentTag.name && !currentTag.slug) {
      const slug = currentTag.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      setCurrentTag({ ...currentTag, slug })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isEditing && currentTag.id) {
      await updateTag.mutateAsync({
        id: currentTag.id,
        data: { name: currentTag.name, slug: currentTag.slug }
      })
    } else {
      await createTag.mutateAsync({
        name: currentTag.name as string,
        slug: currentTag.slug as string
      })
    }

    setIsDialogOpen(false)
  }

  // Action menu handlers
  const handleActionMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, tagId: number) => {
    setActionMenuAnchor(event.currentTarget)
    setActionMenuTagId(tagId)
  }

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null)
    setActionMenuTagId(null)
  }

  // Delete handlers
  const handleDeleteClick = () => {
    setTagToDelete(actionMenuTagId)
    setIsDeleteDialogOpen(true)
    handleActionMenuClose()
  }

  const handleDeleteTag = async () => {
    if (!tagToDelete) return

    await deleteTag.mutateAsync(tagToDelete)
    setIsDeleteDialogOpen(false)
    setTagToDelete(null)
  }

  const handleBulkDeleteClick = () => {
    if (selectedTags.length > 0) {
      setIsBulkDeleteDialogOpen(true)
    }
  }

  const handleBulkDelete = async () => {
    await bulkDeleteTags.mutateAsync(selectedTags)
    setIsBulkDeleteDialogOpen(false)
    setSelectedTags([])
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          {t('Tags')}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={t('Tags')}
            action={
              <Button variant='contained' color='primary' onClick={handleOpenCreateDialog}>
                {t('New Tag')}
              </Button>
            }
          />

          <Box sx={{ p: 3, pb: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
              <TextField
                size='small'
                placeholder={t('Search')}
                value={searchQuery}
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

              {selectedTags.length > 0 && (
                <Button
                  variant='outlined'
                  color='error'
                  onClick={handleBulkDeleteClick}
                  startIcon={<i className='tabler-trash' />}
                >
                  {t('Delete')} ({selectedTags.length})
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
                      indeterminate={
                        selectedTags.length > 0 && tagsData?.results && selectedTags.length < tagsData.results.length
                      }
                      checked={
                        tagsData?.results &&
                        tagsData.results.length > 0 &&
                        selectedTags.length === tagsData.results.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>{t('Name')}</TableCell>
                  <TableCell>{t('Slug')}</TableCell>
                  <TableCell>{t('CreatedAt')}</TableCell>
                  <TableCell align='right'>{t('Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align='center' sx={{ py: 3 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : !tagsData?.results || tagsData.results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align='center' sx={{ py: 3 }}>
                      {t('No Data')}
                    </TableCell>
                  </TableRow>
                ) : (
                  tagsData.results.map(tag => (
                    <TableRow key={tag.id} hover>
                      <TableCell padding='checkbox'>
                        <Checkbox checked={selectedTags.includes(tag.id)} onChange={() => handleSelectTag(tag.id)} />
                      </TableCell>
                      <TableCell>{tag.name}</TableCell>
                      <TableCell>{tag.slug}</TableCell>
                      <TableCell>{format(new Date(tag.created_at), 'PP')}</TableCell>
                      <TableCell align='right'>
                        <IconButton size='small' onClick={e => handleActionMenuOpen(e, tag.id)}>
                          <i className='tabler-dots-vertical' />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component='div'
            count={tagsData?.count || 0}
            rowsPerPage={pagination.pageSize}
            page={pagination.pageIndex}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Grid>

      {/* Action Menu */}
      <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={handleActionMenuClose}>
        <MenuItem
          onClick={() => {
            const tag = tagsData?.results.find(t => t.id === actionMenuTagId)

            if (tag) handleOpenEditDialog(tag)
          }}
        >
          <i className='tabler-edit mr-2' />
          {t('Edit')}
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <i className='tabler-trash mr-2' />
          {t('Delete')}
        </MenuItem>
      </Menu>

      {/* Create/Edit Tag Dialog */}
      <Dialog open={isDialogOpen} onClose={handleDialogClose} maxWidth='sm' fullWidth>
        <DialogTitle>{isEditing ? t('blog.editTag') : t('blog.createTag')}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('Name')}
                  name='name'
                  value={currentTag.name}
                  onChange={handleFormChange}
                  onBlur={handleNameBlur}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('Slug')}
                  name='slug'
                  value={currentTag.slug}
                  onChange={handleFormChange}
                  required
                  helperText={t('blog.slugHelp')}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>{t('Cancel')}</Button>
            <Button type='submit' variant='contained' disabled={createTag.isPending || updateTag.isPending}>
              {createTag.isPending || updateTag.isPending ? (
                <CircularProgress size={24} />
              ) : isEditing ? (
                t('Update')
              ) : (
                t('Create')
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>{t('ConfirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>{t('blog.deleteTagConfirmation')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>{t('Cancel')}</Button>
          <Button color='error' onClick={handleDeleteTag} disabled={deleteTag.isPending}>
            {deleteTag.isPending ? <CircularProgress size={24} /> : t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={isBulkDeleteDialogOpen} onClose={() => setIsBulkDeleteDialogOpen(false)}>
        <DialogTitle>{t('ConfirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>{t('blog.bulkDeleteTagsConfirmation', { count: selectedTags.length })}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsBulkDeleteDialogOpen(false)}>{t('Cancel')}</Button>
          <Button color='error' onClick={handleBulkDelete} disabled={bulkDeleteTags.isPending}>
            {bulkDeleteTags.isPending ? <CircularProgress size={24} /> : t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default TagsPage
