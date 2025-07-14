// React Imports
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { hasPermissions } from '@/utils/permissionUtils'

// Axios Import
import type { AxiosError, AxiosResponse } from 'axios'

import axiosInstance from '@/utils/api/axiosInstance'

// Types
import type { ClientData, CreateClient } from '@/types/apps/TableDataTypes'
import type { ErrorResponse } from '@/types/type'
import { API_ROUTES } from '@/utils/constants/apiRoutes'
import { useAuthStore } from '@/store/useAuthStore'
import { cleanApiParams } from '@/utils/utility/paramsUtils'

export const useClientHooks = () => {
  const queryClient = useQueryClient()

  const useFetchClientTransactions = (
    pageSize?: number,
    page?: number,
    search?: string,
    client_type?: string,
    ordering?: string,
    isActive?: boolean
  ) => {
    return useQuery<AxiosResponse<ClientData>>({
      queryKey: ['clients', page, pageSize, search, client_type, ordering, isActive],
      queryFn: async () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          search,
          client_type,
          ordering,
          is_active: isActive
        })

        const response = await axiosInstance.get<ClientData>('/api/trans/clients/', {
          params,
          requiresAuth: true,
          requiredPermission: 'view_transclient'
        } as any)
        return response
      }
    })
  }

  /** Fetch Single Client */
  const useFetchClientById = (id: number) => {
    return useQuery({
      queryKey: ['client', id],
      queryFn: async () => {
        const response = await axiosInstance.get(
          `${API_ROUTES.TRANSACTION_SERVICES.getSingleClientTransaction}${id}/`,
          { requiresAuth: true, requiredPermission: 'view_transclient' } as any
        )

        return response.data
      },
      enabled: !!id
    })
  }

  /** Create a Client */
  const useSaveClient = () => {
    return useMutation({
      mutationFn: async (clientData: Partial<CreateClient>) => {
        return await axiosInstance.post(API_ROUTES.TRANSACTION_SERVICES.createClientTransaction, clientData, {
          requiresAuth: true,
          requiredPermission: 'add_transclient'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['clients'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to save client')
      }
    })
  }

  /** Update a Client */
  const useUpdateClient = () => {
    return useMutation({
      mutationFn: async (clientData: Partial<CreateClient & { id: number }>) => {
        return await axiosInstance.patch(
          `${API_ROUTES.TRANSACTION_SERVICES.createClientTransaction}${clientData.id}/`,
          clientData,
          { requiresAuth: true, requiredPermission: 'change_transclient' } as any
        )
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['clients'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to update status')
      }
    })
  }

  /** Delete Client */
  const useDeleteClient = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.TRANSACTION_SERVICES.deleteClientTransaction}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_transclient'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['clients'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete client')
      }
    })
  }

  // Bulk Delete Clients Api
  const useDeleteClientBulk = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.TRANSACTION_SERVICES.deleteClientTransaction}bulk_delete/`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'delete_transclient'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['clients'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.error || 'Failed to delete clients')
      }
    })
  }

  return {
    useFetchClientTransactions,
    useFetchClientById,
    useSaveClient,
    useDeleteClient,
    useUpdateClient,
    useDeleteClientBulk
  }
}
