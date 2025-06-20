// Analytics Types
export interface AnalyticsMetricType {
  id: number
  name: string
  value: number
  unit: string
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  category: string
  created_at: string
}

// Analytics Query Types
export interface AnalyticsQueryParamsType {
  start_date?: string
  end_date?: string
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  category?: string
  metrics?: string[]
}

// Analytics Dashboard Types
export interface AnalyticsDashboardType {
  summary: {
    total_users: number
    active_users: number
    total_pages: number
    total_components: number
  }
  trends: {
    user_growth: Array<{
      date: string
      count: number
    }>
    page_views: Array<{
      date: string
      count: number
    }>
    component_usage: Array<{
      type: string
      count: number
    }>
  }
  performance: {
    average_response_time: number
    error_rate: number
    uptime_percentage: number
  }
}
