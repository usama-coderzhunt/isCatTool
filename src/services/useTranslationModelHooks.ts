import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'
import type { TranslationModelType, CreateTranslationModelType } from '@/types/translation'
import { mapCreateTranslationModelData } from './utility/translation'

interface ListResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const useTranslationModels = (page = 1, pageSize = 5, search = '') => {
  return useQuery<ListResponse<TranslationModelType>>({
    queryKey: ['translationModels', page, pageSize, search],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ListResponse<TranslationModelType>>(
        API_ROUTES.TRANSLATION_MODELS.getTranslationModels,
        {
          params: { page, page_size: pageSize, search }
        }
      )
      return data
    }
  })
}

export const useCreateTranslationModel = () => {
  const queryClient = useQueryClient()
  return useMutation<TranslationModelType, Error, CreateTranslationModelType>({
    mutationFn: async data => {
      const payload = mapCreateTranslationModelData(data)
      const response = await axiosInstance.post<TranslationModelType>(
        API_ROUTES.TRANSLATION_MODELS.getTranslationModels,
        payload
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationModels'] })
    }
  })
}

export const useUpdateTranslationModel = () => {
  const queryClient = useQueryClient()
  return useMutation<TranslationModelType, Error, { id: number; data: CreateTranslationModelType }>({
    mutationFn: async ({ id, data }) => {
      const payload = mapCreateTranslationModelData(data)
      const response = await axiosInstance.put<TranslationModelType>(
        `${API_ROUTES.TRANSLATION_MODELS.getTranslationModels}${id}/`,
        payload
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationModels'] })
    }
  })
}

export const useDeleteTranslationModel = () => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, number>({
    mutationFn: async id => {
      await axiosInstance.delete(`${API_ROUTES.TRANSLATION_MODELS.getTranslationModels}${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationModels'] })
    }
  })
}

export default useTranslationModels
