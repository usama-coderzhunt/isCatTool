// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Axios Import
import type { AxiosError } from 'axios'

// Types Import
import type { ErrorResponse } from '@/types/type'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

// Utility Import
import { CaseTypes } from '@/types/cases'

export const useCasesHooks = () => {
  const queryClient = useQueryClient()

  const useCreateCase = () => {
    const mutation = useMutation({
      mutationFn: async (caseData: Partial<CaseTypes>) => {
        return await axiosInstance.post(API_ROUTES.CASES.createCase, caseData, {
          requiresAuth: true,
          requiredPermission: 'add_case'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cases'] })
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

  const getCases = (pageSize?: number, page?: number, search?: string, ordering?: string, clientId?: number, caseStatus?: string) => {
    return useQuery({
      queryKey: ['cases', pageSize, page, search, ordering, clientId, caseStatus],
      queryFn: () => {
        return axiosInstance.get(API_ROUTES.CASES.getCases, {
          params: {
            page,
            page_size: pageSize,
            search,
            ordering,
            client_id: clientId,
            closed: caseStatus
          },
          requiresAuth: true,
          requiredPermission: 'view_case'
        } as any)
      }
    })
  }

  const getCaseById = (id: number) => {
    return useQuery({
      queryKey: ['case', id],
      queryFn: async () => {
        const response = await axiosInstance.get(
          `${API_ROUTES.CASES.getCaseById}${id}/`,
          { requiresAuth: true, requiredPermission: 'view_case' } as any
        )

        return response.data
      },
      enabled: !!id
    })
  }

  const useEditCase = () => {
    const mutation = useMutation({
      mutationFn: async (caseData: Partial<CaseTypes & { id: number | undefined }>) => {
        return await axiosInstance.patch(`${API_ROUTES.CASES.editCase}${caseData?.id}/`, caseData, {
          requiresAuth: true,
          requiredPermission: 'change_case'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cases'] })
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

  const useDeleteCase = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.CASES.deleteCase}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_case'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cases'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete case')
      }
    })
  }

  const useDeleteCaseBulk = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.CASES.deleteCase}bulk_delete/`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'delete_case'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cases'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete cases')
      }
    })
  }

  // Case Types

  const useCreateCaseType = () => {
    const mutation = useMutation({
      mutationFn: (name: string) => {
        return axiosInstance.post(API_ROUTES.CASES.createCaseType, { name }, {
          requiresAuth: true,
          requiredPermission: 'add_casetype'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['case-types'] });
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

  const useUpdateCaseType = (id: number | null) => {
    const mutation = useMutation({
      mutationFn: (name: string) => {
        return axiosInstance.put(`${API_ROUTES.CASES.editCaseType}${id}/`, { name }, {
          requiresAuth: true,
          requiredPermission: 'change_casetype'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['case-types'] });
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

  const getCaseTypes = (pageSize?: number, page?: number, search?: string, ordering?: string) => {
    return useQuery({
      queryKey: ['case-types', pageSize, page, search],
      queryFn: () => {
        return axiosInstance.get(API_ROUTES.CASES.getCaseTypes, {
          params: {
            page,
            page_size: pageSize,
            search,
            ordering
          },
          requiresAuth: true,
          requiredPermission: 'view_casetype'
        } as any)
      }
    })
  }

  const deleteCaseType = (id: number | null) => {
    return useMutation({
      mutationFn: () => axiosInstance.delete(`${API_ROUTES.CASES.deleteCaseType}${id}/`, { requiresAuth: true, requiredPermission: 'delete_casetype' } as any),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['case-types'] });
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.'
        toast.error(errorMessage)
      }
    })
  }

  const useBulkDeleteCaseType = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.CASES.deleteCaseType}bulk_delete/`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'delete_casetype'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['case-types'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.'
        toast.error(errorMessage)
      }
    })
  }

  return {
    useCreateCase,
    getCases,
    useEditCase,
    useDeleteCase,
    getCaseById,
    useDeleteCaseBulk,

    // Case Types
    getCaseTypes,
    useCreateCaseType,
    useUpdateCaseType,
    deleteCaseType,
    useBulkDeleteCaseType
  }
}
