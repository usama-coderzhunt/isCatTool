// React Imports
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '@/types/type';
import axiosInstance from '@/utils/api/axiosInstance';
import { API_ROUTES } from '@/utils/constants/apiRoutes';
import { GeneralSettings, LogoSettings, FinanceSettings, APITokenSettings, SocialTrackingSettings, SocialLinkSettings, SEOSettings, FooterSettings, PayPalSettings, StripeSettings, ManualPaymentSettings } from '@/types/adminSettingsTypes';


// Hook for managing admin settings
export const useAdminSettingsHook = (component?: 'left' | 'right') => {
  const queryClient = useQueryClient();
  const cacheKeyPrefix = component ? `logo-settings-${component}` : 'logo-settings';

  // General Settings
  const useGeneralSettings = () => {
    return useQuery<GeneralSettings>({
      queryKey: ['general-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.GENERAL.get
        )
        return response.data.results[0];
      },
    });
  };

  const useUpdateGeneralSettings = () => {
    return useMutation({
      mutationFn: async (data: Partial<GeneralSettings>) => {
        const response = await axiosInstance.patch(
          `${API_ROUTES.ADMIN_SETTINGS.GENERAL.update}${data.id}/`,
          data,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['general-settings'] });
        toast.success('General settings updated successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to update general settings');
      },
    });
  };

  // Logo Settings
  const useLogoSettings = () => {
    return useQuery<LogoSettings>({
      queryKey: [cacheKeyPrefix],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.LOGO.get)
        return response.data.results[0];
      },
    });
  };

  const useUpdateLogoSettings = () => {
    return useMutation({
      mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
        const response = await axiosInstance.patch(
          `${API_ROUTES.ADMIN_SETTINGS.LOGO?.update}${id}/`,
          formData,
          {
            requiresAuth: true,
            headers: { 
              'Content-Type': 'multipart/form-data',
            },
          } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['logo-settings'] });
        queryClient.invalidateQueries({ queryKey: ['logo-settings-left'] });
        queryClient.invalidateQueries({ queryKey: ['logo-settings-right'] });
        
        queryClient.refetchQueries({ 
          queryKey: ['logo-settings'],
          type: 'active'
        });
        queryClient.refetchQueries({ 
          queryKey: ['logo-settings-left'],
          type: 'active'
        });
        queryClient.refetchQueries({ 
          queryKey: ['logo-settings-right'],
          type: 'active'
        });
        
        toast.success('Logo updated successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        console.error("Upload error:", error);
        toast.error(error.response?.data?.message || 'Failed to update logo');
      },
    });
  };

  // Finance Settings
  const useFinanceSettings = () => {
    return useQuery<FinanceSettings>({
      queryKey: ['finance-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.FINANCE.get)
        return response.data.results[0];
      },
    });
  };

  const useUpdateFinanceSettings = () => {
    return useMutation({
      mutationFn: async ({ id, ...data }: Partial<FinanceSettings>) => {
        const response = await axiosInstance.patch(
          `${API_ROUTES.ADMIN_SETTINGS.FINANCE.update}${id}/`,
          data,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['finance-settings'] });
        toast.success('Finance settings updated successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to update finance settings');
      },
    });
  };

  const useCreateFinanceSettings = () => {
    return useMutation({
      mutationFn: async (data: Omit<FinanceSettings, 'id'>) => {
        const response = await axiosInstance.post(
          API_ROUTES.ADMIN_SETTINGS.FINANCE.create,
          data,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['finance-settings'] });
        toast.success('Finance settings created successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to create finance settings');
      },
    });
  };

  const useDeleteFinanceSettings = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.delete(
          `${API_ROUTES.ADMIN_SETTINGS.FINANCE.delete}${id}/`,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['finance-settings'] });
        toast.success('Finance settings deleted successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete finance settings');
      },
    });
  };

  // API Token Settings
  const useAPITokenSettings = () => {
    return useQuery<APITokenSettings>({
      queryKey: ['api-token-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.API_TOKENS.get)
        return response.data.results[0];
      },
    });
  };

  const useUpdateAPITokenSettings = () => {
    return useMutation({
      mutationFn: async (data: Partial<APITokenSettings>) => {
        const response = await axiosInstance.patch(
          `${API_ROUTES.ADMIN_SETTINGS.API_TOKENS.update}${data.id}/`,
          data,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['api-token-settings'] });
        toast.success('API token settings updated successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to update API token settings');
      },
    });
  };

  const useCreateAPITokenSettings = () => {
    return useMutation({
      mutationFn: async (data: Omit<APITokenSettings, 'id'>) => {
        const response = await axiosInstance.post(
          API_ROUTES.ADMIN_SETTINGS.API_TOKENS.create,
          data,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['api-token-settings'] });
        toast.success('API token settings created successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to create API token settings');
      },
    });
  };

  const useDeleteAPITokenSettings = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.delete(
          `${API_ROUTES.ADMIN_SETTINGS.API_TOKENS.delete}${id}/`,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['api-token-settings'] });
        toast.success('API token settings deleted successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete API token settings');
      },
    });
  };

  // Social Tracking Settings
  const useSocialTrackingSettings = () => {
    return useQuery<SocialTrackingSettings>({
      queryKey: ['social-tracking-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.SOCIAL_TRACKING.get)
        return response.data.results[0];
      },
    });
  };

  const useUpdateSocialTrackingSettings = () => {
    return useMutation({
      mutationFn: async (data: Partial<SocialTrackingSettings>) => {
        const response = await axiosInstance.patch(
          `${API_ROUTES.ADMIN_SETTINGS.SOCIAL_TRACKING.update}${data.id}/`,
          data,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['social-tracking-settings'] });
        toast.success('Social tracking settings updated successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to update social tracking settings');
      },
    });
  };

  const useCreateSocialTrackingSettings = () => {
    return useMutation({
      mutationFn: async (data: Omit<SocialTrackingSettings, 'id'>) => {
        const response = await axiosInstance.post(
          API_ROUTES.ADMIN_SETTINGS.SOCIAL_TRACKING.create,
          data,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['social-tracking-settings'] });
        toast.success('Social tracking settings created successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to create social tracking settings');
      },
    });
  };

  const useDeleteSocialTrackingSettings = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.delete(
          `${API_ROUTES.ADMIN_SETTINGS.SOCIAL_TRACKING.delete}${id}/`,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['social-tracking-settings'] });
        toast.success('Social tracking settings deleted successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete social tracking settings');
      },
    });
  };

  // Social Link Settings
  const useSocialLinkSettings = () => {
    return useQuery<SocialLinkSettings>({
      queryKey: ['social-link-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.SOCIAL_LINKS.get)
        return response.data.results[0];
      },
    });
  };

  const useUpdateSocialLinkSettings = () => {
    return useMutation({
      mutationFn: async ({ id, formData, ...data }: { 
        id: number; 
        formData?: FormData; 
        [key: string]: any 
      }) => {
        const response = await axiosInstance.patch(
          `${API_ROUTES.ADMIN_SETTINGS.SOCIAL_LINKS.update}${id}/`,
          formData || data,
          { 
            requiresAuth: true,
            headers: formData ? {
              'Content-Type': 'multipart/form-data',
            } : undefined
          } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['social-link-settings'] });
        toast.success('Social links updated successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to update social links');
      },
    });
  };

  const useCreateSocialLinkSettings = () => {
    return useMutation({
      mutationFn: async (data: Omit<SocialLinkSettings, 'id'>) => {
        const response = await axiosInstance.post(
          API_ROUTES.ADMIN_SETTINGS.SOCIAL_LINKS.create,
          data,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['social-link-settings'] });
        toast.success('Social link settings created successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to create social link settings');
      },
    });
  };

  const useDeleteSocialLinkSettings = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.delete(
          `${API_ROUTES.ADMIN_SETTINGS.SOCIAL_LINKS.delete}${id}/`,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['social-link-settings'] });
        toast.success('Social link settings deleted successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete social link settings');
      },
    });
  };

  // Add SEO hooks
  const useSEOSettings = () => {
    return useQuery<SEOSettings>({
      queryKey: ['seo-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.SEO.get)
        return response.data.results[0];
      },
    });
  };

  const useUpdateSEOSettings = () => {
    return useMutation({
      mutationFn: async ({ id, ...data }: Partial<SEOSettings>) => {
        const response = await axiosInstance.patch(
          `${API_ROUTES.ADMIN_SETTINGS.SEO.update}${id}/`,
          data,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['seo-settings'] });
        toast.success('SEO settings updated successfully');
      },
    });
  };

  const useCreateSEOSettings = () => {
    return useMutation({
      mutationFn: async (data: Omit<SEOSettings, 'id'>) => {
        const response = await axiosInstance.post(
          API_ROUTES.ADMIN_SETTINGS.SEO.create,
          data,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['seo-settings'] });
        toast.success('SEO settings created successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to create SEO settings');
      },
    });
  };

  const useDeleteSEOSettings = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.delete(
          `${API_ROUTES.ADMIN_SETTINGS.SEO.delete}${id}/`,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['seo-settings'] });
        toast.success('SEO settings deleted successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete SEO settings');
      },
    });
  };

  // Footer Settings
  const useFooterSettings = () => {
    return useQuery<FooterSettings>({
      queryKey: ['footer-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.FOOTER.get)
        return response.data.results[0];
      },
    });
  };

  const useUpdateFooterSettings = () => {
    return useMutation({
      mutationFn: async ({ id, ...data }: Partial<FooterSettings>) => {
        try {
          const response = await axiosInstance.patch(
            `${API_ROUTES.ADMIN_SETTINGS.FOOTER.update}${id}/`,
            data,
            { requiresAuth: true } as any
          );
          queryClient.invalidateQueries({ queryKey: ['footer-settings'] });
          await queryClient.refetchQueries({ queryKey: ['footer-settings'] });
          
          toast.success('Footer settings updated successfully');
          return response.data;
        } catch (error) {
          toast.error('Failed to update footer settings');
          throw error;
        }
      }
    });
  };

  const useCreateFooterSettings = () => {
    return useMutation({
      mutationFn: async (data: Omit<FooterSettings, 'id'>) => {
        const response = await axiosInstance.post(
          API_ROUTES.ADMIN_SETTINGS.FOOTER.create,
          data,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['footer-settings'] });
        toast.success('Footer settings created successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to create footer settings');
      },
    });
  };

  const useDeleteFooterSettings = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.delete(
          `${API_ROUTES.ADMIN_SETTINGS.FOOTER.delete}${id}/`,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['footer-settings'] });
        toast.success('Footer settings deleted successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete footer settings');
      },
    });
  };

  // Add these hooks inside useAdminSettingsHook
  const usePayPalSettings = () => {
    return useQuery<PayPalSettings>({
      queryKey: ['paypal-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.PAYPAL.get)
        return response.data.results[0];
      },
    });
  };

  const useUpdatePayPalSettings = () => {
    return useMutation({
      mutationFn: async ({ id, ...data }: Partial<PayPalSettings>) => {
        try {
          const response = await axiosInstance.patch(
            `${API_ROUTES.ADMIN_SETTINGS.PAYPAL.update}${id}/`,
            data,
            { requiresAuth: true } as any
          );
          toast.success('PayPal settings updated successfully');
          return response.data;
        } catch (error) {
          toast.error('Failed to update PayPal settings');
          throw error;
        }
      },
    });
  };

  const useCreatePayPalSettings = () => {
    return useMutation({
      mutationFn: async (data: Omit<PayPalSettings, 'id'>) => {
        const response = await axiosInstance.post(
          API_ROUTES.ADMIN_SETTINGS.PAYPAL.create,
          data,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['paypal-settings'] });
        toast.success('PayPal settings created successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to create PayPal settings');
      },
    });
  };

  const useDeletePayPalSettings = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.delete(
          `${API_ROUTES.ADMIN_SETTINGS.PAYPAL.delete}${id}/`,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['paypal-settings'] });
        toast.success('PayPal settings deleted successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete PayPal settings');
      },
    });
  };

  // Similar hooks for Stripe and Manual Payment
  const useStripeSettings = () => {
    return useQuery<StripeSettings>({
      queryKey: ['stripe-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.STRIPE.get)
        return response.data.results[0];
      },
    });
  };

  const useUpdateStripeSettings = () => {
    return useMutation({
      mutationFn: async ({ id, ...data }: Partial<StripeSettings>) => {
        try {
          const response = await axiosInstance.patch(
            `${API_ROUTES.ADMIN_SETTINGS.STRIPE.update}${id}/`,
            data,
            { requiresAuth: true } as any
          );
          toast.success('Stripe settings updated successfully');
          return response.data;
        } catch (error) {
          toast.error('Failed to update Stripe settings');
          throw error;
        }
      },
    });
  };

  const useCreateStripeSettings = () => {
    return useMutation({
      mutationFn: async (data: Omit<StripeSettings, 'id'>) => {
        const response = await axiosInstance.post(
          API_ROUTES.ADMIN_SETTINGS.STRIPE.create,
          data,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['stripe-settings'] });
        toast.success('Stripe settings created successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to create Stripe settings');
      },
    });
  };

  const useDeleteStripeSettings = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.delete(
          `${API_ROUTES.ADMIN_SETTINGS.STRIPE.delete}${id}/`,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['stripe-settings'] });
        toast.success('Stripe settings deleted successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete Stripe settings');
      },
    });
  };

  const useManualPaymentSettings = () => {
    return useQuery<ManualPaymentSettings[]>({
      queryKey: ['manual-payment-settings'],
      queryFn: async () => {
        const response = await axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.MANUAL_PAYMENT.get)
        return response.data.results;
      },
    });
  };

  const useUpdateManualPaymentSettings = () => {
    return useMutation({
      mutationFn: async ({ id, ...data }: Partial<ManualPaymentSettings>) => {
        const response = await axiosInstance.patch(
          `${API_ROUTES.ADMIN_SETTINGS.MANUAL_PAYMENT.update}${id}/`,
          data,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['manual-payment-settings'] });
        toast.success('Manual payment settings updated successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to update manual payment settings');
      },
    });
  };

  const useCreateManualPayment = () => {
    return useMutation({
      mutationFn: async (data: Omit<ManualPaymentSettings, 'id'>) => {
        const response = await axiosInstance.post(
          API_ROUTES.ADMIN_SETTINGS.MANUAL_PAYMENT.create,
          data,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['manual-payment-settings'] });
        toast.success('Manual payment method created successfully');
      },
    });
  };

  const useDeleteManualPayment = () => {
    return useMutation({
      mutationFn: async ({ id }: { id: number }) => {
        const response = await axiosInstance.delete(
          `${API_ROUTES.ADMIN_SETTINGS.MANUAL_PAYMENT.delete}${id}/`,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['manual-payment-settings'] });
        toast.success('Manual payment method deleted successfully');
      },
    });
  };

  // Add create and delete hooks for each setting type
  
  // General Settings
  const useCreateGeneralSettings = () => {
    return useMutation({
      mutationFn: async (data: Omit<GeneralSettings, 'id'>) => {
        const response = await axiosInstance.post(
          API_ROUTES.ADMIN_SETTINGS.GENERAL.create,
          data,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['general-settings'] });
        toast.success('General settings created successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to create general settings');
      },
    });
  };

  const useDeleteGeneralSettings = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.delete(
          `${API_ROUTES.ADMIN_SETTINGS.GENERAL.delete}${id}/`,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['general-settings'] });
        toast.success('General settings deleted successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete general settings');
      },
    });
  };

  // Logo Settings
  const useCreateLogoSettings = () => {
    return useMutation({
      mutationFn: async (formData: FormData) => {
        const response = await axiosInstance.post(
          API_ROUTES.ADMIN_SETTINGS.LOGO.create,
          formData,
          {
            requiresAuth: true,
            headers: { 'Content-Type': 'multipart/form-data' },
          } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [cacheKeyPrefix] });
        toast.success('Logo uploaded successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to upload logo');
      },
    });
  };

  const useDeleteLogoSettings = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.delete(
          `${API_ROUTES.ADMIN_SETTINGS.LOGO.delete}${id}/`,
          { requiresAuth: true } as any
        );
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [cacheKeyPrefix] });
        toast.success('Logo settings deleted successfully');
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete logo settings');
      },
    });
  };

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
  };
}; 
