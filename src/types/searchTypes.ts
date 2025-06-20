// Search Types
export interface SearchResultType {
  id: number
  type: 'page' | 'component' | 'setting' | 'user' | 'workflow'
  title: string
  description?: string
  url: string
  relevance_score: number
  created_at: string
  updated_at: string
}

export interface SearchQueryType {
  query: string
  types?: ('page' | 'component' | 'setting' | 'user' | 'workflow')[]
  from_date?: string
  to_date?: string
  page?: number
  page_size?: number
}

// Filter Types
export interface FilterType {
  id: number
  name: string
  type: 'page' | 'component' | 'setting' | 'user' | 'workflow'
  criteria: Record<string, any>
  is_public: boolean
  created_at: string
  updated_at: string
  created_by?: number
}

export interface CreateFilterType {
  name: string
  type: 'page' | 'component' | 'setting' | 'user' | 'workflow'
  criteria: Record<string, any>
  is_public?: boolean
}

export interface UpdateFilterType extends Partial<CreateFilterType> {
  id: number
}

// Search History Types
export interface SearchHistoryType {
  id: number
  query: string
  user_id: number
  results_count: number
  created_at: string
}
