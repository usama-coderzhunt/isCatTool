// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type {
  SearchResultType,
  SearchQueryType,
  FilterType,
  CreateFilterType,
  UpdateFilterType,
  SearchHistoryType
} from '@/types/searchTypes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import { mapSearchQueryData, mapCreateFilterData, mapUpdateFilterData } from './utility/search'

interface ListResponse<T> {
  results: T[]
  total: number
}

export const useSearchHooks = () => {
  const queryClient = useQueryClient()

  // Search Hooks
  const useSearch = (params: SearchQueryType) => {
    return useQuery<ListResponse<SearchResultType>>({
      queryKey: ['search', params],
      queryFn: () => {
        const searchData = mapSearchQueryData(params)

        return axiosInstance
          .get<ListResponse<SearchResultType>>('/api/search/', {
            params: searchData
          })
          .then((response: AxiosResponse<ListResponse<SearchResultType>>) => response.data)
      },
      enabled: !!params.query
    })
  }

  // Filter Hooks
  const useFilters = (type?: string) => {
    return useQuery<ListResponse<FilterType>>({
      queryKey: ['filters', type],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<FilterType>>('/api/filters/', {
            params: { type }
          })
          .then((response: AxiosResponse<ListResponse<FilterType>>) => response.data)
    })
  }

  const useCreateFilter = () => {
    const mutation = useMutation<FilterType, AxiosError<ErrorResponse>, CreateFilterType>({
      mutationFn: (data: CreateFilterType) => {
        const filterData = mapCreateFilterData(data)

        return axiosInstance
          .post<FilterType>('/api/filters/', filterData)
          .then((response: AxiosResponse<FilterType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['filters'] })
        toast.success('Filter created successfully')
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

  const useUpdateFilter = () => {
    const mutation = useMutation<FilterType, AxiosError<ErrorResponse>, UpdateFilterType>({
      mutationFn: (data: UpdateFilterType) => {
        const { id, ...updateData } = data
        const filterData = mapUpdateFilterData(updateData)

        return axiosInstance
          .patch<FilterType>(`/api/filters/${id}/`, filterData)
          .then((response: AxiosResponse<FilterType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['filters'] })
        toast.success('Filter updated successfully')
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

  // Search History Hooks
  const useSearchHistory = () => {
    return useQuery<ListResponse<SearchHistoryType>>({
      queryKey: ['searchHistory'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<SearchHistoryType>>('/api/search/history/')
          .then((response: AxiosResponse<ListResponse<SearchHistoryType>>) => response.data)
    })
  }

  const useClearSearchHistory = () => {
    const mutation = useMutation<void, AxiosError<ErrorResponse>, void>({
      mutationFn: () => {
        return axiosInstance.delete('/api/search/history/').then((response: AxiosResponse<void>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['searchHistory'] })
        toast.success('Search history cleared successfully')
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
    // Search hooks
    useSearch,

    // Filter hooks
    useFilters,
    useCreateFilter,
    useUpdateFilter,

    // Search History hooks
    useSearchHistory,
    useClearSearchHistory
  }
}
