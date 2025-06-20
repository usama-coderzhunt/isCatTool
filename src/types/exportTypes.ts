// Export Types
export interface ExportJobType {
  id: number
  type: 'pages' | 'components' | 'settings' | 'workflows'
  format: 'json' | 'csv' | 'excel'
  filters?: Record<string, any>
  status: 'pending' | 'processing' | 'completed' | 'failed'
  file_url?: string
  error_message?: string
  created_at: string
  completed_at?: string
  created_by?: number
}

export interface CreateExportJobType {
  type: 'pages' | 'components' | 'settings' | 'workflows'
  format: 'json' | 'csv' | 'excel'
  filters?: Record<string, any>
}

// Import Types
export interface ImportJobType {
  id: number
  type: 'pages' | 'components' | 'settings' | 'workflows'
  file_url: string
  status: 'pending' | 'validating' | 'processing' | 'completed' | 'failed'
  validation_errors?: Array<{
    row: number
    field: string
    message: string
  }>
  error_message?: string
  created_at: string
  completed_at?: string
  created_by?: number
}

export interface CreateImportJobType {
  type: 'pages' | 'components' | 'settings' | 'workflows'
  file: File
}

// Template Types
export interface ImportTemplateType {
  id: number
  type: 'pages' | 'components' | 'settings' | 'workflows'
  name: string
  description?: string
  fields: Array<{
    name: string
    type: string
    required: boolean
    validation?: Record<string, any>
  }>
  created_at: string
  updated_at: string
}

export interface CreateImportTemplateType {
  type: 'pages' | 'components' | 'settings' | 'workflows'
  name: string
  description?: string
  fields: Array<{
    name: string
    type: string
    required: boolean
    validation?: Record<string, any>
  }>
}

export interface UpdateImportTemplateType extends Partial<CreateImportTemplateType> {
  id: number
}
