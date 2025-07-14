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
import { TranslationModelsTypes } from '@/types/translationModelTypes'

export const useTranslationModelsHooks = () => {
  const queryClient = useQueryClient()

  const useCreateTranslationModel = () => {
    const mutation = useMutation({
      mutationFn: async (translationModelData: Partial<TranslationModelsTypes>) => {
        return await axiosInstance.post(API_ROUTES.TRANSLATION_MODELS.createTranslationModels, translationModelData, {
          requiresAuth: true,
          requiredPermission: 'add_translationmodel'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['translationModels'] })
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

  const useEditTranslationModels = () => {
    const mutation = useMutation({
      mutationFn: async (translationModelsData: Partial<TranslationModelsTypes & { id: number | undefined }>) => {
        return await axiosInstance.patch(
          `${API_ROUTES.TRANSLATION_MODELS.editTranslationModels}${translationModelsData?.id}/`,
          translationModelsData,
          {
            requiresAuth: true,
            requiredPermission: 'change_translationmodel'
          } as any
        )
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['translationModels'] })
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

  const getTranslationModels = (pageSize?: number, page?: number, search?: string, ordering?: string) => {
    return useQuery({
      queryKey: ['translationModels', pageSize, page, search, ordering],
      queryFn: () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          search,
          ordering
        })
        return axiosInstance.get(API_ROUTES.TRANSLATION_MODELS.getTranslationModels, {
          params,
          requiresAuth: true,
          requiredPermission: 'view_translationmodel'
        } as any)
      }
    })
  }

  const getTranslationModelById = (id: number) => {
    return useQuery({
      queryKey: ['translationModel', id],
      queryFn: async () => {
        const response = await axiosInstance.get(`${API_ROUTES.TRANSLATION_MODELS.getTranslationModelsById}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_translationmodel'
        } as any)
        return response.data
      },
      enabled: !!id
    })
  }

  const useDeleteTranslationModel = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.TRANSLATION_MODELS.deleteTranslationModels}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_translationmodel'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['translationModels'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(
          error.response?.data?.message || error.response?.data?.error || 'Failed to delete translation model'
        )
      }
    })
  }

  const useBulkDeleteTranslationModels = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.TRANSLATION_MODELS.bulkDeleteTranslationModels}`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'delete_translationmodel'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['translationModels'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(
          error.response?.data?.message || error.response?.data?.error || 'Failed to delete translation models'
        )
      }
    })
  }

  const useTranslationModelPermissions = () => {
    return useMutation({
      mutationFn: async (params: { id: number; user_id: number }) => {
        return axiosInstance.post(
          `${API_ROUTES.TRANSLATION_MODELS.translationModelPermissions(params.id)}`,
          { user_id: params.user_id },
          {
            requiresAuth: true
          } as any
        )
      },
      onSuccess: () => {},
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(
          error.response?.data?.message || error.response?.data?.error || 'Failed to get translation model permissions'
        )
      }
    })
  }

  return {
    useCreateTranslationModel,
    useEditTranslationModels,
    getTranslationModels,
    getTranslationModelById,
    useDeleteTranslationModel,
    useBulkDeleteTranslationModels,
    useTranslationModelPermissions
  }
}
