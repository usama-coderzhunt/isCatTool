// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type {
  SettingType,
  CreateSettingType,
  UpdateSettingType,
  SettingCategoryType,
  CreateSettingCategoryType
} from '@/types/settingTypes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import { mapCreateSettingData, mapUpdateSettingData, mapCreateSettingCategoryData } from './utility/setting'

interface ListResponse<T> {
  results: T[]
}

export const useSettingHooks = () => {
  const queryClient = useQueryClient()

  // Setting Hooks
  const useSettings = (category?: string) => {
    return useQuery<ListResponse<SettingType>>({
      queryKey: ['settings', category],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<SettingType>>('/api/settings/', {
            params: { category }
          })
          .then((response: AxiosResponse<ListResponse<SettingType>>) => response.data)
    })
  }

  const useSetting = (id: number) => {
    return useQuery<SettingType>({
      queryKey: ['settings', id],
      queryFn: () =>
        axiosInstance
          .get<SettingType>(`/api/settings/${id}/`)
          .then((response: AxiosResponse<SettingType>) => response.data),
      enabled: !!id
    })
  }

  const useCreateSetting = () => {
    const mutation = useMutation<SettingType, AxiosError<ErrorResponse>, CreateSettingType>({
      mutationFn: (data: CreateSettingType) => {
        const settingData = mapCreateSettingData(data)

        return axiosInstance
          .post<SettingType>('/api/settings/', settingData)
          .then((response: AxiosResponse<SettingType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['settings'] })
        toast.success('Setting created successfully')
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

  const useUpdateSetting = () => {
    const mutation = useMutation<SettingType, AxiosError<ErrorResponse>, UpdateSettingType>({
      mutationFn: (data: UpdateSettingType) => {
        const { id, ...updateData } = data
        const settingData = mapUpdateSettingData(updateData as UpdateSettingType)

        return axiosInstance
          .patch<SettingType>(`/api/settings/${id}/`, settingData)
          .then((response: AxiosResponse<SettingType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['settings'] })
        toast.success('Setting updated successfully')
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

  const useDeleteSetting = () => {
    const mutation = useMutation<void, AxiosError<ErrorResponse>, number>({
      mutationFn: (id: number) => {
        return axiosInstance.delete(`/api/settings/${id}/`).then((response: AxiosResponse<void>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['settings'] })
        toast.success('Setting deleted successfully')
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

  // Setting Category Hooks
  const useSettingCategories = () => {
    return useQuery<ListResponse<SettingCategoryType>>({
      queryKey: ['settingCategories'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<SettingCategoryType>>('/api/settings/categories/')
          .then((response: AxiosResponse<ListResponse<SettingCategoryType>>) => response.data)
    })
  }

  const useCreateSettingCategory = () => {
    const mutation = useMutation<SettingCategoryType, AxiosError<ErrorResponse>, CreateSettingCategoryType>({
      mutationFn: (data: CreateSettingCategoryType) => {
        const categoryData = mapCreateSettingCategoryData(data)

        return axiosInstance
          .post<SettingCategoryType>('/api/settings/categories/', categoryData)
          .then((response: AxiosResponse<SettingCategoryType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['settingCategories'] })
        toast.success('Setting category created successfully')
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
    // Setting hooks
    useSettings,
    useSetting,
    useCreateSetting,
    useUpdateSetting,
    useDeleteSetting,

    // Setting Category hooks
    useSettingCategories,
    useCreateSettingCategory
  }
}
