import { FilesTypes } from '@/types/filesTypes'
import { LLMOperatorTypes } from '@/types/llmOperatorTypes'
import { TasksTypes } from '@/types/tasksTypes'
import { ErrorResponse } from '@/types/type'
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'
import { cleanApiParams } from '@/utils/utility/paramsUtils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

export const useProjectsHooks = () => {
  const queryClient = useQueryClient()

  const getProjects = (pageSize: number, page: number, ordering?: string, search?: Record<string, any>) => {
    return useQuery({
      queryKey: ['projects', page, pageSize, ordering, search],
      queryFn: async () => {
        return axiosInstance.get(API_ROUTES.PROJECTS.getProjects, {
          params: { page, page_size: pageSize, ordering, ...(search || {}) }
        })
      }
    })
  }

  const getProjectById = (id: number) => {
    return useQuery({
      queryKey: ['project', id],
      queryFn: async () => {
        return axiosInstance.get(`${API_ROUTES.PROJECTS.getProjects}${id}/`)
      },
      enabled: !!id
    })
  }

  const useCreateProject = () => {
    return useMutation({
      mutationFn: async (data: any) => {
        return axiosInstance.post(API_ROUTES.PROJECTS.createProject, data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] })
      }
    })
  }

  const useEditProject = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: number; data: any }) => {
        return axiosInstance.put(`${API_ROUTES.PROJECTS.editProject}${id}/`, data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] })
      }
    })
  }

  const useDeleteProject = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.PROJECTS.deleteProject}${id}/`)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['projects'] })
        }, 500)
      }
    })
  }

  const useDeleteProjectBulk = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.PROJECTS.deleteProject}bulk_delete/`, { data: { ids } })
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['projects'] })
        }, 500)
      }
    })
  }

  // Projects Tasks Hooks

  const useCreateTask = () => {
    const mutation = useMutation({
      mutationFn: async (taskData: Partial<TasksTypes>) => {
        return await axiosInstance.post(API_ROUTES.TASKS.createTask, taskData, {
          requiresAuth: true,
          requiredPermission: 'add_task'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
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

  const useEditTask = () => {
    const mutation = useMutation({
      mutationFn: async ({ id, data }: { id: number; data: Partial<TasksTypes> }) => {
        return await axiosInstance.patch(`${API_ROUTES.TASKS.editTask}${id}/`, data, {
          requiresAuth: true,
          requiredPermission: 'change_task'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
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

  const getTasks = (projectId?: number, pageSize?: number, page?: number, search?: string, ordering?: string) => {
    return useQuery({
      queryKey: ['tasks', projectId, pageSize, page, search, ordering],
      queryFn: () => {
        const params = cleanApiParams({
          project: projectId,
          page,
          page_size: pageSize,
          search,
          ordering
        })
        return axiosInstance.get(API_ROUTES.TASKS.getTasks, {
          params,
          requiresAuth: true,
          requiredPermission: 'view_task'
        } as any)
      }
    })
  }

  const getTasksByProjectId = (id?: number) => {
    return useQuery({
      queryKey: ['tasks-by-project-id', id],
      queryFn: () => {
        return axiosInstance.get(API_ROUTES.TASKS.getTasks, {
          params: {
            project: id
          },
          requiresAuth: true,
          requiredPermission: 'view_task'
        } as any)
      },
      enabled: !!id
    })
  }

  const getTaskById = (id: number) => {
    return useQuery({
      queryKey: ['task', id],
      queryFn: async () => {
        const response = await axiosInstance.get(`${API_ROUTES.TASKS.getTasks}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_task'
        } as any)
        return response.data
      },
      enabled: !!id
    })
  }

  const useDeleteTask = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.TASKS.deleteTask}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_task'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete task')
      }
    })
  }

  const useBulkDeleteTask = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.TASKS.bulkDeleteTasks}`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'delete_task'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.error || 'Failed to delete tasks')
      }
    })
  }

  const useTaskSplitByCount = () => {
    const mutation = useMutation({
      mutationFn: async ({ id, data }: { id: number; data: { number_of_subtasks: number } }) => {
        return await axiosInstance.post(`${API_ROUTES.TASKS.taskSplitByCount(id)}`, data, {
          requiresAuth: true
        } as any)
      },
      onSuccess: (response: any) => {
        toast.success(response.data.status)
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'An unexpected error occurred.'
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

  // Files Hooks
  const useCreateFile = () => {
    const mutation = useMutation({
      mutationFn: async (fileData: { task: number; file: File }) => {
        const formData = new FormData()
        formData.append('task', fileData.task.toString())
        formData.append('file', fileData.file)

        return await axiosInstance.post(API_ROUTES.FILES.createFile, formData, {
          requiresAuth: true,
          requiredPermission: 'add_file',
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['files'] })
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

  const getFiles = (taskId?: number, pageSize?: number, page?: number, search?: string, ordering?: string) => {
    return useQuery({
      queryKey: ['files', taskId, pageSize, page, search, ordering],
      queryFn: () => {
        const params = cleanApiParams({
          task: taskId,
          page,
          page_size: pageSize,
          search,
          ordering
        })
        return axiosInstance.get(API_ROUTES.FILES.getFiles, {
          params,
          requiresAuth: true,
          requiredPermission: 'view_file'
        } as any)
      }
    })
  }

  const getFileById = (id: number) => {
    return useQuery({
      queryKey: ['file', id],
      queryFn: async () => {
        const response = await axiosInstance.get(`${API_ROUTES.FILES.getFileById}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_file'
        } as any)
        return response.data
      },
      enabled: !!id
    })
  }

  const useDeleteFile = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.FILES.deleteFile}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_file'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['files'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete file')
      }
    })
  }

  const useBulkDeleteFile = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.FILES.bulkDeleteFiles}`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'delete_file'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['files'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.error || 'Failed to delete files')
      }
    })
  }

  return {
    getProjects,
    getProjectById,
    useDeleteProject,
    useDeleteProjectBulk,
    useCreateProject,
    useEditProject,

    // Projects Tasks Hooks
    useCreateTask,
    useEditTask,
    getTasks,
    getTasksByProjectId,
    getTaskById,
    useDeleteTask,
    useBulkDeleteTask,
    useTaskSplitByCount,

    // Files Hooks
    useCreateFile,
    getFiles,
    getFileById,
    useDeleteFile,
    useBulkDeleteFile
  }
}
