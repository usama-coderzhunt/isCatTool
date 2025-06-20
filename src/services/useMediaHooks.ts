// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type {
  MediaType,
  CreateMediaType,
  UpdateMediaType,
  MediaCategoryType,
  CreateMediaCategoryType,
  UpdateMediaCategoryType,
  MediaProcessingType,
  CreateMediaProcessingType
} from '@/types/mediaTypes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import {
  mapCreateMediaData,
  mapUpdateMediaData,
  mapCreateMediaCategoryData,
  mapUpdateMediaCategoryData,
  mapCreateMediaProcessingData
} from './utility/media'

interface ListResponse<T> {
  results: T[]
}

export const useMediaHooks = () => {
  const queryClient = useQueryClient()

  // Media Hooks
  const useMedia = (category?: string) => {
    return useQuery<ListResponse<MediaType>>({
      queryKey: ['media', category],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<MediaType>>('/api/media/', {
            params: { category }
          })
          .then((response: AxiosResponse<ListResponse<MediaType>>) => response.data)
    })
  }

  const useUploadMedia = () => {
    const mutation = useMutation<MediaType, AxiosError<ErrorResponse>, CreateMediaType>({
      mutationFn: (data: CreateMediaType) => {
        const mediaData = mapCreateMediaData(data)

        return axiosInstance
          .post<MediaType>('/api/media/', mediaData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          .then((response: AxiosResponse<MediaType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['media'] })
        toast.success('Media uploaded successfully')
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

  const useUpdateMedia = () => {
    const mutation = useMutation<MediaType, AxiosError<ErrorResponse>, UpdateMediaType>({
      mutationFn: (data: UpdateMediaType) => {
        const { id, ...updateData } = data
        const mediaData = mapUpdateMediaData(updateData)

        return axiosInstance
          .patch<MediaType>(`/api/media/${id}/`, mediaData)
          .then((response: AxiosResponse<MediaType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['media'] })
        toast.success('Media updated successfully')
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

  // Media Category Hooks
  const useMediaCategories = () => {
    return useQuery<ListResponse<MediaCategoryType>>({
      queryKey: ['mediaCategories'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<MediaCategoryType>>('/api/media/categories/')
          .then((response: AxiosResponse<ListResponse<MediaCategoryType>>) => response.data)
    })
  }

  const useCreateMediaCategory = () => {
    const mutation = useMutation<MediaCategoryType, AxiosError<ErrorResponse>, CreateMediaCategoryType>({
      mutationFn: (data: CreateMediaCategoryType) => {
        const categoryData = mapCreateMediaCategoryData(data)

        return axiosInstance
          .post<MediaCategoryType>('/api/media/categories/', categoryData)
          .then((response: AxiosResponse<MediaCategoryType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['mediaCategories'] })
        toast.success('Media category created successfully')
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

  const useUpdateMediaCategory = () => {
    const mutation = useMutation<MediaCategoryType, AxiosError<ErrorResponse>, UpdateMediaCategoryType>({
      mutationFn: (data: UpdateMediaCategoryType) => {
        const { id, ...updateData } = data
        const categoryData = mapUpdateMediaCategoryData(updateData)

        return axiosInstance
          .patch<MediaCategoryType>(`/api/media/categories/${id}/`, categoryData)
          .then((response: AxiosResponse<MediaCategoryType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['mediaCategories'] })
        toast.success('Media category updated successfully')
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

  // Media Processing Hooks
  const useProcessMedia = () => {
    const mutation = useMutation<MediaProcessingType, AxiosError<ErrorResponse>, CreateMediaProcessingType>({
      mutationFn: (data: CreateMediaProcessingType) => {
        const processingData = mapCreateMediaProcessingData(data)

        return axiosInstance
          .post<MediaProcessingType>('/api/media/process/', processingData)
          .then((response: AxiosResponse<MediaProcessingType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['media'] })
        toast.success('Media processing started successfully')
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
    // Media hooks
    useMedia,
    useUploadMedia,
    useUpdateMedia,

    // Media Category hooks
    useMediaCategories,
    useCreateMediaCategory,
    useUpdateMediaCategory,

    // Media Processing hooks
    useProcessMedia
  }
}
