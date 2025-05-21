import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import axiosInstance from '@/utils/api/axiosInstance'
import { showError, showSuccess } from '@/utils/toast'

export interface Category {
  id: number
  name: string
  slug: string
  description: string
  created_at: string
  updated_at: string
}

export interface Tag {
  id: number
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface Post {
  id: number
  title: string
  slug: string
  content: string
  featured_image: string | null
  category: number
  tags: number[]
  status: 'draft' | 'published'
  published_at: string
  views: number
  author: number
  created_at: string
  updated_at: string
}

export interface Comment {
  id: number
  post: number
  author: number
  content: string
  created_at: string
  updated_at: string
  active: boolean
  parent: number | null
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

interface BulkDeleteRequest {
  ids: number[]
}

export const useBlogHooks = () => {
  const queryClient = useQueryClient()

  // Posts API
  const useFetchPosts = (pageSize = 10, page = 1, filters = {}) => {
    return useQuery({
      queryKey: ['posts', pageSize, page, filters],
      queryFn: async () => {
        const response = await axiosInstance.get<PaginatedResponse<Post>>('/api/blog/post/', {
          params: {
            limit: pageSize,
            offset: (page - 1) * pageSize,
            ...filters
          },
          requiresAuth: false
        } as any)

        return response.data
      }
    })
  }

  const useFetchPost = (slug: string) => {
    return useQuery({
      queryKey: ['post', slug],
      queryFn: async () => {
        const response = await axiosInstance.get<Post>(
          `/api/blog/post/${slug}/`,

          { requiresAuth: false } as any
        )

        return response.data
      },
      enabled: !!slug
    })
  }

  const useCreatePost = () => {
    return useMutation({
      mutationFn: async (data: Partial<Post> | FormData) => {
        const isFormData = data instanceof FormData

        const response = await axiosInstance.post<Post>('/api/blog/post/', data, {
          headers: {
            // Set the correct content type for FormData
            ...(isFormData ? { 'Content-Type': 'multipart/form-data' } : {})
          },
          requiresAuth: true,
          requiredPermission: 'add_post'
        } as any)

        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['posts'] })
        showSuccess('Post created successfully')
      },
      onError: (error: any) => {
        showError(error?.response?.data?.message || 'Failed to create post')
      }
    })
  }

  const useUpdatePost = () => {
    return useMutation({
      mutationFn: async ({ slug, data }: { slug: string; data: Partial<Post> | FormData }) => {
        const isFormData = data instanceof FormData

        const response = await axiosInstance.patch<Post>(`/api/blog/post/${slug}/`, data, {
          headers: {
            // Set the correct content type for FormData
            ...(isFormData ? { 'Content-Type': 'multipart/form-data' } : {})
          },
          requiresAuth: true,
          requiredPermission: 'change_post'
        } as any)

        return response.data
      },
      onSuccess: data => {
        queryClient.invalidateQueries({ queryKey: ['posts'] })
        queryClient.invalidateQueries({ queryKey: ['post-detail', data.slug] })
        showSuccess('Post updated successfully')
      },
      onError: (error: any) => {
        showError(error?.response?.data?.message || 'Failed to update post')
      }
    })
  }

  const useDeletePost = () => {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async (slug: string) => {
        const response = await axiosInstance.delete(`/api/blog/posts/${slug}/`)

        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['posts'] })
      }
    })
  }

  const useBulkDeletePosts = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        await axiosInstance.post(
          '/api/blog/post/bulk_delete/',
          { ids } as BulkDeleteRequest,
          {
            requiresAuth: true,
            requiredPermission: 'delete_post' // Add permission check
          } as any
        )

        return ids
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['posts'] })
        showSuccess('Posts deleted successfully')
      },
      onError: (error: any) => {
        showError(error?.response?.data?.message || 'Failed to delete posts')
      }
    })
  }

  // Categories API
  const useFetchCategories = (pageSize = 100, page = 1, filters = {}) => {
    return useQuery({
      queryKey: ['categories', pageSize, page, filters],
      queryFn: async () => {
        const response = await axiosInstance.get<PaginatedResponse<Category>>('/api/blog/category/', {
          params: {
            limit: pageSize,
            offset: (page - 1) * pageSize,
            ...filters
          },
          requiresAuth: true,
          requiredPermission: 'view_category' // Add permission check
        } as any)

        return response.data
      }
    })
  }

  const useFetchCategory = (id: string | number) => {
    return useQuery({
      queryKey: ['category', id],
      queryFn: async () => {
        const response = await axiosInstance.get<Category>(`/api/blog/category/${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_category' // Add permission check
        } as any)

        return response.data
      },
      enabled: !!id
    })
  }

  const useCreateCategory = () => {
    return useMutation({
      mutationFn: async (data: Partial<Category>) => {
        const response = await axiosInstance.post<Category>('/api/blog/category/', data, {
          requiresAuth: true,
          requiredPermission: 'add_category' // Add permission check
        } as any)

        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] })
        showSuccess('Category created successfully')
      },
      onError: (error: any) => {
        showError(error?.response?.data?.message || 'Failed to create category')
      }
    })
  }

  const useUpdateCategory = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: number; data: Partial<Category> }) => {
        const response = await axiosInstance.patch<Category>(`/api/blog/category/${id}/`, data, {
          requiresAuth: true,
          requiredPermission: 'change_category' // Add permission check
        } as any)

        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] })
        showSuccess('Category updated successfully')
      },
      onError: (error: any) => {
        showError(error?.response?.data?.message || 'Failed to update category')
      }
    })
  }

  const useDeleteCategory = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        await axiosInstance.delete(`/api/blog/category/${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_category' // Add permission check
        } as any)

        return id
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] })
        showSuccess('Category deleted successfully')
      },
      onError: (error: any) => {
        showError(error?.response?.data?.message || 'Failed to delete category')
      }
    })
  }

  const useBulkDeleteCategories = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        await axiosInstance.post(
          '/api/blog/category/bulk_delete/',
          { ids } as BulkDeleteRequest,
          {
            requiresAuth: true,
            requiredPermission: 'delete_category' // Add permission check
          } as any
        )

        return ids
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] })
        showSuccess('Categories deleted successfully')
      },
      onError: (error: any) => {
        showError(error?.response?.data?.message || 'Failed to delete categories')
      }
    })
  }

  // Tags API
  const useFetchTags = (pageSize = 100, page = 1, filters = {}) => {
    return useQuery({
      queryKey: ['tags', pageSize, page, filters],
      queryFn: async () => {
        const response = await axiosInstance.get<PaginatedResponse<Tag>>('/api/blog/tag/', {
          params: {
            limit: pageSize,
            offset: (page - 1) * pageSize,
            ...filters
          },
          requiresAuth: false
        } as any)

        return response.data
      }
    })
  }

  const useFetchTag = (id: string | number) => {
    return useQuery({
      queryKey: ['tag', id],
      queryFn: async () => {
        const response = await axiosInstance.get<Tag>(`/api/blog/tag/${id}/`, {
          requiresAuth: true,
          requiredPermission: 'view_tag' // Add permission check
        } as any)

        return response.data
      },
      enabled: !!id
    })
  }

  const useCreateTag = () => {
    return useMutation({
      mutationFn: async (data: Partial<Tag>) => {
        const response = await axiosInstance.post<Tag>('/api/blog/tag/', data, {} as any)

        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tags'] })
        showSuccess('Tag created successfully')
      },
      onError: (error: any) => {
        showError(error?.response?.data?.message || 'Failed to create tag')
      }
    })
  }

  const useUpdateTag = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: number; data: Partial<Tag> }) => {
        const response = await axiosInstance.patch<Tag>(`/api/blog/tag/${id}/`, data, {
          requiresAuth: true,
          requiredPermission: 'change_tag' // Add permission check
        } as any)

        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tags'] })
        showSuccess('Tag updated successfully')
      },
      onError: (error: any) => {
        showError(error?.response?.data?.message || 'Failed to update tag')
      }
    })
  }

  const useDeleteTag = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        await axiosInstance.delete(`/api/blog/tag/${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_tag' // Add permission check
        } as any)

        return id
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tags'] })
        showSuccess('Tag deleted successfully')
      },
      onError: (error: any) => {
        showError(error?.response?.data?.message || 'Failed to delete tag')
      }
    })
  }

  const useBulkDeleteTags = () => {
    return useMutation({
      mutationFn: async (ids: number[]) => {
        await axiosInstance.post(
          '/api/blog/tag/bulk_delete/',
          { ids } as BulkDeleteRequest,
          {
            requiresAuth: true,
            requiredPermission: 'delete_tag' // Add permission check
          } as any
        )

        return ids
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tags'] })
        showSuccess('Tags deleted successfully')
      },
      onError: (error: any) => {
        showError(error?.response?.data?.message || 'Failed to delete tags')
      }
    })
  }

  // Comments API
  const useFetchComments = (postId?: number, pageSize = 10, page = 1) => {
    return useQuery({
      queryKey: ['comments', postId, pageSize, page],
      queryFn: async () => {
        const response = await axiosInstance.get<PaginatedResponse<Comment>>('/api/blog/comment/', {
          params: {
            post: postId,
            limit: pageSize,
            offset: (page - 1) * pageSize
          },
          requiresAuth: true,
          requiredPermission: 'view_comment' // Add permission check
        } as any)

        return response.data
      },
      enabled: postId !== undefined
    })
  }

  const useFetchPostDetail = (slug: string) => {
    return useQuery({
      queryKey: ['post-detail', slug],
      queryFn: async () => {
        const response = await axiosInstance.get<Post>(`/api/blog/post/${slug}/`, {
          requiresAuth: true,
          requiredPermission: 'view_post' // Add permission check
        } as any)

        return response.data
      },
      enabled: !!slug
    })
  }

  const useCreateComment = () => {
    return useMutation({
      mutationFn: async (data: Partial<Comment>) => {
        const response = await axiosInstance.post<Comment>('/api/blog/comment/', data, {
          requiresAuth: true,
          requiredPermission: 'add_comment' // Add permission check
        } as any)

        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['comments'] })
        showSuccess('Comment created successfully')
      },
      onError: (error: any) => {
        showError(error?.response?.data?.message || 'Failed to create comment')
      }
    })
  }

  const useUpdateComment = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: number; data: Partial<Comment> }) => {
        const response = await axiosInstance.patch<Comment>(`/api/blog/comment/${id}/`, data, {
          requiresAuth: true,
          requiredPermission: 'change_comment' // Add permission check
        } as any)

        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['comments'] })
        showSuccess('Comment updated successfully')
      },
      onError: (error: any) => {
        showError(error?.response?.data?.message || 'Failed to update comment')
      }
    })
  }

  const useDeleteComment = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        await axiosInstance.delete(`/api/blog/comment/${id}/`, {
          requiresAuth: true,
          requiredPermission: 'delete_comment' // Add permission check
        } as any)

        return id
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['comments'] })
        showSuccess('Comment deleted successfully')
      },
      onError: (error: any) => {
        showError(error?.response?.data?.message || 'Failed to delete comment')
      }
    })
  }

  return {
    // Posts
    useFetchPosts,
    useFetchPost,

    useCreatePost,
    useUpdatePost,
    useDeletePost,
    useBulkDeletePosts,

    // Categories
    useFetchCategories,
    useFetchCategory,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
    useBulkDeleteCategories,

    // Tags
    useFetchTags,
    useFetchTag,
    useCreateTag,
    useUpdateTag,
    useDeleteTag,
    useBulkDeleteTags,

    // Comments
    useFetchComments,
    useFetchPostDetail,
    useCreateComment,
    useUpdateComment,
    useDeleteComment
  }
}
