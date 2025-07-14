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
import { cleanApiParams } from '@/utils/utility/paramsUtils'
import { LLMOperatorTypes } from '@/types/llmOperatorTypes'

export const useLlmOperatorsHooks = () => {
  const queryClient = useQueryClient()

  const useCreateLlmOperator = () => {
    const mutation = useMutation({
      mutationFn: async (llmOperatorData: Partial<LLMOperatorTypes>) => {
        return await axiosInstance.post(API_ROUTES.LLM_OPERATORS.createLlmOperator, llmOperatorData, {
          requiresAuth: true
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['llmOperators'] })
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

  const useEditLlmOperator = () => {
    const mutation = useMutation({
      mutationFn: async (llmOperatorData: Partial<LLMOperatorTypes & { id: number | undefined }>) => {
        return await axiosInstance.patch(
          `${API_ROUTES.LLM_OPERATORS.editLlmOperator}${llmOperatorData?.id}/`,
          llmOperatorData,
          {
            requiresAuth: true
          } as any
        )
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['llmOperators'] })
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

  const getLlmOperators = (pageSize?: number, page?: number, search?: string, ordering?: string) => {
    return useQuery({
      queryKey: ['llmOperators', pageSize, page, search, ordering],
      queryFn: () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          search,
          ordering
        })
        return axiosInstance.get(API_ROUTES.LLM_OPERATORS.getLlmOperators, {
          params,
          requiresAuth: true
        } as any)
      }
    })
  }

  const getLlmOperatorById = (id: number) => {
    return useQuery({
      queryKey: ['llmOperator', id],
      queryFn: async () => {
        const response = await axiosInstance.get(`${API_ROUTES.LLM_OPERATORS.getLlmOperators}${id}/`, {
          requiresAuth: true
        } as any)
        return response.data
      },
      enabled: !!id
    })
  }

  const useDeleteLlmOperator = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.LLM_OPERATORS.deleteLlmOperator}${id}/`, {
          requiresAuth: true
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['llmOperators'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete llm operator')
      }
    })
  }

  const useBulkDeleteLlmOperator = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.LLM_OPERATORS.bulkDeleteLlmOperators}`, {
          data: { ids },
          requiresAuth: true
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['llmOperators'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete languages')
      }
    })
  }

  return {
    useCreateLlmOperator,
    useEditLlmOperator,
    getLlmOperators,
    getLlmOperatorById,
    useDeleteLlmOperator,
    useBulkDeleteLlmOperator
  }
}
