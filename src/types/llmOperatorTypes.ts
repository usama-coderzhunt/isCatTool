export interface LLMOperatorTypes {
  id: number
  created_at: string
  updated_at: string
  name: string
  description: string
  metadata: Record<string, any>
  created_by: number
  updated_by: number | null
}
