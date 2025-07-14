export interface TermBaseTypes {
  id: number
  source_language_detail: {
    id: number
    name: string
    code: string
  }
  target_language_detail: {
    id: number
    name: string
    code: string
  }
  created_at: string
  updated_at: string
  name: string
  description: string | null
  business_unit: string
  created_by: number
  updated_by: number | null
  source_language: number | null | undefined
  target_language: number | null | undefined
}
