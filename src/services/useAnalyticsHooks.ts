// React Imports
import { useQuery } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type { AnalyticsMetricType, AnalyticsQueryParamsType, AnalyticsDashboardType } from '@/types/analyticsTypes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'

interface ListResponse<T> {
  results: T[]
}

export const useAnalyticsHooks = () => {
  // Metrics Hooks
  const useMetrics = (params?: AnalyticsQueryParamsType) => {
    return useQuery<ListResponse<AnalyticsMetricType>>({
      queryKey: ['metrics', params],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<AnalyticsMetricType>>('/api/analytics/metrics/', {
            params
          })
          .then((response: AxiosResponse<ListResponse<AnalyticsMetricType>>) => response.data)
    })
  }

  const useMetric = (id: number) => {
    return useQuery<AnalyticsMetricType>({
      queryKey: ['metrics', id],
      queryFn: () =>
        axiosInstance
          .get<AnalyticsMetricType>(`/api/analytics/metrics/${id}/`)
          .then((response: AxiosResponse<AnalyticsMetricType>) => response.data),
      enabled: !!id
    })
  }

  // Dashboard Hooks
  const useDashboard = (params?: Pick<AnalyticsQueryParamsType, 'start_date' | 'end_date'>) => {
    return useQuery<AnalyticsDashboardType>({
      queryKey: ['dashboard', params],
      queryFn: () =>
        axiosInstance
          .get<AnalyticsDashboardType>('/api/analytics/dashboard/', {
            params
          })
          .then((response: AxiosResponse<AnalyticsDashboardType>) => response.data)
    })
  }

  // Trend Analysis Hooks
  const useTrends = (metric: string, params?: AnalyticsQueryParamsType) => {
    return useQuery<Array<{ date: string; value: number }>>({
      queryKey: ['trends', metric, params],
      queryFn: () =>
        axiosInstance
          .get(`/api/analytics/trends/${metric}/`, {
            params
          })
          .then((response: AxiosResponse<Array<{ date: string; value: number }>>) => response.data)
    })
  }

  // Performance Metrics Hooks
  const usePerformance = (params?: Pick<AnalyticsQueryParamsType, 'start_date' | 'end_date'>) => {
    return useQuery<AnalyticsDashboardType['performance']>({
      queryKey: ['performance', params],
      queryFn: () =>
        axiosInstance
          .get('/api/analytics/performance/', {
            params
          })
          .then((response: AxiosResponse<AnalyticsDashboardType['performance']>) => response.data)
    })
  }

  return {
    useMetrics,
    useMetric,
    useDashboard,
    useTrends,
    usePerformance
  }
}
