// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type {
  NotificationType,
  CreateNotificationType,
  NotificationTemplateType,
  CreateNotificationTemplateType,
  UpdateNotificationTemplateType,
  NotificationPreferenceType,
  UpdateNotificationPreferenceType,
  SendNotificationType,
  NotificationStatisticsType,
  NotificationStatusType
} from '@/types/notificationTypes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import {
  mapCreateNotificationData,
  mapCreateNotificationTemplateData,
  mapUpdateNotificationTemplateData,
  mapUpdateNotificationPreferenceData,
  mapSendNotificationData
} from './utility/notification'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

interface ListResponse<T> {
  results: T[]
}

export const useNotificationHooks = () => {
  const queryClient = useQueryClient()

  // Notification Hooks
  const getNotifications = (pageSize?: number, page?: number, search?: string, ordering?: string) => {
    return useQuery({
      queryKey: ['notifications', pageSize, page, search, ordering],
      queryFn: () => {
        return axiosInstance.get(API_ROUTES.NOTIFICATIONS.getNotifications, {
          params: {
            page,
            page_size: pageSize,
            search,
            ordering
          },
          requiresAuth: true,
          requiredPermission: 'view_notification'
        } as any)
      }
    })
  }

  const useNotification = (id: number) => {
    return useQuery<NotificationType>({
      queryKey: ['notifications-one', id],
      queryFn: () =>
        axiosInstance
          .get<NotificationType>(`/api/notifications/${id}/`, {
            requiresAuth: true,
            requiredPermission: 'view_notification'
          } as any)
          .then((response: AxiosResponse<NotificationType>) => response.data),
      enabled: !!id
    })
  }

  const useCreateNotification = () => {
    const mutation = useMutation({
      mutationFn: async (notificationData: Partial<CreateNotificationType>) => {
        return await axiosInstance.post(API_ROUTES.NOTIFICATIONS.createNotification, notificationData, {
          requiresAuth: true,
          requiredPermission: 'add_notification'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
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


  const useEditNotification = () => {
    const mutation = useMutation({
      mutationFn: async (notificationData: Partial<CreateNotificationType & { id: number | undefined }>) => {
        return await axiosInstance.patch(`${API_ROUTES.NOTIFICATIONS.editNotification}${notificationData?.id}/`, notificationData, {
          requiresAuth: true,
          requiredPermission: 'change_notification'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
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

  const useMarkNotificationAsRead = () => {
    const mutation = useMutation<void, AxiosError<ErrorResponse>, number>({
      mutationFn: (notificationId: number) => {
        return axiosInstance
          .patch<void>(`/api/notifications/${notificationId}/read/`, {
            requiresAuth: true,
            requiredPermission: 'change_notification'
          } as any)
          .then((response: AxiosResponse<void>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
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

  const useUpdateNotification = () => {
    const mutation = useMutation<NotificationType, AxiosError<ErrorResponse>, UpdateNotificationTemplateType>({
      mutationFn: (data: UpdateNotificationTemplateType) => {
        const { id, ...updateData } = data
        const notificationData = mapUpdateNotificationTemplateData(updateData)

        return axiosInstance
          .patch<NotificationType>(`/api/notifications/${id}/`, notificationData, {
            requiresAuth: true,
            requiredPermission: 'change_notification'
          } as any)
          .then((response: AxiosResponse<NotificationType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
        toast.success('Notification updated successfully')
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


  const useDeleteNotification = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.NOTIFICATIONS.deleteNotification}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_notification'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete notification')
      }
    })
  }

  const useDeleteNotificationBulk = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.NOTIFICATIONS.deleteNotification}bulk_delete/`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'delete_notification'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete notifications')
      }
    })
  }

  // Notification Status Hooks
  const useNotificationStatus = (notificationId: number) => {
    return useQuery<ListResponse<NotificationStatusType>>({
      queryKey: ['notificationStatus', notificationId],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<NotificationStatusType>>(`/api/notifications/${notificationId}/status/`, {
            requiresAuth: true,
            requiredPermission: 'view_notification'
          } as any)
          .then((response: AxiosResponse<ListResponse<NotificationStatusType>>) => response.data),
      enabled: !!notificationId
    })
  }

  // Notification Template Hooks
  const useNotificationTemplates = () => {
    return useQuery<ListResponse<NotificationTemplateType>>({
      queryKey: ['notificationTemplates'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<NotificationTemplateType>>('/api/notifications/templates/')
          .then((response: AxiosResponse<ListResponse<NotificationTemplateType>>) => response.data)
    })
  }

  const useCreateNotificationTemplate = () => {
    const mutation = useMutation<NotificationTemplateType, AxiosError<ErrorResponse>, CreateNotificationTemplateType>({
      mutationFn: (data: CreateNotificationTemplateType) => {
        const templateData = mapCreateNotificationTemplateData(data)

        return axiosInstance
          .post<NotificationTemplateType>('/api/notifications/templates/', templateData, {
            requiresAuth: true,
            requiredPermission: 'add_notificationtemplate'
          } as any)
          .then((response: AxiosResponse<NotificationTemplateType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notificationTemplates'] })
        toast.success('Notification template created successfully')
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

  const useUpdateNotificationTemplate = () => {
    const mutation = useMutation<NotificationTemplateType, AxiosError<ErrorResponse>, UpdateNotificationTemplateType>({
      mutationFn: (data: UpdateNotificationTemplateType) => {
        const { id, ...updateData } = data
        const templateData = mapUpdateNotificationTemplateData(updateData)

        return axiosInstance
          .patch<NotificationTemplateType>(`/api/notifications/templates/${id}/`, templateData, {
            requiresAuth: true,
            requiredPermission: 'change_notificationtemplate'
          } as any)
          .then((response: AxiosResponse<NotificationTemplateType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notificationTemplates'] })
        toast.success('Notification template updated successfully')
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

  // Notification Preference Hooks
  const useNotificationPreferences = () => {
    return useQuery<ListResponse<NotificationPreferenceType>>({
      queryKey: ['notificationPreferences'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<NotificationPreferenceType>>('/api/notifications/preferences/', {
            requiresAuth: true,
            requiredPermission: 'view_notificationpreference'
          } as any)
          .then((response: AxiosResponse<ListResponse<NotificationPreferenceType>>) => response.data)
    })
  }

  const useUpdateNotificationPreference = () => {
    const mutation = useMutation<
      NotificationPreferenceType,
      AxiosError<ErrorResponse>,
      UpdateNotificationPreferenceType
    >({
      mutationFn: (data: UpdateNotificationPreferenceType) => {
        const { id, ...updateData } = data
        const preferenceData = mapUpdateNotificationPreferenceData(updateData as UpdateNotificationPreferenceType)

        return axiosInstance
          .patch<NotificationPreferenceType>(`/api/notifications/preferences/${id}/`, preferenceData, {
            requiresAuth: true,
            requiredPermission: 'change_notificationpreference'
          } as any)
          .then((response: AxiosResponse<NotificationPreferenceType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] })
        toast.success('Notification preference updated successfully')
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

  // Notification Sending Hooks
  const useSendNotification = () => {
    const mutation = useMutation<NotificationStatusType[], AxiosError<ErrorResponse>, SendNotificationType>({
      mutationFn: (data: SendNotificationType) => {
        const sendData = mapSendNotificationData(data)

        return axiosInstance
          .post<NotificationStatusType[]>('/api/notifications/send/', sendData, {
            requiresAuth: true,
            requiredPermission: 'send_notification'
          } as any)
          .then((response: AxiosResponse<NotificationStatusType[]>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
        toast.success('Notifications sent successfully')
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

  // Notification Statistics Hooks
  const useNotificationStatistics = () => {
    return useQuery<NotificationStatisticsType>({
      queryKey: ['notificationStatistics'],
      queryFn: () =>
        axiosInstance
          .get<NotificationStatisticsType>('/api/notifications/statistics/', {
            requiresAuth: true,
            requiredPermission: 'view_notification'
          } as any)
          .then((response: AxiosResponse<NotificationStatisticsType>) => response.data)
    })
  }

  return {
    // Notification hooks
    getNotifications,
    useNotification,
    useCreateNotification,
    useEditNotification,
    useMarkNotificationAsRead,
    useUpdateNotification,
    useDeleteNotification,
    useDeleteNotificationBulk,
    useNotificationStatus,

    // Template hooks
    useNotificationTemplates,
    useCreateNotificationTemplate,
    useUpdateNotificationTemplate,

    // Preference hooks
    useNotificationPreferences,
    useUpdateNotificationPreference,

    // Sending hooks
    useSendNotification,

    // Statistics hooks
    useNotificationStatistics
  }
}
