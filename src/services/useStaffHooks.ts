// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types Import
import type { AxiosError } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type {
  StaffPosition,
  CreateStaffPositionInput,
  Staff,
  CreateStaffInput,
  UpdateStaffInput,
  CreateStaff
} from '@/types/staffTypes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import { mapCreateStaffPositionData, mapCreateStaffData, mapUpdateStaffData, mapCreateStaff } from './utility/staff'
import { cleanApiParams } from '@/utils/utility/paramsUtils'

interface ListResponse<T> {
  count: number
  next: string | null
  previous: string | null
  total_pages: number
  current_page: number
  results: T[]
}

export const useStaffHooks = () => {
  const queryClient = useQueryClient()

  // Staff Position Hooks
  const useStaffPositions = (pageSize?: number, page?: number, ordering?: string, search?: string) => {
    return useQuery({
      queryKey: ['staffPositions', page, pageSize, ordering, search],
      queryFn: () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          ordering,
          search
        })
        return axiosInstance
          .get('/api/staff-positions/', {
            params,
            requiresAuth: true,
            requiredPermission: 'view_staffposition'
          } as any)
          .then(response => response.data)
      },
      staleTime: 5 * 60 * 1000 // Cache for 5 minutes
    })
  }

  const useCreateStaffPosition = () => {
    const mutation = useMutation<StaffPosition, AxiosError<ErrorResponse>, CreateStaffPositionInput>({
      mutationFn: data => {
        const positionData = mapCreateStaffPositionData(data)

        return axiosInstance
          .post('/api/staff-positions/', positionData, {
            requiresAuth: true,
            requiredPermission: 'add_staffposition'
          } as any)
          .then(response => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['staffPositions'] })
      },
      onError: error => {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.'

        toast.error(errorMessage)
      }
    })

    return mutation
  }

  const useDeleteStaffPosition = () => {
    return useMutation<void, AxiosError<ErrorResponse>, number>({
      mutationFn: id =>
        axiosInstance
          .delete(`/api/staff-positions/${id}/`, {
            requiresAuth: true,
            requiredPermission: 'delete_staffposition'
          } as any)
          .then(response => response.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['staffPositions'] })
      },
      onError: error => {
        const errorMessage = error.response?.data?.message || 'Failed to delete position'
        toast.error(errorMessage)
      }
    })
  }

  const useDeleteStaffPositionBulk = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance
          .delete(`/api/staff-positions/bulk_delete/`, {
            data: { ids },
            requiresAuth: true,
            requiredPermission: 'delete_staffposition'
          } as any)

          .then(response => response.data)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['staffPositions'] })
        }, 500)
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || 'Failed to delete positions'
        toast.error(errorMessage)
      }
    })
  }

  // Staff Hooks
  // const useStaffMembers = (pageSize?: number, page?: number, search?: string, ordering?: string) => {
  //   return useQuery({
  //     queryKey: ['staff', page, pageSize, search, ordering],
  //     queryFn: () =>
  //       axiosInstance.get('/api/staff/', {
  //         params: {
  //           page: page,
  //           page_size: pageSize,
  //           search: search,
  //           ordering
  //         },
  //         requiresAuth: true,
  //         requiredPermission: 'view_staff'
  //       } as any)
  //         .then(response => response.data)
  //         .catch(error => {
  //           const errorMessage = error.response?.data?.message || 'Failed to fetch staff members'
  //           toast.error(errorMessage)
  //           throw error
  //         })
  //   })
  // }

  const useStaffMembers = (pageSize?: number, page?: number, search?: string, ordering?: string) => {
    return useQuery({
      queryKey: ['staff', page, pageSize, search, ordering],
      queryFn: () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          search,
          ordering
        })
        return axiosInstance.get('/api/staff/', {
          params,
          requiresAuth: true,
          requiredPermission: 'view_staff'
        } as any)
      }
    })
  }

  const useStaffMember = (id: number) => {
    return useQuery<Staff>({
      queryKey: ['staff', id],
      queryFn: () =>
        axiosInstance
          .get(`/api/staff/${id}/`, {
            requiresAuth: true,
            requiredPermission: 'view_staff'
          } as any)
          .then(response => response.data)
          .catch(error => {
            const errorMessage = error.response?.data?.message || 'Failed to fetch staff member'
            toast.error(errorMessage)
            throw error
          }),
      enabled: !!id
    })
  }

  const useCreateStaffMember = () => {
    const mutation = useMutation<Staff, AxiosError<ErrorResponse>, CreateStaffInput>({
      mutationFn: data => {
        const staffData = mapCreateStaffData(data)
        return axiosInstance
          .post('/api/create-staff-and-register/', staffData, {
            requiresAuth: true,
            requiredPermission: 'add_staff'
          } as any)
          .then(response => response.data)
          .catch(error => {
            const errorMessage = error.response?.data?.message || 'Failed to create staff member'
            toast.error(errorMessage)
            throw error
          })
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['staff'] })
        toast.success('Staff member created successfully')
      }
    })
    return mutation
  }

  const useCreateStaff = () => {
    const mutation = useMutation<CreateStaff, AxiosError<ErrorResponse>, CreateStaff>({
      mutationFn: data => {
        const createStaffData = mapCreateStaff(data)

        return axiosInstance
          .post('/api/staff/', createStaffData, {
            requiresAuth: true,
            requiredPermission: 'add_staff'
          } as any)
          .then(response => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['staffPositions'] })
      },
      onError: error => {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.'

        toast.error(errorMessage)
      }
    })

    return mutation
  }

  const useUpdateStaffMember = () => {
    const mutation = useMutation<Staff, AxiosError<ErrorResponse>, UpdateStaffInput>({
      mutationFn: data => {
        const { id, ...updateData } = data
        const staffData = mapUpdateStaffData(updateData as UpdateStaffInput)
        return axiosInstance
          .patch(`/api/staff/${id}/`, staffData, {
            requiresAuth: true,
            requiredPermission: 'change_staff'
          } as any)
          .then(response => response.data)
          .catch(error => {
            const errorMessage = error.response?.data?.message || 'Failed to update staff member'
            toast.error(errorMessage)
            throw error
          })
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['staff'] })
        toast.success('Staff member updated successfully')
      }
    })
    return mutation
  }

  const useDeleteStaffMember = () => {
    const mutation = useMutation<{ message: string }, AxiosError<ErrorResponse>, number>({
      mutationFn: async id => {
        try {
          const response = await axiosInstance.delete(`/api/staff/${id}/`, {
            requiresAuth: true,
            requiredPermission: 'delete_staff'
          } as any)
          return response.data
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to delete staff member'
          toast.error(errorMessage)
          throw error
        }
      },
      onSuccess: data => {
        toast.success(data.message || 'Staff member deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['staff'] })
      }
    })
    return mutation
  }

  const useDeleteStaffMemberBulk = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        try {
          const response = await axiosInstance.delete(`/api/staff/bulk_delete/`, {
            data: { ids },
            requiresAuth: true,
            requiredPermission: 'delete_staff'
          } as any)
          return response.data
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to delete staff members'
          toast.error(errorMessage)
          throw error
        }
      },
      onSuccess: data => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['staff'] })
        }, 500)
      }
    })
  }

  const useUpdateStaffPosition = () => {
    return useMutation<StaffPosition, AxiosError<ErrorResponse>, { id: number; name: string }>({
      mutationFn: async ({ id, name }) => {
        try {
          const response = await axiosInstance.patch(`/api/staff-positions/${id}/`, { name }, {
            requiresAuth: true,
            requiredPermission: 'change_staffposition'
          } as any)
          return response.data
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to update position'
          toast.error(errorMessage)
          throw error
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['staffPositions'] })
      }
    })
  }

  const useUpdateStaffStatus = () => {
    return useMutation({
      mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
        try {
          const response = await axiosInstance.patch(`/api/staff/${id}/`, { is_active }, {
            requiresAuth: true,
            requiredPermission: 'change_staff'
          } as any)
          return response.data
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to update staff status'
          toast.error(errorMessage)
          throw error
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['staff'] })
      }
    })
  }

  return {
    // Staff Position hooks
    useStaffPositions,
    useCreateStaffPosition,
    useDeleteStaffPosition,
    useUpdateStaffPosition,
    useDeleteStaffPositionBulk,

    // Staff Member hooks
    useStaffMembers,
    useStaffMember,
    useCreateStaffMember,
    useUpdateStaffMember,
    useDeleteStaffMember,
    useDeleteStaffMemberBulk,
    useCreateStaff,
    useUpdateStaffStatus
  }
}
