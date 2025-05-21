// React Imports
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'
import { ErrorResponse } from '@/types/type'
import { TodoItem } from '@/types/todoItems'
import { mapTodoItemData } from './utility/todoItems'

interface TodoFilters {
    completed?: 'True' | 'False' | null
    dueDateAfter?: string | null
    dueDateBefore?: string | null
    exceededDueDate?: 'True' | 'False' | null
    todoId?: number | null
}

export const useTodosHooks = () => {
    const queryClient = useQueryClient()

    const useCreateTodoItem = () => {
        const mutation = useMutation({
            mutationFn: (data: TodoItem) => {
                const useTodoItemData = mapTodoItemData(data)
                return axiosInstance.post(API_ROUTES.TODOS.createTodoItem, useTodoItemData, {
                    requiresAuth: true,
                    requiredPermission: 'add_todoitem'
                } as any)
            },
            onSuccess: () => {
                toast.success('Todo Item created successfully')
                queryClient.invalidateQueries({ queryKey: ['todo-items'] })
            },
            onError: (error: AxiosError<ErrorResponse>) => {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.'
                toast.error(errorMessage)
            }
        })

        return {
            data: mutation.data,
            error: mutation.error,
            isLoading: mutation.isPending,
            isSuccess: mutation.isSuccess,
            mutate: mutation.mutate
        }
    }

    const useEditTodoItem = () => {
        const mutation = useMutation({
            mutationFn: ({ id, data }: { id: string; data: TodoItem }) => {
                const useEditTodoItemData = mapTodoItemData(data)

                return axiosInstance.patch(`${API_ROUTES.TODOS.editTodoItem}${id}/`, useEditTodoItemData, {
                    requiresAuth: true,
                    requiredPermission: 'change_todoitem'
                } as any)
            },
            onSuccess: () => {
                toast.success('Todo Item updated successfully')
                queryClient.invalidateQueries({ queryKey: ['todo-items'] })
                queryClient.invalidateQueries({ queryKey: ['todos'] })
            },
            onError: (error: AxiosError<ErrorResponse>) => {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.'
                toast.error(errorMessage)
            }
        })

        return {
            data: mutation.data,
            error: mutation.error,
            isLoading: mutation.isPending,
            isSuccess: mutation.isSuccess,
            mutate: mutation.mutate
        }
    }

    const getTodos = (pageSize?: number, page?: number, search?: string, ordering?: string) => {
        return useQuery({
            queryKey: ['todos', pageSize, page, search, ordering],
            queryFn: () => {
                return axiosInstance.get(API_ROUTES.TODOS.getTodos, {
                    params: {
                        page,
                        page_size: pageSize,
                        ordering,
                        search
                    },
                    requiresAuth: true,
                    requiredPermission: 'view_todoitem'
                } as any)
            }
        })
    }

    const getTodoByCaseId = (id?: number) => {
        return useQuery({
            queryKey: ['todos-by-case-id', id],
            queryFn: () => {
                return axiosInstance.get(API_ROUTES.TODOS.getTodos, {
                    params: {
                        case: id
                    },
                    requiresAuth: true,
                    requiredPermission: 'view_todoitem'
                } as any)
            },
            enabled: !!id
        })
    }

    const getTodoItems = (todoId: number, pageSize: number, page: number, ordering?: string, search?: string) => {
        return useQuery({
            queryKey: ['todo-items', todoId, page, pageSize, ordering, search],
            queryFn: () => {
                return axiosInstance.get(API_ROUTES.TODOS.getTodoItems(todoId), {
                    params: {
                        page,
                        page_size: pageSize,
                        ordering,
                        search,
                    },
                    requiresAuth: true,
                    requiredPermission: 'view_todoitem'
                } as any)
            },
        })
    }

    const getAllTodoItems = (pageSize: number, page: number, ordering?: string, search?: string, filters?: TodoFilters, filtersApplied?: boolean) => {
        return useQuery({
            queryKey: ['todo-items', page, pageSize, ordering, search, filters, filtersApplied],
            queryFn: () => {
                return axiosInstance.get(API_ROUTES.TODOS.getAllTodoItems, {
                    params: {
                        page,
                        page_size: pageSize,
                        ordering,
                        search,
                        completed: filters?.completed,
                        due_date_after: filters?.dueDateAfter,
                        due_date_before: filters?.dueDateBefore,
                        exceeded_due_date: filters?.exceededDueDate,
                        todo_id: filters?.todoId
                    },
                    requiresAuth: true,
                    requiredPermission: 'view_todoitem'
                } as any)
            },
            enabled: filtersApplied
        })
    }

    const useDeleteTodoItem = () => {
        const mutation = useMutation({
            mutationFn: (id: string) => {
                return axiosInstance.delete(`${API_ROUTES.TODOS.deleteTodoItem}${id}/`, {
                    requiresAuth: true,
                    requiredPermission: 'delete_todoitem'
                } as any)
            },
            onSuccess: () => {
                toast.success('Todo Item deleted successfully')
                queryClient.invalidateQueries({ queryKey: ['todo-items'] })
            },
            onError: (error: AxiosError<ErrorResponse>) => {
                const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.'
                toast.error(errorMessage)
            }
        })
        return {
            data: mutation.data,
            error: mutation.error,
            isLoading: mutation.isPending,
            isSuccess: mutation.isSuccess,
            mutate: mutation.mutate
        }
    }

    const useBulkDeleteTodoItems = () => {
        return useMutation({
            mutationFn: async (ids: number[]) => {
                try {
                    const response = await axiosInstance.delete(`${API_ROUTES.TODOS.bulkDeleteTodoItems}`, {
                        data: { ids },
                        requiresAuth: true,
                        requiredPermission: 'delete_todoitem'
                    } as any)
                    return response.data
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Failed to delete staff members'
                    toast.error(errorMessage)
                    throw error
                }
            },
            onSuccess: data => {
                queryClient.invalidateQueries({ queryKey: ['todo-items'] })
            }
        })
    }

    return {
        getTodos,
        getTodoItems,
        useCreateTodoItem,
        useEditTodoItem,
        useDeleteTodoItem,
        useBulkDeleteTodoItems,
        getAllTodoItems,
        getTodoByCaseId
    }
}
