// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type {
  BusinessUnitType,
  CreateBusinessUnitType,
  UpdateBusinessUnitType,
  ExtendedGroupType,
  CreateExtendedGroupType
} from '@/types/businessUnitTypes'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import { mapCreateBusinessUnitData, mapUpdateBusinessUnitData } from './utility/businessUnit'

interface ListResponse<T> {
  results: T[]
}

export const useBusinessUnitHooks = () => {
  const queryClient = useQueryClient()

  const useBusinessUnits = () => {
    return useQuery<ListResponse<BusinessUnitType>>({
      queryKey: ['businessUnits'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<BusinessUnitType>>('/api/bu/')
          .then((response: AxiosResponse<ListResponse<BusinessUnitType>>) => response.data)
    })
  }

  const useBusinessUnit = (id: string) => {
    return useQuery<BusinessUnitType>({
      queryKey: ['businessUnits', id],
      queryFn: () =>
        axiosInstance
          .get<BusinessUnitType>(`/api/bu/${id}/`)
          .then((response: AxiosResponse<BusinessUnitType>) => response.data),
      enabled: !!id
    })
  }

  const useCreateBusinessUnit = () => {
    const mutation = useMutation<BusinessUnitType, AxiosError<ErrorResponse>, CreateBusinessUnitType>({
      mutationFn: data => {
        const buData = mapCreateBusinessUnitData(data)

        return axiosInstance
          .post<BusinessUnitType>('/api/bu/', buData)
          .then((response: AxiosResponse<BusinessUnitType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['businessUnits'] })
        toast.success('Business unit created successfully')
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

  const useUpdateBusinessUnit = () => {
    const mutation = useMutation<BusinessUnitType, AxiosError<ErrorResponse>, UpdateBusinessUnitType>({
      mutationFn: data => {
        const { id, ...updateData } = data
        const buData = mapUpdateBusinessUnitData(updateData as any)

        return axiosInstance
          .patch<BusinessUnitType>(`/api/bu/${id}/`, buData)
          .then((response: AxiosResponse<BusinessUnitType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['businessUnits'] })
        toast.success('Business unit updated successfully')
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

  const useDeleteBusinessUnit = () => {
    const mutation = useMutation<void, AxiosError<ErrorResponse>, string>({
      mutationFn: id => {
        return axiosInstance.delete(`/api/bu/${id}/`).then((response: AxiosResponse<void>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['businessUnits'] })
        toast.success('Business unit deleted successfully')
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

  const useExtendedGroups = () => {
    return useQuery<ListResponse<ExtendedGroupType>>({
      queryKey: ['extended-groups'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<ExtendedGroupType>>(API_ROUTES.BUSINESS_UNIT.EXTENDED_GROUPS)
          .then((response: AxiosResponse<ListResponse<ExtendedGroupType>>) => response.data)
    })
  }

  const useCreateExtendedGroup = () => {
    const mutation = useMutation<ExtendedGroupType, AxiosError<ErrorResponse>, CreateExtendedGroupType>({
      mutationFn: data => {
        return axiosInstance
          .post<ExtendedGroupType>(API_ROUTES.BUSINESS_UNIT.EXTENDED_GROUPS, data)
          .then((response: AxiosResponse<ExtendedGroupType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['extended-groups'] })
        toast.success('Extended group created successfully')
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

  return {
    useBusinessUnits,
    useBusinessUnit,
    useCreateBusinessUnit,
    useUpdateBusinessUnit,
    useDeleteBusinessUnit,
    useExtendedGroups,
    useCreateExtendedGroup
  }
}
