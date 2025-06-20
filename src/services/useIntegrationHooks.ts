// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type {
  IntegrationType,
  CreateIntegrationType,
  UpdateIntegrationType,
  WebhookType,
  CreateWebhookType,
  UpdateWebhookType,
  ApiKeyType,
  CreateApiKeyType
} from '@/types/integrationType'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import {
  mapCreateIntegrationData,
  mapUpdateIntegrationData,
  mapCreateWebhookData,
  mapUpdateWebhookData,
  mapCreateApiKeyData
} from './utility/integration'

interface ListResponse<T> {
  results: T[]
}

export const useIntegrationHooks = () => {
  const queryClient = useQueryClient()

  // Integration Hooks
  const useIntegrations = () => {
    return useQuery<ListResponse<IntegrationType>>({
      queryKey: ['integrations'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<IntegrationType>>('/api/integrations/')
          .then((response: AxiosResponse<ListResponse<IntegrationType>>) => response.data)
    })
  }

  const useIntegration = (id: number) => {
    return useQuery<IntegrationType>({
      queryKey: ['integrations', id],
      queryFn: () =>
        axiosInstance
          .get<IntegrationType>(`/api/integrations/${id}/`)
          .then((response: AxiosResponse<IntegrationType>) => response.data),
      enabled: !!id
    })
  }

  const useCreateIntegration = () => {
    const mutation = useMutation<IntegrationType, AxiosError<ErrorResponse>, CreateIntegrationType>({
      mutationFn: (data: CreateIntegrationType) => {
        const integrationData = mapCreateIntegrationData(data)

        return axiosInstance
          .post<IntegrationType>('/api/integrations/', integrationData)
          .then((response: AxiosResponse<IntegrationType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['integrations'] })
        toast.success('Integration created successfully')
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

  const useUpdateIntegration = () => {
    const mutation = useMutation<IntegrationType, AxiosError<ErrorResponse>, UpdateIntegrationType>({
      mutationFn: (data: UpdateIntegrationType) => {
        const { id, ...updateData } = data
        const integrationData = mapUpdateIntegrationData(updateData)

        return axiosInstance
          .patch<IntegrationType>(`/api/integrations/${id}/`, integrationData)
          .then((response: AxiosResponse<IntegrationType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['integrations'] })
        toast.success('Integration updated successfully')
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

  // Webhook Hooks
  const useWebhooks = (integrationId: number) => {
    return useQuery<ListResponse<WebhookType>>({
      queryKey: ['webhooks', integrationId],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<WebhookType>>(`/api/integrations/${integrationId}/webhooks/`)
          .then((response: AxiosResponse<ListResponse<WebhookType>>) => response.data),
      enabled: !!integrationId
    })
  }

  const useCreateWebhook = () => {
    const mutation = useMutation<WebhookType, AxiosError<ErrorResponse>, CreateWebhookType>({
      mutationFn: (data: CreateWebhookType) => {
        const webhookData = mapCreateWebhookData(data)

        return axiosInstance
          .post<WebhookType>(`/api/integrations/${data.integration_id}/webhooks/`, webhookData)
          .then((response: AxiosResponse<WebhookType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['webhooks'] })
        toast.success('Webhook created successfully')
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

  const useUpdateWebhook = () => {
    const mutation = useMutation<WebhookType, AxiosError<ErrorResponse>, UpdateWebhookType>({
      mutationFn: (data: UpdateWebhookType) => {
        const { id, integration_id, ...updateData } = data
        const webhookData = mapUpdateWebhookData(updateData)

        return axiosInstance
          .patch<WebhookType>(`/api/integrations/${integration_id}/webhooks/${id}/`, webhookData)
          .then((response: AxiosResponse<WebhookType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['webhooks'] })
        toast.success('Webhook updated successfully')
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

  // API Key Hooks
  const useApiKeys = (integrationId: number) => {
    return useQuery<ListResponse<ApiKeyType>>({
      queryKey: ['apiKeys', integrationId],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<ApiKeyType>>(`/api/integrations/${integrationId}/api-keys/`)
          .then((response: AxiosResponse<ListResponse<ApiKeyType>>) => response.data),
      enabled: !!integrationId
    })
  }

  const useCreateApiKey = () => {
    const mutation = useMutation<ApiKeyType, AxiosError<ErrorResponse>, CreateApiKeyType>({
      mutationFn: (data: CreateApiKeyType) => {
        const apiKeyData = mapCreateApiKeyData(data)

        return axiosInstance
          .post<ApiKeyType>(`/api/integrations/${data.integration_id}/api-keys/`, apiKeyData)
          .then((response: AxiosResponse<ApiKeyType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['apiKeys'] })
        toast.success('API key created successfully')
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
    // Integration hooks
    useIntegrations,
    useIntegration,
    useCreateIntegration,
    useUpdateIntegration,

    // Webhook hooks
    useWebhooks,
    useCreateWebhook,
    useUpdateWebhook,

    // API Key hooks
    useApiKeys,
    useCreateApiKey
  }
}
