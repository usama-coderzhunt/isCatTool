export interface TasksTypes {
  id: number
  created_at: string
  updated_at: string
  name: string
  description: string
  due_date: string | null
  status: string
  similarity_threshold: string
  extract_segments_format: string
  generated_document: string
  processing_generated_document: boolean
  is_subtask: boolean | null
  segment_range_start: number | null
  segment_range_end: number | null
  is_split: boolean | null
  custom_prompt: string | null
  created_by: number
  updated_by: number | null
  project: number | null
  default_translation_memory: number
  assigned_to: number | null
  parent_task: number | null
  source_language: number | null
  target_language: number | null
  translation_model: number | null
  translation_subject: string | null
  number_of_subtasks: number | null
  term_base: number[]
  translation_memories: number[]
}
