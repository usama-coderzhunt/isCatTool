import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Axios Import
import type { AxiosError } from 'axios'

// Types Import
import type { ErrorResponse } from '@/types/type'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

// Utility Import
import { cleanApiParams } from '@/utils/utility/paramsUtils'
import { BusinessUnitType } from '@/types/businessUnitTypes'

export const useBusinessUnitHooks = () => {
  const queryClient = useQueryClient()

  const useCreateBusinessUnit = () => {
    const mutation = useMutation({
      mutationFn: async (businessUnitData: Partial<BusinessUnitType>) => {
        return await axiosInstance.post(API_ROUTES.BUSINESS_UNIT.createBusinessUnit, businessUnitData, {
          requiresAuth: true,
          requiredPermission: 'adminAndSuperUserOnly'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['businessUnits'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'An unexpected error occurred.'
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

  const useEditBusinessUnit = () => {
    const mutation = useMutation({
      mutationFn: async (businessUnitData: Partial<BusinessUnitType & { id: string | undefined }>) => {
        return await axiosInstance.patch(
          `${API_ROUTES.BUSINESS_UNIT.editBusinessUnit}${businessUnitData?.id}/`,
          businessUnitData,
          {
            requiresAuth: true,
            requiredPermission: 'adminAndSuperUserOnly'
          } as any
        )
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['businessUnits'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'An unexpected error occurred.'
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

  const getBusinessUnits = (pageSize?: number, page?: number, search?: string, ordering?: string) => {
    return useQuery({
      queryKey: ['businessUnits', pageSize, page, search, ordering],
      queryFn: () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          search,
          ordering
        })
        return axiosInstance.get(API_ROUTES.BUSINESS_UNIT.getBusinessUnit, {
          params,
          requiresAuth: true,
          requiredPermission: 'adminAndSuperUserOnly'
        } as any)
      }
    })
  }

  const getBusinessUnitById = (id: string) => {
    return useQuery({
      queryKey: ['businessUnit', id],
      queryFn: async () => {
        const response = await axiosInstance.get(`${API_ROUTES.BUSINESS_UNIT.getBusinessUnitById}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'adminAndSuperUserOnly'
        } as any)
        return response.data
      },
      enabled: !!id
    })
  }

  const useDeleteBusinessUnit = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        return axiosInstance.delete(`${API_ROUTES.BUSINESS_UNIT.deleteBusinessUnit}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'adminAndSuperUserOnly'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['businessUnits'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to delete business unit')
      }
    })
  }

  const useBulkDeleteBusinessUnit = () => {
    return useMutation({
      mutationFn: async (ids: string[]) => {
        return axiosInstance.delete(`${API_ROUTES.BUSINESS_UNIT.bulkDeleteBusinessUnit}`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'adminAndSuperUserOnly'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['businessUnits'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to delete business units')
      }
    })
  }

  const useBusinessUnitAssignToUser = () => {
    return useMutation({
      mutationFn: async (params: { id: number; business_unit: string }) => {
        return axiosInstance.post(
          `${API_ROUTES.BUSINESS_UNIT.businessUnitAssignToUser(params.id)}`,
          { business_unit: params.business_unit },
          {
            requiresAuth: true,
            requiredPermission: 'adminAndSuperUserOnly'
          } as any
        )
      },
      onSuccess: data => {
        queryClient.invalidateQueries({ queryKey: ['permissions'] })
        toast.success(data.data.message)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to assign business unit')
      }
    })
  }

  return {
    useCreateBusinessUnit,
    useEditBusinessUnit,
    getBusinessUnits,
    getBusinessUnitById,
    useDeleteBusinessUnit,
    useBulkDeleteBusinessUnit,
    useBusinessUnitAssignToUser
  }
}
