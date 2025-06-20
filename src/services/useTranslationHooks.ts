// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type {
  TranslationModelType,
  CreateTranslationModelType,
  LanguageType,
  CreateLanguageType,
  TranslationMemoryType,
  CreateTranslationMemoryType,
  TranslationMemoryEntryType,
  CreateTranslationMemoryEntryType
} from '@/types/translation'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import {
  mapCreateTranslationModelData,
  mapCreateLanguageData,
  mapCreateTranslationMemoryData,
  mapCreateTranslationMemoryEntryData
} from './utility/translation'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

interface ListResponse<T> {
  results: T[]
}

export const useTranslationHooks = () => {
  const queryClient = useQueryClient()

  // Translation Model Hooks
  const useTranslationModels = () => {
    return useQuery<ListResponse<TranslationModelType>>({
      queryKey: ['translationModels'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<TranslationModelType>>('/api/ista/translation-models/')
          .then((response: AxiosResponse<ListResponse<TranslationModelType>>) => response.data)
    })
  }

  const useCreateTranslationModel = () => {
    const mutation = useMutation<TranslationModelType, AxiosError<ErrorResponse>, CreateTranslationModelType>({
      mutationFn: data => {
        const modelData = mapCreateTranslationModelData(data)

        return axiosInstance
          .post<TranslationModelType>('/api/ista/translation-models/', modelData)
          .then((response: AxiosResponse<TranslationModelType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['translationModels'] })
        toast.success('Translation model created successfully')
      },
      onError: error => {
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

  // LanguageType Hooks
  const useLanguages = () => {
    return useQuery<ListResponse<LanguageType>>({
      queryKey: ['languages'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<LanguageType>>(API_ROUTES.LANGUAGES.LIST)
          .then((response: AxiosResponse<ListResponse<LanguageType>>) => response.data)
    })
  }

  const useCreateLanguage = () => {
    const mutation = useMutation<LanguageType, AxiosError<ErrorResponse>, CreateLanguageType>({
      mutationFn: data => {
        const languageData = mapCreateLanguageData(data)

        return axiosInstance
          .post<LanguageType>(API_ROUTES.LANGUAGES.LIST, languageData)
          .then((response: AxiosResponse<LanguageType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['languages'] })
        toast.success('LanguageType created successfully')
      },
      onError: error => {
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

  // Translation Memory Hooks
  const useTranslationMemories = () => {
    return useQuery<ListResponse<TranslationMemoryType>>({
      queryKey: ['translationMemories'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<TranslationMemoryType>>('/api/ista/tm/')
          .then((response: AxiosResponse<ListResponse<TranslationMemoryType>>) => response.data)
    })
  }

  const useCreateTranslationMemory = () => {
    const mutation = useMutation<TranslationMemoryType, AxiosError<ErrorResponse>, CreateTranslationMemoryType>({
      mutationFn: data => {
        const memoryData = mapCreateTranslationMemoryData(data)

        return axiosInstance
          .post<TranslationMemoryType>('/api/ista/tm/', memoryData)
          .then((response: AxiosResponse<TranslationMemoryType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['translationMemories'] })
        toast.success('Translation memory created successfully')
      },
      onError: error => {
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

  // Translation Memory Entry Hooks
  const useTranslationMemoryEntries = (memoryId?: number) => {
    return useQuery<ListResponse<TranslationMemoryEntryType>>({
      queryKey: ['translationMemoryEntries', memoryId],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<TranslationMemoryEntryType>>('/api/ista/tm-entries/', {
            params: { translation_memory: memoryId }
          })
          .then((response: AxiosResponse<ListResponse<TranslationMemoryEntryType>>) => response.data),
      enabled: !!memoryId
    })
  }

  const useCreateTranslationMemoryEntry = () => {
    const mutation = useMutation<
      TranslationMemoryEntryType,
      AxiosError<ErrorResponse>,
      CreateTranslationMemoryEntryType
    >({
      mutationFn: data => {
        const entryData = mapCreateTranslationMemoryEntryData(data)

        return axiosInstance
          .post<TranslationMemoryEntryType>('/api/ista/tm-entries/', entryData)
          .then((response: AxiosResponse<TranslationMemoryEntryType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['translationMemoryEntries'] })
        toast.success('Translation memory entry created successfully')
      },
      onError: error => {
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

  return {
    // Translation Model hooks
    useTranslationModels,
    useCreateTranslationModel,

    // LanguageType hooks
    useLanguages,
    useCreateLanguage,

    // Translation Memory hooks
    useTranslationMemories,
    useCreateTranslationMemory,

    // Translation Memory Entry hooks
    useTranslationMemoryEntries,
    useCreateTranslationMemoryEntry
  }
}
