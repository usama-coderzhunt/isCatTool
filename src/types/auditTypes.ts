// Audit Log Types
export interface AuditLogType {
  id: number
  action: string
  table_name: string
  record_id: number
  changes: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
  created_by?: number
}

// Audit Search Types
export interface AuditSearchParamsType {
  action?: string
  table_name?: string
  record_id?: number
  user_id?: number
  start_date?: string
  end_date?: string
  page?: number
  page_size?: number
}

// Audit Statistics Types
export interface AuditStatisticsType {
  total_actions: number
  actions_by_type: Record<string, number>
  actions_by_user: Record<number, number>
  actions_by_table: Record<string, number>
  actions_over_time: Array<{
    date: string
    count: number
  }>
}
