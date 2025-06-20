import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/utils/api/axiosInstance'

export interface Testimonial {
  id: number
  name: string
  title: string | null
  company: string | null
  testimonial: string
  rating: number
  image: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const useFetchTestimonials = (pageSize = 4, page = 1, filters = {}, serviceId?: number) => {
  return useQuery({
    queryKey: ['testimonials', pageSize, page, filters, serviceId],
    queryFn: async () => {
      const response = await axiosInstance.get<PaginatedResponse<Testimonial>>('/api/testimonials/', {
        params: {
          limit: pageSize,
          offset: (page - 1) * pageSize,
          ...filters,
          service: serviceId
        },
        requiresAuth: false
      } as any)

      return response.data
    },
    enabled: !!serviceId
  })
}

export const useFetchTestimonialsPublic = (pageSize = 4, page = 1, filters = {}, serviceId?: number) => {
  return useQuery({
    queryKey: ['testimonials', pageSize, page, filters, serviceId],
    queryFn: async () => {
      const response = await axiosInstance.get<PaginatedResponse<Testimonial>>('/api/testimonials/public/', {
        params: {
          limit: pageSize,
          offset: (page - 1) * pageSize,
          ...filters,
          service: serviceId
        },
        requiresAuth: false
      } as any)

      return response.data
    }
  })
}
