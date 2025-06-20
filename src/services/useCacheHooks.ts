// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type {
  CacheConfigType,
  CreateCacheConfigType,
  UpdateCacheConfigType,
  CacheStatsType,
  CacheOperationType,
  CreateCacheOperationType
} from '@/types/cacheTypes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import { mapCreateCacheConfigData, mapUpdateCacheConfigData, mapCreateCacheOperationData } from './utility/cache'

interface ListResponse<T> {
  results: T[]
}

export const useCacheHooks = () => {
  const queryClient = useQueryClient()

  // Cache Config Hooks
  const useCacheConfigs = () => {
    return useQuery<ListResponse<CacheConfigType>>({
      queryKey: ['cacheConfigs'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<CacheConfigType>>('/api/cache/configs/')
          .then((response: AxiosResponse<ListResponse<CacheConfigType>>) => response.data)
    })
  }

  const useCreateCacheConfig = () => {
    const mutation = useMutation<CacheConfigType, AxiosError<ErrorResponse>, CreateCacheConfigType>({
      mutationFn: (data: CreateCacheConfigType) => {
        const configData = mapCreateCacheConfigData(data)

        return axiosInstance
          .post<CacheConfigType>('/api/cache/configs/', configData)
          .then((response: AxiosResponse<CacheConfigType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cacheConfigs'] })
        toast.success('Cache configuration created successfully')
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

  const useUpdateCacheConfig = () => {
    const mutation = useMutation<CacheConfigType, AxiosError<ErrorResponse>, UpdateCacheConfigType>({
      mutationFn: (data: UpdateCacheConfigType) => {
        const { id, ...updateData } = data
        const configData = mapUpdateCacheConfigData(updateData)

        return axiosInstance
          .patch<CacheConfigType>(`/api/cache/configs/${id}/`, configData)
          .then((response: AxiosResponse<CacheConfigType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cacheConfigs'] })
        toast.success('Cache configuration updated successfully')
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

  // Cache Statistics Hooks
  const useCacheStats = () => {
    return useQuery<ListResponse<CacheStatsType>>({
      queryKey: ['cacheStats'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<CacheStatsType>>('/api/cache/stats/')
          .then((response: AxiosResponse<ListResponse<CacheStatsType>>) => response.data)
    })
  }

  // Cache Operation Hooks
  const useCacheOperation = () => {
    const mutation = useMutation<CacheOperationType, AxiosError<ErrorResponse>, CreateCacheOperationType>({
      mutationFn: (data: CreateCacheOperationType) => {
        const operationData = mapCreateCacheOperationData(data)

        return axiosInstance
          .post<CacheOperationType>('/api/cache/operations/', operationData)
          .then((response: AxiosResponse<CacheOperationType>) => response.data)
      },
      onSuccess: (data: CacheOperationType) => {
        queryClient.invalidateQueries({ queryKey: ['cacheStats'] })
        toast.success(`Cache ${data.operation} operation started successfully`)
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

  return {
    // Cache Config hooks
    useCacheConfigs,
    useCreateCacheConfig,
    useUpdateCacheConfig,

    // Cache Statistics hooks
    useCacheStats,

    // Cache Operation hooks
    useCacheOperation
  }
}
