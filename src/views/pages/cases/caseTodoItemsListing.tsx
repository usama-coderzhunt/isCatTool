'use client'
import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'

import { Button, Card, Typography, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material'
import CaseTodoItemsTable from './caseTodoItemsTable'
import AddTodoItemsModal from './addTodoItemsModal'
import { Control, FieldValues, useForm } from 'react-hook-form'
import CustomTextField from '@/@core/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { hasPermissions } from '@/utils/permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { useTodosHooks } from '@/services/useTodosHooks'
import { useParams } from 'next/navigation'

interface FilterFormValues extends FieldValues {
  dueDateAfter: string | null
  dueDateBefore: string | null
  exceededDueDate: boolean | null
  todoId: string | null
}

type BooleanFilterValue = '' | 'True' | 'False'

const CaseTodoItemsListing = ({ caseId, isFilterEnabled }: { caseId?: number; isFilterEnabled?: boolean }) => {
  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params
  const userPermissions = useAuthStore(state => state.userPermissions)

  // Hooks
  const { getTodoByCaseId } = useTodosHooks()
  const { data: todos } = getTodoByCaseId(caseId)
  const todoIdInitial = todos?.data?.results?.length > 0 ? todos?.data?.results[0]?.id : null

  const [open, setOpen] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState(null)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('create')
  const [todoID, setTodoID] = useState<string | null>(null)
  const [rowSelection, setRowSelection] = useState({})
  const [multiple, setMultiple] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  // Filter states
  const [completed, setCompleted] = useState<BooleanFilterValue>('')
  const [dueDateAfter, setDueDateAfter] = useState<Date | null>(null)
  const [dueDateBefore, setDueDateBefore] = useState<Date | null>(null)
  const [todoId, setTodoId] = useState<string>('')
  const [exceededDueDate, setExceededDueDate] = useState<BooleanFilterValue>('')
  const [appliedFilters, setAppliedFilters] = useState<{
    completed: 'True' | 'False' | null
    dueDateAfter: string | null
    dueDateBefore: string | null
    exceededDueDate: 'True' | 'False' | null
    todoId: number | null
  }>({
    completed: null,
    dueDateAfter: null,
    dueDateBefore: null,
    exceededDueDate: null,
    todoId: null
  })
  const [filtersApplied, setFiltersApplied] = useState(false)

  useEffect(() => {
    i18n.changeLanguage(currentLocale)
  }, [currentLocale])

  const handleOpen = (mode: 'view' | 'create' | 'edit', todo?: any) => {
    setModalMode(mode)
    setSelectedTodo(todo ?? null)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedTodo(null)
  }

  const handleClearFilters = () => {
    setCompleted('')
    setDueDateAfter(null)
    setDueDateBefore(null)
    setTodoId('')
    setExceededDueDate('')
    setAppliedFilters({
      completed: null,
      dueDateAfter: null,
      dueDateBefore: null,
      exceededDueDate: null,
      todoId: null
    })
    setFiltersApplied(false)
  }

  const handleApplyFilters = () => {
    setAppliedFilters({
      completed: completed === '' ? null : completed,
      dueDateAfter: dueDateAfter ? dueDateAfter.toISOString().split('.')[0] + 'Z' : null,
      dueDateBefore: dueDateBefore ? dueDateBefore.toISOString().split('.')[0] + 'Z' : null,
      exceededDueDate: exceededDueDate === '' ? null : exceededDueDate,
      todoId: todoId === '' ? null : parseInt(todoId)
    })
    setFiltersApplied(true)
  }

  const handleCompletedChange = (event: SelectChangeEvent<BooleanFilterValue>) => {
    const value = event.target.value as BooleanFilterValue
    setCompleted(value)
  }

  const handleExceededDueDateChange = (event: SelectChangeEvent<BooleanFilterValue>) => {
    const value = event.target.value as BooleanFilterValue
    setExceededDueDate(value)
  }

  return (
    <div className='w-full'>
      <div className='w-full'>
        <div className='flex items-center gap-4 mb-4 justify-between'>
          <Typography variant='h3' className='font-medium'>
            {t('cases.todo.title')}
          </Typography>
          <div className='flex flex-row gap-2'>
            {hasPermissions(userPermissions, ['delete_todoitem']) && Object.keys(rowSelection).length ? (
              <Button
                variant='contained'
                color='error'
                onClick={() => {
                  setMultiple(true)
                  setDeleteModalOpen(true)
                }}
              >
                {t('cases.todo.deleteTodoItems')}
              </Button>
            ) : undefined}

            {hasPermissions(userPermissions, ['add_todoitem']) && (
              <Button variant='contained' color='primary' className='shadow-2xl' onClick={() => handleOpen('create')}>
                {t('cases.todo.addNew')}
              </Button>
            )}
          </div>
        </div>

        {/* Filter Section */}
        {isFilterEnabled && (
          <Card className='p-4 mb-4'>
            <Typography variant='h6' className='mb-4 font-medium'>
              {t('cases.todo.filter')}
            </Typography>
            <div className='grid grid-cols-12 gap-4'>
              <div className='col-span-3'>
                <FormControl fullWidth>
                  <InputLabel shrink>{t('cases.todo.filtersFieldsLabels.completed')}</InputLabel>
                  <Select<BooleanFilterValue>
                    value={completed}
                    label={t('cases.todo.filtersFieldsLabels.completed')}
                    onChange={handleCompletedChange}
                    notched
                  >
                    <MenuItem value=''>{t('cases.todo.completedOptions.all')}</MenuItem>
                    <MenuItem value='True'>{t('cases.todo.completedOptions.yes')}</MenuItem>
                    <MenuItem value='False'>{t('cases.todo.completedOptions.no')}</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className='col-span-3'>
                <AppReactDatepicker
                  selected={dueDateAfter}
                  onChange={(date: Date | null) => setDueDateAfter(date)}
                  showTimeSelect
                  timeFormat='HH:mm'
                  timeIntervals={1}
                  dateFormat='yyyy-MM-dd HH:mm'
                  customInput={<CustomTextField fullWidth label={t('cases.todo.filtersFieldsLabels.dueDateAfter')} />}
                />
              </div>
              <div className='col-span-3'>
                <AppReactDatepicker
                  selected={dueDateBefore}
                  onChange={(date: Date | null) => setDueDateBefore(date)}
                  showTimeSelect
                  timeFormat='HH:mm'
                  timeIntervals={1}
                  dateFormat='yyyy-MM-dd HH:mm'
                  customInput={<CustomTextField fullWidth label={t('cases.todo.filtersFieldsLabels.dueDateBefore')} />}
                />
              </div>
              <div className='col-span-3'>
                <FormControl fullWidth>
                  <InputLabel shrink>{t('cases.todo.filtersFieldsLabels.exceededDueDate')}</InputLabel>
                  <Select<BooleanFilterValue>
                    value={exceededDueDate}
                    label={t('cases.todo.filtersFieldsLabels.exceededDueDate')}
                    onChange={handleExceededDueDateChange}
                    notched
                  >
                    <MenuItem value=''>{t('cases.todo.exceededDueDateOptions.unknown')}</MenuItem>
                    <MenuItem value='True'>{t('cases.todo.exceededDueDateOptions.yes')}</MenuItem>
                    <MenuItem value='False'>{t('cases.todo.exceededDueDateOptions.no')}</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className='col-span-3'>
                <CustomTextField
                  fullWidth
                  label={t('cases.todo.filtersFieldsLabels.todoId')}
                  value={todoId}
                  onChange={e => setTodoId(e.target.value)}
                  type='number'
                />
              </div>
              <div className='col-span-12 flex items-end gap-2 justify-end'>
                <Button variant='contained' color='primary' onClick={handleApplyFilters}>
                  {t('cases.todo.filterButtons.apply')}
                </Button>
                <Button variant='outlined' onClick={handleClearFilters}>
                  {t('cases.todo.filterButtons.clear')}
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className='mt-8'>
          <CaseTodoItemsTable
            handleOpen={handleOpen}
            setTodoID={setTodoID}
            todo_Id={todoIdInitial}
            filters={appliedFilters}
            filtersApplied={filtersApplied}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            multiple={multiple}
            setMultiple={setMultiple}
            deleteModalOpen={deleteModalOpen}
            setDeleteModalOpen={setDeleteModalOpen}
          />
        </div>
      </div>
      <AddTodoItemsModal
        open={open}
        handleClose={handleClose}
        handleOpen={handleOpen}
        todoItemData={selectedTodo}
        todoItemID={todoID}
        mode={modalMode}
        title={
          modalMode === 'create'
            ? t('cases.todo.addNew')
            : modalMode === 'edit'
              ? t('cases.todo.edit')
              : t('cases.todo.view')
        }
        todoId={todoIdInitial}
      />
    </div>
  )
}

export default CaseTodoItemsListing
