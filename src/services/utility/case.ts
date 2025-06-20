import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

export const fetchCaseTypesByIds = async (typeIds: number[]) => {
  try {
    const typePromises = typeIds.map(id =>
      axiosInstance
        .get(`${API_ROUTES.CASES.getCaseTypes}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_casetype'
        } as any)
        .then(res => res.data)
    )
    const typesData = await Promise.all(typePromises)
    return typesData
  } catch (error) {
    console.error('Error fetching case types:', error)
    return []
  }
}

export const fetchClientsByIds = async (clientsIds: number[]) => {
  try {
    const clientsPromises = clientsIds.map(id =>
      axiosInstance
        .get(`${API_ROUTES.LAWYER_CLIENTS.getLawyerClients}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_client'
        } as any)
        .then(res => res.data)
    )
    const clientsData = await Promise.all(clientsPromises)
    return clientsData
  } catch (error) {
    console.error('Error fetching clients:', error)
    return []
  }
}

// Fetch staffs when editing
export const fetchStaffsByIds = async (staffsIds: number[]) => {
  try {
    const staffsPromises = staffsIds.map(id =>
      axiosInstance
        .get(`${API_ROUTES.STAFF.getStaff}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_staff'
        } as any)
        .then(res => res.data)
    )
    const staffsData = await Promise.all(staffsPromises)
    return staffsData
  } catch (error) {
    console.error('Error fetching staffs:', error)
    return []
  }
}
