import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

export const fetchOperator = async (operatorId: number) => {
  try {
    const operator = await axiosInstance
      .get(`${API_ROUTES.TRANSLATION_MODELS.getTranslationModelsById}${operatorId}/`, {
        requiresAuth: true,
        requiredPermission: 'view_translationmodel'
      } as any)
      .then(res => res.data)
    return operator
  } catch (error) {
    console.error('Error fetching user:', error)
    return []
  }
}

export const fetchAllowedUsers = async (userId: number) => {
  try {
    const allowedUser = await axiosInstance
      .get(`/api/users/${userId}/`, {
        requiresAuth: true,
        requiredPermission: 'view_staff'
      } as any)
      .then(res => res.data)
    return allowedUser
  } catch (error) {
    console.error('Error fetching user:', error)
    return []
  }
}

export const fetchAllowedGroups = async (groupId: number) => {
  try {
    const allowedGroups = await axiosInstance
      .get(`${API_ROUTES.GROUPS.LIST}${groupId}/`, {
        requiresAuth: true,
        requiredPermission: 'view_group'
      } as any)
      .then(res => res.data)
    return allowedGroups
  } catch (error) {
    console.error('Error fetching user:', error)
    return []
  }
}

export const fetchAllowedUsersByIds = async (usersIds: number[]) => {
  try {
    const allowedUsersPromises = usersIds.map(id =>
      axiosInstance
        .get(`/api/users/${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_staff'
        } as any)
        .then(res => res.data)
    )
    const allowedUsersData = await Promise.all(allowedUsersPromises)
    return allowedUsersData
  } catch (error) {
    console.error('Error fetching case types:', error)
    return []
  }
}

export const fetchAllowedGroupsByIds = async (groupsIds: number[]) => {
  try {
    const allowedGroupsPromises = groupsIds.map(id =>
      axiosInstance
        .get(`${API_ROUTES.GROUPS.LIST}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_group'
        } as any)
        .then(res => res.data)
    )
    const allowedGroupsData = await Promise.all(allowedGroupsPromises)
    return allowedGroupsData
  } catch (error) {
    console.error('Error fetching case types:', error)
    return []
  }
}
