// React Imports
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

// Axios Import
import type { AxiosError } from 'axios'
import axiosInstance from '@/utils/api/axiosInstance'

// Types
import type { UserPermissions, Permission, AssignablePermission } from '@/types/apps/permissionTypes'
import type { ErrorResponse } from '@/types/type'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

export const usePermissionsHook = () => {
  const queryClient = useQueryClient()

  // Fetch user permissions
  const useFetchUserPermissions = (userId: number) => {
    return useQuery<UserPermissions>({
      queryKey: ['userPermissions', userId],
      queryFn: async () => {
        const response = await axiosInstance.get(`/api/users/${userId}/user_permissions/`, {
          requiresAuth: true,
          requiredPermission: 'view_staff'
        } as any)
        return response.data
      },
      enabled: !!userId
    })
  }

  // Update user permissions
  const useUpdateUserPermissions = () => {
    return useMutation({
      mutationFn: async ({ userId, permissions }: { userId: number; permissions: Permission[] }) => {
        return await axiosInstance.put(
          `/api/users/${userId}/user_permissions/`,
          { permissions },
          { requiresAuth: true, requiredPermission: 'change_staff' } as any
        )
      },
      onSuccess: (_, variables) => {
        toast.success('Permissions updated successfully!')
        queryClient.invalidateQueries({ queryKey: ['userPermissions', variables.userId] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to update permissions')
      }
    })
  }

  // Fetch all permissions
  const useFetchAllPermissions = () => {
    return useQuery<Permission[]>({
      queryKey: ['permissions'],
      queryFn: async () => {
        const response = await axiosInstance.get('/api/permissions/', {
          requiresAuth: true,
          requiredPermission: 'view_staff'
        } as any)
        return response.data
      }
    })
  }

  // Fetch assignable permissions
  const useFetchAssignablePermissions = (appLabel?: string, model?: string) => {
    return useQuery<AssignablePermission[]>({
      queryKey: ['assignablePermissions', appLabel, model],
      queryFn: async () => {
        const response = await axiosInstance.get('/api/permissions/assignable_permissions/', {
          params: {
            app_label: appLabel,
            model: model
          },
          requiresAuth: true,
          requiredPermission: 'view_staff'
        } as any)
        return response.data
      }
    })
  }

  const useAllAssignablePermissions = (ordering?: string,search?: string) => {
    return useQuery<Record<string, Permission[]>>({
      queryKey: ['assignable-permissions', ordering, search],
      queryFn: async () => {
        const { data } = await axiosInstance.get('/api/permissions/assignable_permissions/', {
          params: { ordering, search },
          requiresAuth: true,
          requiredPermission: 'view_staff'
        } as any)
        return data
      }
    })
  }

  const useUserPermissions = (userId: number) => {
    return useQuery({
      queryKey: ['user-permissions', userId],
      queryFn: async () => {
        const { data } = await axiosInstance.get(`/api/users/${userId}/user_permissions/`, {
          requiresAuth: true,
          requiredPermission: 'view_staff'
        } as any)
        return data as Permission[]
      },
      enabled: !!userId
    })
  }


  //Entity_Management Hooks

  const useBusinessUnit = () => {
    return useQuery({
      queryKey: ['business-unit'],
      queryFn: async () => {
        const { data } = await axiosInstance.get(API_ROUTES.BUSINESS_UNIT.LIST, {
          requiresAuth: true,
          requiredPermission: 'view_businessunit'
        } as any)
        return data
      },
    })
  }

  const useCreateBusinessUnit = () => {
    const mutation = useMutation({
      mutationFn: ({ name }: { name: string }) => {
        return axiosInstance.post(
          API_ROUTES.BUSINESS_UNIT.LIST,
          { name },
          { requiresAuth: true, requiredPermission: 'add_businessunit' } as any
        )
      },
      onSuccess: () => {
        toast.success('Business Unit created successfully!')
        queryClient.invalidateQueries({ queryKey: ['business-unit'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to create business unit')
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

  const useUpdateBusinessUnit = () => {
    const mutation = useMutation({
      mutationFn: ({ id }: { id: number }) => {
        return axiosInstance.put(
          `${API_ROUTES.BUSINESS_UNIT.LIST}${id}/`,
          { requiresAuth: true, requiredPermission: 'change_businessunit' } as any
        )
      },
      onSuccess: () => {
        toast.success('Business Unit updated successfully!')
        queryClient.invalidateQueries({ queryKey: ['business-unit'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to update business unit')
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

  const useExtendGroups = () => {
    return useQuery({
      queryKey: ['extend-groups'],
      queryFn: async () => {
        const { data } = await axiosInstance.get(API_ROUTES.BUSINESS_UNIT.EXTENDED_GROUPS, {
          requiresAuth: true,
          requiredPermission: 'view_businessunit'
        } as any)
        return data
      },
    })
  }

  const useCreateExtendGroups = () => {
    const mutation = useMutation({
      mutationFn: ({ group, business_unit }: { group: number, business_unit: number }) => {
        return axiosInstance.post(
          API_ROUTES.BUSINESS_UNIT.EXTENDED_GROUPS,
          { group, business_unit },
          { requiresAuth: true, requiredPermission: 'add_businessunit' } as any
        )
      },
      onSuccess: () => {
        toast.success('Extend Group created successfully!')
        queryClient.invalidateQueries({ queryKey: ['extend-groups'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to create extend group')
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
    useFetchUserPermissions,
    useUpdateUserPermissions,
    useFetchAllPermissions,
    useFetchAssignablePermissions,
    useAllAssignablePermissions,
    useUserPermissions,

    //Entity_Management Hooks
    useBusinessUnit,
    useCreateBusinessUnit,
    useUpdateBusinessUnit,
    useExtendGroups,
    useCreateExtendGroups,
  }
} 
