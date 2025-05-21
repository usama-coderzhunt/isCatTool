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

// Hooks and services
import { format } from 'date-fns'
import type { Category} from '@/services/useBlogHooks';

import { useBlogHooks } from '@/services/useBlogHooks'


const CategoriesPage = () => {
  const { t } = useTranslation('common')

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)

  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: ''
  })

  const [isEditing, setIsEditing] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null)
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null)
  const [actionMenuCategoryId, setActionMenuCategoryId] = useState<number | null>(null)

  // Hooks from useBlogHooks
  const { useFetchCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useBulkDeleteCategories } =
    useBlogHooks()

  const { data: categoriesData, isLoading } = useFetchCategories(pagination.pageSize, pagination.pageIndex + 1, {
    search: searchQuery
  })

  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const bulkDeleteCategories = useBulkDeleteCategories()

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
    if (event.target.checked && categoriesData?.results) {
      setSelectedCategories(categoriesData.results.map(category => category.id))
    } else {
      setSelectedCategories([])
    }
  }

  const handleSelectCategory = (categoryId: number) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  // Dialog handlers
  const handleOpenCreateDialog = () => {
    setCurrentCategory({ name: '', slug: '', description: '' })
    setIsEditing(false)
    setIsDialogOpen(true)
  }

  const handleOpenEditDialog = (category: Category) => {
    setCurrentCategory({ ...category })
    setIsEditing(true)
    setIsDialogOpen(true)
    handleActionMenuClose()
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
  }

  // Form handlers
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setCurrentCategory({ ...currentCategory, [name]: value })
  }

  // Auto-generate slug from name
  const handleNameBlur = () => {
    if (currentCategory.name && !currentCategory.slug) {
      const slug = currentCategory.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      setCurrentCategory({ ...currentCategory, slug })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isEditing && currentCategory.id) {
      await updateCategory.mutateAsync({
        id: currentCategory.id,
        data: {
          name: currentCategory.name,
          slug: currentCategory.slug,
          description: currentCategory.description
        }
      })
    } else {
      await createCategory.mutateAsync({
        name: currentCategory.name,
        slug: currentCategory.slug,
        description: currentCategory.description || ''
      })
    }

    setIsDialogOpen(false)
  }

  // Action menu handlers
  const handleActionMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, categoryId: number) => {
    setActionMenuAnchor(event.currentTarget)
    setActionMenuCategoryId(categoryId)
  }

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null)
    setActionMenuCategoryId(null)
  }

  // Delete handlers
  const handleDeleteClick = () => {
    setCategoryToDelete(actionMenuCategoryId)
    setIsDeleteDialogOpen(true)
    handleActionMenuClose()
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return

    await deleteCategory.mutateAsync(categoryToDelete)
    setIsDeleteDialogOpen(false)
    setCategoryToDelete(null)
  }

  const handleBulkDeleteClick = () => {
    if (selectedCategories.length > 0) {
      setIsBulkDeleteDialogOpen(true)
    }
  }

  const handleBulkDelete = async () => {
    await bulkDeleteCategories.mutateAsync(selectedCategories)
    setIsBulkDeleteDialogOpen(false)
    setSelectedCategories([])
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          {t('Categories')}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={t('Category Management')}
            action={
              <Button
                variant='contained'
                color='primary'
                onClick={handleOpenCreateDialog}
                startIcon={<i className='tabler-plus' />}
              >
                {t('New Category')}
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

              {selectedCategories.length > 0 && (
                <Button
                  variant='outlined'
                  color='error'
                  onClick={handleBulkDeleteClick}
                  startIcon={<i className='tabler-trash' />}
                >
                  {t('Delete')} ({selectedCategories.length})
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
                        selectedCategories.length > 0 &&
                        categoriesData?.results &&
                        selectedCategories.length < categoriesData.results.length
                      }
                      checked={
                        categoriesData?.results &&
                        categoriesData.results.length > 0 &&
                        selectedCategories.length === categoriesData.results.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>{t('Name')}</TableCell>
                  <TableCell>{t('Slug')}</TableCell>
                  <TableCell>{t('Description')}</TableCell>
                  <TableCell>{t('CreatedAt')}</TableCell>
                  <TableCell align='right'>{t('Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center' sx={{ py: 3 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : categoriesData?.results?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center' sx={{ py: 3 }}>
                      {t('NoData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  categoriesData?.results?.map(category => (
                    <TableRow key={category.id} hover>
                      <TableCell padding='checkbox'>
                        <Checkbox
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleSelectCategory(category.id)}
                        />
                      </TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.slug}</TableCell>
                      <TableCell>
                        {category.description
                          ? category.description.length > 50
                            ? `${category.description.substring(0, 50)}...`
                            : category.description
                          : '-'}
                      </TableCell>
                      <TableCell>{format(new Date(category.created_at), 'PP')}</TableCell>
                      <TableCell align='right'>
                        <IconButton size='small' onClick={e => handleActionMenuOpen(e, category.id)}>
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
            count={categoriesData?.count || 0}
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
            const category = categoriesData?.results?.find(c => c.id === actionMenuCategoryId)

            if (category) handleOpenEditDialog(category)
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

      {/* Create/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onClose={handleDialogClose} maxWidth='sm' fullWidth>
        <DialogTitle>{isEditing ? t('blog.editCategory') : t('blog.createCategory')}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('Name')}
                  name='name'
                  value={currentCategory.name || ''}
                  onChange={handleFormChange}
                  onBlur={handleNameBlur}
                  required
                  autoFocus
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('Slug')}
                  name='slug'
                  value={currentCategory.slug || ''}
                  onChange={handleFormChange}
                  required
                  helperText={t('blog.slugHelperText')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={t('Description')}
                  name='description'
                  value={currentCategory.description || ''}
                  onChange={handleFormChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>{t('Cancel')}</Button>
            <Button type='submit' variant='contained' disabled={createCategory.isPending || updateCategory.isPending}>
              {createCategory.isPending || updateCategory.isPending ? (
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
          <Typography>{t('blog.deleteCategoryConfirmation')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>{t('Cancel')}</Button>
          <Button color='error' onClick={handleDeleteCategory} disabled={deleteCategory.isPending}>
            {deleteCategory.isPending ? <CircularProgress size={24} /> : t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={isBulkDeleteDialogOpen} onClose={() => setIsBulkDeleteDialogOpen(false)}>
        <DialogTitle>{t('ConfirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>{t('blog.bulkDeleteCategoriesConfirmation', { count: selectedCategories.length })}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsBulkDeleteDialogOpen(false)}>{t('Cancel')}</Button>
          <Button color='error' onClick={handleBulkDelete} disabled={bulkDeleteCategories.isPending}>
            {bulkDeleteCategories.isPending ? <CircularProgress size={24} /> : t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default CategoriesPage
