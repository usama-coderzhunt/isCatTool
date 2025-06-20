// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type { DocumentType, Document, CreateDocumentInput, CreateDocumentTypeInput } from '@/types/documentTypes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import { mapCreateDocumentTypeData, mapCreateDocumentData } from './utility/document'

interface DocumentListResponse {
  results: DocumentType[]
}

interface DocumentResponse {
  results: Document[]
}

export const useDocumentHooks = () => {
  const queryClient = useQueryClient()

  // Document Type Hooks
  const useDocumentTypes = () => {
    return useQuery<DocumentListResponse>({
      queryKey: ['documentTypes'],
      queryFn: () =>
        axiosInstance
          .get<DocumentListResponse>('/api/docs/doc-types/')
          .then((response: AxiosResponse<DocumentListResponse>) => response.data)
    })
  }

  const useCreateDocumentType = () => {
    const mutation = useMutation<DocumentType, AxiosError<ErrorResponse>, CreateDocumentTypeInput>({
      mutationFn: (data: CreateDocumentTypeInput) => {
        const docTypeData = mapCreateDocumentTypeData(data)

        return axiosInstance
          .post<DocumentType>('/api/docs/doc-types/', docTypeData)
          .then((response: AxiosResponse<DocumentType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['documentTypes'] })
        toast.success('Document type created successfully')
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

  // Document Hooks
  const useDocuments = () => {
    return useQuery<DocumentResponse>({
      queryKey: ['documents'],
      queryFn: () =>
        axiosInstance
          .get<DocumentResponse>('/api/docs/')
          .then((response: AxiosResponse<DocumentResponse>) => response.data)
    })
  }

  const useDocument = (id: number) => {
    return useQuery<Document>({
      queryKey: ['documents', id],
      queryFn: () =>
        axiosInstance.get<Document>(`/api/docs/${id}/`).then((response: AxiosResponse<Document>) => response.data)
    })
  }

  const useCreateDocument = () => {
    const mutation = useMutation<Document, AxiosError<ErrorResponse>, CreateDocumentInput>({
      mutationFn: (data: CreateDocumentInput) => {
        const documentData = mapCreateDocumentData(data)

        return axiosInstance
          .post<Document>('/api/docs/', documentData)
          .then((response: AxiosResponse<Document>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['documents'] })
        toast.success('Document created successfully')
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

  const useUpdateDocument = (id: number) => {
    const mutation = useMutation<Document, AxiosError<ErrorResponse>, CreateDocumentInput>({
      mutationFn: (data: CreateDocumentInput) => {
        const documentData = mapCreateDocumentData(data)

        return axiosInstance
          .put<Document>(`/api/docs/${id}/`, documentData)
          .then((response: AxiosResponse<Document>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['documents'] })
        toast.success('Document updated successfully')
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

  const useDeleteDocument = () => {
    const mutation = useMutation<void, AxiosError<ErrorResponse>, number>({
      mutationFn: (id: number) => {
        return axiosInstance.delete(`/api/docs/${id}/`).then((response: AxiosResponse<void>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['documents'] })
        toast.success('Document deleted successfully')
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

  return {
    // Document Type hooks
    useDocumentTypes,
    useCreateDocumentType,

    // Document hooks
    useDocuments,
    useDocument,
    useCreateDocument,
    useUpdateDocument,
    useDeleteDocument
  }
}
