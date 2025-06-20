// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type {
  ReportTemplateType,
  CreateReportTemplateType,
  UpdateReportTemplateType,
  ReportGenerationType,
  GenerateReportType,
  ReportScheduleType,
  CreateReportScheduleType,
  UpdateReportScheduleType
} from '@/types/reportTypes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import {
  mapCreateReportTemplateData,
  mapUpdateReportTemplateData,
  mapGenerateReportData,
  mapCreateReportScheduleData,
  mapUpdateReportScheduleData
} from './utility/report'

interface ListResponse<T> {
  results: T[]
}

export const useReportHooks = () => {
  const queryClient = useQueryClient()

  // Report Template Hooks
  const useReportTemplates = () => {
    return useQuery<ListResponse<ReportTemplateType>>({
      queryKey: ['reportTemplates'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<ReportTemplateType>>('/api/reports/templates/')
          .then((response: AxiosResponse<ListResponse<ReportTemplateType>>) => response.data)
    })
  }

  const useReportTemplate = (id: number) => {
    return useQuery<ReportTemplateType>({
      queryKey: ['reportTemplates', id],
      queryFn: () =>
        axiosInstance
          .get<ReportTemplateType>(`/api/reports/templates/${id}/`)
          .then((response: AxiosResponse<ReportTemplateType>) => response.data),
      enabled: !!id
    })
  }

  const useCreateReportTemplate = () => {
    const mutation = useMutation<ReportTemplateType, AxiosError<ErrorResponse>, CreateReportTemplateType>({
      mutationFn: (data: CreateReportTemplateType) => {
        const templateData = mapCreateReportTemplateData(data)

        return axiosInstance
          .post<ReportTemplateType>('/api/reports/templates/', templateData)
          .then((response: AxiosResponse<ReportTemplateType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['reportTemplates'] })
        toast.success('Report template created successfully')
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

  const useUpdateReportTemplate = () => {
    const mutation = useMutation<ReportTemplateType, AxiosError<ErrorResponse>, UpdateReportTemplateType>({
      mutationFn: (data: UpdateReportTemplateType) => {
        const { id, ...updateData } = data
        const templateData = mapUpdateReportTemplateData(updateData)

        return axiosInstance
          .patch<ReportTemplateType>(`/api/reports/templates/${id}/`, templateData)
          .then((response: AxiosResponse<ReportTemplateType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['reportTemplates'] })
        toast.success('Report template updated successfully')
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

  // Report Generation Hooks
  const useGenerateReport = () => {
    const mutation = useMutation<ReportGenerationType, AxiosError<ErrorResponse>, GenerateReportType>({
      mutationFn: (data: GenerateReportType) => {
        const generationData = mapGenerateReportData(data)

        return axiosInstance
          .post<ReportGenerationType>(`/api/reports/templates/${data.template_id}/generate/`, generationData)
          .then((response: AxiosResponse<ReportGenerationType>) => response.data)
      },
      onSuccess: () => {
        toast.success('Report generation started successfully')
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

  // Report Schedule Hooks
  const useReportSchedules = (templateId?: number) => {
    return useQuery<ListResponse<ReportScheduleType>>({
      queryKey: ['reportSchedules', templateId],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<ReportScheduleType>>('/api/reports/schedules/', {
            params: { template_id: templateId }
          })
          .then((response: AxiosResponse<ListResponse<ReportScheduleType>>) => response.data)
    })
  }

  const useCreateReportSchedule = () => {
    const mutation = useMutation<ReportScheduleType, AxiosError<ErrorResponse>, CreateReportScheduleType>({
      mutationFn: (data: CreateReportScheduleType) => {
        const scheduleData = mapCreateReportScheduleData(data)

        return axiosInstance
          .post<ReportScheduleType>('/api/reports/schedules/', scheduleData)
          .then((response: AxiosResponse<ReportScheduleType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['reportSchedules'] })
        toast.success('Report schedule created successfully')
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

  const useUpdateReportSchedule = () => {
    const mutation = useMutation<ReportScheduleType, AxiosError<ErrorResponse>, UpdateReportScheduleType>({
      mutationFn: (data: UpdateReportScheduleType) => {
        const { id, ...updateData } = data
        const scheduleData = mapUpdateReportScheduleData(updateData)

        return axiosInstance
          .patch<ReportScheduleType>(`/api/reports/schedules/${id}/`, scheduleData)
          .then((response: AxiosResponse<ReportScheduleType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['reportSchedules'] })
        toast.success('Report schedule updated successfully')
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
    // Report Template hooks
    useReportTemplates,
    useReportTemplate,
    useCreateReportTemplate,
    useUpdateReportTemplate,

    // Report Generation hooks
    useGenerateReport,

    // Report Schedule hooks
    useReportSchedules,
    useCreateReportSchedule,
    useUpdateReportSchedule
  }
}
