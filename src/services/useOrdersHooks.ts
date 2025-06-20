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
import { OrdersTypes } from '@/types/ordersTypes'
import { cleanApiParams } from '@/utils/utility/paramsUtils'

export const useOrdersHooks = () => {
  const queryClient = useQueryClient()

  const useCreateOrderOneTimePayment = () => {
    const mutation = useMutation({
      mutationFn: async (orderData: Partial<OrdersTypes>) => {
        return await axiosInstance.post(API_ROUTES.ORDERS.createOrderOneTimePayment, orderData, {
          requiresAuth: true
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        let errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.'
        if (error.response?.data?.message?.toLowerCase().includes('coupon')) {
          errorMessage = 'Invalid coupon code'
        }
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

  const useEditOrder = () => {
    const mutation = useMutation({
      mutationFn: async (orderData: Partial<OrdersTypes & { id: number | undefined }>) => {
        return await axiosInstance.patch(`${API_ROUTES.ORDERS.editOrder}${orderData?.id}/`, orderData, {
          requiresAuth: true
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        let errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.'
        if (error.response?.data?.coupon) {
          errorMessage = 'Invalid coupon code'
        }
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

  const getOrders = (
    pageSize?: number,
    page?: number,
    search?: string,
    ordering?: string,
    isSubscription?: boolean
  ) => {
    return useQuery({
      queryKey: ['orders', pageSize, page, search, ordering, isSubscription],
      queryFn: () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          search,
          ordering,
          is_subscription: isSubscription
        })
        return axiosInstance.get(API_ROUTES.ORDERS.getOrders, {
          params,
          requiresAuth: true
        } as any)
      }
    })
  }

  const getOrderById = (id: number) => {
    return useQuery({
      queryKey: ['order', id],
      queryFn: async () => {
        const response = await axiosInstance.get(`${API_ROUTES.ORDERS.getOrderById}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_order'
        } as any)
        return response.data
      },
      enabled: !!id
    })
  }

  return {
    useCreateOrderOneTimePayment,
    useEditOrder,
    getOrders,
    getOrderById
  }
}
