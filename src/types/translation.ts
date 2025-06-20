// Translation Model Types
export interface TranslationModelType {
  id: number
  name: string
  model_name: string
  description?: string
  operator: string
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
  allowed_users: number[]
  allowed_groups: number[]
}

export interface CreateTranslationModelType {
  name: string
  model_name: string
  description?: string
  operator: string
  allowed_users?: number[]
  allowed_groups?: number[]
}

// Language Types
export interface LanguageType {
  id: number
  name: string
  code: string
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

export interface CreateLanguageType {
  name: string
  code: string
}

// Translation Memory Types
export interface TranslationMemoryType {
  id: number
  name: string
  description?: string
  source_language: number
  target_language: number
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

export interface CreateTranslationMemoryType {
  name: string
  description?: string
  source_language: number
  target_language: number
}

// Translation Memory Entry Types
export interface TranslationMemoryEntryType {
  id: number
  source_text: string
  target_text: string
  reference?: string
  translation_memory: number
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

export interface CreateTranslationMemoryEntryType {
  source_text: string
  target_text: string
  reference?: string
  translation_memory: number
}
