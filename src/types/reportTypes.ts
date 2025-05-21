// Report Template Types
export interface ReportTemplateType {
  id: number
  name: string
  description?: string
  type: 'pdf' | 'excel' | 'csv'
  config: {
    fields: string[]
    filters?: Record<string, any>
    sorting?: Record<string, 'asc' | 'desc'>
    grouping?: string[]
  }
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

export interface CreateReportTemplateType {
  name: string
  description?: string
  type: 'pdf' | 'excel' | 'csv'
  config: {
    fields: string[]
    filters?: Record<string, any>
    sorting?: Record<string, 'asc' | 'desc'>
    grouping?: string[]
  }
}

export interface UpdateReportTemplateType extends Partial<CreateReportTemplateType> {
  id: number
}

// Report Generation Types
export interface ReportGenerationType {
  id: number
  template_id: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  parameters?: Record<string, any>
  file_url?: string
  error_message?: string
  created_at: string
  completed_at?: string
  created_by?: number
}

export interface GenerateReportType {
  template_id: number
  parameters?: Record<string, any>
}

// Report Schedule Types
export interface ReportScheduleType {
  id: number
  template_id: number
  name: string
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string
    day?: number
    recipients: string[]
  }
  parameters?: Record<string, any>
  is_active: boolean
  last_run?: string
  next_run?: string
  created_at: string
  updated_at: string
}

export interface CreateReportScheduleType {
  template_id: number
  name: string
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string
    day?: number
    recipients: string[]
  }
  parameters?: Record<string, any>
  is_active?: boolean
}

export interface UpdateReportScheduleType extends Partial<CreateReportScheduleType> {
  id: number
}
