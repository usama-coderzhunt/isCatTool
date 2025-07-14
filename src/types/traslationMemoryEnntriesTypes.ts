export interface TranslationMemoryEntriesTypes {
  id: number
  created_at: string
  updated_at: string
  source_text: string
  target_text: string
  reference: string | null
  segment_id_reference: string | null
  created_by: number | null
  updated_by: number | null
  translation_memory: number | null | undefined
}
