// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type {
  UserType,
  CreateUserType,
  GroupType,
  CreateGroupType,
  PermissionType,
  UserGroupAssignmentType,
  UserPermissionAssignmentType,
  GroupPermissionAssignmentType,
  UserListResponse,
  AssignablePermissionType,
  ContentTypeResponse
} from '@/types/userTypes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import {
  mapCreateUserData,
  mapCreateGroupData,
  mapUserGroupAssignmentData,
  mapUserPermissionAssignmentData,
  mapGroupPermissionAssignmentData
} from './utility/user'
import { API_ROUTES } from '@/utils/constants/apiRoutes'
import { mapAssignablePermissionsResponse, mapContentTypesResponse } from './utility/permissions'
import { useAuthStore } from '@/store/useAuthStore'
import { hasPermissions } from '@/utils/permissionUtils'
import { cleanApiParams } from '@/utils/utility/paramsUtils'
interface ListResponse<T> {
  count: number
  results: T[]
  next: string | null
  previous: string | null
  total_pages: number
  current_page: number
}

interface ContentType {
  id: number
  app_label: string
  model: string
}

interface Permission {
  id: number
  name: string
  codename: string
  content_type: ContentType
}

interface AssignablePermissionsResponse {
  [key: string]: Permission[]
}

interface UpdateGroupUsersInput {
  users: number[]
}

export const useUserManagementHooks = () => {
  const queryClient = useQueryClient()

  // User Hooks

  const useUsers = (pageSize: number, page: number, search?: string, ordering?: string) => {
    return useQuery({
      queryKey: ['users', page, pageSize, search, ordering],
      queryFn: () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          search,
          ordering
        })
        return axiosInstance.get(API_ROUTES.USER_MANAGEMENT.getUsers, {
          params,
          requiresAuth: true,
          requiredPermission: 'view_staff'
        } as any)
      }
    })
  }

  const useUser = (id: number) => {
    return useQuery({
      queryKey: ['users', id],
      queryFn: async () => {
        const response = await axiosInstance.get<UserType>(`/api/users/${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_staff'
        } as any)
        return response.data
      },
      enabled: !!id
    })
  }

  const useCreateUser = () => {
    const mutation = useMutation<UserType, AxiosError<ErrorResponse>, CreateUserType>({
      mutationFn: data => {
        const userData = mapCreateUserData(data)

        return axiosInstance
          .post<UserType>('/api/users/', userData, {
            requiresAuth: true,
            requiredPermission: 'add_staff'
          } as any)
          .then((response: AxiosResponse<UserType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] })
        toast.success('User created successfully')
      },
      onError: error => {
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

  const useUserInfo = (id: number) => {
    return useQuery<UserType>({
      queryKey: ['users', id],
      queryFn: () =>
        axiosInstance.get<UserType>(`/api/users/${id}/`).then((response: AxiosResponse<UserType>) => response.data),
      enabled: !!id
    })
  }

  const useDeleteUser = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.USER_MANAGEMENT.deleteUser}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_staff'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['users'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete case')
      }
    })
  }

  const useBulkDeleteUsers = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.USER_MANAGEMENT.bulkDeleteUsers}`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'delete_staff'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['users'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete users')
      }
    })
  }

  // Group Hooks
  const useGroups = (pageSize: number, page: number, ordering?: string, search?: string) => {
    return useQuery<ListResponse<GroupType>>({
      queryKey: ['groups', page, pageSize, ordering, search],
      queryFn: async () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          ordering,
          search
        })
        const response = await axiosInstance.get<ListResponse<GroupType>>(API_ROUTES.GROUPS.LIST, {
          params,
          requiresAuth: true,
          requiredPermission: 'view_group'
        } as any)
        return response.data
      },
      keepPreviousData: true
    } as any)
  }

  const useGroupsTM = (pageSize: number, page: number, ordering?: string, search?: string) => {
    return useQuery({
      queryKey: ['groups', page, pageSize, ordering, search],
      queryFn: () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          ordering,
          search
        })
        return axiosInstance.get(API_ROUTES.GROUPS.LIST, {
          params,
          requiresAuth: true,
          requiredPermission: 'view_group'
        } as any)
      }
    })
  }

  const deleteGroup = (id: number | null) => {
    return useMutation({
      mutationFn: () =>
        axiosInstance.delete(API_ROUTES.GROUPS.DETAIL(id), {
          requiresAuth: true,
          requiredPermission: 'delete_group'
        } as any),
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['groups'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.'
        toast.error(errorMessage)
      }
    })
  }

  const useBulkDeleteGroups = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.GROUPS.LIST}bulk_delete/`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'delete_group'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['groups'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete users')
      }
    })
  }

  const useGroup = (id: number) => {
    return useQuery<GroupType>({
      queryKey: ['groups', id],
      queryFn: () =>
        axiosInstance
          .get<GroupType>(API_ROUTES.GROUPS.DETAIL(id), {
            requiresAuth: true,
            requiredPermission: 'view_group'
          } as any)
          .then((response: AxiosResponse<GroupType>) => response.data),
      enabled: !!id
    })
  }

  const useCreateGroup = () => {
    const mutation = useMutation<GroupType, AxiosError<ErrorResponse>, CreateGroupType>({
      mutationFn: data => {
        const groupData = mapCreateGroupData(data)

        return axiosInstance
          .post<GroupType>(API_ROUTES.GROUPS.LIST, groupData, {
            requiresAuth: true,
            requiredPermission: 'add_group'
          } as any)
          .then((response: AxiosResponse<GroupType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['groups'] })
        toast.success('Group created successfully')
      },
      onError: error => {
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

  const useUpdateGroup = () => {
    const mutation = useMutation<GroupType, AxiosError<ErrorResponse>, { id: number; data: Partial<GroupType> }>({
      mutationFn: ({ id, data }) => {
        return axiosInstance
          .patch<GroupType>(API_ROUTES.GROUPS.DETAIL(id), data, {
            requiresAuth: true,
            requiredPermission: 'change_group'
          } as any)
          .then((response: AxiosResponse<GroupType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['groups'] })
        toast.success('Group updated successfully')
      },
      onError: error => {
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

  const useGroupUsers = (groupId: number) => {
    return useQuery<UserType[]>({
      queryKey: ['groups', groupId, 'users'],
      queryFn: () =>
        axiosInstance
          .get<UserType[]>(API_ROUTES.GROUPS.USERS(groupId), {
            requiresAuth: true,
            requiredPermission: 'view_group'
          } as any)
          .then((response: AxiosResponse<UserType[]>) => response.data),
      enabled: !!groupId
    })
  }

  const useUpdateGroupUsers = (groupId: number) => {
    const userPermissions = useAuthStore(state => state.userPermissions)
    const requiredPermission = 'change_group'

    if (!hasPermissions(userPermissions, [requiredPermission])) {
      toast.error('You do not have permission to update groups.')
      return { data: null, error: new Error('Permission denied'), isLoading: false }
    }
    const mutation = useMutation<GroupType, AxiosError<ErrorResponse>, UpdateGroupUsersInput>({
      mutationFn: data => {
        return axiosInstance
          .put<GroupType>(`/api/groups/${groupId}/group_users/`, data)
          .then((response: AxiosResponse<GroupType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['groupUsers'] }) // ✅ Fix: Invalidate only this group's users
        toast.success('Group users updated successfully')
      },
      onError: error => {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.'
        toast.error(errorMessage)
      }
    })

    return {
      data: mutation.data,
      error: mutation.error,
      isLoading: mutation.isPending,
      mutate: mutation.mutate
    }
  }

  // Permission Hooks

  const useUserPermissions = (userId: number) => {
    return useQuery<PermissionType[]>({
      queryKey: ['users', userId, 'permissions'],
      queryFn: () =>
        axiosInstance
          .get<PermissionType[]>(API_ROUTES.USER_PERMISSIONS.USER_PERMISSIONS(userId), {
            requiresAuth: true,
            requiredPermission: 'view_staff'
          } as any)
          .then((response: AxiosResponse<PermissionType[]>) => response.data),
      enabled: !!userId
    })
  }

  const useGroupPermissions = (groupId: number) => {
    return useQuery<PermissionType[]>({
      queryKey: ['groups', groupId, 'permissions'],
      queryFn: () =>
        axiosInstance
          .get<PermissionType[]>(API_ROUTES.GROUPS.GROUP_PERMISSIONS(groupId), {
            requiresAuth: true,
            requiredPermission: 'view_group'
          } as any)
          .then((response: AxiosResponse<PermissionType[]>) => response.data),
      enabled: !!groupId
    })
  }

  const usePermissions = () => {
    const [allPermissions, setAllPermissions] = useState<PermissionType[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchAllPermissions = async () => {
      try {
        let currentPage = 1
        let hasMore = true
        const permissions: PermissionType[] = []

        while (hasMore) {
          const response = await axiosInstance.get<ListResponse<PermissionType>>('/api/permissions/', {
            params: {
              page: currentPage,
              page_size: 100
            },
            requiresAuth: true,
            requiredPermission: 'view_permission'
          } as any)

          permissions.push(...response.data.results)

          if (!response.data.next) {
            hasMore = false
          } else {
            currentPage++
          }
        }

        setAllPermissions(permissions)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching permissions:', error)
        setIsLoading(false)
      }
    }

    useEffect(() => {
      fetchAllPermissions()
    }, [])

    return { data: allPermissions, isLoading }
  }

  // Assignment Hooks

  const useAssignUserGroups = () => {
    const mutation = useMutation<void, AxiosError<ErrorResponse>, UserGroupAssignmentType>({
      mutationFn: data => {
        const assignmentData = mapUserGroupAssignmentData(data)

        return axiosInstance
          .put(`/api/users/${data.user_id}/user_groups/`, assignmentData, {
            requiresAuth: true,
            requiredPermission: 'change_staff'
          } as any)
          .then((response: AxiosResponse<void>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] })
        toast.success('User groups updated successfully')
      },
      onError: error => {
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

  const useAssignUserPermissions = () => {
    const mutation = useMutation<void, AxiosError<ErrorResponse>, UserPermissionAssignmentType>({
      mutationFn: data => {
        const assignmentData = mapUserPermissionAssignmentData(data)

        return axiosInstance
          .put(`/api/users/${data.user_id}/user_permissions/`, assignmentData, {
            requiresAuth: true,
            requiredPermission: 'change_staff'
          } as any)
          .then((response: AxiosResponse<void>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] })
        toast.success('User permissions updated successfully')
      },
      onError: error => {
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

  const useAssignGroupPermissions = () => {
    const mutation = useMutation<void, AxiosError<ErrorResponse>, GroupPermissionAssignmentType>({
      mutationFn: data => {
        const assignmentData = mapGroupPermissionAssignmentData(data)

        return axiosInstance
          .put(API_ROUTES.GROUPS.GROUP_PERMISSIONS(data.group_id), assignmentData, {
            requiresAuth: true,
            requiredPermission: 'change_group'
          } as any)
          .then((response: AxiosResponse<void>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['groups'] })
        toast.success('Group permissions updated successfully')
      },
      onError: error => {
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

  const useAllAssignablePermissions = () => {
    return useQuery({
      queryKey: ['assignable-permissions'],
      queryFn: async (): Promise<AssignablePermissionsResponse> => {
        const { data } = await axiosInstance.get('/api/permissions/assignable_permissions/', {
          requiresAuth: true,
          requiredPermission: 'view_permission'
        } as any)
        return data
      }
    })
  }

  const useAssignablePermissions = (appLabel?: string, model?: string) => {
    return useQuery<AssignablePermissionType[]>({
      queryKey: ['assignable-permissions', appLabel, model],
      queryFn: () => {
        const params = new URLSearchParams()

        if (appLabel) params.append('app_label', appLabel)
        if (model) params.append('model', model)

        return axiosInstance
          .get<AssignablePermissionType[]>(`${API_ROUTES.USER_PERMISSIONS.ASSIGNABLE}?${params.toString()}`, {
            requiresAuth: true,
            requiredPermission: 'view_permission'
          } as any)
          .then((response: AxiosResponse<AssignablePermissionType[]>) =>
            mapAssignablePermissionsResponse(response.data)
          )
      }
    })
  }

  // Additional Permission Hooks

  const useContentTypes = () => {
    return useQuery<ContentTypeResponse[]>({
      queryKey: ['permissions/available_content_types'],
      queryFn: () =>
        axiosInstance
          .get<ContentTypeResponse[]>(API_ROUTES.USER_PERMISSIONS.CONTENT_TYPES)
          .then((response: AxiosResponse<ContentTypeResponse[]>) => mapContentTypesResponse(response.data))
    })
  }

  return {
    // User hooks
    useUsers,
    useUser,
    useUserInfo,
    useCreateUser,
    useDeleteUser,
    useBulkDeleteUsers,

    // Group hooks
    useGroups,
    useGroupsTM,
    deleteGroup,
    useGroup,
    useCreateGroup,
    useUpdateGroup,
    useGroupUsers,
    useGroupPermissions,
    useUpdateGroupUsers,
    useBulkDeleteGroups,

    // Permission hooks
    usePermissions,

    // Assignment hooks
    useAssignUserGroups,
    useAssignUserPermissions,
    useAllAssignablePermissions,
    useAssignGroupPermissions,

    // Additional permission hooks
    useAssignablePermissions,
    useContentTypes,
    useUserPermissions
  }
}
