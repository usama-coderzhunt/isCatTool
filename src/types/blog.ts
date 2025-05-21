// /types/blog.ts

export interface Post {
  id: number
  created_at: string
  updated_at: string
  title: string
  slug: string
  content: string
  featured_image: string
  status: string
  published_at: string
  views: number
  created_by: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  total_pages: number
  current_page: number
  results: T[]
}
