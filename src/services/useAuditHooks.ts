// React Imports
import { useQuery } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type { AuditLogType, AuditSearchParamsType, AuditStatisticsType } from '@/types/auditTypes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'

interface ListResponse<T> {
  results: T[]
  total: number
  page: number
  page_size: number
}

export const useAuditHooks = () => {
  // Audit Log Hooks
  const useAuditLogs = (params?: AuditSearchParamsType) => {
    return useQuery<ListResponse<AuditLogType>>({
      queryKey: ['auditLogs', params],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<AuditLogType>>('/api/audit/logs/', {
            params
          })
          .then((response: AxiosResponse<ListResponse<AuditLogType>>) => response.data)
    })
  }

  const useAuditLog = (id: number) => {
    return useQuery<AuditLogType>({
      queryKey: ['auditLogs', id],
      queryFn: () =>
        axiosInstance
          .get<AuditLogType>(`/api/audit/logs/${id}/`)
          .then((response: AxiosResponse<AuditLogType>) => response.data),
      enabled: !!id
    })
  }

  // Audit Statistics Hooks
  const useAuditStatistics = (params?: Pick<AuditSearchParamsType, 'start_date' | 'end_date'>) => {
    return useQuery<AuditStatisticsType>({
      queryKey: ['auditStatistics', params],
      queryFn: () =>
        axiosInstance
          .get<AuditStatisticsType>('/api/audit/statistics/', {
            params
          })
          .then((response: AxiosResponse<AuditStatisticsType>) => response.data)
    })
  }

  return {
    useAuditLogs,
    useAuditLog,
    useAuditStatistics
  }
}
