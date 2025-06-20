// Setting Types
export interface SettingType {
  id: number
  key: string
  value: string | number | boolean | null
  data_type: 'string' | 'number' | 'boolean' | 'json'
  description?: string
  category: string
  is_public: boolean
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

export interface CreateSettingType {
  key: string
  value: string | number | boolean | null
  data_type: 'string' | 'number' | 'boolean' | 'json'
  description?: string
  category: string
  is_public?: boolean
}

export interface UpdateSettingType extends Partial<CreateSettingType> {
  id: number
}

// Setting Category Types
export interface SettingCategoryType {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface CreateSettingCategoryType {
  name: string
  description?: string
}
