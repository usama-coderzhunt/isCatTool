// Activity Types
export interface ActivityType {
  id: number
  user_id: number
  action: string
  entity_type: string
  entity_id: number
  changes: Record<string, any>
  metadata: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface ActivityFilterType {
  user_id?: number
  action?: string
  entity_type?: string
  entity_id?: number
  start_date?: string
  end_date?: string
  page?: number
  page_size?: number
}

export interface ActivityAnalyticsType {
  total_activities: number
  activities_by_user: Record<number, number>
  activities_by_action: Record<string, number>
  activities_by_entity: Record<string, number>
  activity_timeline: Array<{
    date: string
    count: number
  }>
}

export interface ActivityExportType {
  format: 'csv' | 'json' | 'excel'
  filters?: ActivityFilterType
}
