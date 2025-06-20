// React Imports
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
import { SubscriptionsTypes } from '@/types/subscriptions'
import { cleanApiParams } from '@/utils/utility/paramsUtils'

export const useSubscriptionHooks = () => {
  const queryClient = useQueryClient()

  const useCreateSubscription = () => {
    const mutation = useMutation({
      mutationFn: async (subscriptionData: Partial<SubscriptionsTypes>) => {
        return await axiosInstance.post(API_ROUTES.SUBSCRIPTIONS.createSubscription, subscriptionData, {
          requiresAuth: true,
          requiredPermission: 'add_subscription'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
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

  const useUpdateSubscription = () => {
    const mutation = useMutation({
      mutationFn: async (subscriptionData: Partial<SubscriptionsTypes>) => {
        return await axiosInstance.post(API_ROUTES.SUBSCRIPTIONS.updateSubscription, subscriptionData, {
          requiresAuth: true,
          requiredPermission: 'change_subscription'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
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

  const getSubscriptions = (pageSize?: number, page?: number, search?: string, ordering?: string, order?: number) => {
    return useQuery({
      queryKey: ['subscriptions', pageSize, page, search, ordering, order],
      queryFn: () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          search,
          ordering,
          order
        })
        return axiosInstance.get(API_ROUTES.SUBSCRIPTIONS.getSubscriptions, {
          params,
          requiresAuth: true
        } as any)
      }
    })
  }

  const getSubscriptionsByOrderId = (
    pageSize?: number,
    page?: number,
    search?: string,
    ordering?: string,
    order?: number
  ) => {
    return useQuery({
      queryKey: ['subscriptions-by-order-id', pageSize, page, search, ordering, order],
      queryFn: () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          search,
          ordering,
          order
        })
        return axiosInstance.get(API_ROUTES.SUBSCRIPTIONS.getSubscriptions, {
          params,
          requiresAuth: true
        } as any)
      },
      enabled: !!order
    })
  }

  const getSubscriptionById = (id: number) => {
    return useQuery({
      queryKey: ['subscription', id],
      queryFn: async () => {
        const response = await axiosInstance.get(`${API_ROUTES.SUBSCRIPTIONS.getSubscriptionById}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_subscription'
        } as any)
        return response.data
      },
      enabled: !!id
    })
  }

  return {
    useCreateSubscription,
    useUpdateSubscription,
    getSubscriptions,
    getSubscriptionsByOrderId,
    getSubscriptionById
  }
}
