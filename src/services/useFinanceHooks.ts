// React Imports
import { useQuery } from '@tanstack/react-query'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

export const useFinanceHooks = () => {
  const getFinance = () => {
    return useQuery({
      queryKey: ['finance'],
      queryFn: () => {
        return axiosInstance.get(API_ROUTES.ADMIN_SETTINGS.FINANCE.get, {
          requiresAuth: true
        } as any)
      }
    })
  }

  const getFinanceById = (id: number) => {
    return useQuery({
      queryKey: ['finance', id],
      queryFn: async () => {
        const response = await axiosInstance.get(`${API_ROUTES.ADMIN_SETTINGS.FINANCE.get}${id}/`, {
          requiresAuth: true
        } as any)
        return response.data
      },
      enabled: !!id
    })
  }

  return {
    getFinance,
    getFinanceById
  }
}
