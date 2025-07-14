import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

export const fetchUser = async (userId: number) => {
  try {
    const user = await axiosInstance
      .get(`${API_ROUTES.USER_MANAGEMENT.getUsers}${userId}/`, {
        requiresAuth: true,
        requiredPermission: 'view_staff'
      } as any)
      .then(res => res.data)
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return []
  }
}
