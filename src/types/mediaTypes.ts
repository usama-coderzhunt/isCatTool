// Media Types
export interface MediaType {
  id: number
  name: string
  type: 'image' | 'video' | 'document' | 'other'
  mime_type: string
  size: number
  url: string
  thumbnail_url?: string
  category?: string
  tags?: string[]
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  created_by?: number
}

export interface CreateMediaType {
  name: string
  file: File
  category?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface UpdateMediaType extends Partial<Omit<CreateMediaType, 'file'>> {
  id: number
}

// Media Category Types
export interface MediaCategoryType {
  id: number
  name: string
  description?: string
  parent_id?: number
  created_at: string
  updated_at: string
}

export interface CreateMediaCategoryType {
  name: string
  description?: string
  parent_id?: number
}

export interface UpdateMediaCategoryType extends Partial<CreateMediaCategoryType> {
  id: number
}

// Media Processing Types
export interface MediaProcessingType {
  id: number
  media_id: number
  operation: 'resize' | 'compress' | 'convert' | 'optimize'
  parameters: Record<string, any>
  status: 'pending' | 'processing' | 'completed' | 'failed'
  output_url?: string
  error_message?: string
  created_at: string
  completed_at?: string
}

export interface CreateMediaProcessingType {
  media_id: number
  operation: 'resize' | 'compress' | 'convert' | 'optimize'
  parameters: Record<string, any>
}
