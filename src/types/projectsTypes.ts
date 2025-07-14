export interface ProjectTypes {
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
  translation_model_detail: {
    id: number
    name: string
  }
  translation_subject_detail: {
    id: number
    name: string
  }
  created_at: string
  updated_at: string
  name: string
  due_date: string | null
  status: string
  created_by: number
  updated_by: number | null
  source_language: number
  target_language: number
  translation_model: number
  translation_subject: number
}
