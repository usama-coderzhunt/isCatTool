'use client'

import { SetStateAction, useEffect, useState, Dispatch } from 'react'
import { MaterialReactTable, MRT_Cell, MRT_Row, MRT_SortingState } from 'material-react-table'
import { Button, Typography, useColorScheme, Tooltip, IconButton } from '@mui/material'
import { getDisplayDateTime, getDisplayValue } from '@/utils/utility/displayValue'
import { useTodosHooks } from '@/services/useTodosHooks'
import { TodoItem } from '@/types/todoItems'
import DeleteConfModal from '@/components/deleteConfirmationModal'
import StatusConfModal from '@/components/statusConfirmationModal'
import CustomTextField from '@/@core/components/mui/TextField'
import { useTranslation } from 'next-i18next'
import { getOrderingParam } from '@/utils/utility/sortingFn'
import { toast } from 'react-toastify'
import { useTableState } from '@/hooks/useTableState'
import { usePaginatedSearch } from '@/utils/usePaginatedSearch'
import { exportTodoItemsToCSV } from '@/views/apps/commonTable/tableExport'

interface CaseTodoItemsTableProps {
  handleOpen: (mode: 'view' | 'create' | 'edit', todo?: TodoItem) => void
  setTodoID: (id: string) => void
  todo_Id?: number
  filters?: {
    completed: 'True' | 'False' | null
    dueDateAfter: string | null
    dueDateBefore: string | null
    exceededDueDate: 'True' | 'False' | null
    todoId: number | null
  }
  filtersApplied: boolean
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

const CaseTodoItemsTable: React.FC<CaseTodoItemsTableProps> = ({
  handleOpen,
  setTodoID,
  todo_Id,
  filters,
  filtersApplied,
  rowSelection,
  setRowSelection,
  multiple,
  setMultiple,
  deleteModalOpen,
  setDeleteModalOpen
}) => {
  const { mode: themeMode } = useColorScheme()
  const { t } = useTranslation('global')
  const [data, setData] = useState<TodoItem[]>([])
  const [todoId, setTodoId] = useState<number | null>(null)
  const [delName, setDelName] = useState<string>('')
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    todoItemId: number
    newStatus: boolean
    userName: string
  } | null>(null)

  const { pagination, setPagination, appliedSearch } = usePaginatedSearch({
    initialPageSize: 5,
    globalFilter
  })

  const { getTodoItems, useDeleteTodoItem, useEditTodoItem, getAllTodoItems, useBulkDeleteTodoItems } = useTodosHooks()
  const { data: todoItemsData, isLoading } = todo_Id
    ? getTodoItems(todo_Id, pagination.pageSize, pagination.pageIndex + 1, getOrderingParam(sorting), appliedSearch)
    : getAllTodoItems(
        pagination.pageSize,
        pagination.pageIndex + 1,
        getOrderingParam(sorting),
        appliedSearch,
        filters,
        filtersApplied
      )

  const deleteTodoItem = useDeleteTodoItem()
  const { mutate: editTodoItem } = useEditTodoItem()
  const { mutate: bulkDeleteTodoItems } = useBulkDeleteTodoItems()

  useEffect(() => {
    setData(todoItemsData?.data?.results ?? [])
  }, [todoItemsData, filters])

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
  }

  const handleDeleteTodoItem = () => {
    if (todoId === null) return
    deleteTodoItem.mutate(todoId, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((todoItemsData?.data?.count - 1) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        setData(prevData => prevData?.filter(delTodoId => delTodoId.id !== todoId))
        setDeleteModalOpen(false)
      }
    })
  }

  const handleBulkDeleteTodoItems = (ids: number[]) => {
    if (!ids.length === null) return
    bulkDeleteTodoItems(ids, {
      onSuccess: () => {
        const newTotalPages = Math.ceil((todoItemsData?.data?.count || 0) / pagination.pageSize)
        if (pagination.pageIndex >= newTotalPages) {
          setPagination(prev => ({
            ...prev,
            pageIndex: Math.max(0, newTotalPages - 1)
          }))
        }
        setDeleteModalOpen(false)
        setRowSelection({})
        toast.success(t('cases.todo.todoItemBulkDeletedSuccess'))
      }
    })
    setMultiple(false)
  }

  const handleActiveStatusChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    todoItemId: number,
    userName: string
  ) => {
    const newStatus = event.target.checked
    setPendingStatusChange({ todoItemId, newStatus, userName })
    setStatusModalOpen(true)
  }

  const handleStatusConfirm = () => {
    if (!pendingStatusChange) return

    const { todoItemId, newStatus } = pendingStatusChange

    setData(prevData =>
      prevData.map(client => (client.id === todoItemId ? { ...client, completed: newStatus } : client))
    )

    editTodoItem({ id: todoItemId.toString(), data: { completed: newStatus } as TodoItem })

    setStatusModalOpen(false)
    setPendingStatusChange(null)
  }

  const handleStatusClick = (todoItemId: number, userName: string, currentStatus: boolean) => {
    handleActiveStatusChange(
      { target: { checked: !currentStatus } } as React.ChangeEvent<HTMLInputElement>,
      todoItemId,
      userName
    )
  }

  const { tableState, updateColumnVisibility, updateDensity, updateFullScreen } = useTableState('caseTodoItems')

  const columns = [
    {
      accessorKey: 'completed',
      header: t('cases.todo.status'),
      Cell: ({ cell, row }: { cell: MRT_Cell<TodoItem>; row: MRT_Row<TodoItem> }) => {
        const isCompleted = cell.getValue() as boolean
        return (
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
              isCompleted ? 'bg-green-500' : 'bg-transparent border-2 border-gray-300'
            }`}
            onClick={() => handleStatusClick(row.original.id, row.original.subject, isCompleted)}
          >
            {isCompleted && <i className='tabler-check text-white text-base' />}
          </div>
        )
      }
    },
    {
      accessorKey: 'subject',
      header: t('cases.todo.subject'),
      Cell: ({ cell }: { cell: MRT_Cell<TodoItem> }) => getDisplayValue(cell.getValue())
    },
    {
      accessorKey: 'description',
      header: t('cases.todo.description'),
      Cell: ({ cell }: { cell: MRT_Cell<TodoItem> }) => {
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
      header: t('cases.todo.dueDate'),
      Cell: ({ cell }: { cell: MRT_Cell<TodoItem> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'created_at',
      header: t('cases.todo.createdAt'),
      Cell: ({ cell }: { cell: MRT_Cell<TodoItem> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'updated_at',
      header: t('cases.todo.updatedAt'),
      Cell: ({ cell }: { cell: MRT_Cell<TodoItem> }) => (
        <Typography className='font-medium truncate' color='text.primary'>
          {getDisplayDateTime(cell.getValue())}
        </Typography>
      )
    },
    {
      accessorKey: 'actions',
      header: t('common.actions'),
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }: { row: MRT_Row<TodoItem> }) => {
        const todoId = row.original.id
        return (
          <div className='flex items-center'>
            <Button
              variant='outlined'
              className='min-w-fit inline-flex items-center justify-center p-2 rounded-full bg-transparent hover:bg-[#e1def514] border-none'
              onClick={() => {
                setTodoId(row.original.id)
                setDelName(row.original.subject)
                setDeleteModalOpen(true)
              }}
            >
              <i className='tabler-trash text-textSecondary' />
            </Button>
            <Button
              variant='outlined'
              className='min-w-fit inline-flex items-center justify-center p-2 rounded-full bg-transparent hover:bg-[#e1def514] border-none'
              onClick={() => {
                handleOpen('edit', row.original), setTodoID(todoId.toString())
              }}
            >
              <i className='tabler-edit text-textSecondary w-[22px] h-[22px]' />
            </Button>

            <Button
              variant='outlined'
              className='min-w-fit inline-flex items-center justify-center p-2 rounded-full bg-transparent hover:bg-[#e1def514] border-none'
              onClick={() => handleOpen('view', row.original)}
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
        rowCount={todoItemsData?.data?.count || 0}
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
            <IconButton onClick={() => exportTodoItemsToCSV(data)} title={t('table.export')}>
              <i className='tabler-file-download text-[28px] cursor-pointer' />
            </IconButton>
            {Object.keys(rowSelection).length > 0 && (
              <div className='flex items-center gap-3'>
                <Typography variant='body2' color='text.secondary'>
                  {Object.keys(rowSelection).length} {t('table.recordsSelected')} {t('table.of')}{' '}
                  {todoItemsData?.data?.count}
                </Typography>
                <Button variant='outlined' onClick={() => setRowSelection({})}>
                  {t('table.clearSelection')}
                </Button>
              </div>
            )}
          </div>
        )}
        localization={{
          noRecordsToDisplay: t('cases.todo.noData'),
          rowsPerPage: t('cases.todo.pagination.rowsPerPage'),
          of: t('cases.todo.pagination.of')
        }}
        onSortingChange={setSorting}
      />
      <DeleteConfModal
        title={t('common.confirmDelete')}
        deleteValue={multiple ? '' : delName}
        open={deleteModalOpen}
        handleClose={handleCloseDeleteModal}
        handleDelete={() =>
          multiple
            ? handleBulkDeleteTodoItems(Object.keys(rowSelection).map(key => Number(key)))
            : handleDeleteTodoItem()
        }
      />
      <StatusConfModal
        open={statusModalOpen}
        handleClose={() => {
          setStatusModalOpen(false)
          setPendingStatusChange(null)
        }}
        isShowAddNotesField={false}
        handleStatusChange={handleStatusConfirm}
        title={t('common.confirmStatusChange')}
        userName={pendingStatusChange?.userName || ''}
        newStatus={pendingStatusChange?.newStatus || false}
        message={`${t('cases.todo.statusChangeMessage')} ${pendingStatusChange?.userName} as ${pendingStatusChange?.newStatus ? t('cases.todo.completed') : t('cases.todo.incomplete')}?`}
      />
    </div>
  )
}

export default CaseTodoItemsTable
