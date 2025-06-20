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
import { CouponsTypes } from '@/types/coupons'
import { cleanApiParams } from '@/utils/utility/paramsUtils'

export const useCouponsHooks = () => {
  const queryClient = useQueryClient()

  const useCreateCoupon = () => {
    const mutation = useMutation({
      mutationFn: async (couponData: Partial<CouponsTypes>) => {
        return await axiosInstance.post(API_ROUTES.COUPONS.createCoupon, couponData, {
          requiresAuth: true
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['coupons'] })
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

  const useEditCoupon = () => {
    const mutation = useMutation({
      mutationFn: async (couponData: Partial<CouponsTypes & { id: number | undefined }>) => {
        return await axiosInstance.patch(`${API_ROUTES.COUPONS.createCoupon}${couponData?.id}/`, couponData, {
          requiresAuth: true
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['coupons'] })
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

  const getCoupons = (pageSize?: number, page?: number, search?: string, ordering?: string) => {
    return useQuery({
      queryKey: ['coupons', pageSize, page, search, ordering],
      queryFn: () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          search,
          ordering
        })
        return axiosInstance.get(API_ROUTES.COUPONS.getCoupons, {
          params,
          requiresAuth: true
        } as any)
      }
    })
  }

  const getCouponById = (id: number) => {
    return useQuery({
      queryKey: ['coupon', id],
      queryFn: async () => {
        const response = await axiosInstance.get(`${API_ROUTES.COUPONS.getCouponById}${id}/`, {
          requiresAuth: true
        } as any)
        return response.data
      },
      enabled: !!id
    })
  }

  const useDeleteCoupon = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.COUPONS.deleteCoupon}${id}/`, {
          requiresAuth: true
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['coupons'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete coupons')
      }
    })
  }

  const useDeleteCouponBulk = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.COUPONS.deleteCoupon}bulk_delete/`, {
          data: { ids },
          requiresAuth: true
        } as any)
      },
     onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['coupons'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete coupons')
      }
    })
  }

  return {
    useCreateCoupon,
    useEditCoupon,
    getCoupons,
    getCouponById,
    useDeleteCoupon,
    useDeleteCouponBulk
  }
}
