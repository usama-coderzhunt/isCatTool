// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type {
  TagType,
  CreateTagType,
  UpdateTagType,
  TagAssignmentType,
  CreateTagAssignmentType,
  TagCategoryType,
  CreateTagCategoryType,
  UpdateTagCategoryType,
  TagStatisticsType
} from '@/types/tagTypes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import {
  mapCreateTagData,
  mapUpdateTagData,
  mapCreateTagAssignmentData,
  mapCreateTagCategoryData,
  mapUpdateTagCategoryData
} from './utility/tag'

interface ListResponse<T> {
  results: T[]
}

export const useTagHooks = () => {
  const queryClient = useQueryClient()

  // Tag Hooks
  const useTags = (category?: string) => {
    return useQuery<ListResponse<TagType>>({
      queryKey: ['tags', category],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<TagType>>('/api/tags/', {
            params: { category }
          })
          .then((response: AxiosResponse<ListResponse<TagType>>) => response.data)
    })
  }

  const useCreateTag = () => {
    const mutation = useMutation<TagType, AxiosError<ErrorResponse>, CreateTagType>({
      mutationFn: (data: CreateTagType) => {
        const tagData = mapCreateTagData(data)

        return axiosInstance
          .post<TagType>('/api/tags/', tagData)
          .then((response: AxiosResponse<TagType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tags'] })
        toast.success('Tag created successfully')
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

  const useUpdateTag = () => {
    const mutation = useMutation<TagType, AxiosError<ErrorResponse>, UpdateTagType>({
      mutationFn: (data: UpdateTagType) => {
        const { id, ...updateData } = data
        const tagData = mapUpdateTagData(updateData)

        return axiosInstance
          .patch<TagType>(`/api/tags/${id}/`, tagData)
          .then((response: AxiosResponse<TagType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tags'] })
        toast.success('Tag updated successfully')
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

  // Tag Assignment Hooks
  const useTagAssignments = (entityType: string, entityId: number) => {
    return useQuery<ListResponse<TagAssignmentType>>({
      queryKey: ['tagAssignments', entityType, entityId],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<TagAssignmentType>>('/api/tags/assignments/', {
            params: { entity_type: entityType, entity_id: entityId }
          })
          .then((response: AxiosResponse<ListResponse<TagAssignmentType>>) => response.data)
    })
  }

  const useAssignTag = () => {
    const mutation = useMutation<TagAssignmentType, AxiosError<ErrorResponse>, CreateTagAssignmentType>({
      mutationFn: (data: CreateTagAssignmentType) => {
        const assignmentData = mapCreateTagAssignmentData(data)

        return axiosInstance
          .post<TagAssignmentType>('/api/tags/assignments/', assignmentData)
          .then((response: AxiosResponse<TagAssignmentType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tagAssignments'] })
        toast.success('Tag assigned successfully')
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

  // Tag Category Hooks
  const useTagCategories = () => {
    return useQuery<ListResponse<TagCategoryType>>({
      queryKey: ['tagCategories'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<TagCategoryType>>('/api/tags/categories/')
          .then((response: AxiosResponse<ListResponse<TagCategoryType>>) => response.data)
    })
  }

  const useCreateTagCategory = () => {
    const mutation = useMutation<TagCategoryType, AxiosError<ErrorResponse>, CreateTagCategoryType>({
      mutationFn: (data: CreateTagCategoryType) => {
        const categoryData = mapCreateTagCategoryData(data)

        return axiosInstance
          .post<TagCategoryType>('/api/tags/categories/', categoryData)
          .then((response: AxiosResponse<TagCategoryType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tagCategories'] })
        toast.success('Tag category created successfully')
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

  const useUpdateTagCategory = () => {
    const mutation = useMutation<TagCategoryType, AxiosError<ErrorResponse>, UpdateTagCategoryType>({
      mutationFn: (data: UpdateTagCategoryType) => {
        const { id, ...updateData } = data
        const categoryData = mapUpdateTagCategoryData(updateData)

        return axiosInstance
          .patch<TagCategoryType>(`/api/tags/categories/${id}/`, categoryData)
          .then((response: AxiosResponse<TagCategoryType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tagCategories'] })
        toast.success('Tag category updated successfully')
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

  // Tag Statistics Hooks
  const useTagStatistics = (tagId: number) => {
    return useQuery<TagStatisticsType>({
      queryKey: ['tagStatistics', tagId],
      queryFn: () =>
        axiosInstance
          .get<TagStatisticsType>(`/api/tags/${tagId}/statistics/`)
          .then((response: AxiosResponse<TagStatisticsType>) => response.data),
      enabled: !!tagId
    })
  }

  return {
    // Tag hooks
    useTags,
    useCreateTag,
    useUpdateTag,

    // Tag Assignment hooks
    useTagAssignments,
    useAssignTag,

    // Tag Category hooks
    useTagCategories,
    useCreateTagCategory,
    useUpdateTagCategory,

    // Tag Statistics hooks
    useTagStatistics
  }
}
