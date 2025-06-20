// Tag Types
export interface TagType {
  id: number
  name: string
  slug: string
  description?: string
  category?: string
  color?: string
  icon?: string
  usage_count: number
  created_at: string
  updated_at: string
  created_by?: number
}

export interface CreateTagType {
  name: string
  description?: string
  category?: string
  color?: string
  icon?: string
}

export interface UpdateTagType extends Partial<CreateTagType> {
  id: number
}

// Tag Assignment Types
export interface TagAssignmentType {
  id: number
  tag_id: number
  entity_type: 'page' | 'component' | 'media' | 'workflow'
  entity_id: number
  created_at: string
  created_by?: number
}

export interface CreateTagAssignmentType {
  tag_id: number
  entity_type: 'page' | 'component' | 'media' | 'workflow'
  entity_id: number
}

// Tag Category Types
export interface TagCategoryType {
  id: number
  name: string
  description?: string
  parent_id?: number
  created_at: string
  updated_at: string
}

export interface CreateTagCategoryType {
  name: string
  description?: string
  parent_id?: number
}

export interface UpdateTagCategoryType extends Partial<CreateTagCategoryType> {
  id: number
}

// Tag Statistics Types
export interface TagStatisticsType {
  tag_id: number
  total_usage: number
  usage_by_entity: Record<string, number>
  usage_over_time: Array<{
    date: string
    count: number
  }>
  top_co_occurrences: Array<{
    tag_id: number
    count: number
  }>
}
