import type { CreateDocumentTypeInput, CreateDocumentInput } from '@/types/documentTypes'
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

export const mapCreateDocumentTypeData = (data: CreateDocumentTypeInput) => ({
  ...data
})

export const mapCreateDocumentData = (data: CreateDocumentInput) => ({
  ...data
})

export const fetchCasesByIds = async (casesIds: number[]) => {
  if (!casesIds?.length) {
    return []
  }

  try {
    const casesPromises = casesIds.map(id =>
      axiosInstance
        .get(`${API_ROUTES.CASES.getCases}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_case'
        } as any)
        .then(res => res.data)
    )
    const casesData = await Promise.all(casesPromises)
    return casesData
  } catch (error) {
    console.error('Error fetching cases:', error)
    return []
  }
}

export const fetchDocumentType = async (documentTypeId: number) => {
  try {
    const documentType = await axiosInstance
      .get(`${API_ROUTES.DOCUMENT_TYPES.getDocumentTypes}${documentTypeId}/`, {
        requiresAuth: true,
        requiredPermission: 'view_doctypes'
      } as any)
      .then(res => res.data)
    return documentType
  } catch (error) {
    console.error('Error fetching document type:', error)
    return []
  }
}
