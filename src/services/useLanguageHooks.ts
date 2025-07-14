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
import { cleanApiParams } from '@/utils/utility/paramsUtils'
import { LanguageTypes } from '@/types/languageTypes'

export const useLanguageHooks = () => {
  const queryClient = useQueryClient()

  const useCreateLanguage = () => {
    const mutation = useMutation({
      mutationFn: async (languageData: Partial<LanguageTypes>) => {
        return await axiosInstance.post(API_ROUTES.LANGUAGE.createLanguage, languageData, {
          requiresAuth: true,
          requiredPermission: 'add_language'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['languages'] })
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

  const useEditLanguage = () => {
    const mutation = useMutation({
      mutationFn: async (languageData: Partial<LanguageTypes & { id: number | undefined }>) => {
        return await axiosInstance.patch(`${API_ROUTES.LANGUAGE.editLanguage}${languageData?.id}/`, languageData, {
          requiresAuth: true,
          requiredPermission: 'change_language'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['languages'] })
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

  const getLanguages = (pageSize?: number, page?: number, search?: string, ordering?: string) => {
    return useQuery({
      queryKey: ['languages', pageSize, page, search, ordering],
      queryFn: () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          search,
          ordering
        })
        return axiosInstance.get(API_ROUTES.LANGUAGE.getLanguages, {
          params,
          requiresAuth: true,
          requiredPermission: 'view_language'
        } as any)
      }
    })
  }

  const getLanguageById = (id: number) => {
    return useQuery({
      queryKey: ['language', id],
      queryFn: async () => {
        const response = await axiosInstance.get(`${API_ROUTES.LANGUAGE.getLanguages}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_language'
        } as any)
        return response.data
      },
      enabled: !!id
    })
  }

  const useDeleteLanguage = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.LANGUAGE.deleteLanguage}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_language'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['languages'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete language')
      }
    })
  }

  const useBulkDeleteLanguage = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.LANGUAGE.bulkDeleteLanguage}`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'delete_language'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['languages'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete languages')
      }
    })
  }

  return {
    useCreateLanguage,
    useEditLanguage,
    getLanguages,
    getLanguageById,
    useDeleteLanguage,
    useBulkDeleteLanguage
  }
}
