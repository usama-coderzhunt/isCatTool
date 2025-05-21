// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type {
  PageType,
  CreatePageType,
  UpdatePageType,
  AddComponentType,
  UpdateComponentType,
  DeleteComponentType
} from '@/types/pageTypes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import { mapCreatePageData, mapUpdatePageData, mapCreateComponentData, mapUpdateComponentData } from './utility/page'

interface ListResponse<T> {
  results: T[]
}

export const usePageHooks = () => {
  const queryClient = useQueryClient()

  // Page Hooks
  const usePages = () => {
    return useQuery<ListResponse<PageType>>({
      queryKey: ['pages'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<PageType>>('/api/pages/')
          .then((response: AxiosResponse<ListResponse<PageType>>) => response.data)
    })
  }

  const usePage = (id: number) => {
    return useQuery<PageType>({
      queryKey: ['pages', id],
      queryFn: () =>
        axiosInstance.get<PageType>(`/api/pages/${id}/`).then((response: AxiosResponse<PageType>) => response.data),
      enabled: !!id
    })
  }

  const useCreatePage = () => {
    const mutation = useMutation<PageType, AxiosError<ErrorResponse>, CreatePageType>({
      mutationFn: (data: CreatePageType) => {
        const pageData = mapCreatePageData(data)

        return axiosInstance
          .post<PageType>('/api/pages/', pageData)
          .then((response: AxiosResponse<PageType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pages'] })
        toast.success('Page created successfully')
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

  const useUpdatePage = () => {
    const mutation = useMutation<PageType, AxiosError<ErrorResponse>, UpdatePageType>({
      mutationFn: (data: UpdatePageType) => {
        const { id, ...updateData } = data
        const pageData = mapUpdatePageData(updateData)

        return axiosInstance
          .patch<PageType>(`/api/pages/${id}/`, pageData)
          .then((response: AxiosResponse<PageType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pages'] })
        toast.success('Page updated successfully')
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

  const useDeletePage = () => {
    const mutation = useMutation<void, AxiosError<ErrorResponse>, number>({
      mutationFn: (id: number) => {
        return axiosInstance.delete(`/api/pages/${id}/`).then((response: AxiosResponse<void>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pages'] })
        toast.success('Page deleted successfully')
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

  // Component Management Hooks
  const useAddComponent = () => {
    const mutation = useMutation<PageType, AxiosError<ErrorResponse>, AddComponentType>({
      mutationFn: (data: AddComponentType) => {
        const componentData = mapCreateComponentData(data.component)

        return axiosInstance
          .post<PageType>(`/api/pages/${data.page_id}/components/`, componentData)
          .then((response: AxiosResponse<PageType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pages'] })
        toast.success('Component added successfully')
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

  const useUpdateComponent = () => {
    const mutation = useMutation<PageType, AxiosError<ErrorResponse>, UpdateComponentType>({
      mutationFn: (data: UpdateComponentType) => {
        const componentData = mapUpdateComponentData(data.updates)

        return axiosInstance
          .patch<PageType>(`/api/pages/${data.page_id}/components/${data.component_id}/`, componentData)
          .then((response: AxiosResponse<PageType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pages'] })
        toast.success('Component updated successfully')
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

  const useDeleteComponent = () => {
    const mutation = useMutation<void, AxiosError<ErrorResponse>, DeleteComponentType>({
      mutationFn: (data: DeleteComponentType) => {
        return axiosInstance
          .delete(`/api/pages/${data.page_id}/components/${data.component_id}/`)
          .then((response: AxiosResponse<void>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pages'] })
        toast.success('Component deleted successfully')
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
    // Page hooks
    usePages,
    usePage,
    useCreatePage,
    useUpdatePage,
    useDeletePage,

    // Component hooks
    useAddComponent,
    useUpdateComponent,
    useDeleteComponent
  }
}
