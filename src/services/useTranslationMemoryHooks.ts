import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Axios Import
import type { AxiosError } from 'axios'

// Types Import
import type { ErrorResponse } from '@/types/type'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

// Utility Import
import { cleanApiParams } from '@/utils/utility/paramsUtils'
import { TranslationMemoryTypes } from '@/types/translationMemoryTypes'
import { TranslationMemoryEntriesTypes } from '@/types/traslationMemoryEnntriesTypes'

export const useTranslationMemoryHooks = () => {
  const queryClient = useQueryClient()

  const useCreateTranslationMemory = () => {
    const mutation = useMutation({
      mutationFn: async (translationMemoryData: Partial<TranslationMemoryTypes>) => {
        return await axiosInstance.post(API_ROUTES.TRANSLATION_MEMORY.createTranslationMemory, translationMemoryData, {
          requiresAuth: true,
          requiredPermission: 'add_translationmemory'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['translationMemory'] })
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

  const useEditTranslationMemory = () => {
    const mutation = useMutation({
      mutationFn: async (translationMemoryData: Partial<TranslationMemoryTypes & { id: number | undefined }>) => {
        return await axiosInstance.patch(
          `${API_ROUTES.TRANSLATION_MEMORY.editTranslationMemory}${translationMemoryData?.id}/`,
          translationMemoryData,
          {
            requiresAuth: true,
            requiredPermission: 'change_translationmemory'
          } as any
        )
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['translationMemory'] })
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

  const getTranslationMemory = (pageSize?: number, page?: number, search?: string, ordering?: string) => {
    return useQuery({
      queryKey: ['translationMemory', pageSize, page, search, ordering],
      queryFn: () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          search,
          ordering
        })
        return axiosInstance.get(API_ROUTES.TRANSLATION_MEMORY.getTranslationMemory, {
          params,
          requiresAuth: true,
          requiredPermission: 'view_translationmemory'
        } as any)
      }
    })
  }

  const getTranslationMemoryById = (id: number) => {
    return useQuery({
      queryKey: ['translationMemory', id],
      queryFn: async () => {
        const response = await axiosInstance.get(`${API_ROUTES.TRANSLATION_MEMORY.getTranslationMemory}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_translationmemory'
        } as any)
        return response.data
      },
      enabled: !!id
    })
  }

  const useDeleteTranslationMemory = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.TRANSLATION_MEMORY.deleteTranslationMemory}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_translationmemory'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['translationMemory'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete translation memory')
      }
    })
  }

  const useBulkDeleteTranslationMemory = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.TRANSLATION_MEMORY.bulkDeleteTranslationMemory}`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'delete_translationmemory'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['translationMemory'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.error || 'Failed to delete translation memories')
      }
    })
  }

  const useExportTranslationMemory = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.get(API_ROUTES.TRANSLATION_MEMORY.exportTranslationMemory(id), {
          requiresAuth: true,
          requiredPermission: 'export_tm',
          responseType: 'blob'
        } as any)

        const blob = new Blob([response.data], {
          type: response.headers['content-type'] || 'application/octet-stream'
        })

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url

        const contentDisposition = response.headers['content-disposition']
        let filename = 'translation_memory_export'

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '')
          }
        }

        if (!filename.includes('.')) {
          filename += '.tmx'
        }

        link.download = filename
        document.body.appendChild(link)
        link.click()

        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        return response
      }
    })
  }

  const useImportTranslationMemory = () => {
    return useMutation({
      mutationFn: async (importData: {
        translation_memory: number
        file: File
        source_lang: string
        target_lang: string
      }) => {
        const formData = new FormData()
        formData.append('translation_memory', importData.translation_memory.toString())
        formData.append('file', importData.file)
        formData.append('source_lang', importData.source_lang)
        formData.append('target_lang', importData.target_lang)

        return axiosInstance.post(
          API_ROUTES.TRANSLATION_MEMORY.importTranslationMemory(importData.translation_memory),
          formData,
          {
            requiresAuth: true,
            requiredPermission: 'import_tm',
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          } as any
        )
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['translationMemory'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to import translation memory')
      }
    })
  }

  // Translation Memory Entries

  const useCreateTranslationMemoryEntry = () => {
    const mutation = useMutation({
      mutationFn: async (translationMemoryEntryData: Partial<TranslationMemoryEntriesTypes>) => {
        return await axiosInstance.post(API_ROUTES.TRANSLATION_MEMORY_ENTRIES.createEntry, translationMemoryEntryData, {
          requiresAuth: true,
          requiredPermission: 'add_translationmemoryentry'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['translationMemoryEntries'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'An unexpected error occurred.'
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

  const useEditTranslationMemoryEntry = () => {
    const mutation = useMutation({
      mutationFn: async (
        translationMemoryEntryData: Partial<TranslationMemoryEntriesTypes & { id: number | undefined }>
      ) => {
        return await axiosInstance.patch(
          `${API_ROUTES.TRANSLATION_MEMORY_ENTRIES.editEntry}${translationMemoryEntryData?.id}/`,
          translationMemoryEntryData,
          {
            requiresAuth: true,
            requiredPermission: 'change_translationmemoryentry'
          } as any
        )
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['translationMemoryEntries'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'An unexpected error occurred.'
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

  const getTranslationMemoryEntries = (
    tmID?: number,
    pageSize?: number,
    page?: number,
    search?: string,
    ordering?: string
  ) => {
    return useQuery({
      queryKey: ['translationMemoryEntries', tmID, pageSize, page, search, ordering],
      queryFn: () => {
        const params = cleanApiParams({
          tm_id: tmID,
          page,
          page_size: pageSize,
          search,
          ordering
        })
        return axiosInstance.get(API_ROUTES.TRANSLATION_MEMORY_ENTRIES.getEntries, {
          params,
          requiresAuth: true,
          requiredPermission: 'view_translationmemoryentry'
        } as any)
      }
    })
  }

  const getTranslationMemoryEntryById = (id: number) => {
    return useQuery({
      queryKey: ['translationMemoryEntry', id],
      queryFn: async () => {
        const response = await axiosInstance.get(`${API_ROUTES.TRANSLATION_MEMORY_ENTRIES.getEntryById}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_translationmemoryentry'
        } as any)
        return response.data
      },
      enabled: !!id
    })
  }

  const useDeleteTranslationMemoryEntry = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.TRANSLATION_MEMORY_ENTRIES.deleteEntry}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_translationmemoryentry'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['translationMemoryEntries'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(
          error.response?.data?.message || error.response?.data?.error || 'Failed to delete translation memory entry'
        )
      }
    })
  }

  const useBulkDeleteTranslationMemoryEntries = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.TRANSLATION_MEMORY_ENTRIES.bulkDeleteEntries}`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'delete_translationmemoryentry'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['translationMemoryEntries'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.error || 'Failed to delete translation memories entries')
      }
    })
  }

  return {
    // Translation Memory Hooks
    useCreateTranslationMemory,
    useEditTranslationMemory,
    getTranslationMemory,
    getTranslationMemoryById,
    useDeleteTranslationMemory,
    useBulkDeleteTranslationMemory,
    useExportTranslationMemory,
    useImportTranslationMemory,
    // Translation Memory Entries Hooks
    useCreateTranslationMemoryEntry,
    useEditTranslationMemoryEntry,
    getTranslationMemoryEntries,
    getTranslationMemoryEntryById,
    useDeleteTranslationMemoryEntry,
    useBulkDeleteTranslationMemoryEntries
  }
}
