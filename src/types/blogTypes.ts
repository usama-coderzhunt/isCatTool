// Category Types
export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

export interface CreateCategoryInput {
  name: string
  description?: string
}

// Tag Types
export interface Tag {
  id: number
  name: string
  slug: string
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

export interface CreateTagInput {
  name: string
  slug: string
}

// Post Types
export interface Post {
  id: number
  title: string
  slug: string
  content: string
  featured_image: string | null
  status: 'draft' | 'published'
  published_at?: string
  views: number
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
  author: number
  category: number
  tags: number[]
}

export interface CreatePostInput {
  title: string
  content: string
  featured_image?: string
  category: number
  status: 'draft' | 'published'
  published_at?: string
  tags?: number[]
}

// Comment Types
export interface Comment {
  id: number
  content: string
  created_at: string
  updated_at: string
  active: boolean
  created_by?: number
  updated_by?: number
  post: number
  author: number
  parent?: number
}

export interface CreateCommentInput {
  post: number
  content: string
  active?: boolean
  parent?: number
}
