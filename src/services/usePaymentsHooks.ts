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
import type {
  PaymentPayload,
  CapturePaymentPayload,
  RefundPaymentPayload,
  SubscriptionChangePlanPayload,
  InitiateSubscriptionPayload,
  CaptureSubscriptionPayload,
  RefundSubscriptionPayload
} from '@/types/paymentsTypes'
import type { InvoicesTypes } from '@/types/invoicesTypes'
import type { RefundsTypes } from '@/types/refundsTypes'
import { cleanApiParams } from '@/utils/utility/paramsUtils'

export const usePaymentsHooks = () => {
  const queryClient = useQueryClient()

  const useInitiateOneTimePayment = () => {
    const mutation = useMutation({
      mutationFn: (payload: PaymentPayload) => {
        return axiosInstance.post(API_ROUTES.PAYMENTS_MANAGEMENT.paymentsInitiateOneTimePayment, payload)
      },
      onSuccess: () => {
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
        queryClient.invalidateQueries({ queryKey: ['payments'] })
        router.push('/dashboard')
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
        const errorMessage = error.response?.data?.detail || error.message || 'An unexpected error occurred.'

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

  const getActiveServicePlans = (userId: number | null, serviceId?: string) => {
    return useQuery({
      queryKey: ['service-plans', userId, serviceId],
      queryFn: () => {
        const params = cleanApiParams({
          user_id: userId,
          service_id: serviceId
        })
        return axiosInstance.get(API_ROUTES.SERVICE_PLANS.getActiveServicePlans, {
          params
        })
      },
      enabled: !!userId && !!serviceId
    })
  }

  const getManualPayment = (status?: boolean) => {
    return useQuery({
      queryKey: ['manual-payment', status],
      queryFn: () => {
        return axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.MANUAL_PAYMENT.get, {
          params: {
            active: status
          }
        })
      }
    })
  }

  const getPaymentAuditLogs = (id: number, pageSize: number, page: number, ordering?: string, search?: string) => {
    return useQuery({
      queryKey: ['payment-audit-logs', id, pageSize, page, ordering, search],
      queryFn: () => {
        const params = cleanApiParams({
          transaction_id: id,
          page_size: pageSize,
          page,
          ordering,
          search
        })
        return axiosInstance.get(API_ROUTES.PAYMENTS_MANAGEMENT.paymentAuditLogs, {
          params
        })
      },
      enabled: !!id
    })
  }

  //Invoices Hooks
  const getInvoices = (pageSize: number, page: number, search?: string, ordering?: string, orderId?: number) => {
    return useQuery({
      queryKey: ['invoices', pageSize, page, search, ordering, orderId],
      queryFn: () => {
        const params = cleanApiParams({
          page_size: pageSize,
          page,
          search,
          ordering,
          order: orderId
        })
        return axiosInstance.get(API_ROUTES.INVOICES.getInvoices, {
          params,
          requiresAuth: true,
          requiredPermission: 'view_invoice'
        } as any)
      }
    })
  }

  const getInvoicesByOrderId = (
    pageSize: number,
    page: number,
    search?: string,
    ordering?: string,
    orderId?: number
  ) => {
    return useQuery({
      queryKey: ['invoices-by-order-id', pageSize, page, search, ordering, orderId],
      queryFn: () => {
        const params = cleanApiParams({
          page_size: pageSize,
          page,
          search,
          ordering,
          order: orderId
        })
        return axiosInstance.get(API_ROUTES.INVOICES.getInvoices, {
          params,
          requiresAuth: true,
          requiredPermission: 'view_invoice'
        } as any)
      },
      enabled: !!orderId
    })
  }

  const useEditInvoice = () => {
    const mutation = useMutation({
      mutationFn: async (invoiceData: Partial<InvoicesTypes & { id: number | undefined }>) => {
        return await axiosInstance.patch(`${API_ROUTES.INVOICES.editInvoice}${invoiceData?.id}/`, invoiceData, {
          requiresAuth: true
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['invoices'] })
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

  //Refunds Hooks
  const getRefunds = (pageSize: number, page: number, search?: string, ordering?: string) => {
    return useQuery({
      queryKey: ['refunds', pageSize, page, search, ordering],
      queryFn: () => {
        const params = cleanApiParams({
          page_size: pageSize,
          page,
          search,
          ordering
        })
        return axiosInstance.get(API_ROUTES.PAYMENTS_MANAGEMENT.getRefunds, {
          params,
          requiresAuth: true,
          requiredPermission: 'adminAndSuperUserOnly'
        } as any)
      }
    })
  }

  const useAddNoteToRefund = () => {
    const mutation = useMutation({
      mutationFn: async (refundData: Partial<RefundsTypes & { id: number | undefined }>) => {
        return await axiosInstance.patch(`${API_ROUTES.PAYMENTS_MANAGEMENT.getRefunds}${refundData?.id}/`, refundData, {
          requiresAuth: true
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['refunds'] })
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
    useInitiateOneTimePayment,
    useCaptureOneTimePayment,
    useRefundOneTimePaymentOrder,
    useSubscriptionChangePlan,
    useInitiatePaymentSubscription,
    usePaymentSubscriptionCapture,
    useCancelSubscription,
    useRefundSubscription,
    usePaypalWebhook,
    getActiveServicePlans,
    getManualPayment,
    getPaymentAuditLogs,

    //Invoices Hooks
    getInvoices,
    useEditInvoice,
    getInvoicesByOrderId,

    //Refunds Hooks
    getRefunds,
    useAddNoteToRefund
  }
}
