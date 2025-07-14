// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { ErrorResponse } from '@/types/type'
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'
import {
  GeneralSettings,
  LogoSettings,
  FinanceSettings,
  APITokenSettings,
  SocialTrackingSettings,
  SocialLinkSettings,
  SEOSettings,
  FooterSettings,
  PayPalSettings,
  StripeSettings,
  ManualPaymentSettings,
  PaymentSettings,
  CustomCodeSettings
} from '@/types/adminSettingsTypes'
import { useTranslation } from 'react-i18next'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { useTemplateStore } from '@/store/templateStore'

// Hook for managing admin settings
export const useAdminSettingsHook = (component?: 'left' | 'right') => {
  const { t, i18n } = useTranslation('global')
  const params = useParams() as { lang: string }
  const { lang: currentLocale } = params

  useEffect(() => {
    if (currentLocale && i18n) {
      i18n.changeLanguage(currentLocale)
    }
  }, [currentLocale, i18n])

  const queryClient = useQueryClient()
  const cacheKeyPrefix = component ? `logo-settings-${component}` : 'logo-settings'

  // General Settings
  const useGeneralSettings = () => {
    return useQuery<GeneralSettings>({
      queryKey: ['general-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.GENERAL.get)
        return response.data.results[0]
      },
      staleTime: 0,
      gcTime: 0,
      refetchOnWindowFocus: true
    })
  }

  const useUpdateGeneralSettings = () => {
    return useMutation({
      mutationFn: async (data: Partial<GeneralSettings>) => {
        const response = await axiosInstance.patch(`${API_ROUTES.ADMIN_SETTINGS.GENERAL.update}${data.id}/`, data, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['general-settings'],
          refetchType: 'active',
          exact: true
        })
        toast.success(t('adminSettings.toasts.generalSettingUpdated'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to update general settings')
      }
    })
  }

  // Logo Settings
  const useLogoSettings = () => {
    return useQuery<LogoSettings>({
      queryKey: [cacheKeyPrefix],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.LOGO.get)
        return response.data.results[0]
      }
    })
  }

  const useUpdateLogoSettings = () => {
    return useMutation({
      mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
        const response = await axiosInstance.patch(`${API_ROUTES.ADMIN_SETTINGS.LOGO?.update}${id}/`, formData, {
          requiresAuth: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['logo-settings'] })
        queryClient.invalidateQueries({ queryKey: ['logo-settings-left'] })
        queryClient.invalidateQueries({ queryKey: ['logo-settings-right'] })

        queryClient.refetchQueries({
          queryKey: ['logo-settings'],
          type: 'active'
        })
        queryClient.refetchQueries({
          queryKey: ['logo-settings-left'],
          type: 'active'
        })
        queryClient.refetchQueries({
          queryKey: ['logo-settings-right'],
          type: 'active'
        })

        toast.success(t('adminSettings.toasts.logoUpdated'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        console.error('Upload error:', error)
        toast.error(error.response?.data?.message || 'Failed to update logo')
      }
    })
  }

  // Finance Settings
  const useFinanceSettings = () => {
    return useQuery<FinanceSettings>({
      queryKey: ['finance-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.FINANCE.get)
        return response.data.results[0]
      }
    })
  }

  const useUpdateFinanceSettings = () => {
    return useMutation({
      mutationFn: async ({ id, ...data }: Partial<FinanceSettings>) => {
        const response = await axiosInstance.patch(`${API_ROUTES.ADMIN_SETTINGS.FINANCE.update}${id}/`, data, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['finance-settings'] })
        toast.success(t('adminSettings.toasts.financeSettingUpdated'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to update finance settings')
      }
    })
  }

  const useCreateFinanceSettings = () => {
    return useMutation({
      mutationFn: async (data: Omit<FinanceSettings, 'id'>) => {
        const response = await axiosInstance.post(API_ROUTES.ADMIN_SETTINGS.FINANCE.create, data, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['finance-settings'] })
        toast.success(t('adminSettings.toasts.financeSettingCreated'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to create finance settings')
      }
    })
  }

  const useDeleteFinanceSettings = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.delete(`${API_ROUTES.ADMIN_SETTINGS.FINANCE.delete}${id}/`, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['finance-settings'] })
        toast.success(t('adminSettings.toasts.financeSettingDeleted'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete finance settings')
      }
    })
  }

  // API Token Settings
  const useAPITokenSettings = () => {
    return useQuery<APITokenSettings>({
      queryKey: ['api-token-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.API_TOKENS.get)
        return response.data.results[0]
      }
    })
  }

  const useUpdateAPITokenSettings = () => {
    return useMutation({
      mutationFn: async (data: Partial<APITokenSettings>) => {
        const response = await axiosInstance.patch(`${API_ROUTES.ADMIN_SETTINGS.API_TOKENS.update}${data.id}/`, data, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['api-token-settings'] })
        toast.success(t('adminSettings.toasts.apiTokenUpdated'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to update API token settings')
      }
    })
  }

  const useCreateAPITokenSettings = () => {
    return useMutation({
      mutationFn: async (data: Omit<APITokenSettings, 'id'>) => {
        const response = await axiosInstance.post(API_ROUTES.ADMIN_SETTINGS.API_TOKENS.create, data, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['api-token-settings'] })
        toast.success(t('adminSettings.toasts.apiTokenCreated'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to create API token settings')
      }
    })
  }

  const useDeleteAPITokenSettings = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.delete(`${API_ROUTES.ADMIN_SETTINGS.API_TOKENS.delete}${id}/`, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['api-token-settings'] })
        toast.success(t('adminSettings.toasts.apiTokenDeleted'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete API token settings')
      }
    })
  }

  // Social Tracking Settings
  const useSocialTrackingSettings = () => {
    return useQuery<SocialTrackingSettings>({
      queryKey: ['social-tracking-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.SOCIAL_TRACKING.get)
        return response.data.results[0]
      }
    })
  }

  const useUpdateSocialTrackingSettings = () => {
    return useMutation({
      mutationFn: async (data: Partial<SocialTrackingSettings>) => {
        const response = await axiosInstance.patch(
          `${API_ROUTES.ADMIN_SETTINGS.SOCIAL_TRACKING.update}${data.id}/`,
          data,
          { requiresAuth: true } as any
        )
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['social-tracking-settings'] })
        toast.success(t('adminSettings.toasts.socialTrackingUpdated'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to update social tracking settings')
      }
    })
  }

  const useCreateSocialTrackingSettings = () => {
    return useMutation({
      mutationFn: async (data: Omit<SocialTrackingSettings, 'id'>) => {
        const response = await axiosInstance.post(API_ROUTES.ADMIN_SETTINGS.SOCIAL_TRACKING.create, data, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['social-tracking-settings'] })
        toast.success(t('adminSettings.toasts.socialTrackingCreated'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to create social tracking settings')
      }
    })
  }

  const useDeleteSocialTrackingSettings = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.delete(`${API_ROUTES.ADMIN_SETTINGS.SOCIAL_TRACKING.delete}${id}/`, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['social-tracking-settings'] })
        toast.success(t('adminSettings.toasts.socialTrackingDeleted'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete social tracking settings')
      }
    })
  }

  // Social Link Settings
  const useSocialLinkSettings = () => {
    return useQuery<SocialLinkSettings>({
      queryKey: ['social-link-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.SOCIAL_LINKS.get)
        return response.data.results[0]
      }
    })
  }

  const useUpdateSocialLinkSettings = () => {
    return useMutation({
      mutationFn: async ({ id, formData, ...data }: { id: number; formData?: FormData; [key: string]: any }) => {
        const response = await axiosInstance.patch(
          `${API_ROUTES.ADMIN_SETTINGS.SOCIAL_LINKS.update}${id}/`,
          formData || data,
          {
            requiresAuth: true,
            headers: formData
              ? {
                  'Content-Type': 'multipart/form-data'
                }
              : undefined
          } as any
        )
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['social-link-settings'] })
        toast.success(t('adminSettings.toasts.socialLinkUpdated'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to update social links')
      }
    })
  }

  const useCreateSocialLinkSettings = () => {
    return useMutation({
      mutationFn: async (data: Omit<SocialLinkSettings, 'id'>) => {
        const response = await axiosInstance.post(API_ROUTES.ADMIN_SETTINGS.SOCIAL_LINKS.create, data, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['social-link-settings'] })
        toast.success(t('adminSettings.toasts.socialLinkCreated'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to create social link settings')
      }
    })
  }

  const useDeleteSocialLinkSettings = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.delete(`${API_ROUTES.ADMIN_SETTINGS.SOCIAL_LINKS.delete}${id}/`, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['social-link-settings'] })
        toast.success(t('adminSettings.toasts.socialLinkDeleted'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete social link settings')
      }
    })
  }

  // Add SEO hooks
  const useSEOSettings = () => {
    console.log('>>im here')

    const setSeoData = useTemplateStore(state => state.setSeoData)
    return useQuery<SEOSettings>({
      queryKey: ['seo-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.SEO.get)
        setSeoData({
          meta_title: response.data.results[0].meta_title,
          tagline: response.data.results[0].tagline,
          meta_description: response.data.results[0].meta_description,
          seo_keywords: response.data.results[0].seo_keywords
        })
        return response.data.results[0]
      }
    })
  }

  const useUpdateSEOSettings = () => {
    return useMutation({
      mutationFn: async ({ id, ...data }: Partial<SEOSettings>) => {
        const response = await axiosInstance.patch(`${API_ROUTES.ADMIN_SETTINGS.SEO.update}${id}/`, data, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['seo-settings'] })
        toast.success(t('adminSettings.toasts.seoSettingUpdated'))
      }
    })
  }

  const useCreateSEOSettings = () => {
    return useMutation({
      mutationFn: async (data: Omit<SEOSettings, 'id'>) => {
        const response = await axiosInstance.post(API_ROUTES.ADMIN_SETTINGS.SEO.create, data, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['seo-settings'] })
        toast.success(t('adminSettings.toasts.seoSettingCreated'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to create SEO settings')
      }
    })
  }

  const useDeleteSEOSettings = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.delete(`${API_ROUTES.ADMIN_SETTINGS.SEO.delete}${id}/`, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['seo-settings'] })
        toast.success(t('adminSettings.toasts.seoSettingDeleted'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete SEO settings')
      }
    })
  }

  // Footer Settings
  const useFooterSettings = () => {
    return useQuery<FooterSettings>({
      queryKey: ['footer-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.FOOTER.get)
        return response.data.results[0]
      }
    })
  }

  const useUpdateFooterSettings = () => {
    return useMutation({
      mutationFn: async ({ id, ...data }: Partial<FooterSettings>) => {
        try {
          const response = await axiosInstance.patch(`${API_ROUTES.ADMIN_SETTINGS.FOOTER.update}${id}/`, data, {
            requiresAuth: true
          } as any)
          queryClient.invalidateQueries({ queryKey: ['footer-settings'] })
          await queryClient.refetchQueries({ queryKey: ['footer-settings'] })

          toast.success(t('adminSettings.toasts.footerSettingUpdated'))
          return response.data
        } catch (error) {
          toast.error(t('adminSettings.toasts.failedToUpdateFooterSettings'))
          throw error
        }
      }
    })
  }

  const useCreateFooterSettings = () => {
    return useMutation({
      mutationFn: async (data: Omit<FooterSettings, 'id'>) => {
        const response = await axiosInstance.post(API_ROUTES.ADMIN_SETTINGS.FOOTER.create, data, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['footer-settings'] })
        toast.success(t('adminSettings.toasts.footerSettingCreated'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to create footer settings')
      }
    })
  }

  const useDeleteFooterSettings = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.delete(`${API_ROUTES.ADMIN_SETTINGS.FOOTER.delete}${id}/`, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['footer-settings'] })
        toast.success(t('adminSettings.toasts.footerSettingDeleted'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete footer settings')
      }
    })
  }

  // Add these hooks inside useAdminSettingsHook
  const usePayPalSettings = () => {
    return useQuery<PayPalSettings>({
      queryKey: ['paypal-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.PAYPAL.get)
        return response.data.results[0]
      }
    })
  }

  const useUpdatePayPalSettings = () => {
    return useMutation({
      mutationFn: async ({ id, ...data }: Partial<PayPalSettings>) => {
        try {
          const response = await axiosInstance.patch(`${API_ROUTES.ADMIN_SETTINGS.PAYPAL.update}${id}/`, data, {
            requiresAuth: true
          } as any)
          toast.success(t('adminSettings.toasts.paypalSettingUpdated'))
          return response.data
        } catch (error) {
          toast.error(t('adminSettings.toasts.failedToUpdatePayPalSettings'))
          throw error
        }
      }
    })
  }

  const useCreatePayPalSettings = () => {
    return useMutation({
      mutationFn: async (data: Omit<PayPalSettings, 'id'>) => {
        const response = await axiosInstance.post(API_ROUTES.ADMIN_SETTINGS.PAYPAL.create, data, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['paypal-settings'] })
        toast.success(t('adminSettings.toasts.paypalSettingCreated'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to create PayPal settings')
      }
    })
  }

  const useDeletePayPalSettings = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.delete(`${API_ROUTES.ADMIN_SETTINGS.PAYPAL.delete}${id}/`, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['paypal-settings'] })
        toast.success(t('adminSettings.toasts.paypalSettingDeleted'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete PayPal settings')
      }
    })
  }

  // Similar hooks for Stripe and Manual Payment
  const useStripeSettings = () => {
    return useQuery<StripeSettings>({
      queryKey: ['stripe-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.STRIPE.get)
        return response.data.results[0]
      }
    })
  }

  const useUpdateStripeSettings = () => {
    return useMutation({
      mutationFn: async ({ id, ...data }: Partial<StripeSettings>) => {
        try {
          const response = await axiosInstance.patch(`${API_ROUTES.ADMIN_SETTINGS.STRIPE.update}${id}/`, data, {
            requiresAuth: true
          } as any)
          toast.success(t('adminSettings.toasts.stripeSettingUpdated'))
          return response.data
        } catch (error) {
          toast.error(t('adminSettings.toasts.failedToUpdateStripeSettings'))
          throw error
        }
      }
    })
  }

  const useCreateStripeSettings = () => {
    return useMutation({
      mutationFn: async (data: Omit<StripeSettings, 'id'>) => {
        const response = await axiosInstance.post(API_ROUTES.ADMIN_SETTINGS.STRIPE.create, data, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['stripe-settings'] })
        toast.success(t('adminSettings.toasts.stripeSettingCreated'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to create Stripe settings')
      }
    })
  }

  const useDeleteStripeSettings = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.delete(`${API_ROUTES.ADMIN_SETTINGS.STRIPE.delete}${id}/`, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['stripe-settings'] })
        toast.success(t('adminSettings.toasts.stripeSettingDeleted'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete Stripe settings')
      }
    })
  }

  const useManualPaymentSettings = () => {
    return useQuery<ManualPaymentSettings[]>({
      queryKey: ['manual-payment-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.MANUAL_PAYMENT.get)
        return response.data.results
      }
    })
  }

  const useUpdateManualPaymentSettings = () => {
    return useMutation({
      mutationFn: async ({ id, ...data }: Partial<ManualPaymentSettings>) => {
        const response = await axiosInstance.patch(`${API_ROUTES.ADMIN_SETTINGS.MANUAL_PAYMENT.update}${id}/`, data, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['manual-payment-settings'] })
        toast.success(t('adminSettings.toasts.manualPaymentUpdated'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to update manual payment settings')
      }
    })
  }

  const useCreateManualPayment = () => {
    return useMutation({
      mutationFn: async (data: Omit<ManualPaymentSettings, 'id'>) => {
        const response = await axiosInstance.post(API_ROUTES.ADMIN_SETTINGS.MANUAL_PAYMENT.create, data, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['manual-payment-settings'] })
        toast.success(t('adminSettings.toasts.manualPaymentCreated'))
      }
    })
  }

  const useDeleteManualPayment = () => {
    return useMutation({
      mutationFn: async ({ id }: { id: number }) => {
        const response = await axiosInstance.delete(`${API_ROUTES.ADMIN_SETTINGS.MANUAL_PAYMENT.delete}${id}/`, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['manual-payment-settings'] })
        toast.success(t('adminSettings.toasts.manualPaymentDeleted'))
      }
    })
  }

  // Add create and delete hooks for each setting type

  // General Settings
  const useCreateGeneralSettings = () => {
    return useMutation({
      mutationFn: async (data: Omit<GeneralSettings, 'id'>) => {
        const response = await axiosInstance.post(API_ROUTES.ADMIN_SETTINGS.GENERAL.create, data, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['general-settings'] })
        toast.success(t('adminSettings.toasts.generalSettingCreated'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to create general settings')
      }
    })
  }

  const useDeleteGeneralSettings = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.delete(`${API_ROUTES.ADMIN_SETTINGS.GENERAL.delete}${id}/`, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['general-settings'] })
        toast.success(t('adminSettings.toasts.generalSettingDeleted'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete general settings')
      }
    })
  }

  // Logo Settings
  const useCreateLogoSettings = () => {
    return useMutation({
      mutationFn: async (formData: FormData) => {
        const response = await axiosInstance.post(API_ROUTES.ADMIN_SETTINGS.LOGO.create, formData, {
          requiresAuth: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [cacheKeyPrefix] })
        toast.success(t('adminSettings.toasts.logoUploaded'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to upload logo')
      }
    })
  }

  const useDeleteLogoSettings = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.delete(`${API_ROUTES.ADMIN_SETTINGS.LOGO.delete}${id}/`, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [cacheKeyPrefix] })
        toast.success(t('adminSettings.toasts.logoDeleted'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete logo settings')
      }
    })
  }

  // Similar patterns for other settings...
  // Add create and delete hooks for:
  // - Finance Settings
  // - API Token Settings
  // - Social Tracking Settings
  // - Social Link Settings
  // - SEO Settings
  // - Footer Settings
  // - PayPal Settings
  // - Stripe Settings

  const usePaymentSettings = () => {
    return useQuery<PaymentSettings>({
      queryKey: ['payment-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.PAYMENT.get)
        return response.data.results[0]
      }
    })
  }

  const useUpdatePaymentSettings = () => {
    return useMutation({
      mutationFn: async (data: Partial<PaymentSettings>) => {
        const response = await axiosInstance.patch(`${API_ROUTES.ADMIN_SETTINGS.PAYMENT.update}${data.id}/`, data)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['payment-settings'] })
        toast.success(t('adminSettings.toasts.paymentSettingUpdated'))
      }
    })
  }

  // Custom Code Settings
  const useCustomCodeSettings = () => {
    return useQuery<CustomCodeSettings>({
      queryKey: ['custom-code-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.CUSTOM_CODE.get)
        return response.data.results[0]
      }
    })
  }

  const useUpdateCustomCodeSettings = () => {
    return useMutation({
      mutationFn: async (data: Partial<CustomCodeSettings>) => {
        const response = await axiosInstance.patch(`${API_ROUTES.ADMIN_SETTINGS.CUSTOM_CODE.update}${data.id}/`, data, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['custom-code-settings'] })
        toast.success(t('adminSettings.toasts.customCodeUpdated'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to update custom code settings')
      }
    })
  }

  const useCreateCustomCodeSettings = () => {
    return useMutation({
      mutationFn: async (
        data: Omit<CustomCodeSettings, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>
      ) => {
        const response = await axiosInstance.post(API_ROUTES.ADMIN_SETTINGS.CUSTOM_CODE.create, data, {
          requiresAuth: true
        } as any)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['custom-code-settings'] })
        toast.success(t('adminSettings.toasts.customCodeCreated'))
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to create custom code settings')
      }
    })
  }

  return {
    useGeneralSettings,
    useUpdateGeneralSettings,
    useLogoSettings,
    useUpdateLogoSettings,
    useFinanceSettings,
    useUpdateFinanceSettings,
    useCreateFinanceSettings,
    useDeleteFinanceSettings,
    useAPITokenSettings,
    useUpdateAPITokenSettings,
    useCreateAPITokenSettings,
    useDeleteAPITokenSettings,
    useSocialTrackingSettings,
    useUpdateSocialTrackingSettings,
    useCreateSocialTrackingSettings,
    useDeleteSocialTrackingSettings,
    useSocialLinkSettings,
    useUpdateSocialLinkSettings,
    useCreateSocialLinkSettings,
    useDeleteSocialLinkSettings,
    useSEOSettings,
    useUpdateSEOSettings,
    useCreateSEOSettings,
    useDeleteSEOSettings,
    useFooterSettings,
    useUpdateFooterSettings,
    usePayPalSettings,
    useUpdatePayPalSettings,
    useCreatePayPalSettings,
    useDeletePayPalSettings,
    useStripeSettings,
    useUpdateStripeSettings,
    useCreateStripeSettings,
    useDeleteStripeSettings,
    useManualPaymentSettings,
    useUpdateManualPaymentSettings,
    useCreateManualPayment,
    useDeleteManualPayment,
    useCreateGeneralSettings,
    useDeleteGeneralSettings,
    useCreateLogoSettings,
    useDeleteLogoSettings,
    useCreateFooterSettings,
    useDeleteFooterSettings,
    usePaymentSettings,
    useUpdatePaymentSettings,
    useCustomCodeSettings,
    useUpdateCustomCodeSettings,
    useCreateCustomCodeSettings
  }
}
