import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

export const fetchTranslationMemory = async (userId: number) => {
  try {
    const user = await axiosInstance
      .get(`${API_ROUTES.TRANSLATION_MEMORY.getTranslationMemoryById}${userId}/`, {
        requiresAuth: true,
        requiredPermission: 'view_translationmemory'
      } as any)
      .then(res => res.data)
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return []
  }
}
