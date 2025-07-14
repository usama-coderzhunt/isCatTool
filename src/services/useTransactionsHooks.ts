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
import { TransactionsTypes } from '@/types/transactionsTypes'
import { cleanApiParams } from '@/utils/utility/paramsUtils'

export const useTransactionsHooks = () => {
  const queryClient = useQueryClient()

  const useCreateTransaction = () => {
    const mutation = useMutation({
      mutationFn: async (transactionData: Partial<TransactionsTypes>) => {
        return await axiosInstance.post(API_ROUTES.TRANSACTIONS.createTransaction, transactionData, {
          requiresAuth: true
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
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

  const useUpdateTransaction = () => {
    const mutation = useMutation({
      mutationFn: async (transactionData: Partial<TransactionsTypes & { id: number | undefined }>) => {
        const { id, ...data } = transactionData
        const formData = new FormData()

        // Add all fields to FormData
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (value instanceof File) {
              formData.append(key, value)
            } else if (typeof value === 'object') {
              formData.append(key, JSON.stringify(value))
            } else {
              formData.append(key, String(value))
            }
          }
        })

        return await axiosInstance.patch(`${API_ROUTES.TRANSACTIONS.updateTransaction}${id}/`, formData, {
          requiresAuth: true,
          requiredPermission: 'change_transaction',
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
        queryClient.invalidateQueries({ queryKey: ['transactions-by-order-id'] })
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

  const getTransactions = (pageSize?: number, page?: number, search?: string, ordering?: string, order?: number) => {
    return useQuery({
      queryKey: ['transactions', pageSize, page, search, ordering, order],
      queryFn: () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          search,
          ordering,
          order
        })
        return axiosInstance.get(API_ROUTES.TRANSACTIONS.getTransactions, {
          params,
          requiresAuth: true,
          requiredPermission: 'view_transaction'
        } as any)
      }
    })
  }

  const getTransactionsByOrderId = (
    pageSize?: number,
    page?: number,
    search?: string,
    ordering?: string,
    order?: number
  ) => {
    return useQuery({
      queryKey: ['transactions-by-order-id', pageSize, page, search, ordering, order],
      queryFn: () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          search,
          ordering,
          order
        })
        return axiosInstance.get(API_ROUTES.TRANSACTIONS.getTransactions, {
          params,
          requiresAuth: true,
          requiredPermission: 'view_transaction'
        } as any)
      },
      enabled: !!order
    })
  }

  const getTransactionByOrder = (orderID: number | null) => {
    return useQuery({
      queryKey: ['transactions', orderID],
      queryFn: () => {
        return axiosInstance.get(API_ROUTES.TRANSACTIONS.getTransactions, {
          params: {
            order: orderID
          },
          requiresAuth: true,
          requiredPermission: 'view_transaction'
        } as any)
      },
      enabled: !!orderID
    })
  }

  const getTransactionById = (id: number) => {
    return useQuery({
      queryKey: ['transaction', id],
      queryFn: async () => {
        const response = await axiosInstance.get(`${API_ROUTES.TRANSACTIONS.getTransactionById}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_transaction'
        } as any)
        return response.data
      },
      enabled: !!id
    })
  }

  return {
    useCreateTransaction,
    useUpdateTransaction,
    getTransactions,
    getTransactionsByOrderId,
    getTransactionByOrder,
    getTransactionById
  }
}
