// React Imports
import { useQuery } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type { SystemHealthType, ServiceStatusType, PerformanceMetricsType, ErrorLogType } from '@/types/healthTypes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

interface ListResponse<T> {
  results: T[]
}

export const useHealthHooks = () => {
  // System Health Hook
  const useSystemHealth = () => {
    return useQuery<SystemHealthType>({
      queryKey: ['systemHealth'],
      queryFn: () =>
        axiosInstance
          .get<SystemHealthType>(API_ROUTES.HEALTH.STATUS)
          .then((response: AxiosResponse<SystemHealthType>) => response.data),
      refetchInterval: 60000 // Refetch every minute
    })
  }

  // Service Status Hook
  const useServiceStatus = () => {
    return useQuery<ListResponse<ServiceStatusType>>({
      queryKey: ['serviceStatus'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<ServiceStatusType>>(API_ROUTES.HEALTH.SERVICES)
          .then((response: AxiosResponse<ListResponse<ServiceStatusType>>) => response.data),
      refetchInterval: 30000 // Refetch every 30 seconds
    })
  }

  // Performance Metrics Hook
  const usePerformanceMetrics = (timeRange?: { start: string; end: string }) => {
    return useQuery<PerformanceMetricsType>({
      queryKey: ['performanceMetrics', timeRange],
      queryFn: () =>
        axiosInstance
          .get<PerformanceMetricsType>(API_ROUTES.HEALTH.METRICS, {
            params: timeRange
          })
          .then((response: AxiosResponse<PerformanceMetricsType>) => response.data),
      refetchInterval: 15000 // Refetch every 15 seconds
    })
  }

  // Error Monitoring Hook
  const useErrorLogs = (filters?: {
    level?: 'error' | 'warning' | 'critical'
    resolved?: boolean
    start_date?: string
    end_date?: string
  }) => {
    return useQuery<ListResponse<ErrorLogType>>({
      queryKey: ['errorLogs', filters],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<ErrorLogType>>(API_ROUTES.HEALTH.ERRORS, {
            params: filters
          })
          .then((response: AxiosResponse<ListResponse<ErrorLogType>>) => response.data)
    })
  }

  return {
    useSystemHealth,
    useServiceStatus,
    usePerformanceMetrics,
    useErrorLogs
  }
}
