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
import { TermBaseTypes } from '@/types/termBaseTypes'
import { TermBaseEntriesTypes } from '@/types/termBaseEntriesTypes'

export const useTermBaseHooks = () => {
  const queryClient = useQueryClient()

  const useCreateTermBase = () => {
    const mutation = useMutation({
      mutationFn: async (termBaseData: Partial<TermBaseTypes>) => {
        return await axiosInstance.post(API_ROUTES.TERM_BASE.createTermBase, termBaseData, {
          requiresAuth: true,
          requiredPermission: 'add_termbase'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['termBases'] })
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

  const useEditTermBase = () => {
    const mutation = useMutation({
      mutationFn: async (termBaseData: Partial<TermBaseTypes & { id: number | undefined }>) => {
        return await axiosInstance.patch(`${API_ROUTES.TERM_BASE.editTermBase}${termBaseData?.id}/`, termBaseData, {
          requiresAuth: true,
          requiredPermission: 'change_termbase'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['termBases'] })
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

  const getTermBase = (pageSize?: number, page?: number, search?: string, ordering?: string) => {
    return useQuery({
      queryKey: ['termBases', pageSize, page, search, ordering],
      queryFn: () => {
        const params = cleanApiParams({
          page,
          page_size: pageSize,
          search,
          ordering
        })
        return axiosInstance.get(API_ROUTES.TERM_BASE.getTermBase, {
          params,
          requiresAuth: true,
          requiredPermission: 'view_termbase'
        } as any)
      }
    })
  }

  const getTermBaseById = (id: number) => {
    return useQuery({
      queryKey: ['termBase', id],
      queryFn: async () => {
        const response = await axiosInstance.get(`${API_ROUTES.TERM_BASE.getTermBaseById}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_termbase'
        } as any)
        return response.data
      },
      enabled: !!id
    })
  }

  const useDeleteTermBase = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.TERM_BASE.deleteTermBase}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_termbase'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['termBases'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to delete term base')
      }
    })
  }

  const useBulkDeleteTermBases = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.TERM_BASE.bulkDeleteTermBase}`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'delete_termbase'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['termBases'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.error || 'Failed to delete translation bases')
      }
    })
  }

  const useExportTermBase = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await axiosInstance.get(API_ROUTES.TERM_BASE.exportTermBase(id), {
          requiresAuth: true,
          requiredPermission: 'export_tb',
          responseType: 'blob'
        } as any)

        const blob = new Blob([response.data], {
          type: response.headers['content-type'] || 'application/octet-stream'
        })

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url

        const contentDisposition = response.headers['content-disposition']
        let filename = 'term_base_export'

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '')
          }
        }

        // Get term base name for filename
        try {
          const termBaseResponse = await axiosInstance.get(`${API_ROUTES.TERM_BASE.getTermBaseById}${id}/`, {
            requiresAuth: true,
            requiredPermission: 'view_termbase'
          } as any)
          const termBaseName = termBaseResponse.data.name
          if (termBaseName) {
            filename = termBaseName.replace(/[^a-zA-Z0-9\s-]/g, '_').replace(/\s+/g, '_')
          }
        } catch (error) {
          console.warn('Could not fetch term base name for filename, using default')
        }

        if (!filename.includes('.')) {
          filename += '.csv'
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

  const useImportTermBase = (id: number) => {
    return useMutation({
      mutationFn: async (importData: { file: File }) => {
        const formData = new FormData()
        formData.append('file', importData.file)

        return axiosInstance.post(API_ROUTES.TERM_BASE.importTermBase(id), formData, {
          requiresAuth: true,
          requiredPermission: 'import_tb',
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['termBases'] })
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || 'Failed to import term base')
      }
    })
  }

  // Term Base Entries

  const useCreateTermBaseEntry = () => {
    const mutation = useMutation({
      mutationFn: async (translationMemoryEntryData: Partial<TermBaseEntriesTypes>) => {
        return await axiosInstance.post(API_ROUTES.TERM_BASE_ENTRIES.createTermBaseEntry, translationMemoryEntryData, {
          requiresAuth: true,
          requiredPermission: 'add_termbaseentry'
        } as any)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['termBaseEntries'] })
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

  const useEditTermBaseEntry = () => {
    const mutation = useMutation({
      mutationFn: async (translationMemoryEntryData: Partial<TermBaseEntriesTypes & { id: number | undefined }>) => {
        return await axiosInstance.patch(
          `${API_ROUTES.TERM_BASE_ENTRIES.editTermBaseEntry}${translationMemoryEntryData?.id}/`,
          translationMemoryEntryData,
          {
            requiresAuth: true,
            requiredPermission: 'change_termbaseentry'
          } as any
        )
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['termBaseEntries'] })
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

  const getTermBaseEntries = (tbID?: number, pageSize?: number, page?: number, search?: string, ordering?: string) => {
    return useQuery({
      queryKey: ['termBaseEntries', tbID, pageSize, page, search, ordering],
      queryFn: () => {
        const params = cleanApiParams({
          term_base: tbID,
          page,
          page_size: pageSize,
          search,
          ordering
        })
        return axiosInstance.get(API_ROUTES.TERM_BASE_ENTRIES.getTermBaseEntries, {
          params,
          requiresAuth: true,
          requiredPermission: 'view_termbaseentry'
        } as any)
      }
    })
  }

  const getTermBaseEntryById = (id: number) => {
    return useQuery({
      queryKey: ['termBaseEntry', id],
      queryFn: async () => {
        const response = await axiosInstance.get(`${API_ROUTES.TERM_BASE_ENTRIES.getTermBaseEntryById}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_termbaseentry'
        } as any)
        return response.data
      },
      enabled: !!id
    })
  }

  const useDeleteTermBaseEntry = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        return axiosInstance.delete(`${API_ROUTES.TERM_BASE_ENTRIES.deleteTermBaseEntry}${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_termbaseentry'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['termBaseEntries'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to delete term base entry')
      }
    })
  }

  const useBulkDeleteTermBaseEntries = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        return axiosInstance.delete(`${API_ROUTES.TERM_BASE_ENTRIES.bulkDeleteTermBaseEntries}`, {
          data: { ids },
          requiresAuth: true,
          requiredPermission: 'delete_termbaseentry'
        } as any)
      },
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['termBaseEntries'] })
        }, 500)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        toast.error(error.response?.data?.error || 'Failed to delete term base entries')
      }
    })
  }

  return {
    // Term Base Hooks
    useCreateTermBase,
    useEditTermBase,
    getTermBase,
    getTermBaseById,
    useDeleteTermBase,
    useBulkDeleteTermBases,
    useExportTermBase,
    useImportTermBase,

    // Term Base Entries Hooks
    useCreateTermBaseEntry,
    useEditTermBaseEntry,
    getTermBaseEntries,
    getTermBaseEntryById,
    useDeleteTermBaseEntry,
    useBulkDeleteTermBaseEntries
  }
}
