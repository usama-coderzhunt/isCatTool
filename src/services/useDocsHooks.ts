// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Axios Import
import type { AxiosError } from 'axios'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'
// Types Import
import type { ErrorResponse } from '@/types/type'
import { CreateDocumentInput } from '@/types/documentTypes'

// Utility Import
import { mapCreateDocumentData } from './utility/document'
import { cleanApiParams } from '@/utils/utility/paramsUtils'

export const useDocsHooks = () => {
  const queryClient = useQueryClient()

  const useCreateDocument = () => {
    const mutation = useMutation({
      mutationFn: (data: any) => {
        const documentData = mapCreateDocumentData(data)

        return axiosInstance.post(API_ROUTES.DOCUMENT.createDocument, documentData, {
          requiresAuth: true,
          requiredPermission: 'add_document',
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['docs'] })
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

  const getDocs = (pageSize: number, page: number, ordering?: string, search?: string, clientId?: number) => {
    return useQuery({
      queryKey: ['docs', page, pageSize, ordering, search, clientId],
      queryFn: () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          ordering,
          note: search,
          client_id: clientId
        })
        return axiosInstance.get(API_ROUTES.DOCUMENT.getDocuments, {
          params,
          requiresAuth: true,
          requiredPermission: 'view_document'
        } as any)
      }
    })
  }

  const getSingleDocument = (id: number) => {
    const result = useQuery({
      queryKey: ['singleDoc', id],
      queryFn: () => {
        const response = axiosInstance.get(`${API_ROUTES.DOCUMENT.viewDocument}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_document'
        } as any)
        return response
      }
    })
    return {
      data: result.data?.data,
      error: result.error,
      isLoading: result.isPending,
      isSuccess: result.isSuccess,
      isError: result.isError
    }
  }

  const useDeleteDocument = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.DOCUMENT.deleteDocument}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_document'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['docs'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete case')
      }
    })
  }

  const useBulkDeleteDocuments = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.DOCUMENT.deleteDocument}bulk_delete/`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'delete_document'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['docs'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete documents')
      }
    })
  }

  const useUpdateDocument = () => {
    const mutation = useMutation({
      mutationFn: (data: { id: number } & CreateDocumentInput) => {
        const { id, ...updateData } = data
        const formData = new FormData()

        // Append all fields to FormData
        Object.entries(updateData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(item => formData.append(key, item))
            } else if (value instanceof File) {
              formData.append(key, value)
            } else {
              formData.append(key, value.toString())
            }
          }
        })

        return axiosInstance.patch(`${API_ROUTES.DOCUMENT.updateDocument}${id}/`, formData, {
          requiresAuth: true,
          requiredPermission: 'change_document',
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        } as any)
      },
      onSuccess: (response, variables) => {
        queryClient.invalidateQueries({ queryKey: ['docs'] })
        queryClient.invalidateQueries({ queryKey: ['singleDoc', variables.id] })
        queryClient.setQueryData(['singleDoc', variables.id], response)
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

  // Docs Type Hooks

  const useCreateDocumentType = () => {
    const mutation = useMutation({
      mutationFn: (name: string) => {
        return axiosInstance.post(API_ROUTES.DOCUMENT_TYPES.createDocumentType, { name }, {
          requiresAuth: true,
          requiredPermission: 'add_documenttype'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['docsType'] })
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

  const useUpdateDocumentType = (id: number | null) => {
    const mutation = useMutation({
      mutationFn: (name: string) => {
        return axiosInstance.put(API_ROUTES.DOCUMENT_TYPES.updateDocumentType(id), { name }, {
          requiresAuth: true,
          requiredPermission: 'change_documenttype'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['docsType'] })
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

  const getDocsType = (pageSize: number, page: number, search?: string, ordering?: string) => {
    return useQuery({
      queryKey: ['docsType', page, pageSize, search, ordering],
      queryFn: () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          search,
          ordering
        })
        return axiosInstance.get(API_ROUTES.DOCUMENT_TYPES.getDocumentTypes, {
          params,
          requiresAuth: true,
          requiredPermission: 'view_documenttype'
        } as any)
      }
    })
  }

  const deleteDocType = (id: number | null) => {
    return useMutation({
      mutationFn: () =>
        axiosInstance.delete(API_ROUTES.DOCUMENT_TYPES.deleteDocumentType(id), {
          requiresAuth: true,
          requiredPermission: 'delete_documenttype'
        } as any),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['docsType'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.'
        toast.error(errorMessage)
      }
    })
  }

  const deleteDocTypeBulk = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.DOCUMENT_TYPES.bulkDelete}`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'delete_documenttype'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['docsType'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.'
        toast.error(errorMessage)
      }
    })
  }

  return {
    useCreateDocument,
    getDocs,
    getSingleDocument,
    useDeleteDocument,
    useBulkDeleteDocuments,
    useUpdateDocument,

    // Docs Type Hooks
    useCreateDocumentType,
    useUpdateDocumentType,
    getDocsType,
    deleteDocType,
    deleteDocTypeBulk
  }
}
