'use client'

import { Dispatch, FC, ReactElement, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Button, IconButton, Typography, useColorScheme } from '@mui/material'
import { MaterialReactTable, MRT_Cell, MRT_ColumnDef, MRT_Row, MRT_SortingState } from 'material-react-table'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import CustomTextField from '@/@core/components/mui/TextField'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useTableState } from '@/hooks/useTableState'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'
import { LanguageTypes } from '@/types/languageTypes'
import { useLanguageHooks } from '@/services/useLanguageHooks'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { exportLanguagesToCSV } from '@/views/apps/commonTable/tableExport'
import AddLanguageModal from './addLanguageModal'

interface LanguagesTableProps {
  languagesData: LanguageTypes[]
  totalRecords: number
  pagination: { pageSize: number; pageIndex: number }
  setPagination: Dispatch<SetStateAction<{ pageIndex: number; pageSize: number }>>
  isLoading: boolean
  setGlobalFilter: (value: string) => void
  globalFilter: string
  sorting: MRT_SortingState
  setSorting: (updater: MRT_SortingState | ((prev: MRT_SortingState) => MRT_SortingState)) => void
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 1000,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.ComponentProps<typeof CustomTextField>, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)
  const { t } = useTranslation('global')

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, onChange])

  return (
    <CustomTextField
      label={t('common.search')}
      {...props}
      value={value}
      onChange={e => setValue(e.target.value)}
      shrinkLabel={false}
    />
  )
}

const LanguagesTable: FC<LanguagesTableProps> = ({
  languagesData,
  totalRecords,
  pagination,
  setPagination,
  isLoading,
  setGlobalFilter,
  globalFilter,
  sorting,
  setSorting
}): ReactElement => {
  const { t } = useTranslation('global')
  const { mode: themeMode } = useColorScheme()
  const userPermissions = useAuthStore(state => state.userPermissions)

  //States
  const [openAddModal, setOpenAddModal] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageTypes | null>(null)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)

  // Api Call
  const { useDeleteLanguage, useBulkDeleteLanguage } = useLanguageHooks()
  const deleteLanguage = useDeleteLanguage()
  const bulkDeleteLanguage = useBulkDeleteLanguage()

  // Get user roles
  const isSuperUser = getDecryptedLocalStorage('isSuperUser')
  const userRole = getDecryptedLocalStorage('userRole')

  const handleCloseAddModal = () => {
    setOpenAddModal(false)
    setSelectedLanguage(null)
    setMode('create')
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setSelectedLanguage(null)
  }

  const handleDeleteClick = (language: LanguageTypes) => {
    setSelectedLanguage(language)
    setDeleteModalOpen(true)
  }

  const handleBulkDelete = (ids: number[]) => {
    if (!ids.length === null) return
    bulkDeleteLanguage.mutate(ids, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((totalRecords - ids.length) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        toast.success(t('languages.toasts.languageDeletedBulkSuccess'))
        setDeleteModalOpen(false)
        setRowSelection({})
        setMultiple(false)
      }
    })
  }

  const handleEditClick = (language: LanguageTypes) => {
    setSelectedLanguage(language)
    setMode('edit')
    setOpenAddModal(true)
  }

  const handleDelete = () => {
    if (!selectedLanguage) return
    deleteLanguage.mutate(selectedLanguage.id, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((totalRecords - 1) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        toast.success(t('languages.toasts.languageDeletedSuccess'))
        handleCloseDeleteModal()
      }
    })
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('languages')

  const columns = useMemo<MRT_ColumnDef<LanguageTypes, any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('languages.table.name'),
        Cell: ({ cell }: { cell: MRT_Cell<LanguageTypes> }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'code',
        header: t('languages.table.code'),
        Cell: ({ cell }: { cell: MRT_Cell<LanguageTypes> }) => (
          <Typography className='font-medium' color='text.primary'>
            {getDisplayValue(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'created_at',
        header: t('languages.table.createdAt'),
        Cell: ({ cell }: { cell: MRT_Cell<LanguageTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'updated_at',
        header: t('languages.table.updatedAt'),
        Cell: ({ cell }: { cell: MRT_Cell<LanguageTypes> }) => (
          <Typography className='font-medium truncate' color='text.primary'>
            {getDisplayDateTime(cell.getValue())}
          </Typography>
        )
      },
      {
        accessorKey: 'actions',
        header: t('languages.table.actions'),
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }: { row: MRT_Row<LanguageTypes> }) => (
          <div className='flex items-center'>
            {hasPermissions(userPermissions, ['delete_language']) && (
              <IconButton
                onClick={() => {
                  handleDeleteClick(row.original)
                }}
              >
                <i className='tabler-trash text-textSecondary' />
              </IconButton>
            )}
            {hasPermissions(userPermissions, ['change_language']) && (
              <IconButton
                onClick={() => {
                  handleEditClick(row.original)
                }}
              >
                <i className='tabler-edit text-textSecondary' />
              </IconButton>
            )}
          </div>
        )
      }
    ],
    [t]
  )

  return (
    <div className='flex flex-col gap-y-8'>
      <div className='flex items-center justify-between'>
        <Typography variant='h3'>{t('languages.title')}</Typography>
        <div className='flex flex-row gap-2'>
          {(isSuperUser || userRole === 'Admin') && Object.keys(rowSelection).length ? (
            <Button
              variant='contained'
              color='error'
              onClick={() => {
                setMultiple(true)
                setDeleteModalOpen(true)
              }}
              sx={{ padding: '0.5rem 1rem' }}
            >
              {t('languages.deleteLanguages')}
            </Button>
          ) : (
            <></>
          )}
          {(isSuperUser || userRole === 'Admin') && (
            <Button
              variant='contained'
              color='primary'
              onClick={() => {
                setMode('create')
                setOpenAddModal(true)
              }}
              sx={{ padding: '0.5rem 1rem' }}
            >
              {t('languages.addLanguage')}
            </Button>
          )}
        </div>
      </div>

      <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
        <MaterialReactTable
          columns={columns}
          data={languagesData}
          manualPagination={true}
          rowCount={totalRecords}
          enableGlobalFilter={false}
          enableColumnFilters={true}
          enableSorting={languagesData && languagesData?.length > 1 ? true : false}
          manualSorting={true}
          onGlobalFilterChange={setGlobalFilter}
          enableRowSelection={isSuperUser || userRole === 'Admin'}
          positionToolbarAlertBanner='none'
          onRowSelectionChange={setRowSelection}
          getRowId={row => String(row.id)}
          state={{
            pagination,
            isLoading,
            globalFilter,
            sorting,
            rowSelection,
            columnVisibility: tableState.columnVisibility,
            density: tableState.density,
            isFullScreen: tableState.isFullScreen
          }}
          onColumnVisibilityChange={updateColumnVisibility}
          onDensityChange={updateDensity}
          onIsFullScreenChange={updateFullScreen}
          onSortingChange={setSorting}
          onPaginationChange={setPagination}
          muiPaginationProps={{
            getItemAriaLabel: type => t(`table.pagination.${type}`)
          }}
          localization={{
            noRecordsToDisplay: t('languages.table.noData'),
            rowsPerPage: t('table.rowsPerPage'),
            of: t('table.of'),
            search: t('common.search')
          }}
          renderTopToolbarCustomActions={() => (
            <div className='flex items-center gap-3'>
              <DebouncedInput value={globalFilter ?? ''} onChange={value => setGlobalFilter(String(value))} />
              <IconButton onClick={() => exportLanguagesToCSV(languagesData)} title={t('table.export')}>
                <i className='tabler-file-download text-[28px] cursor-pointer' />
              </IconButton>
              {Object.keys(rowSelection).length > 0 && (
                <div className='flex items-center gap-3'>
                  <Typography variant='body2' color='text.secondary'>
                    {Object.keys(rowSelection).length} {t('table.recordsSelected')} {t('table.of')} {totalRecords}
                  </Typography>
                  <Button variant='outlined' onClick={() => setRowSelection({})}>
                    {t('table.clearSelection')}
                  </Button>
                </div>
              )}
            </div>
          )}
        />
      </div>
      <DeleteConfModal
        open={deleteModalOpen}
        title={`${multiple ? t('languages.deleteModal.deleteLanguages') : t('languages.deleteModal.deleteLanguage')}`}
        message={`${multiple ? t('languages.deleteModal.deleteLanguagesMessage') : t('languages.deleteModal.deleteLanguageMessage', { name: selectedLanguage?.name })}`}
        handleClose={handleCloseDeleteModal}
        handleDelete={() =>
          multiple ? handleBulkDelete(Object.keys(rowSelection).map(key => Number(key))) : handleDelete()
        }
      />
      <AddLanguageModal
        open={openAddModal}
        handleClose={handleCloseAddModal}
        mode={mode}
        languageData={selectedLanguage}
      />
    </div>
  )
}

export default LanguagesTable
