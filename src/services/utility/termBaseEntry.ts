import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

export const fetchTermBase = async (termBaseId: number) => {
  try {
    const termBase = await axiosInstance
      .get(`${API_ROUTES.TERM_BASE.getTermBaseById}${termBaseId}/`, {
        requiresAuth: true,
        requiredPermission: 'view_termbase'
      } as any)
      .then(res => res.data)
    return termBase
  } catch (error) {
    console.error('Error fetching user:', error)
    return []
  }
}
