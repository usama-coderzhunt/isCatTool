'use client'
import { useState } from 'react'
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

interface FilterFormValues extends FieldValues {
    dueDateAfter: string | null
    dueDateBefore: string | null
    exceededDueDate: boolean | null
    todoId: string | null
}

type BooleanFilterValue = '' | 'True' | 'False'

const CaseTodoItemsListing = ({ caseId, isFilterEnabled }: { caseId?: number, isFilterEnabled?: boolean }) => {
    const { t } = useTranslation('global')
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

    const { setValue, register } = useForm<FilterFormValues>({
        defaultValues: {
            dueDateAfter: null,
            dueDateBefore: null,
            exceededDueDate: null,
            todoId: null
        }
    })

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
                                Delete Todo Items
                            </Button>
                        ) : (
                            undefined
                        )}

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
                        <Typography variant='h6' className='mb-4 font-medium'>Filter</Typography>
                        <div className='grid grid-cols-12 gap-4'>
                            <div className='col-span-3'>
                                <FormControl fullWidth>
                                    <InputLabel shrink>Completed</InputLabel>
                                    <Select<BooleanFilterValue>
                                        value={completed}
                                        label="Completed"
                                        onChange={handleCompletedChange}
                                        notched
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="True">Yes</MenuItem>
                                        <MenuItem value="False">No</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                            <div className='col-span-3'>
                                <AppReactDatepicker
                                    selected={dueDateAfter}
                                    onChange={(date: Date | null) => setDueDateAfter(date)}
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={1}
                                    dateFormat="yyyy-MM-dd HH:mm"
                                    placeholderText="Due Date After"
                                    customInput={<CustomTextField fullWidth label="Due Date After" />}
                                />
                            </div>
                            <div className='col-span-3'>
                                <AppReactDatepicker
                                    selected={dueDateBefore}
                                    onChange={(date: Date | null) => setDueDateBefore(date)}
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={1}
                                    dateFormat="yyyy-MM-dd HH:mm"
                                    placeholderText="Due Date Before"
                                    customInput={<CustomTextField fullWidth label="Due Date Before" />}
                                />
                            </div>
                            <div className='col-span-3'>
                                <FormControl fullWidth>
                                    <InputLabel shrink>Exceeded Due Date</InputLabel>
                                    <Select<BooleanFilterValue>
                                        value={exceededDueDate}
                                        label="Exceeded Due Date"
                                        onChange={handleExceededDueDateChange}
                                        notched
                                    >
                                        <MenuItem value="">Unknown</MenuItem>
                                        <MenuItem value="True">Yes</MenuItem>
                                        <MenuItem value="False">No</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                            <div className='col-span-3'>
                                <CustomTextField
                                    fullWidth
                                    label="Todo ID"
                                    value={todoId}
                                    onChange={(e) => setTodoId(e.target.value)}
                                    type="number"
                                    placeholder="Enter Todo ID"
                                />
                            </div>
                            <div className='col-span-12 flex items-end gap-2 justify-end'>
                                <Button variant='contained' color='primary' onClick={handleApplyFilters}>
                                    Apply Filter
                                </Button>
                                <Button variant='outlined' onClick={handleClearFilters}>
                                    Clear
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
                title={modalMode === 'create' ? t('cases.todo.addNew') : modalMode === 'edit' ? t('cases.todo.edit') : t('cases.todo.view')}
                todoId={todoIdInitial}
            />
        </div>
    )
}

export default CaseTodoItemsListing
