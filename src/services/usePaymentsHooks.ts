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
import {
  PaymentPayload,
  CapturePaymentPayload,
  RefundPaymentPayload,
  SubscriptionChangePlanPayload,
  InitiateSubscriptionPayload,
  CaptureSubscriptionPayload,
  RefundSubscriptionPayload
} from '@/types/paymentsTypes'

export const usePaymentsHooks = () => {
  const queryClient = useQueryClient()

  const useInitiateOneTimePayment = () => {
    const mutation = useMutation({
      mutationFn: (payload: PaymentPayload) => {
        return axiosInstance.post(API_ROUTES.PAYMENTS_MANAGEMENT.paymentsInitiateOneTimePayment, payload)
      },
      onSuccess: () => {
        toast.success('One Time Payment initiated successfully')
        queryClient.invalidateQueries({ queryKey: ['payments'] })
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

  const useCaptureOneTimePayment = (router?: any) => {
    const mutation = useMutation({
      mutationFn: (payload?: CapturePaymentPayload) => {
        return axiosInstance.post(API_ROUTES.PAYMENTS_MANAGEMENT.paymentsCaptureOneTimePayment, payload)
      },
      onSuccess: () => {
        toast.success('One Time Payment captured successfully')
        queryClient.invalidateQueries({ queryKey: ['payments'] })
        router.push('/apps/services')
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

  const useRefundOneTimePaymentOrder = () => {
    const mutation = useMutation({
      mutationFn: (payload: RefundPaymentPayload) => {
        return axiosInstance.post(API_ROUTES.PAYMENTS_MANAGEMENT.paymentsRefundOneTimePayment, payload, {
          requiresAuth: true
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        const errorMessage =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          'An unexpected error occurred.'
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

  const useSubscriptionChangePlan = () => {
    const mutation = useMutation({
      mutationFn: (payload: SubscriptionChangePlanPayload) => {
        return axiosInstance.post(API_ROUTES.PAYMENTS_MANAGEMENT.paymentsSubscriptionChangePlan, payload)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['service-plans'] })
        queryClient.invalidateQueries({ queryKey: ['payments'] })
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

  const useInitiatePaymentSubscription = () => {
    const mutation = useMutation({
      mutationFn: (payload: InitiateSubscriptionPayload) => {
        return axiosInstance.post(API_ROUTES.PAYMENTS_MANAGEMENT.paymentsInitiateSubscription, payload)
      },
      onSuccess: () => {
        toast.success('Subscription Payment initiated successfully')
        queryClient.invalidateQueries({ queryKey: ['payments'] })
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

  const usePaymentSubscriptionCapture = () => {
    const mutation = useMutation({
      mutationFn: (payload: CaptureSubscriptionPayload) => {
        return axiosInstance.post(API_ROUTES.PAYMENTS_MANAGEMENT.paymentsCaptureSubscription, payload)
      },
      onSuccess: () => {
        toast.success('Subscription Payment captured successfully')
        queryClient.invalidateQueries({ queryKey: ['payments'] })
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

  const useCancelSubscription = () => {
    const mutation = useMutation({
      mutationFn: (payload: { id: number; reason: string }) => {
        return axiosInstance.post(API_ROUTES.PAYMENTS_MANAGEMENT.cancelSubscription(payload.id), {
          reason: payload.reason
        })
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['payments'] })
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

  const useRefundSubscription = () => {
    const mutation = useMutation({
      mutationFn: (payload: RefundSubscriptionPayload) => {
        return axiosInstance.post(API_ROUTES.PAYMENTS_MANAGEMENT.paymentsRefundOneTimePayment, payload, {
          requiresAuth: true
        } as any)
      },
      onSuccess: () => {
        toast.success('Subscription Payment refunded successfully')
        queryClient.invalidateQueries({ queryKey: ['payments'] })
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

  const usePaypalWebhook = () => {
    const mutation = useMutation({
      mutationFn: () => {
        return axiosInstance.post(API_ROUTES.PAYMENTS_MANAGEMENT.paypalWebhook)
      },
      onSuccess: () => {
        toast.success('Paypal Webhook received successfully')
        queryClient.invalidateQueries({ queryKey: ['payments'] })
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

  const getActiveServicePlans = (userId: number | null, serviceId?: number) => {
    return useQuery({
      queryKey: ['service-plans', userId, serviceId],
      queryFn: () => {
        return axiosInstance.get(API_ROUTES.SERVICE_PLANS.getActiveServicePlans, {
          params: {
            user_id: userId,
            service_id: serviceId
          }
        })
      },
      enabled: !!userId && !!serviceId
    })
  }

  return {
    useInitiateOneTimePayment,
    useCaptureOneTimePayment,
    useRefundOneTimePaymentOrder,
    useSubscriptionChangePlan,
    useInitiatePaymentSubscription,
    usePaymentSubscriptionCapture,
    useCancelSubscription,
    useRefundSubscription,
    usePaypalWebhook,
    getActiveServicePlans
  }
}
