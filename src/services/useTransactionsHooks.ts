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

export const useTransactionsHooks = () => {
    const queryClient = useQueryClient()

    const useCreateTransaction = () => {
        const mutation = useMutation({
            mutationFn: async (transactionData: Partial<TransactionsTypes>) => {
                return await axiosInstance.post(API_ROUTES.TRANSACTIONS.createTransaction, transactionData, {
                    requiresAuth: true,
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
                return await axiosInstance.patch(`${API_ROUTES.TRANSACTIONS.updateTransaction}${transactionData?.id}/`, transactionData, {
                    requiresAuth: true,
                    requiredPermission: 'change_transaction'
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

    const getTransactions = (pageSize?: number, page?: number, search?: string, ordering?: string, order?: number) => {
        return useQuery({
            queryKey: ['transactions', pageSize, page, search, ordering, order],
            queryFn: () => {
                return axiosInstance.get(API_ROUTES.TRANSACTIONS.getTransactions, {
                    params: {
                        page,
                        page_size: pageSize,
                        search,
                        ordering,
                        order
                    },
                    requiresAuth: true,
                    requiredPermission: 'view_transaction'
                } as any)
            }
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
                const response = await axiosInstance.get(
                    `${API_ROUTES.TRANSACTIONS.getTransactionById}${id}/`,
                    { requiresAuth: true, requiredPermission: 'view_transaction' } as any
                )
                return response.data
            },
            enabled: !!id
        })
    }


    return {
        useCreateTransaction,
        useUpdateTransaction,
        getTransactions,
        getTransactionByOrder,
        getTransactionById
    }
}
