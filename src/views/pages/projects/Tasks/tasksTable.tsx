'use client'

import { SetStateAction, useEffect, useState, Dispatch } from 'react'
import { MaterialReactTable, MRT_Cell, MRT_Row, MRT_SortingState } from 'material-react-table'
import { Button, Typography, useColorScheme, Tooltip, IconButton } from '@mui/material'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from 'next-i18next'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import { toast } from 'react-toastify'
import { useTableState } from '@/hooks/useTableState'
import { usePaginatedSearch } from '@/utils/usePaginatedSearch'
import { exportTasksToCSV } from '@/views/apps/commonTable/tableExport'
import { TasksTypes } from '@/types/tasksTypes'
import { useProjectsHooks } from '@/services/useProjectsHooks'
import { useParams, useRouter } from 'next/navigation'

interface TasksTableProps {
  handleOpen: (mode: 'create' | 'edit', task?: TasksTypes) => void
  setTaskID: (id: number) => void
  projectId?: number
  rowSelection: any
  setRowSelection: any
  multiple: boolean
  setMultiple: Dispatch<SetStateAction<boolean>>
  deleteModalOpen: boolean
  setDeleteModalOpen: Dispatch<SetStateAction<boolean>>
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

const TasksTable: React.FC<TasksTableProps> = ({
  handleOpen,
  setTaskID,
  projectId,
  rowSelection,
  setRowSelection,
  multiple,
  setMultiple,
  deleteModalOpen,
  setDeleteModalOpen
}) => {
  const { mode: themeMode } = useColorScheme()
  const { t, i18n } = useTranslation('global')
  const router = useRouter()
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const [data, setData] = useState<TasksTypes[]>([])
  const [delName, setDelName] = useState<string>('')
  const [taskId, setTaskId] = useState<number | null>(null)
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [sorting, setSorting] = useState<MRT_SortingState>([])

  const { pagination, setPagination, appliedSearch } = usePaginatedSearch({
    initialPageSize: 5,
    globalFilter
  })

  const { getTasks, useDeleteTask, useBulkDeleteTask } = useProjectsHooks()
  const { data: tasksData, isLoading } = getTasks(
    projectId,
    pagination.pageSize,
    pagination.pageIndex + 1,
    appliedSearch,
    getOrderingParam(sorting)
  )

  const { mutate: deleteTask } = useDeleteTask()
  const { mutate: bulkDeleteTask } = useBulkDeleteTask()

  useEffect(() => {
    setData(tasksData?.data?.results ?? [])
  }, [tasksData])

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale, i18n])

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setMultiple(false)
  }

  const handleDeleteTask = () => {
    if (taskId === null) return
    deleteTask(taskId, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((tasksData?.data?.count - 1) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        setData(prevData => prevData?.filter(delTaskId => delTaskId.id !== taskId))
        toast.success(t('tasks.toasts.taskDeletedSuccess'))
        setDeleteModalOpen(false)
      }
    })
  }

  const handleBulkDeleteTask = (ids: number[]) => {
    if (!ids.length === null) return
    bulkDeleteTask(ids, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((tasksData?.data?.count || 0) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        setDeleteModalOpen(false)
        setRowSelection({})
        toast.success(t('tasks.toasts.taskDeletedBulkSuccess'))
      }
    })
    setMultiple(false)
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('tasks')

  const columns = [
    {
      accessorKey: 'name',
      header: t('tasks.table.name'),
      Cell: ({ cell }: { cell: MRT_Cell<TasksTypes> }) => getDisplayValue(cell.getValue())
    },
    {
      accessorKey: 'description',
      header: t('tasks.table.description'),
      Cell: ({ cell }: { cell: MRT_Cell<TasksTypes> }) => {
        const description = getDisplayValue(cell.getValue())
        return (
          <Tooltip title={description} arrow>
            <Typography className='truncate max-w-[200px] w-full'>{description}</Typography>
          </Tooltip>
        )
      }
    },
    {
      accessorKey: 'due_date',
      header: t('tasks.table.dueDate'),
      Cell: ({ cell }: { cell: MRT_Cell<TasksTypes> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'status',
      header: t('tasks.table.status'),
      Cell: ({ cell }: { cell: MRT_Cell<TasksTypes> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayValue(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'created_at',
      header: t('tasks.table.createdAt'),
      Cell: ({ cell }: { cell: MRT_Cell<TasksTypes> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'updated_at',
      header: t('tasks.table.updatedAt'),
      Cell: ({ cell }: { cell: MRT_Cell<TasksTypes> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'actions',
      header: t('tasks.table.actions'),
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }: { row: MRT_Row<TasksTypes> }) => {
        const taskId = row.original.id
        return (
          <div className='flex items-center'>
            <Button
              variant='outlined'
              className='min-w-fit inline-flex items-center justify-center p-2 rounded-full bg-transparent hover:bg-[#e1def514] border-none'
              onClick={() => {
                setDelName(row.original.name)
                setDeleteModalOpen(true)
                setTaskId(taskId)
              }}
            >
              <i className='tabler-trash text-textSecondary' />
            </Button>
            <Button
              variant='outlined'
              className='min-w-fit inline-flex items-center justify-center p-2 rounded-full bg-transparent hover:bg-[#e1def514] border-none'
              onClick={() => {
                handleOpen('edit', row.original), setTaskID(row.original.id)
              }}
            >
              <i className='tabler-edit text-textSecondary w-[22px] h-[22px]' />
            </Button>
            <Button
              variant='outlined'
              className='min-w-fit inline-flex items-center justify-center p-2 rounded-full bg-transparent hover:bg-[#e1def514] border-none'
              onClick={() => {
                router.push(`/${currentLocale}/dashboard/task-details/${row.original.id}`)
              }}
            >
              <i className='tabler-eye text-textSecondary w-[22px] h-[22px]' />
            </Button>
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
        manualPagination={true}
        rowCount={tasksData?.data?.count || 0}
        enableGlobalFilter={false}
        enableColumnFilters={true}
        enableSorting={data && data?.length > 1 ? true : false}
        manualSorting={true}
        enableRowSelection
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
        onGlobalFilterChange={setGlobalFilter}
        onPaginationChange={setPagination}
        renderTopToolbarCustomActions={() => (
          <div className='flex items-center gap-3'>
            <DebouncedInput value={globalFilter ?? ''} onChange={value => setGlobalFilter(String(value))} />
            <IconButton onClick={() => exportTasksToCSV(data)} title={t('table.export')}>
              <i className='tabler-file-download text-[28px] cursor-pointer' />
            </IconButton>
            {Object.keys(rowSelection).length > 0 && (
              <div className='flex items-center gap-3'>
                <Typography variant='body2' color='text.secondary'>
                  {Object.keys(rowSelection).length} {t('table.recordsSelected')} {t('table.of')}{' '}
                  {tasksData?.data?.count}
                </Typography>
                <Button
                  variant='outlined'
                  onClick={() => {
                    setRowSelection({}), setMultiple(false)
                  }}
                >
                  {t('table.clearSelection')}
                </Button>
              </div>
            )}
          </div>
        )}
        localization={{
          noRecordsToDisplay: t('tasks.table.noData'),
          rowsPerPage: t('table.rowsPerPage'),
          of: t('table.of')
        }}
        onSortingChange={setSorting}
      />
      <DeleteConfModal
        title={multiple ? t('tasks.deleteModal.deleteTasks') : t('tasks.deleteModal.deleteTask')}
        message={
          multiple
            ? t('tasks.deleteModal.bulkDeleteConfirmationMessage')
            : t('tasks.deleteModal.message', { name: delName })
        }
        open={deleteModalOpen}
        handleClose={handleCloseDeleteModal}
        handleDelete={() =>
          multiple ? handleBulkDeleteTask(Object.keys(rowSelection).map(key => Number(key))) : handleDeleteTask()
        }
      />
    </div>
  )
}

export default TasksTable
