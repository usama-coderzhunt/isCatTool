// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Axios Import
import type { AxiosError } from 'axios'

// Types Import
import type { CreateTransService } from '@/types/services'
import type { ErrorResponse } from '@/types/type'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

// Utility Import
import { mapTransServiceData } from './utility/service'
import { ServicePlanTypes } from '@/types/servicesPlans'
import { cleanApiParams } from '@/utils/utility/paramsUtils'
interface ServiceCategory {
  id: number
  name: string
  slug: string
  description: string
  created_by: number
  updated_by: number | null
  created_at: string
  updated_at: string
}
export const useServicesHooks = () => {
  const queryClient = useQueryClient()

  // Trans Services Hooks
  const useCreateTransService = () => {
    const mutation = useMutation({
      mutationFn: (data: CreateTransService) => {
        const useTransServiceData = mapTransServiceData(data)

        return axiosInstance.post(API_ROUTES.TRANSLATION_SERVICES.createTransService, useTransServiceData, {
          requiresAuth: true,
          requiredPermission: 'add_transservices'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['trans-services'] })
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

  const getTransServices = (clientId: number, pageSize: number, page: number, ordering?: string, search?: string) => {
    return useQuery({
      queryKey: ['trans-services', clientId, page, pageSize, ordering, search],
      queryFn: () => {
        const params = cleanApiParams({
          client_id: clientId,
          page,
          page_size: pageSize,
          ordering,
          translation_type: search
        })
        return axiosInstance.get(API_ROUTES.TRANSLATION_SERVICES.getTransServices, {
          params
        } as any)
      }
    })
  }

  const useDeleteTransService = () => {
    const mutation = useMutation({
      mutationFn: (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.TRANSLATION_SERVICES.deleteTransService}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_transservices'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['trans-services'] })
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

  const useDeleteTransServiceBulk = () => {
    const mutation = useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.TRANSLATION_SERVICES.deleteTransService}bulk_delete/`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'delete_transservices'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['trans-services'] })
        }, 500)
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

  const useEditTransService = () => {
    const mutation = useMutation({
      mutationFn: ({ id, data }: { id: string; data: CreateTransService }) => {
        const useEditTransServiceData = mapTransServiceData(data)

        return axiosInstance.patch(
          `${API_ROUTES.TRANSLATION_SERVICES.editTransService}${id}/`,
          useEditTransServiceData,
          {
            requiresAuth: true,
            requiredPermission: 'change_transservices'
          } as any
        )
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['trans-services'] })
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

  // Service Management Hooks

  const useCreateService = () => {
    const mutation = useMutation({
      mutationFn: (formData: FormData) => {
        return axiosInstance.post(API_ROUTES.SERVICE_MANAGEMENT.createService, formData, {
          requiresAuth: true,
          requiredPermission: 'add_servicesection',
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['services'] })
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

  const getServices = (pageSize: number, page: number, ordering?: string, search?: string, category?: number) => {
    return useQuery({
      queryKey: ['services', page, pageSize, ordering, search, category],
      queryFn: () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          ordering,
          search,
          category
        })
        return axiosInstance.get(API_ROUTES.SERVICE_MANAGEMENT.getServices, {
          params,
          requiresAuth: true,
          requiredPermission: 'adminAndSuperUserOnly'
        } as any)
      }
    })
  }

  const getFrontPageeServices = (
    pageSize: number,
    page: number,
    ordering?: string,
    search?: string,
    category?: number
  ) => {
    return useQuery({
      queryKey: ['services', page, pageSize, ordering, search, category],
      queryFn: () => {
        return axiosInstance.get(API_ROUTES.SERVICE_MANAGEMENT.getServices, {
          params: { page_size: pageSize, page, ordering, search, category }
        } as any)
      }
    })
  }

  const getServiceById = (slug: string | number | undefined) => {
    return useQuery({
      queryKey: ['service', slug],
      queryFn: async () => {
        const response = await axiosInstance.get(`${API_ROUTES.SERVICE_MANAGEMENT.getServiceById}${slug}/`, {
          requiresAuth: true,
          requiredPermission: ''
        } as any)
        return response.data
      },
      enabled: !!slug
    })
  }
  const getFrontPagesServiceById = (slug: string | number | undefined) => {
    return useQuery({
      queryKey: ['service', slug],
      queryFn: async () => {
        const response = await axiosInstance.get(`${API_ROUTES.SERVICE_MANAGEMENT.getServiceById}${slug}/`)
        return response.data
      },
      enabled: !!slug
    })
  }
  const useEditService = () => {
    const mutation = useMutation({
      mutationFn: ({ id, data }: { id: number | undefined; data: FormData }) => {
        return axiosInstance.patch(`${API_ROUTES.SERVICE_MANAGEMENT.editService}${id}/`, data, {
          requiresAuth: true,
          requiredPermission: 'change_servicesection',
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['services'] })
        queryClient.invalidateQueries({ queryKey: ['service'] })
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

  const useDeleteService = () => {
    const mutation = useMutation({
      mutationFn: (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.SERVICE_MANAGEMENT.deleteService}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_servicesection'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['services'] })
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

  const useDeleteServiceBulk = () => {
    const mutation = useMutation({
      mutationFn: (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.SERVICE_MANAGEMENT.deleteService}bulk_delete/`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'delete_servicesection'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['services'] })
        }, 500)
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

  //Service Categories Hooks

  const useCreateServiceCategory = () => {
    const mutation = useMutation({
      mutationFn: (formData: FormData) => {
        return axiosInstance.post(API_ROUTES.SERVICE_CATEGORIES.createServiceCategory, formData, {
          requiresAuth: true,
          requiredPermission: 'add_category'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['service-categories'] })
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

  const useEditServiceCategory = () => {
    const mutation = useMutation({
      mutationFn: ({ id, data }: { id: number | undefined; data: FormData }) => {
        return axiosInstance.patch(`${API_ROUTES.SERVICE_CATEGORIES.editServiceCategory}${id}/`, data, {
          requiresAuth: true,
          requiredPermission: 'change_category'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['service-categories'] })
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

  const getAllCategories = () => {
    return useQuery({
      queryKey: ['service-categories'],
      queryFn: async () => {
        let allCategories: ServiceCategory[] = []
        let page = 1
        let hasMore = true

        while (hasMore) {
          const response = await axiosInstance.get(API_ROUTES.SERVICE_CATEGORIES.getServiceCategories, {
            params: { page },
            requiresAuth: true,
            requiredPermission: 'adminAndSuperUserOnly'
          } as any)

          allCategories = [...allCategories, ...response.data.results]
          hasMore = response.data.next !== null
          page++
        }

        return allCategories
      }
    })
  }

  const getFrontPageCategories = () => {
    return useQuery({
      queryKey: ['service-categories'],
      queryFn: async () => {
        let allCategories: ServiceCategory[] = []
        let page = 1
        let hasMore = true

        while (hasMore) {
          const response = await axiosInstance.get('/api/services/category/', {
            params: { page }
          } as any)

          allCategories = [...allCategories, ...response.data.results]
          hasMore = response.data.next !== null
          page++
        }

        return allCategories
      }
    })
  }

  const getCategories = (pageSize: number, page: number, ordering?: string, search?: string) => {
    return useQuery({
      queryKey: ['service-categories', page, pageSize, ordering, search],
      queryFn: () => {
        const params = cleanApiParams({
          page_size: pageSize,
          page,
          ordering,
          search
        })
        return axiosInstance.get(API_ROUTES.SERVICE_CATEGORIES.getServiceCategories, {
          params
        } as any)
      }
    })
  }

  const useDeleteServiceCategory = () => {
    const mutation = useMutation({
      mutationFn: (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.SERVICE_CATEGORIES.deleteServiceCategory}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_category'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['service-categories'] })
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

  const useBulkDeleteServiceCategory = () => {
    const mutation = useMutation({
      mutationFn: (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.SERVICE_CATEGORIES.deleteServiceCategory}bulk_delete/`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'delete_category'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['service-categories'] })
        }, 500)
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

  // Service Plans Hooks

  const useCreateServicePlan = () => {
    const mutation = useMutation({
      mutationFn: async (servicePlanData: Partial<ServicePlanTypes>) => {
        return await axiosInstance.post(API_ROUTES.SERVICE_PLANS.createServicePlan, servicePlanData, {
          requiresAuth: true,
          requiredPermission: 'add_serviceplan'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['service-plans'] })
        queryClient.invalidateQueries({ queryKey: ['service'] })
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

  const useEditServicePlan = () => {
    const mutation = useMutation({
      mutationFn: async (servicePlanData: Partial<ServicePlanTypes & { id: number | undefined }>) => {
        return await axiosInstance.patch(
          `${API_ROUTES.SERVICE_PLANS.createServicePlan}${servicePlanData?.id}/`,
          servicePlanData,
          {
            requiresAuth: true,
            requiredPermission: 'change_serviceplan'
          } as any
        )
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['service-plans'] })
        queryClient.invalidateQueries({ queryKey: ['service'] })
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

  const getServicePlans = (pageSize?: number, page?: number, search?: string, ordering?: string) => {
    return useQuery({
      queryKey: ['service-plans', pageSize, page, search, ordering],
      queryFn: () => {
        return axiosInstance.get(API_ROUTES.SERVICE_PLANS.getServicePlans, {
          params: {
            page,
            page_size: pageSize,
            search,
            ordering
          }
        })
      }
    })
  }

  const getServicePlanById = (id: number) => {
    return useQuery({
      queryKey: ['service-plan', id],
      queryFn: () => {
        return axiosInstance.get(`${API_ROUTES.SERVICE_PLANS.getServicePlans}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_serviceplan'
        } as any)
      },
      enabled: !!id
    })
  }

  const useDeleteServicePlan = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.SERVICE_PLANS.deleteServicePlan}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_serviceplan'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['service-plans'] })
        queryClient.invalidateQueries({ queryKey: ['service'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete service plan')
      }
    })
  }

  return {
    //Trans Services Hooks
    useCreateTransService,
    getTransServices,
    useDeleteTransService,
    useDeleteTransServiceBulk,
    useEditTransService,

    //Service Management Hooks
    useCreateService,
    getServices,
    getFrontPageeServices,
    getServiceById,
    useEditService,
    useDeleteService,
    useDeleteServiceBulk,

    //Service Categories Hooks
    getAllCategories,
    getCategories,
    useCreateServiceCategory,
    useEditServiceCategory,
    useDeleteServiceCategory,
    useBulkDeleteServiceCategory,
    getFrontPageCategories,

    //Service Plans Hooks
    useCreateServicePlan,
    useEditServicePlan,
    getServicePlans,
    useDeleteServicePlan,
    getServicePlanById,
    getFrontPagesServiceById
  }
}
