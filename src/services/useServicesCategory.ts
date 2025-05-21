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
import { mapServiceCategoryData } from './utility/servicesCategory'
import { CreateServiceCategoryType } from '@/types/servicesCategory'

export const useServicesCategoryHooks = () => {
    const queryClient = useQueryClient()

    const useCreateServiceCategory = () => {
        const mutation = useMutation({
            mutationFn: (data: CreateServiceCategoryType) => {
                const useServiceCategoryData = mapServiceCategoryData(data)

                return axiosInstance.post(API_ROUTES.SERVICES_CATEGORY.createServiceCategory, useServiceCategoryData, {
                    requiresAuth: true
                } as any)
            },
            onSuccess: () => {
                toast.success('Service Category created successfully')
                queryClient.invalidateQueries({ queryKey: ['services-categories'] })
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

    const getServicesCategories = () => {
        return useQuery({
            queryKey: ['services-categories'],
            queryFn: () => {
                return axiosInstance.get(API_ROUTES.SERVICES_CATEGORY.getServicesCategories, {
                    requiresAuth: true
                } as any)
            }
        })
    }

    const getServiceById = (id: number) => {
        return useQuery({
            queryKey: ['service-category', id],
            queryFn: () => {
                return axiosInstance.get(`${API_ROUTES.SERVICES_CATEGORY.getServiceCategoryById(id)}`, {
                    requiresAuth: true
                } as any)
            }
        })
    }

    const useEditServiceCategory = () => {
        const mutation = useMutation({
            mutationFn: ({ id, data }: { id: number; data: CreateServiceCategoryType }) => {
                const useEditServiceCategoryData = mapServiceCategoryData(data)

                return axiosInstance.patch(`${API_ROUTES.SERVICES_CATEGORY.editServiceCategory(id)}`, useEditServiceCategoryData, {
                    requiresAuth: true
                } as any)
            },
            onSuccess: () => {
                toast.success('Service Category updated successfully')
                queryClient.invalidateQueries({ queryKey: ['services-categories'] })
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
        useCreateServiceCategory,
        getServicesCategories,
        getServiceById,
        useEditServiceCategory,
    }
}
