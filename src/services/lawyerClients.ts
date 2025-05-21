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
import { LawyerClientTypes } from '@/types/lawyerClients'

export const useLawyerClientsHooks = () => {
  const queryClient = useQueryClient()

  const useCreateLawyerClient = () => {
    const mutation = useMutation({
      mutationFn: async (lawyerClientData: Partial<LawyerClientTypes>) => {
        return await axiosInstance.post(API_ROUTES.LAWYER_CLIENTS.createLawyerClient, lawyerClientData, {
          requiresAuth: true,
          requiredPermission: 'add_lawyerclient'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lawyer-clients'] })
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

  const getLawyerClients = (pageSize?: number, page?: number, search?: string, client_type?: string, ordering?: string) => {
    return useQuery({
      queryKey: ['lawyer-clients', pageSize, page, search, client_type, ordering],
      queryFn: () => {
        return axiosInstance.get(API_ROUTES.LAWYER_CLIENTS.getLawyerClients, {
          params: {
            page,
            page_size: pageSize,
            search,
            client_type,
            ordering
          },
          requiresAuth: true,
          requiredPermission: 'view_lawyerclient'
        } as any)
      }
    })
  }


  const getLawyerClientById = (id: number) => {
    return useQuery({
      queryKey: ['lawyer-client', id],
      queryFn: async () => {
        const response = await axiosInstance.get(
          `${API_ROUTES.LAWYER_CLIENTS.getLawyerClients}${id}/`,
          { requiresAuth: true, requiredPermission: 'view_lawyerclient' } as any
        )

        return response.data
      },
      enabled: !!id
    })
  }

  const useEditLawyerClient = () => {
    const mutation = useMutation({
      mutationFn: async (lawyerClientData: Partial<LawyerClientTypes & { id: number | undefined }>) => {
        return await axiosInstance.patch(`${API_ROUTES.LAWYER_CLIENTS.editLawyerClient}${lawyerClientData?.id}/`, lawyerClientData, {
          requiresAuth: true,
          requiredPermission: 'change_lawyerclient'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lawyer-clients'] })
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

  const useDeleteLawyerClient = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.LAWYER_CLIENTS.deleteLawyerClient}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_lawyerclient'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lawyer-clients'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete client')
      }
    })
  }

  const useDeleteLawyerClientBulk = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.LAWYER_CLIENTS.deleteLawyerClient}bulk_delete/`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'delete_lawyerclient'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lawyer-clients'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete clients')
      }
    })
  }

  return {
    useCreateLawyerClient,
    getLawyerClients,
    useEditLawyerClient,
    useDeleteLawyerClient,
    getLawyerClientById,
    useDeleteLawyerClientBulk
  }
}
