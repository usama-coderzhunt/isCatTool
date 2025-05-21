// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type {
  ExportJobType,
  CreateExportJobType,
  ImportJobType,
  CreateImportJobType,
  ImportTemplateType,
  CreateImportTemplateType,
  UpdateImportTemplateType
} from '@/types/exportTypes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import {
  mapCreateExportJobData,
  mapCreateImportJobData,
  mapCreateImportTemplateData,
  mapUpdateImportTemplateData
} from './utility/export'

interface ListResponse<T> {
  results: T[]
}

export const useExportHooks = () => {
  const queryClient = useQueryClient()

  // Export Job Hooks
  const useExportJobs = () => {
    return useQuery<ListResponse<ExportJobType>>({
      queryKey: ['exportJobs'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<ExportJobType>>('/api/exports/')
          .then((response: AxiosResponse<ListResponse<ExportJobType>>) => response.data)
    })
  }

  const useCreateExportJob = () => {
    const mutation = useMutation<ExportJobType, AxiosError<ErrorResponse>, CreateExportJobType>({
      mutationFn: (data: CreateExportJobType) => {
        const exportData = mapCreateExportJobData(data)

        return axiosInstance
          .post<ExportJobType>('/api/exports/', exportData)
          .then((response: AxiosResponse<ExportJobType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['exportJobs'] })
        toast.success('Export job created successfully')
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

  // Import Job Hooks
  const useImportJobs = () => {
    return useQuery<ListResponse<ImportJobType>>({
      queryKey: ['importJobs'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<ImportJobType>>('/api/imports/')
          .then((response: AxiosResponse<ListResponse<ImportJobType>>) => response.data)
    })
  }

  const useCreateImportJob = () => {
    const mutation = useMutation<ImportJobType, AxiosError<ErrorResponse>, CreateImportJobType>({
      mutationFn: (data: CreateImportJobType) => {
        const importData = mapCreateImportJobData(data)

        return axiosInstance
          .post<ImportJobType>('/api/imports/', importData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          .then((response: AxiosResponse<ImportJobType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['importJobs'] })
        toast.success('Import job created successfully')
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

  // Import Template Hooks
  const useImportTemplates = (type?: string) => {
    return useQuery<ListResponse<ImportTemplateType>>({
      queryKey: ['importTemplates', type],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<ImportTemplateType>>('/api/imports/templates/', {
            params: { type }
          })
          .then((response: AxiosResponse<ListResponse<ImportTemplateType>>) => response.data)
    })
  }

  const useCreateImportTemplate = () => {
    const mutation = useMutation<ImportTemplateType, AxiosError<ErrorResponse>, CreateImportTemplateType>({
      mutationFn: (data: CreateImportTemplateType) => {
        const templateData = mapCreateImportTemplateData(data)

        return axiosInstance
          .post<ImportTemplateType>('/api/imports/templates/', templateData)
          .then((response: AxiosResponse<ImportTemplateType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['importTemplates'] })
        toast.success('Import template created successfully')
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

  const useUpdateImportTemplate = () => {
    const mutation = useMutation<ImportTemplateType, AxiosError<ErrorResponse>, UpdateImportTemplateType>({
      mutationFn: (data: UpdateImportTemplateType) => {
        const { id, ...updateData } = data
        const templateData = mapUpdateImportTemplateData(updateData)

        return axiosInstance
          .patch<ImportTemplateType>(`/api/imports/templates/${id}/`, templateData)
          .then((response: AxiosResponse<ImportTemplateType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['importTemplates'] })
        toast.success('Import template updated successfully')
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
    // Export Job hooks
    useExportJobs,
    useCreateExportJob,

    // Import Job hooks
    useImportJobs,
    useCreateImportJob,

    // Import Template hooks
    useImportTemplates,
    useCreateImportTemplate,
    useUpdateImportTemplate
  }
}
