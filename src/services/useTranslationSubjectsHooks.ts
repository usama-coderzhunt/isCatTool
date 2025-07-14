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
import { TranslationSubjectsTypes } from '@/types/translationSubjectsTypes'

export const useTranslationSubjectsHooks = () => {
  const queryClient = useQueryClient()

  const useCreateTranslationSubject = () => {
    const mutation = useMutation({
      mutationFn: async (translationSubjectData: Partial<TranslationSubjectsTypes>) => {
        return await axiosInstance.post(
          API_ROUTES.TRANSLATION_SUBJECTS.createTranslationSubject,
          translationSubjectData,
          {
            requiresAuth: true,
            requiredPermission: 'add_translationsubject'
          } as any
        )
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['translationSubjects'] })
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

  const useEditTranslationSubject = () => {
    const mutation = useMutation({
      mutationFn: async (translationSubjectData: Partial<TranslationSubjectsTypes & { id: number | undefined }>) => {
        return await axiosInstance.patch(
          `${API_ROUTES.TRANSLATION_SUBJECTS.editTranslationSubject}${translationSubjectData?.id}/`,
          translationSubjectData,
          {
            requiresAuth: true,
            requiredPermission: 'change_translationsubject'
          } as any
        )
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['translationSubjects'] })
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

  const getTranslationSubjects = (pageSize?: number, page?: number, search?: string, ordering?: string) => {
    return useQuery({
      queryKey: ['translationSubjects', pageSize, page, search, ordering],
      queryFn: () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          search,
          ordering
        })
        return axiosInstance.get(API_ROUTES.TRANSLATION_SUBJECTS.getTranslationSubjects, {
          params,
          requiresAuth: true,
          requiredPermission: 'view_translationsubject'
        } as any)
      }
    })
  }

  const getTranslationSubjectById = (id: number) => {
    return useQuery({
      queryKey: ['translationSubject', id],
      queryFn: async () => {
        const response = await axiosInstance.get(`${API_ROUTES.TRANSLATION_SUBJECTS.getTranslationSubjectById}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_translationsubject'
        } as any)
        return response.data
      },
      enabled: !!id
    })
  }

  const useDeleteTranslationSubject = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.TRANSLATION_SUBJECTS.deleteTranslationSubject}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_translationsubject'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['translationSubjects'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(
          error.response?.data?.message || error.response?.data?.error || 'Failed to delete translation subject'
        )
      }
    })
  }

  const useBulkDeleteTranslationSubjects = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.TRANSLATION_SUBJECTS.bulkDeleteTranslationSubjects}`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'delete_translationsubject'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['translationSubjects'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(
          error.response?.data?.message || error.response?.data?.error || 'Failed to delete translation subjects'
        )
      }
    })
  }

  return {
    useCreateTranslationSubject,
    useEditTranslationSubject,
    getTranslationSubjects,
    getTranslationSubjectById,
    useDeleteTranslationSubject,
    useBulkDeleteTranslationSubjects
  }
}
