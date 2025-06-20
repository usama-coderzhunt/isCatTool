// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type {
  PermissionType,
  CreatePermissionType,
  RoleType,
  CreateRoleType,
  UpdateRoleType,
  PermissionAssignmentType,
  PermissionInheritanceType
} from '@/types/permissionTypes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

interface ListResponse<T> {
  results: T[]
}

export const usePermissionHooks = () => {
  const queryClient = useQueryClient()

  // Permission Hooks
  const usePermissions = () => {
    return useQuery<ListResponse<PermissionType>>({
      queryKey: ['permissions'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<PermissionType>>(API_ROUTES.PERMISSION.LIST)
          .then((response: AxiosResponse<ListResponse<PermissionType>>) => response.data)
    })
  }

  const useCreatePermission = () => {
    const mutation = useMutation<PermissionType, AxiosError<ErrorResponse>, CreatePermissionType>({
      mutationFn: (data: CreatePermissionType) =>
        axiosInstance
          .post<PermissionType>(API_ROUTES.PERMISSION.LIST, data)
          .then((response: AxiosResponse<PermissionType>) => response.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['permissions'] })
        toast.success('Permission created successfully')
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

  // Role Hooks
  const useRoles = () => {
    return useQuery<ListResponse<RoleType>>({
      queryKey: ['roles'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<RoleType>>(API_ROUTES.PERMISSION.ROLES)
          .then((response: AxiosResponse<ListResponse<RoleType>>) => response.data)
    })
  }

  const useCreateRole = () => {
    const mutation = useMutation<RoleType, AxiosError<ErrorResponse>, CreateRoleType>({
      mutationFn: (data: CreateRoleType) =>
        axiosInstance
          .post<RoleType>(API_ROUTES.PERMISSION.ROLES, data)
          .then((response: AxiosResponse<RoleType>) => response.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['roles'] })
        toast.success('Role created successfully')
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

  const useUpdateRole = () => {
    const mutation = useMutation<RoleType, AxiosError<ErrorResponse>, UpdateRoleType>({
      mutationFn: (data: UpdateRoleType) => {
        const { id, ...updateData } = data

        return axiosInstance
          .patch<RoleType>(API_ROUTES.PERMISSION.ROLE_DETAIL(id), updateData)
          .then((response: AxiosResponse<RoleType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['roles'] })
        toast.success('Role updated successfully')
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

  // Permission Assignment Hooks
  const useAssignPermissions = () => {
    const mutation = useMutation<void, AxiosError<ErrorResponse>, PermissionAssignmentType>({
      mutationFn: (data: PermissionAssignmentType) =>
        axiosInstance
          .post<void>(API_ROUTES.PERMISSION.ASSIGN, data)
          .then((response: AxiosResponse<void>) => response.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['permissions'] })
        toast.success('Permissions assigned successfully')
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

  // Permission Inheritance Hooks
  const useInheritPermissions = () => {
    const mutation = useMutation<void, AxiosError<ErrorResponse>, PermissionInheritanceType>({
      mutationFn: (data: PermissionInheritanceType) =>
        axiosInstance
          .post<void>(API_ROUTES.PERMISSION.INHERIT, data)
          .then((response: AxiosResponse<void>) => response.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['permissions'] })
        toast.success('Permissions inherited successfully')
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
    usePermissions,
    useCreatePermission,
    useRoles,
    useCreateRole,
    useUpdateRole,
    useAssignPermissions,
    useInheritPermissions
  }
}
