import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

interface TranslationSubjectType {
  id: number
  name: string
  // Add more fields if needed
}

interface CreateTranslationSubjectType {
  name: string
  // Add more fields if needed
}

interface ListResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const useTranslationSubjects = (page = 1, pageSize = 5, search = '') => {
  return useQuery<ListResponse<TranslationSubjectType>>({
    queryKey: ['translationSubjects', page, pageSize, search],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ListResponse<TranslationSubjectType>>(
        API_ROUTES.TRANSLATION_SUBJECTS.getTranslationSubjects,
        {
          params: { page, page_size: pageSize, search }
        }
      )
      return data
    }
  })
}

export const useCreateTranslationSubject = () => {
  const queryClient = useQueryClient()
  return useMutation<TranslationSubjectType, Error, CreateTranslationSubjectType>({
    mutationFn: async data => {
      const response = await axiosInstance.post<TranslationSubjectType>(
        API_ROUTES.TRANSLATION_SUBJECTS.getTranslationSubjects,
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationSubjects'] })
    }
  })
}

export const useUpdateTranslationSubject = () => {
  const queryClient = useQueryClient()
  return useMutation<TranslationSubjectType, Error, { id: number; data: CreateTranslationSubjectType }>({
    mutationFn: async ({ id, data }) => {
      const response = await axiosInstance.put<TranslationSubjectType>(
        `${API_ROUTES.TRANSLATION_SUBJECTS.getTranslationSubjects}${id}/`,
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationSubjects'] })
    }
  })
}

export const useDeleteTranslationSubject = () => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, number>({
    mutationFn: async id => {
      await axiosInstance.delete(`${API_ROUTES.TRANSLATION_SUBJECTS.getTranslationSubjects}${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationSubjects'] })
    }
  })
}

export default useTranslationSubjects
