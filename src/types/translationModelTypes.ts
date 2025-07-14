export interface TranslationModelsTypes {
  id: number
  operator_detail: {
    id: number
    name: string
  }
  created_at: string
  updated_at: string
  name: string
  model_name: string
  description: string
  created_by: number | null
  updated_by: number | null
  operator: number
  allowed_users: number[]
  allowed_groups: number[]
}
