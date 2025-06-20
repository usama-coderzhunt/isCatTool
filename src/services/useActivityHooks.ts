// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type { ActivityType, ActivityFilterType, ActivityAnalyticsType, ActivityExportType } from '@/types/activityTypes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

interface ListResponse<T> {
  results: T[]
  total: number
  page: number
  page_size: number
}

export const useActivityHooks = () => {
  const queryClient = useQueryClient()

  // Activity List Hook
  const useActivities = (filters?: ActivityFilterType) => {
    return useQuery({
      queryKey: ['activities', filters],
      queryFn: () => axiosInstance.get(API_ROUTES.ACTIVITY.LIST, { params: filters })
    })
  }

  // Activity Detail Hook
  const useActivity = (id: number) => {
    return useQuery({
      queryKey: ['activities', id],
      queryFn: () => axiosInstance.get<ActivityType>(API_ROUTES.ACTIVITY.DETAIL(id)),
      enabled: !!id
    })
  }

  // Activity Filter Hook
  const useFilteredActivities = (filters: ActivityFilterType) => {
    return useQuery({
      queryKey: ['filteredActivities', filters],
      queryFn: () => axiosInstance.post(API_ROUTES.ACTIVITY.FILTER, filters),
      enabled: !!filters
    })
  }

  // Activity Analytics Hook
  const useActivityAnalytics = (filters?: Pick<ActivityFilterType, 'start_date' | 'end_date'>) => {
    return useQuery<ActivityAnalyticsType>({
      queryKey: ['activityAnalytics', filters],
      queryFn: () =>
        axiosInstance
          .get<ActivityAnalyticsType>(API_ROUTES.ACTIVITY.ANALYTICS, { params: filters })
          .then((response: AxiosResponse<ActivityAnalyticsType>) => response.data)
    })
  }

  // Activity Export Hook
  const useExportActivities = () => {
    const mutation = useMutation<Blob, AxiosError<ErrorResponse>, ActivityExportType>({
      mutationFn: (data: ActivityExportType) =>
        axiosInstance
          .post(API_ROUTES.ACTIVITY.EXPORT, data, { responseType: 'blob' })
          .then((response: AxiosResponse<Blob>) => response.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['activities'] })
        toast.success('Activities exported successfully')
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
    useActivities,
    useActivity,
    useFilteredActivities,
    useActivityAnalytics,
    useExportActivities
  }
}
