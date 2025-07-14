'use client'

import { useState, useEffect } from 'react'
import { MaterialReactTable, MRT_Cell, MRT_Row, MRT_SortingState } from 'material-react-table'
import { Button, IconButton, Typography, useColorScheme } from '@mui/material'
import { useProjectsHooks } from '@/services/useProjectsHooks'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import { useTranslation } from 'next-i18next'
import { hasPermissions } from '@/utils/permissionUtils'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import CustomTextField from '@/@core/components/mui/TextField'
import { toast } from 'react-toastify'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import { useTableState } from '@/hooks/useTableState'
import { usePaginatedSearch } from '@/utils/usePaginatedSearch'
import { exportProjectsToCSV } from '@/utils/utility/exportProjectsToCSV'
import { useParams, useRouter } from 'next/navigation'

export type Project = {
  id: number
  name: string
  source_language_detail: { id: number; name: string; code: string }
  target_language_detail: { id: number; name: string; code: string }
  translation_model_detail: { id: number; name: string }
  translation_subject_detail: { id: number; name: string }
  created_at: string
  updated_at: string
  status: string
  due_date?: string | null
}

interface ProjectsTableProps {
  handleOpen: (mode: 'view' | 'create' | 'edit', project?: Project) => void
  setProjectID: (id: number) => void
  userPermissions: { codename: string }[]
  rowSelection: any
  setRowSelection: any
  setMultiple: any
  multiple: boolean
  openDeleteModal: boolean
  setOpenDeleteModal: any
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
}) => {
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
  }, [value])

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

const ProjectsTable: React.FC<ProjectsTableProps> = ({
  handleOpen,
  setProjectID,
  userPermissions,
  rowSelection,
  setRowSelection,
  multiple,
  setMultiple,
  openDeleteModal,
  setOpenDeleteModal
}) => {
  const router = useRouter()
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const { t, i18n } = useTranslation('global')

  const { mode: themeMode } = useColorScheme()
  const [globalFilter, setGlobalFilter] = useState('')
  const [delName, setDelName] = useState('')
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null)

  const { pagination, setPagination, appliedSearch } = usePaginatedSearch({
    initialPageSize: 5,
    globalFilter
  })

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  const { getProjects, useDeleteProject, useDeleteProjectBulk } = useProjectsHooks()
  // Determine search params
  let searchParams: Record<string, any> = {}
  if (globalFilter) {
    if (!isNaN(Number(globalFilter))) {
      searchParams.id = globalFilter
    } else {
      searchParams.name__icontains = globalFilter
    }
  }
  const { data: projectsData, isLoading } = getProjects(
    pagination.pageSize,
    pagination.pageIndex + 1,
    getOrderingParam(sorting),
    searchParams
  )

  const { mutate: deleteProject } = useDeleteProject()
  const { mutate: deleteProjectBulk } = useDeleteProjectBulk()

  const handleDeleteProject = () => {
    if (projectToDelete !== null) {
      deleteProject(projectToDelete, {
        onSuccess: () => {
          const newTotalPages = Math.ceil((projectsData?.data?.count - 1) / pagination.pageSize)
          if (pagination.pageIndex >= newTotalPages) {
            setPagination(prev => ({
              ...prev,
              pageIndex: Math.max(0, newTotalPages - 1)
            }))
          }
          toast.success(t('projects.toasts.projectDeletedSuccess'))
          setOpenDeleteModal(false)
          setProjectToDelete(null)
        }
      })
    }
  }

  const handleDeleteProjectBulk = (ids: number[]) => {
    if (!ids.length === null) return
    deleteProjectBulk(ids, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((projectsData?.data?.count || 0) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        toast.success(t('projects.toasts.projectDeletedBulkSuccess'))
        setMultiple(false)
        setOpenDeleteModal(false)
        setRowSelection({})
      }
    })
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('projects')

  const data = projectsData?.data?.results ?? []
  const totalCount = projectsData?.data?.count ?? 0

  const columns = [
    {
      accessorKey: 'name',
      header: t('projects.table.name'),
      Cell: ({ cell }: { cell: MRT_Cell<Project> }) => getDisplayValue(cell.getValue())
    },
    {
      accessorKey: 'source_language_detail.name',
      header: t('projects.table.sourceLanguage'),
      Cell: ({ row }: { row: MRT_Row<Project> }) => getDisplayValue(row.original.source_language_detail?.name)
    },
    {
      accessorKey: 'target_language_detail.name',
      header: t('projects.table.targetLanguage'),
      Cell: ({ row }: { row: MRT_Row<Project> }) => getDisplayValue(row.original.target_language_detail?.name)
    },
    {
      accessorKey: 'translation_model_detail.name',
      header: t('projects.table.translationModel'),
      Cell: ({ row }: { row: MRT_Row<Project> }) => getDisplayValue(row.original.translation_model_detail?.name)
    },
    {
      accessorKey: 'translation_subject_detail.name',
      header: t('projects.table.translationSubject'),
      Cell: ({ row }: { row: MRT_Row<Project> }) => getDisplayValue(row.original.translation_subject_detail?.name)
    },
    {
      accessorKey: 'status',
      header: t('projects.table.status'),
      Cell: ({ cell }: { cell: MRT_Cell<Project> }) => getDisplayValue(cell.getValue())
    },
    {
      accessorKey: 'created_at',
      header: t('projects.table.createdAt'),
      Cell: ({ cell }: { cell: MRT_Cell<Project> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'updated_at',
      header: t('projects.table.updatedAt'),
      Cell: ({ cell }: { cell: MRT_Cell<Project> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'actions',
      header: t('projects.table.actions'),
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }: { row: MRT_Row<Project> }) => {
        const projectId = row.original.id
        const projectName = row.original.name
        return (
          <div className='flex items-center gap-2'>
            {hasPermissions(userPermissions, ['change_project']) && (
              <IconButton
                onClick={() => {
                  handleOpen('edit', row.original)
                  setProjectID(projectId)
                }}
              >
                <i className='tabler-edit text-textSecondary' />
              </IconButton>
            )}
            {hasPermissions(userPermissions, ['delete_project']) && (
              <IconButton
                onClick={() => {
                  setDelName(projectName)
                  setProjectToDelete(projectId)
                  setOpenDeleteModal(true)
                }}
              >
                <i className='tabler-trash text-textSecondary' />
              </IconButton>
            )}
            {hasPermissions(userPermissions, ['view_project']) && (
              <IconButton onClick={() => router.push(`/${currentLocale}/dashboard/project-details/${row.original.id}`)}>
                <i className='tabler-eye text-textSecondary' />
              </IconButton>
            )}
          </div>
        )
      }
    }
  ]

  return (
    <div className={`w-full ${themeMode === 'light' ? 'customColor' : ''}`}>
      <MaterialReactTable
        columns={columns}
        data={data}
        enableGlobalFilter={false}
        enableColumnFilters={true}
        manualPagination
        manualSorting={true}
        enableSorting={data && data?.length > 1 ? true : false}
        onSortingChange={setSorting}
        rowCount={totalCount}
        enableRowSelection
        positionToolbarAlertBanner='none'
        onRowSelectionChange={setRowSelection}
        getRowId={row => String(row.id)}
        state={{
          isLoading,
          pagination,
          sorting,
          globalFilter,
          rowSelection,
          columnVisibility: tableState.columnVisibility,
          density: tableState.density,
          isFullScreen: tableState.isFullScreen
        }}
        onPaginationChange={setPagination}
        onColumnVisibilityChange={updateColumnVisibility}
        onDensityChange={updateDensity}
        onIsFullScreenChange={updateFullScreen}
        displayColumnDefOptions={{
          'mrt-row-expand': {
            size: 50,
            enableResizing: false
          }
        }}
        localization={{
          noRecordsToDisplay: t('projects.table.noData'),
          rowsPerPage: t('table.rowsPerPage'),
          of: t('table.of')
        }}
        renderTopToolbarCustomActions={() => (
          <div className='flex items-center gap-3'>
            <DebouncedInput value={globalFilter ?? ''} onChange={value => setGlobalFilter(String(value))} />
            <IconButton onClick={() => exportProjectsToCSV(data)} title={t('table.export')}>
              <i className='tabler-file-download text-[28px] cursor-pointer' />
            </IconButton>
            {Object.keys(rowSelection).length > 0 && (
              <div className='flex items-center gap-3'>
                <Typography variant='body2' color='text.secondary'>
                  {Object.keys(rowSelection).length} {t('table.recordsSelected')} {t('table.of')} {totalCount}
                </Typography>
                <Button
                  variant='outlined'
                  onClick={() => {
                    setRowSelection({})
                    setMultiple(false)
                  }}
                >
                  {t('table.clearSelection')}
                </Button>
              </div>
            )}
          </div>
        )}
      />
      <DeleteConfModal
        title={multiple ? t('projects.deleteModal.deleteProjects') : t('projects.deleteModal.deleteProject')}
        message={
          multiple
            ? t('projects.deleteModal.bulkDeleteConfirmationMessage')
            : t('projects.deleteModal.message', { name: delName })
        }
        open={openDeleteModal}
        handleClose={() => {
          setOpenDeleteModal(false)
          setMultiple(false)
        }}
        handleDelete={() =>
          multiple ? handleDeleteProjectBulk(Object.keys(rowSelection).map(key => Number(key))) : handleDeleteProject()
        }
      />
    </div>
  )
}

export default ProjectsTable
