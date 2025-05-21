// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type {
  CommentType,
  CreateCommentType,
  UpdateCommentType,
  CommentModerationActionType,
  CommentReactionType,
  CreateCommentReactionType,
  CommentThreadType,
  CommentStatisticsType
} from '@/types/commentTypes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import {
  mapCreateCommentData,
  mapUpdateCommentData,
  mapCommentModerationActionData,
  mapCreateCommentReactionData
} from './utility/comment'

interface ListResponse<T> {
  results: T[]
}

export const useCommentHooks = () => {
  const queryClient = useQueryClient()

  // Comment Hooks
  const useComments = (entityType?: string, entityId?: number) => {
    return useQuery<ListResponse<CommentType>>({
      queryKey: ['comments', entityType, entityId],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<CommentType>>('/api/comments/', {
            params: { entity_type: entityType, entity_id: entityId }
          })
          .then((response: AxiosResponse<ListResponse<CommentType>>) => response.data)
    })
  }

  const useComment = (id: number) => {
    return useQuery<CommentType>({
      queryKey: ['comments', id],
      queryFn: () =>
        axiosInstance
          .get<CommentType>(`/api/comments/${id}/`)
          .then((response: AxiosResponse<CommentType>) => response.data),
      enabled: !!id
    })
  }

  const useCreateComment = () => {
    const mutation = useMutation<CommentType, AxiosError<ErrorResponse>, CreateCommentType>({
      mutationFn: (data: CreateCommentType) => {
        const commentData = mapCreateCommentData(data)

        return axiosInstance
          .post<CommentType>('/api/comments/', commentData)
          .then((response: AxiosResponse<CommentType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['comments'] })
        toast.success('Comment created successfully')
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

  const useUpdateComment = () => {
    const mutation = useMutation<CommentType, AxiosError<ErrorResponse>, UpdateCommentType>({
      mutationFn: (data: UpdateCommentType) => {
        const { id, ...updateData } = data
        const commentData = mapUpdateCommentData(updateData)

        return axiosInstance
          .patch<CommentType>(`/api/comments/${id}/`, commentData)
          .then((response: AxiosResponse<CommentType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['comments'] })
        toast.success('Comment updated successfully')
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

  // Comment Moderation Hooks
  const useModerateComment = () => {
    const mutation = useMutation<CommentType, AxiosError<ErrorResponse>, CommentModerationActionType>({
      mutationFn: (data: CommentModerationActionType) => {
        const { id, ...actionData } = data
        const moderationData = mapCommentModerationActionData(actionData as CommentModerationActionType)

        return axiosInstance
          .post<CommentType>(`/api/comments/${id}/moderate/`, moderationData)
          .then((response: AxiosResponse<CommentType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['comments'] })
        toast.success('Comment moderated successfully')
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

  // Comment Reaction Hooks
  const useCommentReactions = (commentId: number) => {
    return useQuery<ListResponse<CommentReactionType>>({
      queryKey: ['commentReactions', commentId],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<CommentReactionType>>(`/api/comments/${commentId}/reactions/`)
          .then((response: AxiosResponse<ListResponse<CommentReactionType>>) => response.data),
      enabled: !!commentId
    })
  }

  const useCreateCommentReaction = () => {
    const mutation = useMutation<CommentReactionType, AxiosError<ErrorResponse>, CreateCommentReactionType>({
      mutationFn: (data: CreateCommentReactionType) => {
        const reactionData = mapCreateCommentReactionData(data)

        return axiosInstance
          .post<CommentReactionType>(`/api/comments/${data.comment_id}/reactions/`, reactionData)
          .then((response: AxiosResponse<CommentReactionType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['commentReactions'] })
        toast.success('Reaction added successfully')
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

  // Comment Thread Hooks
  const useCommentThread = (entityType: string, entityId: number) => {
    return useQuery<CommentThreadType>({
      queryKey: ['commentThread', entityType, entityId],
      queryFn: () =>
        axiosInstance
          .get<CommentThreadType>(`/api/comments/thread/`, {
            params: { entity_type: entityType, entity_id: entityId }
          })
          .then((response: AxiosResponse<CommentThreadType>) => response.data),
      enabled: !!entityType && !!entityId
    })
  }

  // Comment Statistics Hooks
  const useCommentStatistics = () => {
    return useQuery<CommentStatisticsType>({
      queryKey: ['commentStatistics'],
      queryFn: () =>
        axiosInstance
          .get<CommentStatisticsType>('/api/comments/statistics/')
          .then((response: AxiosResponse<CommentStatisticsType>) => response.data)
    })
  }

  return {
    // Comment hooks
    useComments,
    useComment,
    useCreateComment,
    useUpdateComment,

    // Moderation hooks
    useModerateComment,

    // Reaction hooks
    useCommentReactions,
    useCreateCommentReaction,

    // Thread hooks
    useCommentThread,

    // Statistics hooks
    useCommentStatistics
  }
}
