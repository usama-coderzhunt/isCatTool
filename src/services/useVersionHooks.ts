// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type {
  VersionType,
  CreateVersionType,
  CompareVersionsType,
  VersionHistoryType,
  VersionBranchType
} from '@/types/versionTypes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

interface ListResponse<T> {
  results: T[]
}

export const useVersionHooks = () => {
  const queryClient = useQueryClient()

  // Version List Hook
  const useVersions = (entityType?: string, entityId?: number) => {
    return useQuery<ListResponse<VersionType>>({
      queryKey: ['versions', entityType, entityId],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<VersionType>>(API_ROUTES.VERSION.LIST, {
            params: { entity_type: entityType, entity_id: entityId }
          })
          .then((response: AxiosResponse<ListResponse<VersionType>>) => response.data)
    })
  }

  // Version History Hook
  const useVersionHistory = (entityType: string, entityId: number) => {
    return useQuery<VersionHistoryType>({
      queryKey: ['versionHistory', entityType, entityId],
      queryFn: () =>
        axiosInstance
          .get<VersionHistoryType>(API_ROUTES.VERSION.HISTORY(entityType, entityId))
          .then((response: AxiosResponse<VersionHistoryType>) => response.data),
      enabled: !!entityType && !!entityId
    })
  }

  // Create Version Hook
  const useCreateVersion = () => {
    const mutation = useMutation<VersionType, AxiosError<ErrorResponse>, CreateVersionType>({
      mutationFn: (data: CreateVersionType) =>
        axiosInstance
          .post<VersionType>(API_ROUTES.VERSION.LIST, data)
          .then((response: AxiosResponse<VersionType>) => response.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['versions'] })
        toast.success('Version created successfully')
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

  // Compare Versions Hook
  const useCompareVersions = (params: CompareVersionsType) => {
    return useQuery<Record<string, any>>({
      queryKey: ['versionCompare', params],
      queryFn: () =>
        axiosInstance
          .get(API_ROUTES.VERSION.COMPARE, { params })
          .then((response: AxiosResponse<Record<string, any>>) => response.data),
      enabled: !!params.version1_id && !!params.version2_id
    })
  }

  // Rollback Version Hook
  const useRollbackVersion = () => {
    const mutation = useMutation<VersionType, AxiosError<ErrorResponse>, number>({
      mutationFn: (versionId: number) =>
        axiosInstance
          .post<VersionType>(API_ROUTES.VERSION.ROLLBACK(versionId))
          .then((response: AxiosResponse<VersionType>) => response.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['versions'] })
        toast.success('Version rollback successful')
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

  // Create Version Branch Hook
  const useCreateVersionBranch = () => {
    const mutation = useMutation<VersionBranchType, AxiosError<ErrorResponse>, { id: number; name: string }>({
      mutationFn: ({ id, name }) =>
        axiosInstance
          .post<VersionBranchType>(API_ROUTES.VERSION.BRANCH(id), { name })
          .then((response: AxiosResponse<VersionBranchType>) => response.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['versions'] })
        toast.success('Version branch created successfully')
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
    useVersions,
    useVersionHistory,
    useCreateVersion,
    useCompareVersions,
    useRollbackVersion,
    useCreateVersionBranch
  }
}
