import type { CreateCategoryInput, CreateTagInput, CreatePostInput, CreateCommentInput } from '@/types/blogTypes'

export const mapCreateCategoryData = (data: CreateCategoryInput) => ({
  name: data.name,
  description: data.description
})

export const mapCreateTagData = (data: CreateTagInput) => ({
  name: data.name,
  slug: data.slug
})

export const mapCreatePostData = (data: CreatePostInput) => ({
  title: data.title,
  content: data.content,
  featured_image: data.featured_image,
  category: data.category,
  status: data.status,
  published_at: data.published_at,
  tags: data.tags
})

export const mapCreateCommentData = (data: CreateCommentInput) => ({
  post: data.post,
  content: data.content,
  active: data.active,
  parent: data.parent
})
