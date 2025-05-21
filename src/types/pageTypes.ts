// Page Component Types
export interface PageComponentType {
  id: number
  type: string
  order: number
  content: Record<string, any>
  styles?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CreatePageComponentType {
  type: string
  order: number
  content: Record<string, any>
  styles?: Record<string, any>
}

// Page Types
export interface PageType {
  id: number
  title: string
  slug: string
  is_homepage: boolean
  components: PageComponentType[]
  created_at: string
  updated_at: string
}

export interface CreatePageType {
  title: string
  slug: string
  is_homepage?: boolean
}

export interface UpdatePageType extends Partial<CreatePageType> {
  id: number
}

// Component Management Types
export interface AddComponentType {
  page_id: number
  component: CreatePageComponentType
}

export interface UpdateComponentType {
  page_id: number
  component_id: number
  updates: Partial<CreatePageComponentType>
}

export interface DeleteComponentType {
  page_id: number
  component_id: number
}
